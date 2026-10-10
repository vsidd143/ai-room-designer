"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const designStyles = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean lines, smart furniture & contemporary finishes",
    emoji: "✦",
    tags: ["Clean", "Contemporary", "Smart"],
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Simple, clutter-free spaces with elegant details",
    emoji: "◌",
    tags: ["Simple", "Calm", "Elegant"],
  },
  {
    id: "luxury",
    name: "Luxury",
    description: "Premium materials, rich textures & sophisticated styling",
    emoji: "◆",
    tags: ["Premium", "Rich", "Elegant"],
  },
  {
    id: "scandinavian",
    name: "Scandinavian",
    description: "Warm, bright interiors with natural materials",
    emoji: "◇",
    tags: ["Warm", "Natural", "Bright"],
  },
  {
    id: "industrial",
    name: "Industrial",
    description: "Raw textures, metal accents & bold architectural elements",
    emoji: "▦",
    tags: ["Bold", "Raw", "Urban"],
  },
  {
    id: "traditional",
    name: "Traditional",
    description: "Timeless furniture, classic details & warm interiors",
    emoji: "❖",
    tags: ["Classic", "Warm", "Timeless"],
  },
];

function Step({
  number,
  label,
  active,
  completed,
}: {
  number: string;
  label: string;
  active?: boolean;
  completed?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition ${
          completed
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
            : active
              ? "border-cyan-400/50 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-cyan-100 shadow-lg shadow-cyan-500/10"
              : "border-white/10 bg-white/[0.04] text-white/35"
        }`}
      >
        {completed ? "✓" : number}
      </div>

      <span
        className={`hidden text-xs font-medium sm:block ${
          active
            ? "text-cyan-200"
            : completed
              ? "text-slate-400"
              : "text-white/35"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function Line({ active }: { active?: boolean }) {
  return (
    <div
      className={`mx-2 h-px w-8 sm:w-12 ${
        active
          ? "bg-gradient-to-r from-cyan-400/50 to-blue-400/50"
          : "bg-white/10"
      }`}
    />
  );
}

export default function DesignPage() {
  const router = useRouter();

  const [selectedStyle, setSelectedStyle] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);

    const savedStyle =
      localStorage.getItem("smartroom_design_style") || "";

    const savedRoom =
      localStorage.getItem("smartroom_room_type") || "";

    const savedBudget =
      localStorage.getItem("smartroom_budget") || "";

    setSelectedStyle(savedStyle);
    setSelectedRoom(savedRoom);
    setSelectedBudget(savedBudget);
  }, []);

  const handleContinue = () => {
    if (!selectedStyle) return;

    localStorage.setItem(
      "smartroom_design_style",
      selectedStyle
    );

    localStorage.removeItem("smartroom_generated_image");

    router.push("/upload");
  };

  return (
    <main
      className={`min-h-screen overflow-hidden bg-[#08080c] text-white transition-opacity duration-700 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Ambient Background */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(34,211,238,0.13),transparent_32%),radial-gradient(circle_at_10%_70%,rgba(59,130,246,0.10),transparent_25%),radial-gradient(circle_at_90%_70%,rgba(139,92,246,0.09),transparent_25%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(120deg,#08080c_0%,#101018_45%,#08080c_100%)]" />

        <div className="absolute left-1/2 top-[-260px] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-cyan-500/[0.07] blur-[140px]" />

        <div className="absolute bottom-[-240px] right-[-180px] h-[500px] w-[500px] rounded-full bg-blue-600/[0.06] blur-[130px]" />

        <div className="absolute left-[-220px] top-[40%] h-[400px] w-[400px] rounded-full bg-violet-600/[0.06] blur-[120px]" />
      </div>

      {/* Navbar */}

      <header className="relative z-10 border-b border-white/[0.06] bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/dashboard"
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 transition group-hover:border-cyan-300/40">
              <span className="text-sm font-bold text-cyan-200">
                R
              </span>
            </div>

            <div>
              <div className="text-sm font-semibold tracking-wide">
                ROOM
                <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  AI
                </span>
              </div>

              <div className="text-[9px] uppercase tracking-[0.25em] text-white/30">
                Interior Intelligence
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/60 transition hover:border-cyan-400/30 hover:bg-white/[0.06] hover:text-white"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Progress */}

      <div className="relative z-10 border-b border-white/[0.05]">
        <div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-5">
          <Step number="1" label="Room" completed />

          <Line active />

          <Step number="2" label="Budget" completed />

          <Line active />

          <Step number="3" label="Style" active />

          <Line />

          <Step number="4" label="Upload" />
        </div>
      </div>

      {/* Main */}

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        {/* Heading */}

        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-gradient-to-r from-cyan-400/[0.08] to-blue-500/[0.08] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-200">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
            Step 03 · Design Style
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Choose your{" "}
            <span className="bg-gradient-to-r from-cyan-200 via-blue-300 to-violet-300 bg-clip-text text-transparent">
              design language
            </span>
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/45 sm:text-base">
            Select the interior style that best matches your vision.
            ROOMAI will use it to guide the AI redesign.
          </p>
        </div>

        {/* Selected Room + Budget */}

        <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur-xl">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/30">
              Room Selected
            </div>

            <div className="mt-2 text-sm font-medium text-white">
              {loaded ? selectedRoom || "Room selected" : "Room selected"}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 backdrop-blur-xl">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/30">
              Budget
            </div>

            <div className="mt-2 text-sm font-medium text-white">
              {loaded ? selectedBudget || "Budget selected" : "Budget selected"}
            </div>
          </div>
        </div>

        {/* Style Cards */}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {designStyles.map((style) => {
            const isSelected = selectedStyle === style.id;

            return (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyle(style.id)}
                className={`group relative overflow-hidden rounded-3xl border p-6 text-left transition duration-300 ${
                  isSelected
                    ? "border-cyan-400/45 bg-gradient-to-br from-cyan-400/[0.10] via-blue-500/[0.07] to-violet-500/[0.08] shadow-[0_0_50px_rgba(34,211,238,0.09)]"
                    : "border-white/[0.07] bg-white/[0.025] hover:border-cyan-400/25 hover:bg-white/[0.045]"
                }`}
              >
                {/* Selection indicator */}

                <div
                  className={`absolute right-5 top-5 flex h-6 w-6 items-center justify-center rounded-full border transition ${
                    isSelected
                      ? "border-cyan-300 bg-cyan-300 text-[#08080c]"
                      : "border-white/10 bg-white/[0.03] text-transparent"
                  }`}
                >
                  <span className="text-xs font-bold">✓</span>
                </div>

                {/* Glow */}

                <div
                  className={`pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full blur-3xl transition ${
                    isSelected
                      ? "bg-cyan-500/15"
                      : "bg-blue-500/0 group-hover:bg-blue-500/[0.08]"
                  }`}
                />

                <div className="relative">
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border text-lg transition ${
                      isSelected
                        ? "border-cyan-400/30 bg-gradient-to-br from-cyan-400/15 to-blue-500/15 text-cyan-200"
                        : "border-white/10 bg-white/[0.04] text-white/50 group-hover:border-cyan-400/20 group-hover:text-cyan-100"
                    }`}
                  >
                    {style.emoji}
                  </div>

                  <h2
                    className={`text-lg font-semibold ${
                      isSelected
                        ? "text-white"
                        : "text-white/90"
                    }`}
                  >
                    {style.name}
                  </h2>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-white/40">
                    {style.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {style.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full border px-2.5 py-1 text-[10px] ${
                          isSelected
                            ? "border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-100/80"
                            : "border-white/[0.07] bg-white/[0.025] text-white/30"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div
                    className={`absolute bottom-[-24px] left-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-blue-400 transition-all duration-300 ${
                      isSelected
                        ? "w-full opacity-100"
                        : "w-0 opacity-0 group-hover:w-full group-hover:opacity-60"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Action */}

        <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/budget"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-center text-sm text-white/60 transition hover:border-cyan-400/25 hover:bg-white/[0.06] hover:text-white"
          >
            ← Back to Budget
          </Link>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedStyle}
            className={`rounded-xl px-7 py-3 text-sm font-semibold transition ${
              selectedStyle
                ? "bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 text-[#08080c] shadow-lg shadow-cyan-500/10 hover:brightness-110"
                : "cursor-not-allowed bg-white/10 text-white/25"
            }`}
          >
            Continue to Upload →
          </button>
        </div>

        {/* AI Note */}

        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
          <p className="text-xs leading-5 text-white/30">
            <span className="text-cyan-200/80">
              AI Design Engine
            </span>{" "}
            will combine your selected room type, budget and design
            style to create a personalized interior concept.
          </p>
        </div>
      </section>
    </main>
  );
}