"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setResetMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleForgotPassword() {
    setResetMessage("");
    setMessage("");

    if (!email.trim()) {
      setResetMessage("Please enter your email address first.");
      return;
    }

    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      setResetMessage(error.message);
      setResetLoading(false);
      return;
    }

    setResetMessage(
      "Password reset link has been sent to your email."
    );

    setResetLoading(false);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070b] text-white">
      {/* =========================
          AMBIENT BACKGROUND
      ========================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-280px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-purple-600/[0.10] blur-[150px]" />

        <div className="absolute left-[-180px] top-[35%] h-[500px] w-[500px] rounded-full bg-indigo-600/[0.07] blur-[140px]" />

        <div className="absolute right-[-180px] bottom-[-120px] h-[500px] w-[500px] rounded-full bg-fuchsia-600/[0.06] blur-[140px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,7,11,0.55)_100%)]" />
      </div>

      {/* =========================
          TOP NAVBAR
      ========================== */}

      <header className="relative z-10 border-b border-white/[0.06] bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/[0.08] transition group-hover:border-purple-400/40 group-hover:bg-purple-500/[0.12]">
              <span className="text-sm font-bold text-purple-300">
                R
              </span>
            </div>

            <div>
              <div className="text-sm font-semibold tracking-wide text-white">
                Smart
                <span className="text-purple-300">
                  Room
                </span>
              </div>

              <div className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                Interior Intelligence
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-white/35 sm:block">
              New to SmartRoom?
            </span>

            <Link
              href="/register"
              className="rounded-xl border border-purple-400/20 bg-purple-500/[0.06] px-4 py-2 text-xs font-medium text-purple-300 transition hover:border-purple-400/40 hover:bg-purple-500/[0.12]"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      {/* =========================
          MAIN
      ========================== */}

      <section className="relative z-10 flex min-h-[calc(100vh-64px)] items-center px-5 py-12 sm:px-8">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1fr_430px]">
          
          {/* =========================
              LEFT CONTENT
          ========================== */}

          <div className="hidden lg:block">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-400/15 bg-purple-500/[0.06] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-purple-300/80">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                Intelligent Interiors
              </div>

              <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white xl:text-7xl">
                Design spaces
                <br />
                <span className="bg-gradient-to-r from-purple-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
                  worth coming home to.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-sm leading-7 text-white/40">
                Transform your room into a space that feels
                uniquely yours with AI-powered interior
                design, intelligent recommendations and
                personalized room transformations.
              </p>

              <div className="mt-9 flex items-center gap-6">
                <div>
                  <div className="text-lg font-semibold text-white">
                    AI
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/25">
                    Powered Design
                  </div>
                </div>

                <div className="h-8 w-px bg-white/[0.08]" />

                <div>
                  <div className="text-lg font-semibold text-white">
                    10+
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/25">
                    Room Types
                  </div>
                </div>

                <div className="h-8 w-px bg-white/[0.08]" />

                <div>
                  <div className="text-lg font-semibold text-white">
                    24/7
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/25">
                    Available
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =========================
              LOGIN CARD
          ========================== */}

          <div className="relative">
            <div className="absolute -inset-5 rounded-[40px] bg-purple-500/[0.05] blur-3xl" />

            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] p-7 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-9">
              
              <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-[220px] w-[220px] rounded-full bg-purple-500/[0.10] blur-[70px]" />

              <div className="relative">
                {/* HEADER */}

                <div className="mb-8">
                  <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-purple-300/70">
                    Welcome Back
                  </div>

                  <h2 className="text-3xl font-semibold tracking-tight text-white">
                    Sign in to SmartRoom
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/35">
                    Continue creating beautiful spaces with
                    AI.
                  </p>
                </div>

                {/* FORM */}

                <form
                  onSubmit={handleLogin}
                  className="space-y-5"
                >
                  {/* EMAIL */}

                  <div>
                    <label className="mb-2 block text-xs font-medium text-white/55">
                      Email address
                    </label>

                    <div className="group flex h-12 items-center rounded-xl border border-white/[0.08] bg-black/20 transition focus-within:border-purple-400/40 focus-within:bg-purple-500/[0.025] focus-within:ring-4 focus-within:ring-purple-500/[0.06]">
                      <div className="flex w-11 items-center justify-center text-xs text-purple-300/70">
                        @
                      </div>

                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        placeholder="you@example.com"
                        className="h-full flex-1 bg-transparent pr-4 text-sm text-white outline-none placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-xs font-medium text-white/55">
                        Password
                      </label>

                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={resetLoading}
                        className="text-xs font-medium text-purple-300 transition hover:text-purple-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {resetLoading
                          ? "Sending..."
                          : "Forgot password?"}
                      </button>
                    </div>

                    <div className="group flex h-12 items-center rounded-xl border border-white/[0.08] bg-black/20 transition focus-within:border-purple-400/40 focus-within:bg-purple-500/[0.025] focus-within:ring-4 focus-within:ring-purple-500/[0.06]">
                      <div className="flex w-11 items-center justify-center text-xs text-purple-300/70">
                        ••
                      </div>

                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        placeholder="••••••••"
                        className="h-full flex-1 bg-transparent pr-4 text-sm text-white outline-none placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  {/* RESET MESSAGE */}

                  {resetMessage && (
                    <div className="rounded-xl border border-purple-400/15 bg-purple-500/[0.08] px-4 py-3 text-sm leading-6 text-purple-200">
                      {resetMessage}
                    </div>
                  )}

                  {/* ERROR */}

                  {message && (
                    <div className="rounded-xl border border-red-400/15 bg-red-500/[0.08] px-4 py-3 text-sm leading-6 text-red-300">
                      {message}
                    </div>
                  )}

                  {/* SIGN IN */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative mt-2 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl border border-purple-300/20 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 px-4 font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:-translate-y-0.5 hover:shadow-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="relative z-10">
                      {loading
                        ? "Signing in..."
                        : "Sign In"}
                    </span>

                    {!loading && (
                      <span className="relative z-10 ml-3 text-lg transition group-hover:translate-x-1">
                        →
                      </span>
                    )}

                    <div className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />
                  </button>
                </form>

                {/* DIVIDER */}

                <div className="my-7 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/[0.07]" />

                  <span className="text-[9px] uppercase tracking-[0.18em] text-white/20">
                    Secure Access
                  </span>

                  <div className="h-px flex-1 bg-white/[0.07]" />
                </div>

                {/* REGISTER */}

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
                  <p className="text-xs text-white/35">
                    Don't have an account?
                  </p>

                  <Link
                    href="/register"
                    className="mt-1 inline-block text-sm font-medium text-purple-300 transition hover:text-purple-200"
                  >
                    Create your SmartRoom account →
                  </Link>
                </div>

                {/* BACK HOME */}

                <div className="mt-5 text-center">
                  <Link
                    href="/"
                    className="text-xs text-white/25 transition hover:text-white/60"
                  >
                    ← Back to home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <div className="pointer-events-none fixed bottom-5 left-0 right-0 z-10 text-center">
        <span className="text-[9px] uppercase tracking-[0.22em] text-white/15">
          SMARTROOM • AI INTERIOR INTELLIGENCE
        </span>
      </div>
    </main>
  );
}