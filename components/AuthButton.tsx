import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect("/login");
  };

  return user ? (
    <div className="flex items-center gap-2 sm:gap-4">
      <span className="hidden sm:inline">Hey, {user.email}!</span>
      <span className="sm:hidden text-sm">Hey!</span>
      <ThemeToggle />
      <form action={signOut}>
        <button className="py-2 px-3 sm:px-4 rounded-md text-sm no-underline bg-btn-background hover:bg-btn-background-hover">
          Logout
        </button>
      </form>
    </div>
  ) : (
    <div className="flex items-center gap-4">
      <ThemeToggle />
      <Link
        href="/login"
        className="py-2 px-3 flex rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
      >
        Login
      </Link>
    </div>
  );
}
