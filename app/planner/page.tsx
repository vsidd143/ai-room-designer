"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const roomTypes = [
  {
    id: "Bedroom",
    title: "Bedroom",
    description: "Rest, relax & recharge",
    icon: "◒",
  },
  {
    id: "Living Room",
    title: "Living Room",
    description: "Comfort & social spaces",
    icon: "▱",
  },
  {
    id: "Kitchen",
    title: "Kitchen",
    description: "Cooking & smart storage",
    icon: "⌂",
  },
  {
    id: "Bathroom",
    title: "Bathroom",
    description: "Clean, calm & functional",
    icon: "◌",
  },
  {
    id: "Dining Room",
    title: "Dining Room",
    description: "Meals & memorable moments",
    icon: "○",
  },
  {
    id: "Study Room",
    title: "Study Room",
    description: "Focus, work & productivity",
    icon: "▤",
  },
  {
    id: "Kids Room",
    title: "Kids Room",
    description: "Playful & creative space",
    icon: "✦",
  },
  {
    id: "Dressing Room",
    title: "Dressing Room",
    description: "Organized personal space",
    icon: "◇",
  },
  {
    id: "Balcony",
    title: "Balcony",
    description: "Relaxing outdoor corner",
    icon: "⌁",
  },
  {
    id: "Office",
    title: "Office",
    description: "Professional & productive",
    icon: "▥",
  },
];

export default function PlannerPage() {
  const router = useRouter();

  const [selectedRoom, setSelectedRoom] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);

    const savedRoom = localStorage.getItem(
      "smartroom_room_type"
    );

    if (savedRoom) {
      setSelectedRoom(savedRoom);
    }
  }, []);

  const handleContinue = () => {
    if (!selectedRoom) {
      return;
    }

    localStorage.setItem(
      "smartroom_room_type",
      selectedRoom
    );

    // Clear old analysis/design data
    localStorage.removeItem(
      "smartroom_room_analysis"
    );

    localStorage.removeItem(
      "smartroom_room_image"
    );

    localStorage.removeItem(
      "smartroom_room_mime"
    );

    localStorage.removeItem(
      "smartroom_generated_image"
    );

    router.push("/budget");
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

      <div className="pointer-events-none fixed left-[5%] top-[20%] h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />

      <div className="pointer-events-none fixed right-[5%] top-[45%] h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

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

        {/* Desktop navigation */}

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur-xl md:flex">
          <Link
            href="/dashboard"
            className="rounded-full px-5 py-2.5 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            Studio
          </Link>

          <Link
            href="/planner"
            className="rounded-full border border-cyan-400/20 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 px-5 py-2.5 text-xs font-medium text-cyan-200 shadow-sm"
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
          <Step number="01" label="Room" active />

          <Line active />

          <Step number="02" label="Budget" />

          <Line />

          <Step number="03" label="Style" />

          <Line />

          <Step number="04" label="Upload" />
        </div>
      </div>

      {/* HERO */}

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-14 md:px-10">
        <div className="text-center">
          <p className="text-[10px] font-semibold tracking-[0.35em] text-cyan-300/80">
            STEP 01 · ROOM PLANNER
          </p>

          <h1 className="mt-5 text-5xl font-light leading-[0.95] tracking-[-0.04em] sm:text-6xl md:text-8xl">
            What space are we{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-blue-300 to-violet-300 bg-clip-text font-serif italic text-transparent">
              transforming?
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
            Choose the room you want to redesign.
            Our AI will use this selection to
            understand the purpose, furniture,
            materials and layout of your space.
          </p>
        </div>

        {/* ROOM GRID */}

        <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {roomTypes.map((room, index) => {
            const isSelected =
              selectedRoom === room.id;

            return (
              <button
                key={room.id}
                type="button"
                onClick={() =>
                  setSelectedRoom(room.id)
                }
                className={`group relative min-h-[190px] overflow-hidden rounded-[24px] border p-6 text-left transition-all duration-500 ${
                  isSelected
                    ? "border-cyan-400/50 bg-gradient-to-br from-cyan-400/[0.10] via-blue-500/[0.08] to-violet-500/[0.08] shadow-[0_0_45px_rgba(34,211,238,0.10)]"
                    : "border-white/10 bg-[#111117]/75 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-[#15151d]"
                }`}
                style={{
                  animationDelay: `${index * 60}ms`,
                }}
              >
                {/* Hover glow */}

                <div
                  className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl transition-opacity duration-500 ${
                    isSelected
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                />

                {/* Selected indicator */}

                {isSelected && (
                  <div className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/15 text-xs text-cyan-200">
                    ✓
                  </div>
                )}

                {/* Icon */}

                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl transition-all duration-500 ${
                    isSelected
                      ? "border-cyan-400/30 bg-gradient-to-br from-cyan-400/15 to-blue-500/15 text-cyan-200 shadow-[0_0_30px_rgba(34,211,238,0.12)]"
                      : "border-white/10 bg-white/[0.04] text-slate-400 group-hover:border-cyan-400/20 group-hover:text-cyan-200"
                  }`}
                >
                  {room.icon}
                </div>

                {/* Text */}

                <div className="relative mt-7">
                  <h2
                    className={`text-base font-medium transition-colors ${
                      isSelected
                        ? "text-white"
                        : "text-slate-200"
                    }`}
                  >
                    {room.title}
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {room.description}
                  </p>
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

        {/* SELECTED ROOM */}

        <div
          className={`mx-auto mt-10 max-w-6xl transition-all duration-500 ${
            selectedRoom
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-3 opacity-0"
          }`}
        >
          <div className="rounded-[24px] border border-white/10 bg-white/[0.025] px-6 py-5 backdrop-blur-xl md:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 text-cyan-200">
                  ✦
                </div>

                <div>
                  <p className="text-[9px] font-semibold tracking-[0.25em] text-slate-600">
                    SELECTED SPACE
                  </p>

                  <p className="mt-1 text-sm font-medium text-white">
                    {selectedRoom}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                AI will optimize the redesign specifically
                for this room type.
              </p>
            </div>
          </div>
        </div>

        {/* CONTINUE */}

        <div className="mt-10 flex flex-col items-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedRoom}
            className="group relative inline-flex items-center gap-4 overflow-hidden rounded-full bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 px-8 py-4 text-sm font-semibold text-[#08080c] shadow-[0_0_40px_rgba(34,211,238,0.12)] transition duration-500 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(59,130,246,0.22)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-[#08080c] text-white transition-transform duration-300 group-hover:rotate-90">
              +
            </span>

            <span className="relative">
              Continue to Budget
            </span>

            <span className="relative text-lg transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>

          <p className="mt-5 text-[10px] tracking-[0.2em] text-slate-600">
            YOU CAN CHANGE YOUR SELECTION BEFORE CONTINUING
          </p>
        </div>

        {/* FOOTER STATUS */}

        <div className="mx-auto mt-16 flex max-w-6xl flex-col items-center justify-between gap-5 border-t border-white/5 pt-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />

              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />
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