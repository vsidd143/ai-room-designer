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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
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
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
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
        return;
      }

      if (data.session) {
        setMessage("Account created successfully. Redirecting...");

        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 700);

        return;
      }

      setMessage(
        "Account created successfully. Please check your email to confirm your account."
      );
    } catch {
      setError("Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
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

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: trimmedEmail,
      });

      if (resendError) {
        setError(resendError.message);
        return;
      }

      setMessage(
        "Confirmation email sent. Please check your inbox."
      );
    } catch {
      setError("Unable to resend the confirmation email. Please try again.");
    } finally {
      setResending(false);
    }
  }

  function EyeIcon({ visible }: { visible: boolean }) {
    return visible ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 3l18 18" />
        <path d="M10.6 10.6a2 2 0 002.8 2.8" />
        <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.3 4.5 9.5 7-.4.9-1.1 2-2.1 3" />
        <path d="M6.6 6.6C4.4 8 3 10.2 2.5 12c.5 1.1 1.4 2.7 3.1 4.1A10.4 10.4 0 0012 19c1.1 0 2.1-.2 3-.5" />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  const inputClass =
    "h-full min-w-0 flex-1 bg-transparent pr-4 text-sm text-white outline-none placeholder:text-white/25";

  const fieldClass =
    "group flex h-12 items-center rounded-xl border border-white/[0.09] bg-black/25 transition duration-300 focus-within:border-cyan-300/50 focus-within:bg-cyan-400/[0.025] focus-within:ring-4 focus-within:ring-cyan-400/[0.06]";

  const labelClass =
    "mb-2 block text-xs font-medium text-white/60";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08080c] text-white">
      {/* DASHBOARD-MATCHING AMBIENT BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-280px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-violet-500/[0.13] blur-[150px]" />

        <div className="absolute left-[-180px] top-[35%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.07] blur-[140px]" />

        <div className="absolute bottom-[-120px] right-[-180px] h-[500px] w-[500px] rounded-full bg-indigo-500/[0.10] blur-[140px]" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.35)_100%)]" />
      </div>

      {/* NAVBAR */}

      <header className="relative z-10 border-b border-white/[0.06] bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/[0.07] transition duration-300 group-hover:border-cyan-300/50 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.12)]">
              <span className="text-sm font-bold text-cyan-200">R</span>
            </div>

            <div>
              <div className="text-sm font-semibold tracking-wide text-white">
                ROOM<span className="text-cyan-300">AI</span>
              </div>

              <div className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                Smart Interiors
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-cyan-300/20 bg-cyan-400/[0.05] px-4 py-2 text-xs font-medium text-cyan-200 transition duration-300 hover:border-cyan-300/40 hover:bg-cyan-400/10"
          >
            Home
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}

      <section className="relative z-10 flex min-h-[calc(100vh-64px)] items-center px-5 py-10 sm:px-8">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1fr_460px]">
          {/* LEFT CONTENT */}

          <div className="hidden animate-fade-in lg:block">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-400/[0.05] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-200/80">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />
              AI Interior Intelligence
            </div>

            <h1 className="max-w-xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-white xl:text-7xl">
              Design your
              <span className="block bg-gradient-to-r from-cyan-200 via-white to-violet-300 bg-clip-text text-transparent">
                perfect space.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-white/40">
              Create your ROOMAI account and transform your room with
              AI-powered interior design, personalized recommendations
              and intelligent room transformations.
            </p>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              <div className="rounded-2xl border border-cyan-300/10 bg-white/[0.025] p-4 backdrop-blur-xl transition duration-300 hover:border-cyan-300/25 hover:bg-cyan-400/[0.035]">
                <div className="text-xl text-cyan-200">✦</div>
                <div className="mt-3 text-xs font-medium text-white/70">
                  AI Design
                </div>
                <div className="mt-1 text-[10px] leading-4 text-white/30">
                  Smart room transformations
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur-xl transition duration-300 hover:border-violet-300/25 hover:bg-violet-400/[0.035]">
                <div className="text-xl text-violet-300">◇</div>
                <div className="mt-3 text-xs font-medium text-white/70">
                  Your Budget
                </div>
                <div className="mt-1 text-[10px] leading-4 text-white/30">
                  Designs within your budget
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur-xl transition duration-300 hover:border-indigo-300/25 hover:bg-indigo-400/[0.035]">
                <div className="text-xl text-indigo-300">◎</div>
                <div className="mt-3 text-xs font-medium text-white/70">
                  Save Designs
                </div>
                <div className="mt-1 text-[10px] leading-4 text-white/30">
                  Keep your designs
                </div>
              </div>
            </div>

            {/* FUTURISTIC ORB */}

            <div className="relative mt-8 flex h-24 items-center gap-5 overflow-hidden rounded-2xl border border-cyan-300/10 bg-white/[0.025] px-5">
              <div className="login-orb flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-cyan-200/30 bg-gradient-to-br from-cyan-300/50 via-blue-500/50 to-violet-600/60 shadow-[0_0_35px_rgba(34,211,238,0.15)]">
                <span className="text-2xl text-white">✦</span>
              </div>

              <div>
                <p className="text-sm font-medium text-white">
                  Your AI design studio
                </p>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  Imagine it. Design it. Make it yours.
                </p>
              </div>

              <div className="pointer-events-none absolute right-5 top-5 h-16 w-16 rounded-full bg-violet-500/10 blur-2xl" />
            </div>
          </div>

          {/* REGISTER CARD */}

          <div className="relative animate-card-in">
            <div className="absolute -inset-5 rounded-[40px] bg-gradient-to-br from-cyan-500/[0.07] via-violet-500/[0.06] to-indigo-500/[0.07] blur-3xl" />

            <div className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-[#101018]/85 p-7 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-9">
              <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-[220px] w-[220px] rounded-full bg-cyan-500/[0.08] blur-[70px]" />

              <div className="pointer-events-none absolute bottom-[-100px] left-[-80px] h-[200px] w-[200px] rounded-full bg-violet-500/[0.08] blur-[70px]" />

              <div className="relative">
                {/* HEADER */}

                <div className="mb-7">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/[0.07]">
                    <span className="text-lg font-semibold text-cyan-200">
                      R
                    </span>
                  </div>

                  <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-200/80">
                    Join ROOMAI
                  </div>

                  <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    Create your account
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/40">
                    Start creating intelligent interior designs with AI.
                  </p>
                </div>

                {/* FORM */}

                <form onSubmit={handleRegister} className="space-y-4">
                  {/* FULL NAME */}

                  <div>
                    <label htmlFor="register-name" className={labelClass}>
                      Full Name
                    </label>

                    <div className={fieldClass}>
                      <div className="flex w-11 items-center justify-center text-xs text-cyan-200/80">
                        ◎
                      </div>

                      <input
                        id="register-name"
                        type="text"
                        required
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Enter your full name"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* EMAIL */}

                  <div>
                    <label htmlFor="register-email" className={labelClass}>
                      Email Address
                    </label>

                    <div className={fieldClass}>
                      <div className="flex w-11 items-center justify-center text-xs text-cyan-200/80">
                        @
                      </div>

                      <input
                        id="register-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}

                  <div>
                    <label htmlFor="register-password" className={labelClass}>
                      Password
                    </label>

                    <div className={fieldClass}>
                      <div className="flex w-11 items-center justify-center text-xs text-cyan-200/80">
                        ••
                      </div>

                      <input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Minimum 6 characters"
                        className="h-full min-w-0 flex-1 bg-transparent pr-2 text-sm text-white outline-none placeholder:text-white/25"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        className="mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-cyan-200/70 transition hover:bg-cyan-400/10 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                      >
                        <EyeIcon visible={showPassword} />
                      </button>
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div>
                    <label
                      htmlFor="confirm-password"
                      className={labelClass}
                    >
                      Confirm Password
                    </label>

                    <div className={fieldClass}>
                      <div className="flex w-11 items-center justify-center text-xs text-cyan-200/80">
                        ✓
                      </div>

                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        minLength={6}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        placeholder="Re-enter your password"
                        className="h-full min-w-0 flex-1 bg-transparent pr-2 text-sm text-white outline-none placeholder:text-white/25"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((current) => !current)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                        aria-pressed={showConfirmPassword}
                        className="mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-cyan-200/70 transition hover:bg-cyan-400/10 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60"
                      >
                        <EyeIcon visible={showConfirmPassword} />
                      </button>
                    </div>
                  </div>

                  {/* ERROR MESSAGE */}

                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-400/20 bg-red-500/[0.08] px-4 py-3 text-sm leading-5 text-red-300"
                    >
                      {error}
                    </div>
                  )}

                  {/* SUCCESS MESSAGE */}

                  {message && (
                    <div
                      role="status"
                      className="rounded-xl border border-cyan-300/15 bg-cyan-400/[0.06] px-4 py-3 text-sm leading-6 text-cyan-100"
                    >
                      {message}
                    </div>
                  )}

                  {/* CREATE ACCOUNT */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative mt-2 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl border border-cyan-200/20 bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 px-4 font-semibold text-slate-950 shadow-lg shadow-cyan-900/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(34,211,238,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="relative z-10">
                      {loading ? "Creating Account..." : "Create Account"}
                    </span>

                    {!loading && (
                      <span className="relative z-10 ml-3 text-lg transition duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    )}

                    <div className="absolute inset-0 bg-white/20 opacity-0 transition duration-300 group-hover:opacity-100" />
                  </button>
                </form>

                {/* RESEND CONFIRMATION */}

                {message &&
                  !message.includes("Redirecting") && (
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      disabled={resending}
                      className="mt-4 w-full rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-xs font-medium text-white/50 transition hover:border-cyan-300/20 hover:bg-cyan-400/[0.04] hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {resending
                        ? "Sending..."
                        : "Resend Confirmation Email"}
                    </button>
                  )}

                {/* LOGIN */}

                <div className="mt-7 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-center">
                  <p className="text-xs text-white/40">
                    Already have a ROOMAI account?
                  </p>

                  <Link
                    href="/login"
                    className="mt-2 inline-block text-sm font-medium text-cyan-200 transition hover:text-violet-200"
                  >
                    Sign in to your account →
                  </Link>
                </div>

                {/* BACK HOME */}

                <div className="mt-5 text-center">
                  <Link
                    href="/"
                    className="text-xs text-white/30 transition hover:text-cyan-200"
                  >
                    ← Back to home
                  </Link>
                </div>

                <p className="mt-6 text-center text-[9px] uppercase tracking-[0.18em] text-white/20">
                  ROOMAI • AI INTERIOR INTELLIGENCE
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANIMATIONS */}

      <style jsx global>{`
        @keyframes register-fade-in {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes register-orb-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-7px);
          }
        }

        .animate-fade-in {
          animation: register-fade-in 0.8s ease-out both;
        }

        .animate-card-in {
          animation: register-fade-in 0.7s ease-out both;
          animation-delay: 0.12s;
        }

        .login-orb {
          animation: register-orb-float 4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in,
          .animate-card-in,
          .login-orb {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}