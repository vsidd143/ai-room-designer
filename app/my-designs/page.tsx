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
  if (budget === null || budget === undefined) {
    return "Not specified";
  }

  // If Supabase returns a number
  if (typeof budget === "number") {
    return `₹${budget.toLocaleString("en-IN")}`;
  }

  // If Supabase returns a string
  if (typeof budget === "string") {
    const cleanBudget = budget.trim();

    if (!cleanBudget) {
      return "Not specified";
    }

    if (cleanBudget === "50000") {
      return "₹50,000";
    }

    if (cleanBudget === "100000") {
      return "₹1,00,000";
    }

    if (cleanBudget === "200000") {
      return "₹2,00,000";
    }

    if (cleanBudget === "500000") {
      return "₹5,00,000";
    }

    if (cleanBudget.startsWith("₹")) {
      return cleanBudget;
    }

    // Numeric string
    const numericValue = Number(
      cleanBudget.replace(/,/g, "")
    );

    if (!Number.isNaN(numericValue)) {
      return `₹${numericValue.toLocaleString("en-IN")}`;
    }

    return cleanBudget;
  }

  // If budget is an object
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
            Array.isArray(data?.designs)
              ? data.designs
              : []
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
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDesigns();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#07070b] text-white">
      {/* Ambient Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-260px] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[140px]" />

        <div className="absolute bottom-[-240px] right-[-180px] h-[500px] w-[500px] rounded-full bg-fuchsia-600/[0.06] blur-[130px]" />

        <div className="absolute left-[-220px] top-[40%] h-[400px] w-[400px] rounded-full bg-indigo-600/[0.05] blur-[120px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/[0.06] bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10">
              <span className="text-sm font-bold text-purple-300">
                R
              </span>
            </div>

            <div>
              <div className="text-sm font-semibold tracking-wide">
                ROOMAI
              </div>

              <div className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                Interior Intelligence
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/60 transition hover:bg-white/[0.06] hover:text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/planner"
              className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-white/90"
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
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/15 bg-purple-500/[0.07] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-purple-300">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              Your AI Designs
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              My{" "}
              <span className="bg-gradient-to-r from-purple-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
                Designs
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
              Explore your saved AI-generated room
              transformations and revisit your interior
              concepts anytime.
            </p>
          </div>

          <Link
            href="/planner"
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-purple-500/10 transition hover:bg-white/90"
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
              className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && designs.length === 0 && (
          <div className="mx-auto mt-14 max-w-xl rounded-3xl border border-white/[0.07] bg-white/[0.025] p-10 text-center backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-400/15 bg-purple-500/[0.08] text-2xl text-purple-300">
              ✦
            </div>

            <h2 className="mt-6 text-xl font-semibold">
              No designs yet
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/40">
              Create your first AI-powered room
              transformation and it will appear here.
            </p>

            <Link
              href="/planner"
              className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
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

                <span className="ml-2 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/60">
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
                    className="group overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-purple-400/20 hover:bg-white/[0.04]"
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

                      <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-white/80 backdrop-blur-md">
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
                            Created{" "}
                            {formatDate(design.created_at)}
                          </p>
                        </div>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-purple-400/10 bg-purple-500/[0.06] text-purple-300">
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
                          router.push(
                            `/my-designs/${design.id}`
                          )
                        }
                        className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-semibold text-white/70 transition hover:border-purple-400/20 hover:bg-purple-500/[0.08] hover:text-white"
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
    </main>
  );
}