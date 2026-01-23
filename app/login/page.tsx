"use client";
import Link from "next/link";
import { Suspense } from "react";
import { SubmitButton } from "./submit-button";
import { signIn, signUp, signInWithGoogleOAuth } from "./actions";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  
  const handleSignInWithGoogle = async () => {
    try {
      await signInWithGoogleOAuth();
    } catch (error) {
      console.error("Fehler beim Anmelden mit Google: ", error);
    }
  };

  const handleResetPassword = async () => {
    const supabase = createClient();
    const email = prompt("Für welche Email");
    if (!email) {
      console.error("No valid Email");
      return;
    }
    email.trim();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/password-reset`,
    });
    if (data) alert("Recovery Link sent to " + email);
    if (error) alert("Error while sending password reset link to " + email);
  };
  
  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <Link href="/" className="font-bold text-xl hover:opacity-80 transition-opacity">
            MyApp
          </Link>
        </div>
      </nav>
      
      <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-muted-foreground">Sign in to your account to continue</p>
      </div>
      
      <div className="flex flex-col gap-9 ">
        <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
          <label className="text-md" htmlFor="email">
            Email
          </label>
          <input
            className="rounded-xl px-4 py-2 bg-inherit border mb-6"
            name="email"
            placeholder="you@example.com"
            required
          />
          <label className="text-md" htmlFor="password">
            Password
          </label>
          <input
            className="rounded-xl px-4 py-2 bg-inherit border mb-6"
            type="password"
            name="password"
            placeholder="••••••••"
            //required
          />
          <SubmitButton
            formAction={signIn}
            className="bg-green-700 rounded-xl px-4 py-2 text-foreground mb-2"
            pendingText="Signing In..."
          >
            Sign In
          </SubmitButton>
          <SubmitButton
            formAction={signUp}
            className="border border-foreground/20 rounded-xl px-4 py-2 text-foreground mb-2"
            pendingText="Signing Up..."
          >
            Sign Up
          </SubmitButton>

          {message && (
            <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
              {message}
            </p>
          )}
        </form>

        <button
          onClick={handleSignInWithGoogle}
          className="border border-foreground/20 rounded-xl px-4 py-2 text-foreground mb-2"
        >
          Sign In with Google
        </button>
        <button
          onClick={handleResetPassword}
          className="font-extralight text-left text-blue-400"
        >
          Forgot password
        </button>
      </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="flex-1 flex justify-center items-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
