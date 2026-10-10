"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const budgetOptions = [
  {
    id: "₹50,000",
    amount: "₹50K",
    title: "Essential",
    description: "Smart upgrades & essentials",
    range: "₹40K – ₹60K",
    icon: "◇",
  },
  {
    id: "₹1,00,000",
    amount: "₹1L",
    title: "Balanced",
    description: "Complete room transformation",
    range: "₹80K – ₹1.2L",
    icon: "✦",
  },
  {
    id: "₹2,00,000",
    amount: "₹2L",
    title: "Premium",
    description: "Premium materials & furniture",
    range: "₹1.5L – ₹2.5L",
    icon: "◆",
  },
  {
    id: "₹5,00,000",
    amount: "₹5L",
    title: "Luxury",
    description: "High-end interior experience",
    range: "₹4L – ₹6L+",
    icon: "✧",
  },
];

export default function BudgetPage() {
  const router = useRouter();

  const [selectedBudget, setSelectedBudget] =
    useState("");

  const [customBudget, setCustomBudget] =
    useState("");

  const [selectedRoom, setSelectedRoom] =
    useState("");

  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    setLoaded(true);

    const savedBudget =
      localStorage.getItem("smartroom_budget");

    const savedRoom =
      localStorage.getItem("smartroom_room_type");

    if (savedRoom) {
      setSelectedRoom(savedRoom);
    }

    if (savedBudget) {
      const standardBudget =
        budgetOptions.find(
          (option) => option.id === savedBudget
        );

      if (standardBudget) {
        setSelectedBudget(standardBudget.id);
      } else {
        setSelectedBudget("custom");

        setCustomBudget(
          savedBudget.replace(/₹|,/g, "")
        );
      }
    }
  }, []);

  const handleBudgetSelect = (budget: string) => {
    setSelectedBudget(budget);
    setCustomBudget("");
  };

  const handleCustomBudget = (value: string) => {
    const cleanedValue =
      value.replace(/[^0-9]/g, "");

    setCustomBudget(cleanedValue);
    setSelectedBudget("custom");
  };

  const handleContinue = () => {
    let finalBudget = "";

    if (selectedBudget === "custom") {
      if (!customBudget) {
        return;
      }

      finalBudget = `₹${Number(
        customBudget
      ).toLocaleString("en-IN")}`;
    } else {
      finalBudget = selectedBudget;
    }

    if (!finalBudget) {
      return;
    }

    localStorage.setItem(
      "smartroom_budget",
      finalBudget
    );

    // Clear old analysis/design
    localStorage.removeItem(
      "smartroom_room_analysis"
    );

    localStorage.removeItem(
      "smartroom_generated_image"
    );

    router.push("/design");
  };

  return (
    <main
      className={`min-h-screen overflow-hidden bg-[#08080c] text-white transition-opacity duration-700 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(34,211,238,0.13),transparent_32%),radial-gradient(circle_at_10%_70%,rgba(59,130,246,0.10),transparent_25%),radial-gradient(circle_at_90%_70%,rgba(139,92,246,0.09),transparent_25%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(120deg,#08080c_0%,#101018_45%,#08080c_100%)]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="pointer-events-none fixed left-[5%] top-[25%] h-72 w-72 animate-pulse rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="pointer-events-none fixed right-[5%] top-[50%] h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

      {/* NAVBAR */}

      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-7 md:px-10">
        <Link
          href="/dashboard"
          className="group flex items-center gap-3"
        >
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/[0.06] shadow-[0_0_30px_rgba(34,211,238,0.12)] transition duration-500 group-hover:scale-105 group-hover:border-cyan-400/50">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/10" />

            <span className="relative text-lg font-black">
              R
            </span>
          </div>

          <div className="leading-none">
            <div className="text-[15px] font-bold tracking-[0.28em]">
              ROOM
              <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                AI
              </span>
            </div>

            <div className="mt-1 text-[8px] font-medium tracking-[0.35em] text-slate-500">
              SMART INTERIORS
            </div>
          </div>
        </Link>

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur-xl md:flex">
          <Link
            href="/dashboard"
            className="rounded-full px-5 py-2.5 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            Studio
          </Link>

          <Link
            href="/planner"
            className="rounded-full border border-cyan-400/20 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 px-5 py-2.5 text-xs font-medium text-cyan-200"
          >
            New Design
          </Link>

          <Link
            href="/my-designs"
            className="rounded-full px-5 py-2.5 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            My Designs
          </Link>
        </div>

        <Link
          href="/dashboard"
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-slate-400 transition hover:border-cyan-400/30 hover:text-white"
        >
          Dashboard
        </Link>
      </nav>

      {/* PROGRESS */}

      <div className="relative z-10 mx-auto max-w-4xl px-6 pt-4">
        <div className="flex items-center justify-between">
          <Step number="01" label="Room" completed />

          <Line completed />

          <Step number="02" label="Budget" active />

          <Line active />

          <Step number="03" label="Style" />

          <Line />

          <Step number="04" label="Upload" />
        </div>
      </div>

      {/* MAIN */}

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-14 md:px-10">
        {/* HERO */}

        <div className="text-center">
          <p className="text-[10px] font-semibold tracking-[0.35em] text-cyan-300/80">
            STEP 02 · BUDGET PLANNER
          </p>

          <h1 className="mt-5 text-5xl font-light leading-[0.95] tracking-[-0.04em] sm:text-6xl md:text-8xl">
            Set your{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-blue-300 to-violet-300 bg-clip-text font-serif italic text-transparent">
              investment.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
            Tell us how much you want to invest
            in your space. ROOMAI will use your
            budget to recommend realistic
            materials, furniture and design
            choices.
          </p>
        </div>

        {/* SELECTED ROOM */}

        <div className="mx-auto mt-10 max-w-5xl">
          <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.2em] text-slate-500">
            <span className="h-px w-8 bg-white/10" />

            <span>SELECTED ROOM</span>

            <span className="h-px w-8 bg-white/10" />
          </div>

          <div className="mt-4 flex justify-center">
            <div className="rounded-full border border-cyan-400/20 bg-gradient-to-r from-cyan-400/[0.06] to-blue-500/[0.06] px-5 py-2.5 text-xs text-slate-300 backdrop-blur-xl">
              {selectedRoom || "Room selected"}
            </div>
          </div>
        </div>

        {/* BUDGET OPTIONS */}

        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {budgetOptions.map((budget, index) => {
            const isSelected =
              selectedBudget === budget.id;

            return (
              <button
                key={budget.id}
                type="button"
                onClick={() =>
                  handleBudgetSelect(budget.id)
                }
                className={`group relative min-h-[250px] overflow-hidden rounded-[28px] border p-7 text-left transition-all duration-500 ${
                  isSelected
                    ? "border-cyan-400/50 bg-gradient-to-br from-cyan-400/[0.10] via-blue-500/[0.08] to-violet-500/[0.08] shadow-[0_0_50px_rgba(34,211,238,0.10)]"
                    : "border-white/10 bg-[#111117]/75 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-[#15151d]"
                }`}
                style={{
                  animationDelay: `${index * 80}ms`,
                }}
              >
                {/* Glow */}

                <div
                  className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl transition-opacity duration-500 ${
                    isSelected
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                />

                {/* Selected */}

                {isSelected && (
                  <div className="absolute right-6 top-6 flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/15 text-xs text-cyan-200">
                    ✓
                  </div>
                )}

                {/* Icon */}

                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-xl transition-all duration-500 ${
                    isSelected
                      ? "border-cyan-400/30 bg-gradient-to-br from-cyan-400/15 to-blue-500/15 text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.12)]"
                      : "border-white/10 bg-white/[0.04] text-slate-400 group-hover:border-cyan-400/20 group-hover:text-cyan-200"
                  }`}
                >
                  {budget.icon}
                </div>

                {/* Content */}

                <div className="relative mt-7">
                  <p
                    className={`text-3xl font-light tracking-tight ${
                      isSelected
                        ? "text-white"
                        : "text-slate-200"
                    }`}
                  >
                    {budget.amount}
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-300">
                    {budget.title}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {budget.description}
                  </p>

                  <div className="mt-5 border-t border-white/5 pt-4">
                    <p className="text-[9px] tracking-[0.15em] text-slate-600">
                      ESTIMATED RANGE
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {budget.range}
                    </p>
                  </div>
                </div>

                {/* Bottom line */}

                <div
                  className={`absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-blue-400 transition-all duration-500 ${
                    isSelected
                      ? "w-full opacity-100"
                      : "w-0 opacity-0 group-hover:w-full group-hover:opacity-50"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* CUSTOM BUDGET */}

        <div className="mx-auto mt-6 max-w-5xl">
          <button
            type="button"
            onClick={() =>
              setSelectedBudget("custom")
            }
            className={`w-full rounded-[24px] border p-6 text-left transition-all duration-500 ${
              selectedBudget === "custom"
                ? "border-cyan-400/40 bg-gradient-to-r from-cyan-400/[0.08] to-blue-500/[0.08]"
                : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.04]"
            }`}
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.06] text-xl text-cyan-200">
                  +
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    Custom Budget
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Have a specific amount in mind?
                  </p>
                </div>
              </div>

              {selectedBudget === "custom" && (
                <div
                  className="flex items-center rounded-2xl border border-cyan-400/20 bg-black/20 px-4 py-3"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >
                  <span className="mr-2 text-sm text-cyan-300">
                    ₹
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={customBudget}
                    onChange={(event) =>
                      handleCustomBudget(
                        event.target.value
                      )
                    }
                    placeholder="Enter amount"
                    className="w-40 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                  />
                </div>
              )}
            </div>
          </button>
        </div>

        {/* SELECTED SUMMARY */}

        <div
          className={`mx-auto mt-8 max-w-5xl transition-all duration-500 ${
            selectedBudget
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-3 opacity-0"
          }`}
        >
          <div className="rounded-[24px] border border-white/10 bg-white/[0.025] px-6 py-5 backdrop-blur-xl md:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[9px] font-semibold tracking-[0.25em] text-slate-600">
                  SELECTED INVESTMENT
                </p>

                <p className="mt-2 text-2xl font-light text-white">
                  {selectedBudget === "custom"
                    ? customBudget
                      ? `₹${Number(
                          customBudget
                        ).toLocaleString("en-IN")}`
                      : "Enter your budget"
                    : selectedBudget}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-xs text-slate-500">
                  AI will keep your redesign
                  within this budget.
                </p>

                <p className="mt-2 text-[10px] tracking-[0.15em] text-cyan-300/80">
                  BUDGET-AWARE DESIGN
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTINUE */}

        <div className="mt-10 flex flex-col items-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={
              !selectedBudget ||
              (selectedBudget === "custom" &&
                !customBudget)
            }
            className="group relative inline-flex items-center gap-4 overflow-hidden rounded-full bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 px-8 py-4 text-sm font-semibold text-[#08080c] shadow-[0_0_40px_rgba(34,211,238,0.12)] transition duration-500 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(59,130,246,0.22)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[#08080c] text-white transition-transform duration-300 group-hover:rotate-90">
              +
            </span>

            <span className="relative">
              Continue to Design Style
            </span>

            <span className="relative text-lg transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>

          <p className="mt-5 text-[10px] tracking-[0.2em] text-slate-600">
            YOUR BUDGET GUIDES THE AI DESIGN
          </p>
        </div>

        {/* FOOTER STATUS */}

        <div className="mx-auto mt-16 flex max-w-6xl flex-col items-center justify-between gap-5 border-t border-white/5 pt-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>

            <span className="text-[10px] font-semibold tracking-[0.25em] text-slate-500">
              ROOMAI STUDIO
            </span>
          </div>

          <p className="text-center text-[10px] tracking-wider text-slate-600 sm:text-right">
            Smart interior planning powered by AI.
          </p>
        </div>
      </section>

      {/* SIDE LABELS */}

      <div className="pointer-events-none fixed left-4 top-1/2 hidden -translate-y-1/2 rotate-[-90deg] text-[9px] tracking-[0.45em] text-white/[0.1] xl:block">
        INTERIOR INTELLIGENCE
      </div>

      <div className="pointer-events-none fixed right-4 top-1/2 hidden -translate-y-1/2 rotate-90 text-[9px] tracking-[0.45em] text-white/[0.1] xl:block">
        ROOMAI STUDIO
      </div>
    </main>
  );
}

/* PROGRESS STEP */

function Step({
  number,
  label,
  active = false,
  completed = false,
}: {
  number: string;
  label: string;
  active?: boolean;
  completed?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full border text-[10px] font-semibold transition ${
          active
            ? "border-cyan-400/50 bg-gradient-to-br from-cyan-400/15 to-blue-500/15 text-cyan-200 shadow-[0_0_25px_rgba(34,211,238,0.12)]"
            : completed
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
            : "border-white/10 bg-white/[0.03] text-slate-600"
        }`}
      >
        {completed && !active ? "✓" : number}
      </div>

      <span
        className={`text-[9px] tracking-[0.2em] ${
          active
            ? "text-cyan-300"
            : completed
            ? "text-slate-400"
            : "text-slate-600"
        }`}
      >
        {label.toUpperCase()}
      </span>
    </div>
  );
}

/* PROGRESS LINE */

function Line({
  active = false,
  completed = false,
}: {
  active?: boolean;
  completed?: boolean;
}) {
  return (
    <div
      className={`mb-5 h-px flex-1 ${
        completed
          ? "bg-emerald-400/20"
          : active
          ? "bg-gradient-to-r from-cyan-400/30 to-blue-400/30"
          : "bg-white/10"
      }`}
    />
  );
}