"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Design = {
  id: string;
  original_image_url: string | null;
  generated_image_url: string | null;
  room_analysis: any;
  final_analysis: any;
  budget: number | null;
  style: string | null;
  created_at: string;
};

export default function DesignDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const designId = params.id as string;

  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!designId) return;

    loadDesign();
  }, [designId]);

  const loadDesign = async () => {
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
          data.error || "Failed to load design."
        );
      }

      const foundDesign = (data.designs || []).find(
        (item: Design) => item.id === designId
      );

      if (!foundDesign) {
        throw new Error("Design not found.");
      }

      setDesign(foundDesign);
    } catch (err: any) {
      console.error("DESIGN DETAILS ERROR:", err);

      setError(
        err?.message || "Failed to load design."
      );
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     HELPERS
  ----------------------------- */

  const formatDate = (date: string) => {
    if (!date) return "Unknown date";

    try {
      return new Date(date).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );
    } catch {
      return "Unknown date";
    }
  };

  const formatCurrency = (
    value: number | null | undefined
  ) => {
    if (
      value === null ||
      value === undefined ||
      Number.isNaN(Number(value))
    ) {
      return "Not specified";
    }

    return `₹${Number(value).toLocaleString(
      "en-IN"
    )}`;
  };

  const titleCase = (value: string) => {
    if (!value) return "";

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  /*
   * Converts ANY AI value into something React
   * can safely display.
   */
  const displayValue = (value: any): string => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "Not available";
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => {
          if (
            item !== null &&
            typeof item === "object"
          ) {
            return Object.entries(item)
              .map(
                ([key, val]) =>
                  `${titleCase(key)}: ${displayValue(
                    val
                  )}`
              )
              .join(" • ");
          }

          return String(item);
        })
        .join(", ");
    }

    if (typeof value === "object") {
      return Object.entries(value)
        .map(
          ([key, val]) =>
            `${titleCase(key)}: ${displayValue(
              val
            )}`
        )
        .join(" • ");
    }

    return String(value);
  };

  const renderList = (items: any[]) => {
    if (!items || items.length === 0) {
      return (
        <p className="text-sm text-white/35">
          None specified
        </p>
      );
    }

    return (
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex gap-3 text-sm leading-6 text-white/55"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />

            <span>
              {displayValue(item)}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  /* -----------------------------
     LOADING
  ----------------------------- */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07070b] text-white">
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">

          <div className="pointer-events-none absolute left-1/2 top-[-200px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[140px]" />

          <div className="relative text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-purple-400" />

            <p className="mt-5 text-sm text-white/40">
              Loading your design...
            </p>
          </div>

        </div>
      </main>
    );
  }

  /* -----------------------------
     ERROR
  ----------------------------- */

  if (error || !design) {
    return (
      <main className="min-h-screen overflow-hidden bg-[#07070b] text-white">

        <div className="pointer-events-none fixed inset-0">
          <div className="absolute left-1/2 top-[-220px] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[150px]" />
          <div className="absolute right-[-200px] top-[40%] h-[450px] w-[450px] rounded-full bg-fuchsia-600/[0.06] blur-[140px]" />
        </div>

        <div className="relative flex min-h-screen items-center justify-center px-5">

          <div className="w-full max-w-xl rounded-3xl border border-white/[0.07] bg-white/[0.025] p-10 text-center backdrop-blur-xl">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/15 bg-red-500/[0.08] text-xl text-red-300">
              !
            </div>

            <h1 className="mt-5 text-2xl font-semibold text-white">
              Design not found
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/40">
              {error ||
                "We could not load this saved design."}
            </p>

            <button
              onClick={() =>
                router.push("/my-designs")
              }
              className="mt-7 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              ← Back to My Designs
            </button>

          </div>

        </div>
      </main>
    );
  }

  /* -----------------------------
     DATA
  ----------------------------- */

  const roomAnalysis =
    design.room_analysis || {};

  const finalAnalysis =
    design.final_analysis || {};

  const newRoom =
    finalAnalysis?.newRoomAnalysis || {};

  const changes =
    finalAnalysis?.oldToNewChanges || [];

  const improvements =
    finalAnalysis?.improvements || [];

  const budgetBreakdown =
    finalAnalysis?.budgetBreakdown || [];

  const budgetSummary =
    finalAnalysis?.budgetSummary || null;

  return (
    <main className="min-h-screen overflow-hidden bg-[#07070b] text-white">

      {/* =========================
          AMBIENT BACKGROUND
      ========================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute left-1/2 top-[-280px] h-[560px] w-[760px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[150px]" />

        <div className="absolute right-[-200px] top-[35%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/[0.06] blur-[140px]" />

        <div className="absolute bottom-[-220px] left-[-180px] h-[450px] w-[450px] rounded-full bg-indigo-600/[0.05] blur-[130px]" />

      </div>

      {/* =========================
          HEADER
      ========================== */}

      <header className="relative z-30 border-b border-white/[0.06] bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="flex items-center gap-3"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10">

              <span className="text-sm font-bold text-purple-300">
                R
              </span>

            </div>

            <div className="text-left">

              <div className="text-sm font-semibold tracking-wide text-white">
                ROOMAI
              </div>

              <div className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                Interior Intelligence
              </div>

            </div>

          </button>

          <div className="flex items-center gap-2">

            <button
              onClick={() =>
                router.push("/my-designs")
              }
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/60 transition hover:bg-white/[0.06] hover:text-white"
            >
              ← My Designs
            </button>

            <button
              onClick={() =>
                router.push("/planner")
              }
              className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition hover:bg-white/90"
            >
              + New Design
            </button>

          </div>

        </div>

      </header>

      {/* =========================
          MAIN
      ========================== */}

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">

        {/* =========================
            TITLE
        ========================== */}

        <section className="mb-10">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/15 bg-purple-500/[0.07] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-purple-300">

            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />

            SmartRoom Design

          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">

                {design.style ? (
                  <>
                    <span className="text-white">
                      {titleCase(
                        design.style
                      )}
                    </span>{" "}

                    <span className="bg-gradient-to-r from-purple-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
                      Room
                    </span>
                  </>
                ) : (
                  "AI Room Design"
                )}

              </h1>

              <p className="mt-3 text-sm text-white/40">
                Saved on{" "}
                {formatDate(
                  design.created_at
                )}
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              {design.style && (
                <span className="rounded-full border border-purple-400/15 bg-purple-500/[0.07] px-4 py-2 text-xs font-medium capitalize text-purple-300">
                  {design.style}
                </span>
              )}

              <span className="rounded-full border border-emerald-400/15 bg-emerald-500/[0.07] px-4 py-2 text-xs font-medium text-emerald-300">
                ✓ AI Generated
              </span>

            </div>

          </div>

        </section>

        {/* =========================
            BEFORE / AFTER
        ========================== */}

        <section className="grid gap-5 lg:grid-cols-2">

          {/* ORIGINAL */}

          <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl">

            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">

              <div>

                <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                  Original
                </p>

                <h2 className="mt-1 text-sm font-medium text-white/75">
                  Your Room
                </h2>

              </div>

              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] text-white/40">
                BEFORE
              </span>

            </div>

            <div className="aspect-[4/3] bg-black/20">

              {design.original_image_url ? (
                <img
                  src={
                    design.original_image_url
                  }
                  alt="Original room"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-center text-sm text-white/25">
                  Original image unavailable
                </div>
              )}

            </div>

          </div>

          {/* GENERATED */}

          <div className="overflow-hidden rounded-3xl border border-purple-400/15 bg-white/[0.025] backdrop-blur-xl">

            <div className="flex items-center justify-between border-b border-purple-400/10 px-5 py-4">

              <div>

                <p className="text-[10px] uppercase tracking-[0.2em] text-purple-300/60">
                  AI Transformation
                </p>

                <h2 className="mt-1 text-sm font-medium text-white">
                  Redesigned Room
                </h2>

              </div>

              <span className="rounded-full border border-purple-400/20 bg-purple-500/[0.08] px-3 py-1.5 text-[10px] text-purple-300">
                AFTER
              </span>

            </div>

            <div className="aspect-[4/3] bg-black/20">

              {design.generated_image_url ? (
                <img
                  src={
                    design.generated_image_url
                  }
                  alt="AI redesigned room"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-center text-sm text-white/25">
                  Generated image unavailable
                </div>
              )}

            </div>

          </div>

        </section>

        {/* =========================
            DESIGN SUMMARY
        ========================== */}

        {finalAnalysis.designSummary && (
          <section className="mt-12 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-xl sm:p-7">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-400/15 bg-purple-500/[0.08] text-lg text-purple-300">
                ✦
              </div>

              <div>

                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-purple-300/70">
                  AI Design Report
                </p>

                <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                  Design Summary
                </h2>

              </div>

            </div>

            <p className="mt-5 rounded-2xl border border-white/[0.05] bg-black/20 p-5 text-sm leading-7 text-white/55">
              {displayValue(
                finalAnalysis.designSummary
              )}
            </p>

          </section>
        )}

        {/* =========================
            DESIGN INFORMATION
        ========================== */}

        <section className="mt-12">

          <div className="mb-6">

            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-purple-300/70">
              Project Information
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Design Details
            </h2>

            <p className="mt-2 text-sm text-white/35">
              Configuration used by ROOMAI for this design.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* STYLE */}

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-xl transition hover:border-purple-400/15 hover:bg-white/[0.04]">

              <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                Style
              </p>

              <p className="mt-3 font-semibold capitalize text-white">
                {design.style || "Custom"}
              </p>

            </div>

            {/* BUDGET */}

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-xl transition hover:border-purple-400/15 hover:bg-white/[0.04]">

              <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                Budget
              </p>

              <p className="mt-3 font-semibold text-white">
                {formatCurrency(
                  design.budget
                )}
              </p>

            </div>

            {/* ROOM TYPE */}

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 backdrop-blur-xl transition hover:border-purple-400/15 hover:bg-white/[0.04]">

              <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                Room Type
              </p>

              <p className="mt-3 font-semibold text-white">
                {displayValue(
                  newRoom.roomType ||
                    roomAnalysis.roomType
                )}
              </p>

            </div>

            {/* RATING */}

            <div className="rounded-2xl border border-purple-400/10 bg-purple-500/[0.035] p-5 backdrop-blur-xl transition hover:border-purple-400/20">

              <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                AI Rating
              </p>

              <p className="mt-3 text-2xl font-semibold text-purple-300">
                {newRoom.overallRating
                  ? `${newRoom.overallRating}/10`
                  : "N/A"}
              </p>

            </div>

          </div>

        </section>

        {/* =========================
            ORIGINAL ROOM ANALYSIS
        ========================== */}

        <section className="mt-12 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-xl sm:p-7">

          <div className="mb-6">

            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-purple-300/70">
              Before Transformation
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
              Original Room Analysis
            </h2>

            <p className="mt-2 text-sm text-white/35">
              AI analysis of your uploaded room.
            </p>

          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {[
              [
                "Room Type",
                roomAnalysis.roomType,
              ],
              [
                "Room Size",
                roomAnalysis.roomSize,
              ],
              [
                "Current Style",
                roomAnalysis.currentStyle,
              ],
              [
                "Colors",
                roomAnalysis.colors,
              ],
              [
                "Flooring",
                roomAnalysis.flooring,
              ],
              [
                "Lighting",
                roomAnalysis.lighting,
              ],
              [
                "Walls",
                roomAnalysis.walls,
              ],
              [
                "Windows",
                roomAnalysis.windows,
              ],
              [
                "Curtains",
                roomAnalysis.curtains,
              ],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-2xl border border-white/[0.05] bg-black/20 p-5"
              >

                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
                  {String(label)}
                </p>

                <p className="mt-3 text-sm leading-6 text-white/60">
                  {displayValue(value)}
                </p>

              </div>
            ))}

          </div>

          {/* FURNITURE */}

          {Array.isArray(
            roomAnalysis.furniture
          ) &&
            roomAnalysis.furniture.length > 0 && (
              <div className="mt-5 rounded-2xl border border-white/[0.05] bg-black/20 p-5">

                <p className="mb-4 text-sm font-semibold text-white/70">
                  Existing Furniture
                </p>

                {renderList(
                  roomAnalysis.furniture
                )}

              </div>
            )}

          {/* STORAGE */}

          {roomAnalysis.storage && (
            <div className="mt-5 rounded-2xl border border-white/[0.05] bg-black/20 p-5">

              <p className="text-sm font-semibold text-white/70">
                Storage
              </p>

              <p className="mt-2 text-sm leading-6 text-white/55">
                {displayValue(
                  roomAnalysis.storage
                )}
              </p>

            </div>
          )}

          {/* DECOR */}

          {Array.isArray(
            roomAnalysis.decor
          ) &&
            roomAnalysis.decor.length > 0 && (
              <div className="mt-5 rounded-2xl border border-white/[0.05] bg-black/20 p-5">

                <p className="mb-4 text-sm font-semibold text-white/70">
                  Existing Decor
                </p>

                {renderList(
                  roomAnalysis.decor
                )}

              </div>
            )}

          {/* ISSUES */}

          {Array.isArray(
            roomAnalysis.issues
          ) &&
            roomAnalysis.issues.length > 0 && (
              <div className="mt-5 rounded-2xl border border-amber-400/10 bg-amber-500/[0.05] p-5">

                <p className="mb-4 text-sm font-semibold text-amber-300">
                  Improvement Areas
                </p>

                {renderList(
                  roomAnalysis.issues
                )}

              </div>
            )}

          {/* SUGGESTIONS */}

          {Array.isArray(
            roomAnalysis.suggestions
          ) &&
            roomAnalysis.suggestions.length > 0 && (
              <div className="mt-5 rounded-2xl border border-indigo-400/10 bg-indigo-500/[0.05] p-5">

                <p className="mb-4 text-sm font-semibold text-indigo-300">
                  AI Suggestions
                </p>

                {renderList(
                  roomAnalysis.suggestions
                )}

              </div>
            )}

        </section>

        {/* =========================
            NEW ROOM ANALYSIS
        ========================== */}

        {Object.keys(newRoom).length > 0 && (
          <section className="mt-12 rounded-3xl border border-purple-400/10 bg-white/[0.025] p-6 backdrop-blur-xl sm:p-7">

            <div className="mb-6">

              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-purple-300/70">
                After Transformation
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                New Room Analysis
              </h2>

              <p className="mt-2 text-sm text-white/35">
                AI analysis of your redesigned room.
              </p>

            </div>

            {/* TOP INFO */}

            <div className="grid gap-4 md:grid-cols-3">

              <div className="rounded-2xl border border-purple-400/10 bg-purple-500/[0.05] p-5">

                <p className="text-[10px] uppercase tracking-[0.18em] text-purple-300/60">
                  Room Type
                </p>

                <p className="mt-3 font-semibold text-white">
                  {displayValue(
                    newRoom.roomType
                  )}
                </p>

              </div>

              <div className="rounded-2xl border border-purple-400/10 bg-purple-500/[0.05] p-5">

                <p className="text-[10px] uppercase tracking-[0.18em] text-purple-300/60">
                  Design Style
                </p>

                <p className="mt-3 font-semibold capitalize text-white">
                  {displayValue(
                    newRoom.designStyle ||
                      design.style
                  )}
                </p>

              </div>

              <div className="rounded-2xl border border-purple-400/10 bg-purple-500/[0.05] p-5">

                <p className="text-[10px] uppercase tracking-[0.18em] text-purple-300/60">
                  Overall Rating
                </p>

                <p className="mt-3 text-2xl font-semibold text-purple-300">
                  {newRoom.overallRating
                    ? `${newRoom.overallRating}/10`
                    : "N/A"}
                </p>

              </div>

            </div>

            {/* OVERALL LOOK */}

            {newRoom.overallLook && (
              <div className="mt-5 rounded-2xl border border-white/[0.05] bg-black/20 p-5">

                <p className="text-sm font-semibold text-white/70">
                  Overall Look
                </p>

                <p className="mt-2 text-sm leading-7 text-white/55">
                  {displayValue(
                    newRoom.overallLook
                  )}
                </p>

              </div>
            )}

            {/* COLOR PALETTE */}

            {Array.isArray(
              newRoom.colorPalette
            ) &&
              newRoom.colorPalette.length > 0 && (
                <div className="mt-5 rounded-2xl border border-white/[0.05] bg-black/20 p-5">

                  <p className="mb-4 text-sm font-semibold text-white/70">
                    Color Palette
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {newRoom.colorPalette.map(
                      (
                        color: any,
                        index: number
                      ) => (
                        <span
                          key={index}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/60"
                        >
                          {displayValue(color)}
                        </span>
                      )
                    )}

                  </div>

                </div>
              )}

            {/* FLOORING */}

            {newRoom.flooring && (
              <div className="mt-5 rounded-2xl border border-white/[0.05] bg-black/20 p-5">

                <p className="text-sm font-semibold text-white/70">
                  Flooring
                </p>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  {displayValue(
                    newRoom.flooring
                  )}
                </p>

              </div>
            )}

            {/* WALLS */}

            {newRoom.walls && (
              <div className="mt-5 rounded-2xl border border-white/[0.05] bg-black/20 p-5">

                <p className="text-sm font-semibold text-white/70">
                  Walls
                </p>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  {displayValue(
                    newRoom.walls
                  )}
                </p>

              </div>
            )}

            {/* LIGHTING */}

            {newRoom.lighting && (
              <div className="mt-5 rounded-2xl border border-white/[0.05] bg-black/20 p-5">

                <p className="text-sm font-semibold text-white/70">
                  Lighting
                </p>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  {displayValue(
                    newRoom.lighting
                  )}
                </p>

              </div>
            )}

            {/* FURNITURE */}

            {Array.isArray(
              newRoom.furniture
            ) &&
              newRoom.furniture.length > 0 && (
                <div className="mt-5 rounded-2xl border border-white/[0.05] bg-black/20 p-5">

                  <p className="mb-4 text-sm font-semibold text-white/70">
                    New Furniture
                  </p>

                  {renderList(
                    newRoom.furniture
                  )}

                </div>
              )}

            {/* DECOR */}

            {Array.isArray(newRoom.decor) &&
              newRoom.decor.length > 0 && (
                <div className="mt-5 rounded-2xl border border-white/[0.05] bg-black/20 p-5">

                  <p className="mb-4 text-sm font-semibold text-white/70">
                    New Decor
                  </p>

                  {renderList(
                    newRoom.decor
                  )}

                </div>
              )}

            {/* CURTAINS */}

            {newRoom.curtainsAndWindows && (
              <div className="mt-5 rounded-2xl border border-white/[0.05] bg-black/20 p-5">

                <p className="text-sm font-semibold text-white/70">
                  Curtains & Windows
                </p>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  {displayValue(
                    newRoom.curtainsAndWindows
                  )}
                </p>

              </div>
            )}

            {/* STORAGE */}

            {newRoom.storage && (
              <div className="mt-5 rounded-2xl border border-white/[0.05] bg-black/20 p-5">

                <p className="text-sm font-semibold text-white/70">
                  Storage
                </p>

                <p className="mt-2 text-sm leading-6 text-white/55">
                  {displayValue(
                    newRoom.storage
                  )}
                </p>

              </div>
            )}

          </section>
        )}

        {/* =========================
            WHAT CHANGED
        ========================== */}

        {Array.isArray(changes) &&
          changes.length > 0 && (
            <section className="mt-12 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-xl sm:p-7">

              <div className="mb-6">

                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-purple-300/70">
                  Transformation
                </p>

                <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                  What Changed?
                </h2>

              </div>

              <div className="space-y-4">

                {changes.map(
                  (
                    change: any,
                    index: number
                  ) => {

                    if (
                      change === null ||
                      typeof change !==
                        "object"
                    ) {
                      return null;
                    }

                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-white/[0.06] bg-black/20 p-5"
                      >

                        <div className="flex flex-wrap items-center justify-between gap-3">

                          <h3 className="font-semibold text-white">
                            {displayValue(
                              change.category ||
                                `Change ${
                                  index + 1
                                }`
                            )}
                          </h3>

                          {change.improvement && (
                            <span className="rounded-full border border-emerald-400/15 bg-emerald-500/[0.07] px-3 py-1 text-xs font-medium text-emerald-300">
                              Improved
                            </span>
                          )}

                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">

                          {change.before && (
                            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">

                              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">
                                Before
                              </p>

                              <p className="mt-2 text-sm leading-6 text-white/55">
                                {displayValue(
                                  change.before
                                )}
                              </p>

                            </div>
                          )}

                          {change.after && (
                            <div className="rounded-xl border border-purple-400/10 bg-purple-500/[0.05] p-4">

                              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-purple-300/60">
                                After
                              </p>

                              <p className="mt-2 text-sm leading-6 text-white/60">
                                {displayValue(
                                  change.after
                                )}
                              </p>

                            </div>
                          )}

                        </div>

                        {change.improvement && (
                          <div className="mt-4 rounded-xl border border-emerald-400/10 bg-emerald-500/[0.05] p-4">

                            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300/60">
                              Improvement
                            </p>

                            <p className="mt-2 text-sm leading-6 text-white/55">
                              {displayValue(
                                change.improvement
                              )}
                            </p>

                          </div>
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            </section>
          )}

        {/* =========================
            IMPROVEMENTS
        ========================== */}

        {Array.isArray(improvements) &&
          improvements.length > 0 && (
            <section className="mt-12 rounded-3xl border border-emerald-400/10 bg-white/[0.025] p-6 backdrop-blur-xl sm:p-7">

              <div className="mb-6">

                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-emerald-300/70">
                  AI Recommendations
                </p>

                <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                  Improvements
                </h2>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                {improvements.map(
                  (
                    item: any,
                    index: number
                  ) => {

                    if (
                      item === null ||
                      typeof item !==
                        "object"
                    ) {
                      return null;
                    }

                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-emerald-400/10 bg-emerald-500/[0.05] p-5"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <h3 className="font-semibold text-emerald-200">
                            {displayValue(
                              item.item ||
                                `Recommendation ${
                                  index + 1
                                }`
                            )}
                          </h3>

                          {item.priority && (
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium capitalize text-emerald-300">
                              {displayValue(
                                item.priority
                              )}
                            </span>
                          )}

                        </div>

                        {item.reason && (
                          <p className="mt-3 text-sm leading-6 text-white/55">
                            {displayValue(
                              item.reason
                            )}
                          </p>
                        )}

                        {item.estimatedCost !==
                          undefined &&
                          item.estimatedCost !==
                            null && (
                            <p className="mt-4 text-sm font-semibold text-emerald-300">
                              Estimated cost:{" "}
                              {formatCurrency(
                                Number(
                                  item.estimatedCost
                                )
                              )}
                            </p>
                          )}

                      </div>
                    );
                  }
                )}

              </div>

            </section>
          )}

        {/* =========================
            BUDGET
        ========================== */}

        {(Array.isArray(budgetBreakdown) &&
          budgetBreakdown.length > 0) ||
          budgetSummary ? (
          <section className="mt-12 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-xl sm:p-7">

            <div className="mb-6">

              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-purple-300/70">
                Investment
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
                Budget Breakdown
              </h2>

            </div>

            {/* BUDGET SUMMARY */}

            {budgetSummary && (
              <div className="mb-6">

                <h3 className="mb-4 text-sm font-semibold text-white/70">
                  Budget Summary
                </h3>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  {/* TOTAL */}

                  <div className="rounded-2xl border border-purple-400/10 bg-purple-500/[0.05] p-5">

                    <p className="text-[10px] uppercase tracking-[0.18em] text-purple-300/60">
                      Total Budget
                    </p>

                    <p className="mt-3 text-xl font-semibold text-white">
                      {formatCurrency(
                        typeof budgetSummary ===
                          "object"
                          ? budgetSummary.totalBudget
                          : undefined
                      )}
                    </p>

                  </div>

                  {/* ESTIMATED */}

                  <div className="rounded-2xl border border-purple-400/10 bg-purple-500/[0.05] p-5">

                    <p className="text-[10px] uppercase tracking-[0.18em] text-purple-300/60">
                      Estimated Cost
                    </p>

                    <p className="mt-3 text-xl font-semibold text-purple-300">
                      {formatCurrency(
                        typeof budgetSummary ===
                          "object"
                          ? budgetSummary.estimatedTotal
                          : undefined
                      )}
                    </p>

                  </div>

                  {/* REMAINING */}

                  <div className="rounded-2xl border border-emerald-400/10 bg-emerald-500/[0.05] p-5">

                    <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-300/60">
                      Remaining Budget
                    </p>

                    <p className="mt-3 text-xl font-semibold text-emerald-300">
                      {formatCurrency(
                        typeof budgetSummary ===
                          "object"
                          ? budgetSummary.remainingBudget
                          : undefined
                      )}
                    </p>

                  </div>

                  {/* USED */}

                  <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-5">

                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                      Budget Used
                    </p>

                    <p className="mt-3 text-xl font-semibold text-white">

                      {typeof budgetSummary ===
                        "object" &&
                      budgetSummary.budgetUsedPercentage !==
                        undefined
                        ? Math.round(
                            Number(
                              budgetSummary.budgetUsedPercentage
                            )
                          )
                        : 0}

                      %

                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* ITEM BREAKDOWN */}

            {Array.isArray(
              budgetBreakdown
            ) &&
              budgetBreakdown.length > 0 && (
                <div>

                  <h3 className="mb-4 text-sm font-semibold text-white/70">
                    Estimated Expenses
                  </h3>

                  <div className="overflow-hidden rounded-2xl border border-white/[0.07]">

                    <div className="hidden grid-cols-[1fr_1fr_180px] bg-white/[0.025] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.18em] text-white/25 md:grid">

                      <span>
                        Category
                      </span>

                      <span>
                        Item
                      </span>

                      <span className="text-right">
                        Estimated Cost
                      </span>

                    </div>

                    {budgetBreakdown.map(
                      (
                        item: any,
                        index: number
                      ) => {

                        if (
                          item === null ||
                          typeof item !==
                            "object"
                        ) {
                          return null;
                        }

                        return (
                          <div
                            key={index}
                            className="grid gap-2 border-t border-white/[0.06] px-5 py-4 md:grid-cols-[1fr_1fr_180px] md:items-center"
                          >

                            <div>

                              <p className="text-[10px] uppercase tracking-[0.15em] text-white/25 md:hidden">
                                Category
                              </p>

                              <p className="font-medium text-white/70">
                                {displayValue(
                                  item.category ||
                                    "General"
                                )}
                              </p>

                            </div>

                            <div>

                              <p className="text-[10px] uppercase tracking-[0.15em] text-white/25 md:hidden">
                                Item
                              </p>

                              <p className="text-sm text-white/45">
                                {displayValue(
                                  item.item ||
                                    "Design item"
                                )}
                              </p>

                            </div>

                            <div className="md:text-right">

                              <p className="text-[10px] uppercase tracking-[0.15em] text-white/25 md:hidden">
                                Estimated Cost
                              </p>

                              <p className="font-semibold text-white">
                                {formatCurrency(
                                  Number(
                                    item.estimatedCost ||
                                      0
                                  )
                                )}
                              </p>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>
              )}

          </section>
        ) : null}

        {/* =========================
            FINAL CTA
        ========================== */}

        <section className="relative mt-12 overflow-hidden rounded-3xl border border-purple-400/15 bg-gradient-to-br from-purple-600/20 via-indigo-600/10 to-fuchsia-600/[0.08] p-8 sm:p-10">

          <div className="pointer-events-none absolute right-[-100px] top-[-120px] h-[300px] w-[300px] rounded-full bg-purple-500/15 blur-[100px]" />

          <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">

            <div>

              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-purple-300/80">
                ROOMAI
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Ready to create another room?
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/40">
                Upload another room photo and let AI
                create a personalized interior design.
              </p>

            </div>

            <button
              onClick={() =>
                router.push("/planner")
              }
              className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Create New Design →
            </button>

          </div>

        </section>

      </div>

    </main>
  );
}