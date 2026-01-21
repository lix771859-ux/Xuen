import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function AddArticleForm() {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "错误",
        description: "请输入文章标题",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("articles")
        .insert([{ title: title.trim() }])
        .select();

      if (error) throw error;

      console.log("Article added:", data);
      setTitle("");
      toast({
        title: "成功",
        description: "文章已添加",
      });
    } catch (error) {
      console.error("Error adding article:", error);
      toast({
        title: "错误",
        description: "添加文章失败，请重试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium mb-2"
        >
          文章标题
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          placeholder="输入文章标题"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "添加中..." : "添加文章"}
      </button>
    </form>
  );
}
