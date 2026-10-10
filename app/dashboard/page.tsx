"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Design = {
  id: string;
  original_image_url?: string | null;
  generated_image_url?: string | null;
  room_analysis?: Record<string, any> | null;
  final_analysis?: Record<string, any> | null;
  budget?: string | number | null;
  style?: string | null;
  created_at?: string;
};

export default function DashboardPage() {
  const [loaded, setLoaded] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [userName, setUserName] = useState("Designer");
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const supabase = createClient();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("USER LOAD ERROR:", authError);
        }

        if (user && active) {
          const metadata = user.user_metadata ?? {};

          const name =
            metadata.full_name ||
            metadata.name ||
            metadata.display_name ||
            metadata.first_name ||
            user.email?.split("@")[0] ||
            "Designer";

          setUserName(String(name).trim() || "Designer");
        }

        const response = await fetch("/api/my-designs", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.error || "Unable to load your saved designs."
          );
        }

        const savedDesigns: Design[] = Array.isArray(result)
          ? result
          : Array.isArray(result?.designs)
            ? result.designs
            : [];

        if (active) {
          setDesigns(savedDesigns);
        }
      } catch (err) {
        console.error("DASHBOARD ERROR:", err);

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading your dashboard."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    const timer = window.setTimeout(() => setLoaded(true), 100);

    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      active = false;
      window.clearTimeout(timer);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  function getRoomType(design: Design) {
    const analysis =
      design.final_analysis || design.room_analysis || {};

    return (
      analysis.roomType ||
      analysis.room_type ||
      analysis.room ||
      "Room Design"
    );
  }

  function getBudget(budget: Design["budget"]) {
    if (budget === null || budget === undefined || budget === "") {
      return "Not specified";
    }

    if (typeof budget === "number") {
      return `₹${budget.toLocaleString("en-IN")}`;
    }

    return budget;
  }

  function getStyle(style?: string | null) {
    if (!style) return "Custom Style";

    return style.charAt(0).toUpperCase() + style.slice(1);
  }

  function getDate(date?: string) {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "";

    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main
      className={`relative min-h-screen overflow-hidden bg-[#08080c] text-white transition-opacity duration-700 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* ANIMATED BACKGROUND */}

      <div
        className="pointer-events-none absolute inset-[-40px] transition-transform duration-300"
        style={{
          transform: `translate(${mouse.x * -5}px, ${mouse.y * -5}px)`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.17),transparent_45%),radial-gradient(circle_at_90%_50%,rgba(59,130,246,0.07),transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#08080c_0%,#101018_50%,#08080c_100%)]" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.3)_100%)]" />

      {/* NAVIGATION */}

      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between border-b border-white/[0.06] px-5 py-5 md:px-10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 shadow-[0_0_25px_rgba(139,92,246,0.12)]">
            <span className="text-xl font-black text-purple-200">R</span>
          </div>

          <div>
            <p className="text-sm font-bold tracking-[0.25em]">
              ROOM<span className="text-purple-400">AI</span>
            </p>
            <p className="mt-1 text-[9px] tracking-[0.25em] text-slate-500">
              SMART INTERIORS
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 md:flex">
          <Link
            href="/dashboard"
            className="rounded-full bg-white/10 px-5 py-2.5 text-xs text-white transition hover:bg-white/15"
          >
            Studio
          </Link>

          <Link
            href="/planner"
            className="rounded-full px-5 py-2.5 text-xs text-slate-400 transition hover:text-white"
          >
            New Design
          </Link>

          <Link
            href="/my-designs"
            className="rounded-full px-5 py-2.5 text-xs text-slate-400 transition hover:text-white"
          >
            My Designs
          </Link>

          <Link
            href="/profile"
            className="rounded-full px-5 py-2.5 text-xs text-slate-400 transition hover:text-white"
          >
            Profile
          </Link>
        </div>

        <Link
          href="/profile"
          aria-label="Open profile"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/10 text-sm font-semibold text-cyan-100 transition duration-300 hover:scale-110 hover:bg-cyan-400/20"
        >
          {userName.charAt(0).toUpperCase()}
        </Link>
      </nav>

      {/* MOBILE NAVIGATION */}

      <div className="relative z-20 flex gap-2 overflow-x-auto px-5 py-3 md:hidden">
        <Link
          href="/dashboard"
          className="whitespace-nowrap rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-xs text-cyan-100"
        >
          Studio
        </Link>

        <Link
          href="/planner"
          className="whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-xs text-slate-400 transition hover:text-white"
        >
          New Design
        </Link>

        <Link
          href="/my-designs"
          className="whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-xs text-slate-400 transition hover:text-white"
        >
          My Designs
        </Link>

        <Link
          href="/profile"
          className="whitespace-nowrap rounded-full border border-white/10 px-4 py-2 text-xs text-slate-400 transition hover:text-white"
        >
          Profile
        </Link>
      </div>

      {/* MAIN DASHBOARD */}

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-10 md:px-10 md:pt-16">
        {/* FUTURISTIC AI WELCOME SECTION */}

        <div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/10 bg-[#0c0d17]/70 px-6 py-8 shadow-[0_0_70px_rgba(34,211,238,0.05)] backdrop-blur-xl sm:px-10 sm:py-10 lg:px-12">
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/[0.08] blur-3xl" />

          <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-violet-500/[0.12] blur-3xl" />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_330px]">
            {/* WELCOME TEXT */}

            <div className="animate-welcome-in">
              <div className="mb-5 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />

                <span className="text-[10px] font-semibold tracking-[0.3em] text-cyan-200">
                  YOUR PERSONAL DESIGN STUDIO
                </span>
              </div>

              <h1 className="max-w-3xl text-4xl font-light leading-tight tracking-tight sm:text-5xl md:text-6xl">
                Welcome back,
                <br />
                <span className="bg-gradient-to-r from-cyan-200 via-white to-violet-300 bg-clip-text font-serif italic text-transparent">
                  {userName}.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 md:text-base">
                Your space, your style, your vision. Continue exploring your
                saved designs or create something extraordinary with AI.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/planner"
                  className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan-200 to-violet-300 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-[0_0_30px_rgba(103,232,249,0.15)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(103,232,249,0.3)]"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-lg text-cyan-100 transition-transform duration-300 group-hover:rotate-90">
                    +
                  </span>

                  Create New Design

                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>

                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                  AI Studio Ready
                </span>
              </div>
            </div>

            {/* ANIMATED AI ORB */}

            <div className="relative mx-auto flex h-[250px] w-full max-w-[300px] items-center justify-center sm:h-[300px]">
              <div className="orb-grid absolute inset-3 rounded-full opacity-40" />

              <div className="orb-ring orb-ring-one absolute h-[205px] w-[205px] rounded-full border border-cyan-200/30 sm:h-[240px] sm:w-[240px]" />

              <div className="orb-ring orb-ring-two absolute h-[170px] w-[230px] rounded-[50%] border border-violet-300/30 sm:h-[190px] sm:w-[265px]" />

              <div className="orb-ring orb-ring-three absolute h-[230px] w-[150px] rounded-[50%] border border-cyan-100/20 sm:h-[265px] sm:w-[175px]" />

              <div className="orb-core relative flex h-32 w-32 items-center justify-center rounded-full sm:h-40 sm:w-40">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-200/80 via-blue-500/60 to-violet-600/90 blur-xl" />

                <div className="orb-core-inner absolute inset-2 rounded-full border border-white/30 bg-gradient-to-br from-cyan-100/80 via-blue-500/70 to-violet-700/90 shadow-[inset_-10px_-12px_28px_rgba(5,8,30,0.65),0_0_50px_rgba(34,211,238,0.3)]" />

                <div className="absolute left-[22%] top-[18%] h-8 w-14 rotate-[-35deg] rounded-full bg-white/50 blur-md" />

                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-2xl text-white shadow-lg backdrop-blur-md">
                  ✦
                </div>
              </div>

              <span className="orb-particle orb-particle-one absolute left-[16%] top-[25%] h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,1)]" />

              <span className="orb-particle orb-particle-two absolute right-[13%] top-[35%] h-1.5 w-1.5 rounded-full bg-violet-200 shadow-[0_0_15px_rgba(196,181,253,1)]" />

              <span className="orb-particle orb-particle-three absolute bottom-[18%] left-[27%] h-1.5 w-1.5 rounded-full bg-blue-200 shadow-[0_0_15px_rgba(147,197,253,1)]" />

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-cyan-200/15 bg-slate-950/70 px-4 py-2 text-[10px] tracking-[0.25em] text-cyan-100/80 backdrop-blur-md">
                <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                ROOMAI INTELLIGENCE
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_10px_40px_rgba(34,211,238,0.06)]">
            <p className="text-xs tracking-wide text-slate-400">
              Saved Designs
            </p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-3xl font-light">
                {loading ? "—" : designs.length}
              </p>
              <span className="text-xl text-cyan-200">✦</span>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Your personal collection
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-violet-300/30 hover:shadow-[0_10px_40px_rgba(139,92,246,0.06)]">
            <p className="text-xs tracking-wide text-slate-400">
              Design Studio
            </p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-2xl font-light">AI Powered</p>
              <span className="text-xl text-violet-300">✧</span>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Analyze and reimagine your room
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_10px_40px_rgba(34,211,238,0.06)]">
            <p className="text-xs tracking-wide text-slate-400">
              Next Step
            </p>

            <div className="mt-3 flex items-end justify-between">
              <p className="text-2xl font-light">Create</p>
              <span className="text-xl text-cyan-200">↗</span>
            </div>

            <Link
              href="/planner"
              className="mt-2 inline-block text-xs text-cyan-200 transition hover:text-white"
            >
              Start a new project →
            </Link>
          </div>
        </div>

        {/* SAVED DESIGNS HEADING */}

        <div className="mt-16 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.3em] text-cyan-200">
              YOUR COLLECTION
            </p>

            <h2 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl">
              Recent designs
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Your saved room transformations, all in one place.
            </p>
          </div>

          <Link
            href="/my-designs"
            className="w-fit text-sm text-slate-300 transition hover:text-cyan-200"
          >
            View all designs <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* DESIGN STATES */}

        {loading ? (
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <div className="h-56 bg-white/[0.06]" />

                <div className="space-y-3 p-5">
                  <div className="h-4 w-2/3 rounded bg-white/10" />
                  <div className="h-3 w-1/2 rounded bg-white/[0.06]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-7 rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-7">
            <h3 className="text-lg font-medium">Unable to load designs</h3>

            <p className="mt-2 text-sm text-red-200">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-105"
            >
              Try again
            </button>
          </div>
        ) : designs.length > 0 ? (
          <>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {designs.slice(0, 3).map((design) => {
                const roomType = getRoomType(design);

                return (
                  <Link
                    key={design.id}
                    href="/my-designs"
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111117]/80 transition duration-500 hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_15px_50px_rgba(34,211,238,0.08)]"
                  >
                    <div className="relative h-56 overflow-hidden bg-white/[0.04]">
                      {design.generated_image_url ? (
                        <img
                          src={design.generated_image_url}
                          alt={`${roomType} redesigned room`}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-500">
                          Image preview unavailable
                        </div>
                      )}

                      <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[10px] tracking-wide text-white backdrop-blur-md">
                        AI REDESIGN
                      </div>

                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />

                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-lg font-medium text-white">
                          {roomType}
                        </p>

                        {design.created_at && (
                          <p className="mt-1 text-xs text-slate-300">
                            {getDate(design.created_at)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 p-5">
                      <div className="min-w-0">
                        <p className="text-[10px] tracking-[0.2em] text-slate-500">
                          INTERIOR STYLE
                        </p>

                        <p className="mt-1 truncate text-sm text-slate-200">
                          {getStyle(design.style)}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-[10px] tracking-[0.2em] text-slate-500">
                          BUDGET
                        </p>

                        <p className="mt-1 text-sm font-medium text-cyan-200">
                          {getBudget(design.budget)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3 text-xs text-slate-400 transition group-hover:text-cyan-200">
                      View design details
                      <span aria-hidden="true">↗</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* VIEW MORE DESIGNS - ONLY WHEN MORE THAN 3 EXIST */}

            {designs.length > 3 && (
              <div className="mt-8 flex justify-center">
                <Link
                  href="/my-designs"
                  className="group inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-gradient-to-r from-cyan-400/[0.08] to-violet-400/[0.08] px-7 py-3.5 text-sm font-medium text-cyan-100 shadow-[0_0_25px_rgba(34,211,238,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-cyan-400/[0.12] hover:shadow-[0_0_30px_rgba(34,211,238,0.10)]"
                >
                  View More Designs
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-14 text-center sm:px-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-3xl text-cyan-200">
              ✦
            </div>

            <h3 className="mt-6 text-2xl font-light">
              Your creative journey starts here
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-400">
              Choose a room, set your budget and style, and let AI help you
              imagine a fresh new look for your space.
            </p>

            <Link
              href="/planner"
              className="mt-7 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan-200 to-violet-300 px-6 py-3.5 text-sm font-semibold text-slate-950 transition duration-300 hover:scale-[1.02]"
            >
              <span>+</span>
              Create your first design
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}

        {/* BOTTOM CTA */}

        <div className="relative mt-16 overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-r from-cyan-500/[0.07] via-white/[0.025] to-violet-500/[0.08] p-7 sm:p-10">
          <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.3em] text-cyan-200">
                READY FOR A CHANGE?
              </p>

              <h3 className="mt-3 text-2xl font-light sm:text-3xl">
                Imagine a space that feels like you.
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Start a new room project with your own style and budget.
              </p>
            </div>

            <Link
              href="/planner"
              className="inline-flex w-fit shrink-0 items-center gap-3 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3.5 text-sm text-white transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/10"
            >
              Start a new project
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <footer className="mt-12 flex flex-col justify-between gap-3 border-t border-white/[0.06] pt-6 text-[10px] tracking-wider text-slate-600 sm:flex-row">
          <span>ROOMAI STUDIO · SMART INTERIORS</span>
          <span>DESIGNED AROUND YOUR VISION</span>
        </footer>
      </section>

      {/* ANIMATION STYLES */}

      <style jsx global>{`
        @keyframes welcome-in {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes orb-float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(2deg);
          }
        }

        @keyframes orb-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes orb-spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes particle-drift {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
            opacity: 0.55;
          }
          50% {
            transform: translate3d(7px, -12px, 0);
            opacity: 1;
          }
        }

        @keyframes orb-breathe {
          0%,
          100% {
            filter: saturate(1);
          }
          50% {
            filter: saturate(1.35);
          }
        }

        .animate-welcome-in {
          animation: welcome-in 0.75s ease-out both;
        }

        .orb-core {
          animation: orb-float 5s ease-in-out infinite;
        }

        .orb-core-inner {
          animation: orb-breathe 4s ease-in-out infinite;
        }

        .orb-ring-one {
          animation: orb-spin 16s linear infinite;
        }

        .orb-ring-two {
          animation: orb-spin-reverse 21s linear infinite;
        }

        .orb-ring-three {
          animation: orb-spin 25s linear infinite;
        }

        .orb-particle-one {
          animation: particle-drift 3.8s ease-in-out infinite;
        }

        .orb-particle-two {
          animation: particle-drift 4.4s ease-in-out infinite 0.6s;
        }

        .orb-particle-three {
          animation: particle-drift 3.3s ease-in-out infinite 1s;
        }

        .orb-grid {
          background-image: radial-gradient(
            rgba(165, 243, 252, 0.22) 1px,
            transparent 1px
          );
          background-size: 13px 13px;
          mask-image: radial-gradient(circle, black 0%, transparent 70%);
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-welcome-in,
          .orb-core,
          .orb-core-inner,
          .orb-ring-one,
          .orb-ring-two,
          .orb-ring-three,
          .orb-particle-one,
          .orb-particle-two,
          .orb-particle-three {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}
