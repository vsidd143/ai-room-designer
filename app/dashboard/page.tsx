"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [loaded, setLoaded] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 120);

    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x:
          (event.clientX / window.innerWidth - 0.5) * 2,
        y:
          (event.clientY / window.innerHeight - 0.5) * 2,
      });
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    return () => {
      clearTimeout(timer);
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  }, []);

  return (
    <main
      className={`relative min-h-screen overflow-hidden bg-[#08080c] text-white transition-opacity duration-1000 ${
        loaded
          ? "opacity-100"
          : "opacity-0"
      }`}
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div
        className="pointer-events-none absolute inset-[-40px] transition-transform duration-700 ease-out"
        style={{
          transform: `
            scale(1.05)
            translate(
              ${mouse.x * -7}px,
              ${mouse.y * -7}px
            )
          `,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(139,92,246,0.18),transparent_30%),radial-gradient(circle_at_15%_70%,rgba(59,130,246,0.08),transparent_25%),radial-gradient(circle_at_85%_70%,rgba(168,85,247,0.08),transparent_25%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(120deg,#08080c_0%,#101018_45%,#08080c_100%)]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* Dark overlay */}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.45)_100%)]" />

      {/* =====================================================
          FLOATING ORBS
      ====================================================== */}

      <div
        className="pointer-events-none absolute left-[8%] top-[20%] h-64 w-64 rounded-full bg-purple-600/10 blur-3xl transition-transform duration-1000 ease-out"
        style={{
          transform: `
            translate(
              ${mouse.x * 20}px,
              ${mouse.y * 20}px
            )
          `,
        }}
      />

      <div
        className="pointer-events-none absolute right-[8%] top-[35%] h-72 w-72 rounded-full bg-violet-500/10 blur-3xl transition-transform duration-1000 ease-out"
        style={{
          transform: `
            translate(
              ${mouse.x * -18}px,
              ${mouse.y * -18}px
            )
          `,
        }}
      />

      <div
        className="pointer-events-none absolute bottom-[5%] left-[45%] h-48 w-48 rounded-full bg-fuchsia-500/5 blur-3xl"
        style={{
          animation:
            "floatOrb 7s ease-in-out infinite",
        }}
      />

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <nav
        className={`relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-7 transition-all duration-1000 md:px-10 ${
          loaded
            ? "translate-y-0 opacity-100"
            : "-translate-y-5 opacity-0"
        }`}
      >
        {/* LOGO */}

        <Link
          href="/"
          className="group flex items-center gap-3"
        >
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/[0.06] shadow-[0_0_30px_rgba(139,92,246,0.12)] transition duration-500 group-hover:scale-105 group-hover:border-purple-400/50">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent" />

            <span className="relative text-lg font-black tracking-tight">
              R
            </span>
          </div>

          <div className="leading-none">
            <div className="text-[15px] font-bold tracking-[0.28em]">
              ROOM<span className="text-purple-400">AI</span>
            </div>

            <div className="mt-1 text-[8px] font-medium tracking-[0.35em] text-slate-500">
              SMART INTERIORS
            </div>
          </div>
        </Link>

        {/* NAV LINKS */}

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur-xl md:flex">
          <Link
            href="/dashboard"
            className="rounded-full bg-white/10 px-5 py-2.5 text-xs font-medium tracking-wide text-white shadow-sm transition hover:bg-white/15"
          >
            Studio
          </Link>

          <Link
            href="/planner"
            className="rounded-full px-5 py-2.5 text-xs font-medium tracking-wide text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            New Design
          </Link>

          <Link
            href="/my-designs"
            className="rounded-full px-5 py-2.5 text-xs font-medium tracking-wide text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            My Designs
          </Link>

          <Link
            href="/profile"
            className="rounded-full px-5 py-2.5 text-xs font-medium tracking-wide text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            Profile
          </Link>
        </div>

        {/* PROFILE */}

        <Link
          href="/profile"
          className="group flex items-center gap-3"
        >
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-white">
              Designer
            </p>

            <p className="mt-0.5 text-[10px] text-slate-500">
              Personal Studio
            </p>
          </div>

          <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-purple-400/30 bg-gradient-to-br from-purple-500/20 to-white/5 transition duration-300 group-hover:scale-105 group-hover:border-purple-400/60">
            <span className="text-sm font-semibold text-purple-200">
              U
            </span>

            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#08080c] bg-emerald-400" />
          </div>
        </Link>
      </nav>

      {/* =====================================================
          MOBILE NAV
      ====================================================== */}

      <div className="relative z-20 mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 pb-2 md:hidden">
        <Link
          href="/dashboard"
          className="whitespace-nowrap rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-2 text-xs text-purple-200"
        >
          Studio
        </Link>

        <Link
          href="/planner"
          className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-slate-400"
        >
          New Design
        </Link>

        <Link
          href="/my-designs"
          className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-slate-400"
        >
          My Designs
        </Link>

        <Link
          href="/profile"
          className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-slate-400"
        >
          Profile
        </Link>
      </div>

      {/* =====================================================
          MAIN HERO
      ====================================================== */}

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-100px)] max-w-7xl flex-col justify-center px-6 pb-20 pt-12 md:px-10 md:pb-24 md:pt-16">
        {/* Eyebrow */}

        <div
          className={`flex items-center justify-center gap-4 transition-all duration-1000 delay-100 ${
            loaded
              ? "translate-y-0 opacity-100"
              : "translate-y-5 opacity-0"
          }`}
        >
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-purple-400/70" />

          <span className="text-[10px] font-semibold tracking-[0.35em] text-purple-300/80">
            YOUR PRIVATE DESIGN STUDIO
          </span>

          <span className="h-px w-10 bg-gradient-to-l from-transparent to-purple-400/70" />
        </div>

        {/* TITLE */}

        <div className="mt-8 text-center">
          <h1
            className={`text-5xl font-light leading-[0.95] tracking-[-0.04em] text-white transition-all duration-1000 delay-200 sm:text-6xl md:text-8xl lg:text-[100px] ${
              loaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            Welcome back,
          </h1>

          <h1
            className={`mt-3 text-5xl font-serif italic leading-[0.95] tracking-[-0.04em] text-purple-200 transition-all duration-1000 delay-300 sm:text-6xl md:text-8xl lg:text-[100px] ${
              loaded
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            creator.
          </h1>
        </div>

        {/* DESCRIPTION */}

        <p
          className={`mx-auto mt-8 max-w-2xl text-center text-sm leading-7 text-slate-400 transition-all duration-1000 delay-500 sm:text-base ${
            loaded
              ? "translate-y-0 opacity-100"
              : "translate-y-5 opacity-0"
          }`}
        >
          Transform your space with intelligent interior
          design.
          <br className="hidden sm:block" />
          Your next room begins with a single photograph.
        </p>

        {/* =====================================================
            MAIN STUDIO CARD
        ====================================================== */}

        <div
          className={`mx-auto mt-12 w-full max-w-4xl transition-all duration-1000 delay-500 ${
            loaded
              ? "translate-y-0 opacity-100"
              : "translate-y-12 opacity-0"
          }`}
        >
          <div className="group relative">
            {/* Outer glow */}

            <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-purple-600/20 via-fuchsia-500/10 to-purple-600/20 opacity-60 blur-xl transition duration-700 group-hover:opacity-100" />

            {/* Card */}

            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#111117]/85 p-8 shadow-2xl backdrop-blur-2xl md:p-12">
              {/* Animated top shine */}

              <div
                className="pointer-events-none absolute -left-1/2 top-0 h-px w-[200%] bg-gradient-to-r from-transparent via-purple-300/60 to-transparent"
                style={{
                  animation:
                    "shineLine 5s ease-in-out infinite",
                }}
              />

              {/* Background glow */}

              <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-72 w-72 rounded-full bg-purple-600/10 blur-3xl" />

              <div className="pointer-events-none absolute bottom-[-100px] left-[-100px] h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />

              {/* Card Content */}

              <div className="relative z-10 grid gap-10 md:grid-cols-[150px_1fr] md:items-center">
                {/* ICON */}

                <div className="mx-auto md:mx-0">
                  <div className="relative flex h-32 w-32 items-center justify-center">
                    {/* rotating ring */}

                    <div
                      className="absolute inset-0 rounded-full border border-purple-400/20"
                      style={{
                        animation:
                          "spinSlow 12s linear infinite",
                      }}
                    />

                    <div
                      className="absolute inset-3 rounded-full border border-dashed border-purple-400/20"
                      style={{
                        animation:
                          "spinSlowReverse 16s linear infinite",
                      }}
                    />

                    {/* Glow */}

                    <div className="absolute h-20 w-20 rounded-full bg-purple-500/20 blur-2xl" />

                    {/* Icon */}

                    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/20 to-white/5 shadow-[0_0_50px_rgba(139,92,246,0.18)]">
                      <span className="text-4xl text-purple-200">
                        ✦
                      </span>
                    </div>
                  </div>
                </div>

                {/* CONTENT */}

                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center gap-2 md:justify-start">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />

                    <span className="text-[10px] font-semibold tracking-[0.3em] text-purple-300">
                      YOUR STUDIO
                    </span>
                  </div>

                  <h2 className="mt-4 text-3xl font-light tracking-tight text-white md:text-4xl">
                    No rooms yet.
                  </h2>

                  <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400 md:mx-0">
                    Your personal design collection will
                    appear here after you create your first
                    room. Upload a photo and let AI
                    transform your space.
                  </p>

                  {/* CTA */}

                  <div className="mt-7">
                    <Link
                      href="/planner"
                      className="group/button relative inline-flex items-center gap-4 overflow-hidden rounded-full bg-white px-7 py-4 text-sm font-semibold text-black transition duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]"
                    >
                      {/* Button shine */}

                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/5 to-transparent transition-transform duration-700 group-hover/button:translate-x-full" />

                      <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover/button:rotate-90">
                        +
                      </span>

                      <span className="relative">
                        Create Your First Room
                      </span>

                      <span className="relative text-lg transition-transform duration-300 group-hover/button:translate-x-1">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Bottom card info */}

              <div className="relative z-10 mt-10 border-t border-white/5 pt-6">
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[10px] tracking-wider text-slate-500 md:justify-start">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    AI READY
                  </span>

                  <span className="hidden h-3 w-px bg-white/10 sm:block" />

                  <span>ROOM ANALYSIS</span>

                  <span className="hidden h-3 w-px bg-white/10 sm:block" />

                  <span>AI REDESIGN</span>

                  <span className="hidden h-3 w-px bg-white/10 sm:block" />

                  <span>BUDGET PLANNING</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            BOTTOM STATUS
        ====================================================== */}

        <div
          className={`mx-auto mt-10 flex w-full max-w-4xl flex-col items-center justify-between gap-5 transition-all duration-1000 delay-700 sm:flex-row ${
            loaded
              ? "translate-y-0 opacity-100"
              : "translate-y-5 opacity-0"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>

            <span className="text-[10px] font-semibold tracking-[0.25em] text-slate-400">
              ROOMAI STUDIO
            </span>

            <span className="h-3 w-px bg-white/10" />

            <span className="text-[10px] tracking-[0.2em] text-slate-600">
              READY TO CREATE
            </span>
          </div>

          <p className="text-center text-[10px] tracking-wider text-slate-600 sm:text-right">
            Upload a room photo and let AI reimagine
            your space.
          </p>
        </div>
      </section>

      {/* =====================================================
          DECORATIVE SIDE TEXT
      ====================================================== */}

      <div className="pointer-events-none absolute left-4 top-1/2 hidden -translate-y-1/2 rotate-[-90deg] text-[9px] font-medium tracking-[0.45em] text-white/[0.12] xl:block">
        INTERIOR INTELLIGENCE
      </div>

      <div className="pointer-events-none absolute right-4 top-1/2 hidden translate-y-[-50%] rotate-90 text-[9px] font-medium tracking-[0.45em] text-white/[0.12] xl:block">
        ROOMAI STUDIO
      </div>

      {/* =====================================================
          BOTTOM DECORATIVE LINE
      ====================================================== */}

      <div className="pointer-events-none absolute bottom-5 left-1/2 flex w-32 -translate-x-1/2 items-center gap-2">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20" />

        <span className="h-1 w-1 rounded-full bg-purple-400/60" />

        <span className="h-px w-8 bg-white/10" />

        <span className="h-1 w-1 rounded-full bg-purple-400/60" />

        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20" />
      </div>

      {/* =====================================================
          ANIMATION STYLES
      ====================================================== */}

      <style jsx>{`
        @keyframes floatOrb {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(0, -25px, 0) scale(1.08);
          }
        }

        @keyframes spinSlow {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spinSlowReverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        @keyframes shineLine {
          0% {
            transform: translateX(-25%);
            opacity: 0;
          }

          20% {
            opacity: 1;
          }

          50% {
            transform: translateX(25%);
            opacity: 0.7;
          }

          80% {
            opacity: 0;
          }

          100% {
            transform: translateX(25%);
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}