"use client";

import AddArticleForm from "@/components/add-article-form";
import { createClient } from "@/utils/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

type Article = { created_at: string; id: number; title: string | null };
export default function Page() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getData = async () => {
      const { data } = await supabase.from("articles").select("*");
      //const articles = await db.articles.findMany();
      if (data) setArticles(data);
    };
    getData();

    const channel = supabase
      .channel("article-change")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "articles",
        },
        (payload) => {
          switch (payload.eventType) {
            case "DELETE":
              setArticles((currentArticles) => {
                const deletedId = payload.old.id;
                const newArticles = currentArticles.filter(
                  (article) => article.id !== deletedId
                );
                return newArticles;
              });
              break;
            case "UPDATE":
              setArticles((currentArticles) => {
                const updatedId = payload.new.id;
                return currentArticles.map((article) =>
                  article.id === updatedId
                    ? { ...article, ...payload.new }
                    : article
                );
              });
              break;
            case "INSERT":
              setArticles((currentArticles) => {
                const newArticle: Article = {
                  created_at: payload.new.created_at,
                  id: payload.new.id,
                  title: payload.new.title,
                };
                const exists = currentArticles.some(
                  (article) => article.id === newArticle.id
                );
                return exists
                  ? currentArticles
                  : [...currentArticles, newArticle];
              });
              break;
            default:
              // Handle other event types if necessary
              break;
          }
        }
      )
      .subscribe();
    setChannel(channel);

    // Cleanup-Funktion, die bei Unmount aufgerufen wird
    return () => {
      console.log("unsubscribe");
      channel.unsubscribe();
    };
  }, [supabase]);

  return (
    <div className="flex-1 w-full flex flex-col gap-8 items-center py-8">
      <div className="w-full max-w-4xl px-4">
        <h1 className="text-3xl font-bold mb-2">文章管理（客户端）</h1>
        <p className="text-muted-foreground mb-8">使用客户端实时订阅功能</p>
        
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold mb-4">添加新文章</h2>
            <AddArticleForm />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">文章列表 ({articles.length})</h2>
            <div className="space-y-3">
              {articles.length === 0 ? (
                <p className="text-muted-foreground text-sm">暂无文章，请添加第一篇文章</p>
              ) : (
                articles.map((article) => (
                  <div
                    key={article.id}
                    className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                  >
                    <h3 className="font-medium">{article.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      创建于: {new Date(article.created_at).toLocaleString('zh-CN')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
