"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setReady(true);
      } else {
        setError(
          "This password reset link is invalid or has expired."
        );
      }

      setCheckingSession(false);
    }

    checkSession();
  }, [supabase.auth]);

  async function handleUpdatePassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: updateError } =
      await supabase.auth.updateUser({
        password,
      });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Your password has been updated successfully."
    );

    setLoading(false);

    setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1500);
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07070b] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-purple-400/20 border-t-purple-400" />

          <p className="text-sm text-white/40">
            Verifying reset link...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070b] text-white">
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-280px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-purple-600/[0.10] blur-[150px]" />

        <div className="absolute left-[-180px] top-[35%] h-[500px] w-[500px] rounded-full bg-indigo-600/[0.07] blur-[140px]" />

        <div className="absolute right-[-180px] bottom-[-120px] h-[500px] w-[500px] rounded-full bg-fuchsia-600/[0.06] blur-[140px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,7,11,0.55)_100%)]" />
      </div>

      {/* NAVBAR */}

      <header className="relative z-10 border-b border-white/[0.06] bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/[0.08]">
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
        </div>
      </header>

      {/* MAIN */}

      <section className="relative z-10 flex min-h-[calc(100vh-64px)] items-center justify-center px-5 py-12">
        <div className="relative w-full max-w-[430px]">
          <div className="absolute -inset-5 rounded-[40px] bg-purple-500/[0.05] blur-3xl" />

          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] p-7 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-9">
            <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-[220px] w-[220px] rounded-full bg-purple-500/[0.10] blur-[70px]" />

            <div className="relative">
              <div className="mb-8">
                <div className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-purple-300/70">
                  Account Security
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-white">
                  Reset your password
                </h1>

                <p className="mt-2 text-sm leading-6 text-white/35">
                  Create a new password for your SmartRoom
                  account.
                </p>
              </div>

              {!ready ? (
                <div className="rounded-xl border border-red-400/15 bg-red-500/[0.08] px-4 py-4 text-sm leading-6 text-red-300">
                  {error}
                </div>
              ) : (
                <form
                  onSubmit={handleUpdatePassword}
                  className="space-y-5"
                >
                  {/* NEW PASSWORD */}

                  <div>
                    <label className="mb-2 block text-xs font-medium text-white/55">
                      New password
                    </label>

                    <div className="flex h-12 items-center rounded-xl border border-white/[0.08] bg-black/20 transition focus-within:border-purple-400/40 focus-within:ring-4 focus-within:ring-purple-500/[0.06]">
                      <div className="flex w-11 items-center justify-center text-xs text-purple-300/70">
                        ••
                      </div>

                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        placeholder="Enter new password"
                        className="h-full flex-1 bg-transparent pr-4 text-sm text-white outline-none placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div>
                    <label className="mb-2 block text-xs font-medium text-white/55">
                      Confirm password
                    </label>

                    <div className="flex h-12 items-center rounded-xl border border-white/[0.08] bg-black/20 transition focus-within:border-purple-400/40 focus-within:ring-4 focus-within:ring-purple-500/[0.06]">
                      <div className="flex w-11 items-center justify-center text-xs text-purple-300/70">
                        ••
                      </div>

                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        placeholder="Confirm new password"
                        className="h-full flex-1 bg-transparent pr-4 text-sm text-white outline-none placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  {/* ERROR */}

                  {error && (
                    <div className="rounded-xl border border-red-400/15 bg-red-500/[0.08] px-4 py-3 text-sm leading-6 text-red-300">
                      {error}
                    </div>
                  )}

                  {/* SUCCESS */}

                  {message && (
                    <div className="rounded-xl border border-green-400/15 bg-green-500/[0.08] px-4 py-3 text-sm leading-6 text-green-300">
                      {message}
                    </div>
                  )}

                  {/* UPDATE BUTTON */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl border border-purple-300/20 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 px-4 font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:-translate-y-0.5 hover:shadow-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="relative z-10">
                      {loading
                        ? "Updating password..."
                        : "Update Password"}
                    </span>

                    {!loading && (
                      <span className="relative z-10 ml-3 text-lg transition group-hover:translate-x-1">
                        →
                      </span>
                    )}

                    <div className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />
                  </button>
                </form>
              )}

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="text-xs text-white/30 transition hover:text-white/70"
                >
                  ← Back to login
                </Link>
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