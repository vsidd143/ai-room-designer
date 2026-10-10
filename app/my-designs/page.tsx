
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Design = {
  id: string;
  original_image_url?: string | null;
  generated_image_url?: string | null;
  room_analysis?: any;
  final_analysis?: any;
  budget?: string | number | Record<string, any> | null;
  style?: string | null;
  created_at?: string;
};

function formatStyle(style?: string | null) {
  if (!style) return "Custom";
  return style.charAt(0).toUpperCase() + style.slice(1);
}

function formatBudget(
  budget?: string | number | Record<string, any> | null
) {
  if (budget === null || budget === undefined) return "Not specified";

  if (typeof budget === "number") {
    return `₹${budget.toLocaleString("en-IN")}`;
  }

  if (typeof budget === "string") {
    const cleanBudget = budget.trim();

    if (!cleanBudget) return "Not specified";
    if (cleanBudget === "50000") return "₹50,000";
    if (cleanBudget === "100000") return "₹1,00,000";
    if (cleanBudget === "200000") return "₹2,00,000";
    if (cleanBudget === "500000") return "₹5,00,000";
    if (cleanBudget.startsWith("₹")) return cleanBudget;

    const numericValue = Number(cleanBudget.replace(/,/g, ""));

    if (!Number.isNaN(numericValue)) {
      return `₹${numericValue.toLocaleString("en-IN")}`;
    }

    return cleanBudget;
  }

  if (typeof budget === "object") {
    if (typeof budget.amount === "number") {
      return `₹${budget.amount.toLocaleString("en-IN")}`;
    }

    if (typeof budget.amount === "string") {
      return formatBudget(budget.amount);
    }

    if (typeof budget.value === "number") {
      return `₹${budget.value.toLocaleString("en-IN")}`;
    }

    if (typeof budget.value === "string") {
      return formatBudget(budget.value);
    }

    if (typeof budget.budget === "string") {
      return formatBudget(budget.budget);
    }

    if (typeof budget.budget === "number") {
      return formatBudget(budget.budget);
    }

    return "Custom Budget";
  }

  return "Not specified";
}

function formatDate(date?: string) {
  if (!date) return "Recently created";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently created";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRoomType(design: Design) {
  const analysis = design.room_analysis;

  if (
    analysis &&
    typeof analysis === "object" &&
    typeof analysis.roomType === "string"
  ) {
    return analysis.roomType;
  }

  if (
    analysis &&
    typeof analysis === "object" &&
    typeof analysis.room_type === "string"
  ) {
    return analysis.room_type;
  }

  if (
    analysis &&
    typeof analysis === "object" &&
    typeof analysis.room === "string"
  ) {
    return analysis.room;
  }

  return "Interior Design";
}

export default function MyDesignsPage() {
  const router = useRouter();

  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDesigns() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/my-designs", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Failed to load your designs."
          );
        }

        if (mounted) {
          setDesigns(
            Array.isArray(data?.designs) ? data.designs : []
          );
        }
      } catch (err: any) {
        if (mounted) {
          setError(
            err?.message ||
              "Something went wrong while loading designs."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDesigns();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#08080c] text-white">
      {/* Dashboard Ambient Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/[0.10] blur-[150px]" />
        <div className="absolute left-[-200px] top-[35%] h-[500px] w-[500px] rounded-full bg-blue-600/[0.08] blur-[140px]" />
        <div className="absolute right-[-180px] bottom-[-150px] h-[500px] w-[500px] rounded-full bg-violet-600/[0.07] blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(8,8,12,0.55)_100%)]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/[0.06] bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/[0.08]">
              <span className="text-sm font-bold text-cyan-300">R</span>
            </div>

            <div>
              <div className="text-sm font-semibold tracking-wide text-white">
                Smart<span className="text-cyan-300">Room</span>
              </div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                Interior Intelligence
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/60 transition hover:border-cyan-400/20 hover:bg-cyan-500/[0.05] hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/planner"
              className="rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-900/20 transition hover:-translate-y-0.5"
            >
              + New Design
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        {/* Heading */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-500/[0.06] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-300/80">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              Your AI Designs
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              My{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                Designs
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
              Explore your saved AI-generated room transformations
              and revisit your interior concepts anytime.
            </p>
          </div>

          <Link
            href="/planner"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/20 transition hover:-translate-y-0.5"
          >
            Create New Design →
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025]"
              >
                <div className="h-64 animate-pulse bg-white/[0.05]" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.06]" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.05]" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-white/[0.05]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mx-auto mt-12 max-w-xl rounded-3xl border border-red-400/15 bg-red-500/[0.06] p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10 text-red-300">
              !
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              Unable to load designs
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/40">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && designs.length === 0 && (
          <div className="mx-auto mt-14 max-w-xl rounded-3xl border border-white/[0.07] bg-white/[0.025] p-10 text-center backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-500/[0.08] text-2xl text-cyan-300">
              ✦
            </div>

            <h2 className="mt-6 text-xl font-semibold">
              No designs yet
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/40">
              Create your first AI-powered room transformation
              and it will appear here.
            </p>

            <Link
              href="/planner"
              className="mt-7 inline-flex rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Create Your First Design →
            </Link>
          </div>
        )}

        {/* Designs */}
        {!loading && !error && designs.length > 0 && (
          <>
            <div className="mt-10 flex items-center justify-between">
              <div>
                <span className="text-sm text-white/40">
                  Saved Designs
                </span>
                <span className="ml-2 rounded-full border border-cyan-400/10 bg-cyan-500/[0.05] px-2.5 py-1 text-xs text-cyan-200/80">
                  {designs.length}
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {designs.map((design) => {
                const roomType = getRoomType(design);

                return (
                  <article
                    key={design.id}
                    className="group overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.04]"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-white/[0.03]">
                      {design.generated_image_url ? (
                        <img
                          src={design.generated_image_url}
                          alt={`${roomType} AI interior design`}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                        />
                      ) : design.original_image_url ? (
                        <img
                          src={design.original_image_url}
                          alt={`${roomType} original room`}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-white/25">
                          No preview available
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 to-transparent" />

                      <div className="absolute left-4 top-4 rounded-full border border-cyan-300/15 bg-black/40 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-cyan-100/90 backdrop-blur-md">
                        AI Generated
                      </div>

                      <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white/80 backdrop-blur-md">
                        {formatStyle(design.style)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-base font-semibold text-white">
                            {roomType}
                          </h2>

                          <p className="mt-1 text-xs text-white/35">
                            Created {formatDate(design.created_at)}
                          </p>
                        </div>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-500/[0.06] text-cyan-300">
                          ✦
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="mt-5 grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                          <div className="text-[9px] uppercase tracking-[0.15em] text-white/25">
                            Style
                          </div>
                          <div className="mt-1 text-xs font-medium text-white/70">
                            {formatStyle(design.style)}
                          </div>
                        </div>

                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                          <div className="text-[9px] uppercase tracking-[0.15em] text-white/25">
                            Budget
                          </div>
                          <div className="mt-1 text-xs font-medium text-white/70">
                            {formatBudget(design.budget)}
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/my-designs/${design.id}`)
                        }
                        className="mt-4 w-full rounded-xl border border-cyan-400/10 bg-cyan-500/[0.04] px-4 py-3 text-xs font-semibold text-cyan-100/80 transition hover:border-cyan-400/25 hover:bg-cyan-500/[0.08] hover:text-white"
                      >
                        View Design Details →
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] px-5 py-6 text-center sm:px-8">
        <span className="text-[9px] uppercase tracking-[0.22em] text-white/20">
          SMARTROOM • AI INTERIOR INTELLIGENCE
        </span>
      </footer>
    </main>
  );
}
