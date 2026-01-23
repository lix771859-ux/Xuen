"use client";

import AddArticleForm from "@/components/add-article-form";
import AIArticleSearch from "@/components/AIArticleSearch";
import { createClient } from "@/utils/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Article = { created_at: string; id: number; title: string | null };

const ITEMS_PER_PAGE = 10;

export default function Page() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getData = async () => {
      const { data } = await supabase.from("articles").select("*").order("created_at", { ascending: false });
      if (data) {
        console.log('加载文章列表:', data.length, '篇');
        setArticles(data);
      }
    };
    getData();

    // 监听添加文章事件，手动刷新列表
    const handleArticleAdded = () => {
      console.log('收到添加文章事件，刷新列表');
      getData();
    };
    window.addEventListener('article-added', handleArticleAdded);

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
          console.log('收到 Realtime 事件:', payload.eventType, payload);
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
              console.log('收到 INSERT 事件:', payload.new);
              setArticles((currentArticles) => {
                const newArticle: Article = {
                  created_at: payload.new.created_at,
                  id: payload.new.id,
                  title: payload.new.title,
                };
                const exists = currentArticles.some(
                  (article) => article.id === newArticle.id
                );
                console.log('当前文章数:', currentArticles.length, '是否已存在:', exists);
                return exists
                  ? currentArticles
                  : [newArticle, ...currentArticles];
              });
              break;
            default:
              break;
          }
        }
      )
      .subscribe();
    setChannel(channel);

    return () => {
      console.log("unsubscribe");
      window.removeEventListener('article-added', handleArticleAdded);
      channel.unsubscribe();
    };
  }, [supabase]);

  // 计算分页
  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentArticles = articles.slice(startIndex, endIndex);

  // 当添加新文章时重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [articles.length]);

  return (
    <div className="flex-1 w-full flex flex-col justify-center gap-8 items-center py-8">
      <div className="w-full max-w-6xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">文章管理（客户端）</h1>
          <p className="text-muted-foreground">使用客户端实时订阅功能</p>
        </div>
        
        <AIArticleSearch />
        
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">我的文章列表 ({articles.length})</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {articles.length === 0 ? (
              <p className="text-muted-foreground text-sm col-span-full">暂无文章，请使用上方 AI 搜索添加文章</p>
            ) : (
              currentArticles.map((article) => (
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
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                第 {currentPage} / {totalPages} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                下一页
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
