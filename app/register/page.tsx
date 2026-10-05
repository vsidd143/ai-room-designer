"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError("Please enter your full name.");
      setLoading(false);
      return;
    }

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters long."
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } =
      await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
          },
        },
      });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    /*
     * If Supabase immediately creates a session,
     * the user can go directly to the dashboard.
     */
    if (data.session) {
      setMessage(
        "Account created successfully. Redirecting..."
      );

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 700);

      return;
    }

    /*
     * If email confirmation is enabled,
     * Supabase will require the user to confirm
     * their email before signing in.
     */
    setMessage(
      "Account created successfully. Please check your email to confirm your account."
    );

    setLoading(false);
  }

  async function handleResendConfirmation() {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setError(
        "Enter your email address before resending the confirmation email."
      );
      return;
    }

    setResending(true);
    setMessage("");
    setError("");

    const { error: resendError } =
      await supabase.auth.resend({
        type: "signup",
        email: trimmedEmail,
      });

    if (resendError) {
      setError(resendError.message);
      setResending(false);
      return;
    }

    setMessage(
      "Confirmation email sent. Please check your inbox."
    );

    setResending(false);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070b] text-white">
      {/* Ambient Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-purple-600/[0.12] blur-[150px]" />

        <div className="absolute left-[-200px] top-[40%] h-[500px] w-[500px] rounded-full bg-indigo-600/[0.08] blur-[140px]" />

        <div className="absolute right-[-180px] bottom-[-150px] h-[500px] w-[500px] rounded-full bg-fuchsia-600/[0.07] blur-[140px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,7,11,0.65)_100%)]" />
      </div>

      {/* Navbar */}
      <header className="relative z-20 border-b border-white/[0.06] bg-black/20 backdrop-blur-xl">
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

          <Link
            href="/"
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/60 transition hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white"
          >
            Home
          </Link>
        </div>
      </header>

      {/* Main */}
      <section className="relative z-10 flex min-h-[calc(100vh-64px)] items-center px-5 py-10 sm:px-8">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_460px]">
          {/* Left Content */}
          <div className="hidden lg:block">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-400/15 bg-purple-500/[0.06] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-purple-300/80">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              AI Interior Intelligence
            </div>

            <h1 className="max-w-xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-white xl:text-6xl">
              Design your
              <span className="block bg-gradient-to-r from-purple-300 via-violet-300 to-indigo-300 bg-clip-text text-transparent">
                perfect space.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-white/35">
              Create your SmartRoom account and transform
              your room with AI-powered interior design.
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur-xl">
                <div className="text-xl text-purple-300">
                  ✦
                </div>

                <div className="mt-3 text-xs font-medium text-white/70">
                  AI Design
                </div>

                <div className="mt-1 text-[10px] leading-4 text-white/25">
                  Smart room transformations
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur-xl">
                <div className="text-xl text-indigo-300">
                  ◇
                </div>

                <div className="mt-3 text-xs font-medium text-white/70">
                  Your Budget
                </div>

                <div className="mt-1 text-[10px] leading-4 text-white/25">
                  Designs within your budget
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur-xl">
                <div className="text-xl text-fuchsia-300">
                  ◎
                </div>

                <div className="mt-3 text-xs font-medium text-white/70">
                  Save Designs
                </div>

                <div className="mt-1 text-[10px] leading-4 text-white/25">
                  Keep your designs
                </div>
              </div>
            </div>
          </div>

          {/* Register Card */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-purple-500/[0.04] blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.09] bg-white/[0.04] p-7 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-9">
              {/* Card Glow */}
              <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-[250px] w-[250px] rounded-full bg-purple-500/[0.08] blur-[80px]" />

              <div className="relative">
                {/* Header */}
                <div className="mb-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/15 bg-purple-500/[0.08]">
                    <span className="text-lg font-semibold text-purple-300">
                      R
                    </span>
                  </div>

                  <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white">
                    Create your account
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/30">
                    Start creating intelligent interior
                    designs with SmartRoom.
                  </p>
                </div>

                {/* Form */}
                <form
                  onSubmit={handleRegister}
                  className="space-y-5"
                >
                  {/* Full Name */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-white/55">
                      Full Name
                    </label>

                    <div className="flex h-12 items-center rounded-xl border border-white/[0.08] bg-black/20 transition focus-within:border-purple-400/40 focus-within:bg-purple-500/[0.025] focus-within:ring-4 focus-within:ring-purple-500/[0.06]">
                      <div className="flex w-11 items-center justify-center text-xs text-purple-300/70">
                        ◎
                      </div>

                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(event) =>
                          setName(event.target.value)
                        }
                        placeholder="Enter your full name"
                        autoComplete="name"
                        className="h-full flex-1 bg-transparent pr-4 text-sm text-white outline-none placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-white/55">
                      Email Address
                    </label>

                    <div className="flex h-12 items-center rounded-xl border border-white/[0.08] bg-black/20 transition focus-within:border-purple-400/40 focus-within:bg-purple-500/[0.025] focus-within:ring-4 focus-within:ring-purple-500/[0.06]">
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
                        autoComplete="email"
                        className="h-full flex-1 bg-transparent pr-4 text-sm text-white outline-none placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-white/55">
                      Password
                    </label>

                    <div className="flex h-12 items-center rounded-xl border border-white/[0.08] bg-black/20 transition focus-within:border-purple-400/40 focus-within:bg-purple-500/[0.025] focus-within:ring-4 focus-within:ring-purple-500/[0.06]">
                      <div className="flex w-11 items-center justify-center text-xs text-purple-300/70">
                        •••
                      </div>

                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(event) =>
                          setPassword(
                            event.target.value
                          )
                        }
                        placeholder="Minimum 6 characters"
                        autoComplete="new-password"
                        className="h-full flex-1 bg-transparent pr-4 text-sm text-white outline-none placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-white/55">
                      Confirm Password
                    </label>

                    <div className="flex h-12 items-center rounded-xl border border-white/[0.08] bg-black/20 transition focus-within:border-purple-400/40 focus-within:bg-purple-500/[0.025] focus-within:ring-4 focus-within:ring-purple-500/[0.06]">
                      <div className="flex w-11 items-center justify-center text-xs text-purple-300/70">
                        ✓
                      </div>

                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(
                            event.target.value
                          )
                        }
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        className="h-full flex-1 bg-transparent pr-4 text-sm text-white outline-none placeholder:text-white/20"
                      />
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="rounded-xl border border-red-400/15 bg-red-500/[0.08] px-4 py-3 text-sm leading-5 text-red-300">
                      {error}
                    </div>
                  )}

                  {/* Success */}
                  {message && (
                    <div className="rounded-xl border border-green-400/15 bg-green-500/[0.08] px-4 py-3 text-sm leading-5 text-green-300">
                      {message}
                    </div>
                  )}

                  {/* Create Account */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl border border-purple-300/20 bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:-translate-y-0.5 hover:shadow-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="relative z-10">
                      {loading
                        ? "Creating Account..."
                        : "Create Account"}
                    </span>

                    {!loading && (
                      <span className="relative z-10 ml-3 text-lg transition group-hover:translate-x-1">
                        →
                      </span>
                    )}

                    <div className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />
                  </button>
                </form>

                {/* Resend Confirmation */}
                {message &&
                  !loading &&
                  !message.includes(
                    "Redirecting"
                  ) && (
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resending}
                      className="mt-4 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-xs font-medium text-white/45 transition hover:border-purple-400/20 hover:bg-purple-500/[0.05] hover:text-purple-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {resending
                        ? "Sending..."
                        : "Resend Confirmation Email"}
                    </button>
                  )}

                {/* Login */}
                <div className="mt-7 border-t border-white/[0.06] pt-6 text-center">
                  <p className="text-xs text-white/25">
                    Already have a SmartRoom account?
                  </p>

                  <Link
                    href="/login"
                    className="mt-2 inline-flex text-sm font-medium text-purple-300 transition hover:text-purple-200"
                  >
                    Sign in to your account →
                  </Link>
                </div>

                {/* Footer Note */}
                <p className="mt-6 text-center text-[10px] leading-4 text-white/15">
                  By creating an account, you can save and
                  manage your AI interior designs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="relative z-10 px-5 pb-8 text-center sm:px-8">
        <span className="text-[9px] uppercase tracking-[0.22em] text-white/15">
          SMARTROOM • AI INTERIOR INTELLIGENCE
        </span>
      </div>
    </main>
  );
}