"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Loader2, Plus, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/utils/supabase/client";

type AIArticle = {
  title: string;
  description: string;
};

export default function AIArticleSearch() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<AIArticle[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "请输入搜索内容",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch("/api/ai/search-articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "搜索失败");
      }

      setResults(data.articles || []);
      
      if (data.articles?.length === 0) {
        toast({
          title: "未找到结果",
          description: "请尝试其他关键词",
        });
      }
    } catch (error: any) {
      toast({
        title: "搜索失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddArticle = async (article: AIArticle) => {
    try {
      // 先检查用户是否已登录
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "请先登录",
          description: "添加文章需要登录账号",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("articles")
        .insert({ 
          title: article.title
        })
        .select();

      if (error) {
        console.error('添加文章错误:', error);
        throw error;
      }

      console.log('文章添加成功:', data);

      toast({
        title: "添加成功",
        description: `"${article.title}" 已添加到文章列表`,
      });

      // 从搜索结果中移除已添加的文章
      setResults(prev => prev.filter(a => a.title !== article.title));
      
      // 触发页面刷新事件，通知父组件更新列表
      window.dispatchEvent(new CustomEvent('article-added'));
      
    } catch (error: any) {
      console.error('添加文章失败:', error);
      toast({
        title: "添加失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI 文章搜索</CardTitle>
          <CardDescription>使用 AI 帮你找到相关文章</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="输入你想搜索的话题..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={isSearching}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  搜索中...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  搜索
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">搜索结果 ({results.length})</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {results.map((article, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-2">{article.title}</h4>
                      <p className={`text-sm text-muted-foreground ${expandedIndex === index ? '' : 'line-clamp-3'}`}>
                        {article.description}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleAddArticle(article)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        添加
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                      >
                        {expandedIndex === index ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            收起
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            展开
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
