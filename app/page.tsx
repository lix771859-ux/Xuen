import AuthButton from "../components/AuthButton";
import Header from "@/components/Header";

export default async function Index() {
  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <AuthButton />
        </div>
      </nav>

      <div className="animate-in flex-1 flex flex-col gap-2 max-w-4xl px-3">
        <Header />
        <main className="flex-1 flex flex-col gap-6">
          <div className="flex flex-col gap-6 py-8">
            <h1 className="text-4xl font-bold text-center">欢迎使用 Next.js + Supabase</h1>
            <p className="text-xl text-center text-muted-foreground">
              这是一个使用 Next.js 14、Supabase 和 shadcn/ui 构建的模板项目
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="p-6 border rounded-lg bg-card">
                <h3 className="text-lg font-semibold mb-2">🔐 身份验证</h3>
                <p className="text-sm text-muted-foreground">
                  完整的用户认证系统，包括登录、注册、密码重置等功能
                </p>
              </div>
              
              <div className="p-6 border rounded-lg bg-card">
                <h3 className="text-lg font-semibold mb-2">💳 支付集成</h3>
                <p className="text-sm text-muted-foreground">
                  Stripe 支付集成，支持订阅和一次性支付
                </p>
              </div>
              
              <div className="p-6 border rounded-lg bg-card">
                <h3 className="text-lg font-semibold mb-2">🎨 UI 组件</h3>
                <p className="text-sm text-muted-foreground">
                  shadcn/ui 组件库，提供美观的界面组件
                </p>
              </div>
            </div>

            <div className="flex gap-4 justify-center mt-8">
              <a
                href="/protected"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
              >
                查看受保护页面
              </a>
              <a
                href="/articles/client"
                className="px-6 py-3 border border-border rounded-md hover:bg-accent transition-colors"
              >
                浏览文章
              </a>
            </div>
          </div>
        </main>
      </div>

      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>
          Powered by{" "}
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Supabase
          </a>
        </p>
      </footer>
    </div>
  );
}
