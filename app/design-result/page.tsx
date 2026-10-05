"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type RoomAnalysis = {
  roomType?: string;
  roomSize?: string;
  currentStyle?: string;
  colors?: string[];
  flooring?: string;
  lighting?: string;
  walls?: string;
  windows?: string;
  curtains?: string;
  furniture?: string[];
  storage?: string;
  decor?: string;
  issues?: string[];
  suggestions?: string[];
  recommendedStyles?: string[];
  estimatedBudget?: {
    min?: number;
    max?: number;
  };
  redesignDirection?: string;
};

type BudgetBreakdown = {
  category?: string;
  item?: string;
  amount?: number;
  estimated?: number;
  cost?: number;
  percentage?: number;
};

type FinalAnalysis = {
  newRoomAnalysis?: {
    roomType?: string;
    designStyle?: string;
    overallLook?: string;
    colorPalette?: string[];
    flooring?: string;
    walls?: string;
    lighting?: string;
    furniture?: string[];
    decor?: string[];
    curtainsAndWindows?: string;
    storage?: string;
  };

  oldToNewChanges?: string[];

  improvements?: string[];

  budgetBreakdown?: BudgetBreakdown[];

  budgetSummary?: string;

  finalRecommendation?: string;

  [key: string]: unknown;
};

function formatBudget(value: unknown): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not selected";
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return "Not selected";
    }

    return `₹${value.toLocaleString("en-IN")}`;
  }

  if (typeof value === "string") {
    const cleaned = value.trim();

    if (!cleaned) {
      return "Not selected";
    }

    /*
     * Already formatted values such as:
     * ₹50,000
     * ₹1,00,000
     * ₹2L
     * ₹5L
     */
    if (
      cleaned.includes("₹") ||
      cleaned.includes("K") ||
      cleaned.includes("L") ||
      cleaned.includes("lakh") ||
      cleaned.includes("Lakhs")
    ) {
      return cleaned;
    }

    /*
     * Plain numeric string.
     */
    const numericValue = Number(
      cleaned.replace(/,/g, "")
    );

    if (Number.isFinite(numericValue)) {
      return `₹${numericValue.toLocaleString(
        "en-IN"
      )}`;
    }

    return cleaned;
  }

  if (typeof value === "object") {
    const objectValue =
      value as Record<string, unknown>;

    const possibleValues = [
      objectValue.amount,
      objectValue.value,
      objectValue.budget,
      objectValue.total,
    ];

    for (const possibleValue of possibleValues) {
      if (
        possibleValue !== undefined &&
        possibleValue !== null &&
        possibleValue !== ""
      ) {
        return formatBudget(possibleValue);
      }
    }
  }

  return "Not selected";
}

function getImageSource(
  image: string,
  mimeType: string
): string {
  if (!image) {
    return "";
  }

  /*
   * If the image is already a complete data URL,
   * use it directly.
   */
  if (image.startsWith("data:")) {
    return image;
  }

  /*
   * Uploaded room images are stored in localStorage
   * as raw Base64, so we must add the MIME prefix.
   */
  return `data:${mimeType || "image/jpeg"};base64,${image}`;
}

function getGeneratedImage(
  data: Record<string, unknown>
): string {
  const possibleImageValues = [
    data.generatedImage,
    data.image,
    data.generated_image,
    data.output,
    data.result,
  ];

  for (const value of possibleImageValues) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return "";
}

function getFinalReport(
  data: Record<string, unknown>
): FinalAnalysis | null {
  const possibleReports = [
    data.report,
    data.finalAnalysis,
    data.analysis,
    data.final_analysis,
  ];

  for (const report of possibleReports) {
    if (
      report &&
      typeof report === "object"
    ) {
      return report as FinalAnalysis;
    }
  }

  return null;
}

export default function DesignResultPage() {
  const router = useRouter();

  const [roomImage, setRoomImage] = useState("");
  const [roomMime, setRoomMime] = useState(
    "image/jpeg"
  );

  const [roomType, setRoomType] = useState("");
  const [budget, setBudget] = useState("");
  const [style, setStyle] = useState("");

  const [roomAnalysis, setRoomAnalysis] =
    useState<RoomAnalysis | null>(null);

  const [generatedImage, setGeneratedImage] =
    useState("");

  const [finalAnalysis, setFinalAnalysis] =
    useState<FinalAnalysis | null>(null);

  const [generating, setGenerating] =
    useState(false);

  const [generationStep, setGenerationStep] =
    useState("");

  const [error, setError] = useState("");

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);

    const savedImage =
      localStorage.getItem(
        "smartroom_room_image"
      ) || "";

    const savedMime =
      localStorage.getItem(
        "smartroom_room_mime"
      ) || "image/jpeg";

    const savedRoom =
      localStorage.getItem(
        "smartroom_room_type"
      ) || "";

    const savedBudget =
      localStorage.getItem(
        "smartroom_budget"
      ) || "";

    const savedStyle =
      localStorage.getItem(
        "smartroom_design_style"
      ) || "";

    const savedAnalysis =
      localStorage.getItem(
        "smartroom_room_analysis"
      );

    const savedGenerated =
      localStorage.getItem(
        "smartroom_generated_image"
      ) || "";

    const savedFinalAnalysis =
      localStorage.getItem(
        "smartroom_final_analysis"
      );

    setRoomImage(savedImage);
    setRoomMime(savedMime);
    setRoomType(savedRoom);
    setBudget(savedBudget);
    setStyle(savedStyle);
    setGeneratedImage(savedGenerated);

    if (savedAnalysis) {
      try {
        setRoomAnalysis(
          JSON.parse(savedAnalysis)
        );
      } catch {
        setRoomAnalysis(null);
      }
    }

    if (savedFinalAnalysis) {
      try {
        setFinalAnalysis(
          JSON.parse(savedFinalAnalysis)
        );
      } catch {
        setFinalAnalysis(null);
      }
    }
  }, []);

  const originalImageSource = useMemo(() => {
    return getImageSource(
      roomImage,
      roomMime
    );
  }, [roomImage, roomMime]);

  const generatedImageSource = useMemo(() => {
    if (!generatedImage) {
      return "";
    }

    if (
      generatedImage.startsWith("data:")
    ) {
      return generatedImage;
    }

    /*
     * Generated image responses are normally
     * returned as a complete data URL.
     * This fallback supports raw Base64 too.
     */
    if (
      generatedImage.startsWith(
        "http://"
      ) ||
      generatedImage.startsWith(
        "https://"
      )
    ) {
      return generatedImage;
    }

    return `data:image/png;base64,${generatedImage}`;
  }, [generatedImage]);

  const displayBudget = useMemo(() => {
    return formatBudget(budget);
  }, [budget]);

  const generateFinalAnalysis = async (
    newImage: string
  ) => {
    try {
      setGenerationStep(
        "Preparing your final AI analysis..."
      );

      const response = await fetch(
        "/api/final-analysis",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            originalImage: roomImage,
            generatedImage: newImage,
            originalAnalysis:
              roomAnalysis,
            roomType,
            budget,
            style,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Final analysis failed."
        );
      }

      const report =
        getFinalReport(data);

      if (report) {
        setFinalAnalysis(report);

        localStorage.setItem(
          "smartroom_final_analysis",
          JSON.stringify(report)
        );
      }

      return report;
    } catch (error) {
      console.error(
        "FINAL ANALYSIS ERROR:",
        error
      );

      throw new Error(
        error instanceof Error
          ? error.message
          : "Final AI analysis failed."
      );
    }
  };

  const generateDesign = async () => {
    if (!roomImage) {
      setError(
        "Original room image is missing. Please go back to Upload."
      );
      return;
    }

    if (!roomType) {
      setError(
        "Room type is missing. Please start the design again."
      );
      return;
    }

    if (!budget) {
      setError(
        "Budget is missing. Please start the design again."
      );
      return;
    }

    if (!style) {
      setError(
        "Interior style is missing. Please start the design again."
      );
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setFinalAnalysis(null);

      localStorage.removeItem(
        "smartroom_generated_image"
      );

      localStorage.removeItem(
        "smartroom_final_analysis"
      );

      setGenerationStep(
        "AI is studying your room..."
      );

      const response = await fetch(
        "/api/redesign-room",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            image: roomImage,
            mimeType: roomMime,
            roomType,
            budget,
            style,
            roomAnalysis,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "AI room redesign failed."
        );
      }

      const newImage =
        getGeneratedImage(data);

      if (!newImage) {
        console.error(
          "REDESIGN RESPONSE:",
          data
        );

        throw new Error(
          "AI did not return a generated room image."
        );
      }

      setGeneratedImage(newImage);

      localStorage.setItem(
        "smartroom_generated_image",
        newImage
      );

      setGenerationStep(
        "Your new interior has been generated."
      );

      await generateFinalAnalysis(
        newImage
      );

      setGenerationStep(
        "Design and final analysis completed."
      );
    } catch (error) {
      console.error(
        "DESIGN GENERATION ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while generating your design."
      );

      setGenerationStep("");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImageSource) {
      return;
    }

    const link =
      document.createElement("a");

    link.href = generatedImageSource;

    link.download =
      "roomai-generated-interior.png";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  const handleStartAgain = () => {
    localStorage.removeItem(
      "smartroom_room_image"
    );

    localStorage.removeItem(
      "smartroom_room_mime"
    );

    localStorage.removeItem(
      "smartroom_room_analysis"
    );

    localStorage.removeItem(
      "smartroom_generated_image"
    );

    localStorage.removeItem(
      "smartroom_final_analysis"
    );

    localStorage.removeItem(
      "smartroom_uploaded_path"
    );

    router.push("/planner");
  };

  const renderList = (
    items?: string[]
  ) => {
    if (!items || items.length === 0) {
      return (
        <p className="text-sm text-slate-500">
          No information available.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {items.map(
          (item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex gap-3"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />

              <p className="text-sm leading-6 text-slate-300">
                {item}
              </p>
            </div>
          )
        )}
      </div>
    );
  };

  const getBreakdownAmount = (
    item: BudgetBreakdown
  ) => {
    const amount =
      item.amount ??
      item.estimated ??
      item.cost;

    if (
      typeof amount !== "number" ||
      !Number.isFinite(amount)
    ) {
      return "—";
    }

    return `₹${amount.toLocaleString(
      "en-IN"
    )}`;
  };

  return (
    <main
      className={`min-h-screen overflow-x-hidden bg-[#08080c] text-white transition-opacity duration-700 ${
        loaded
          ? "opacity-100"
          : "opacity-0"
      }`}
    >
      {/* Background */}

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_5%,rgba(139,92,246,0.16),transparent_32%),radial-gradient(circle_at_10%_60%,rgba(59,130,246,0.06),transparent_25%),radial-gradient(circle_at_90%_70%,rgba(168,85,247,0.07),transparent_25%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(120deg,#08080c_0%,#101018_45%,#08080c_100%)]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize:
              "80px 80px",
          }}
        />
      </div>

      {/* Navbar */}

      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-7 md:px-10">
        <Link
          href="/dashboard"
          className="group flex items-center gap-3"
        >
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/[0.06] shadow-[0_0_30px_rgba(139,92,246,0.12)] transition duration-500 group-hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent" />

            <span className="relative text-lg font-black">
              R
            </span>
          </div>

          <div className="leading-none">
            <div className="text-[15px] font-bold tracking-[0.28em]">
              ROOM
              <span className="text-purple-400">
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
            className="rounded-full bg-purple-500/15 px-5 py-2.5 text-xs font-medium text-purple-200"
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
          className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-slate-400 transition hover:border-purple-400/30 hover:text-white"
        >
          Dashboard
        </Link>
      </nav>

      {/* Header */}

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-12 pt-10 md:px-10">
        <div className="text-center">
          <p className="text-[10px] font-semibold tracking-[0.35em] text-purple-300/80">
            ROOMAI · AI DESIGN STUDIO
          </p>

          <h1 className="mt-5 text-5xl font-light tracking-[-0.04em] sm:text-6xl md:text-7xl">
            Your room,
            <br />
            <span className="font-serif italic text-purple-200">
              reimagined.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-400">
            Your room photo, room type, budget and
            interior style are combined to create a
            personalized AI interior design.
          </p>
        </div>

        {/* Design brief */}

        <div className="mx-auto mt-12 grid max-w-6xl gap-3 md:grid-cols-4">
          <BriefCard
            icon="⌂"
            label="ROOM TYPE"
            value={
              roomType || "Not selected"
            }
          />

          <BriefCard
            icon="₹"
            label="BUDGET"
            value={displayBudget}
          />

          <BriefCard
            icon="✦"
            label="INTERIOR STYLE"
            value={
              style || "Not selected"
            }
          />

          <BriefCard
            icon="◉"
            label="ROOM PHOTO"
            value={
              roomImage
                ? "Ready for AI"
                : "Missing"
            }
          />
        </div>
      </section>

      {/* Before / After */}

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-10 md:px-10">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Original */}

          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#111117]/80 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-[9px] tracking-[0.25em] text-slate-600">
                  ORIGINAL
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  Your Current Room
                </h2>
              </div>

              <span className="rounded-full bg-white/[0.05] px-4 py-2 text-[10px] text-slate-500">
                Before
              </span>
            </div>

            <div className="relative flex min-h-[480px] items-center justify-center bg-black">
              {originalImageSource ? (
                <img
                  src={originalImageSource}
                  alt="Original room"
                  className="h-full max-h-[620px] w-full object-contain"
                />
              ) : (
                <div className="px-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-2xl">
                    📷
                  </div>

                  <p className="mt-5 text-sm text-slate-400">
                    Original room image is not
                    available.
                  </p>

                  <Link
                    href="/upload"
                    className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    Back to Upload
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Generated */}

          <div className="overflow-hidden rounded-[28px] border border-purple-400/20 bg-[#111117]/80 shadow-2xl shadow-purple-950/20 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-purple-400/10 px-5 py-4">
              <div>
                <p className="text-[9px] tracking-[0.25em] text-purple-300/60">
                  AI RESULT
                </p>

                <h2 className="mt-1 text-lg font-semibold">
                  Generated Interior
                </h2>
              </div>

              <span className="rounded-full bg-purple-500/10 px-4 py-2 text-[10px] text-purple-300">
                AI
              </span>
            </div>

            <div className="relative flex min-h-[480px] items-center justify-center bg-black">
              {generatedImageSource ? (
                <img
                  src={generatedImageSource}
                  alt="AI generated interior"
                  className="h-full max-h-[620px] w-full object-contain"
                />
              ) : (
                <div className="px-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-2xl">
                    ✦
                  </div>

                  <h3 className="mt-6 text-xl font-semibold">
                    Ready for generation
                  </h3>

                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                    Your AI-generated interior will
                    appear here after you start the
                    design process.
                  </p>
                </div>
              )}

              {generating && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md">
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl border border-purple-400/30 bg-purple-500/10 text-2xl">
                      ✦
                    </div>

                    <p className="mt-5 text-lg font-semibold">
                      Creating your interior
                    </p>

                    <p className="mt-2 text-sm text-slate-400">
                      {generationStep ||
                        "AI is working on your room..."}
                    </p>

                    <div className="mx-auto mt-6 h-1 w-48 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-1/2 animate-pulse rounded-full bg-purple-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Error */}

      {error && (
        <section className="relative z-10 mx-auto max-w-5xl px-6 pb-6 md:px-10">
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-center text-sm text-red-300">
            {error}
          </div>
        </section>
      )}

      {/* Generate controls */}

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-12 md:px-10">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-8 text-center backdrop-blur-2xl md:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-xl">
            ✦
          </div>

          <h2 className="mt-6 text-2xl font-semibold">
            {generatedImage
              ? "Your AI design is ready"
              : "Ready to create your design?"}
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            {generatedImage
              ? "You can generate another variation using the same room, budget and interior style."
              : "ROOMAI will redesign your actual room while considering the selected room type, budget and interior style."}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {!generatedImage ? (
              <button
                type="button"
                onClick={generateDesign}
                disabled={generating}
                className="group inline-flex items-center gap-4 rounded-full bg-white px-8 py-4 text-sm font-semibold text-black shadow-[0_0_40px_rgba(255,255,255,0.08)] transition duration-500 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(255,255,255,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>
                  {generating
                    ? "AI Creating..."
                    : "Generate My Interior"}
                </span>

                <span className="text-lg transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={generateDesign}
                  disabled={generating}
                  className="inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ✦ Generate Again
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-7 py-3.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
                >
                  ↓ Download
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleStartAgain}
              disabled={generating}
              className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-transparent px-7 py-3.5 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
            >
              Start New Design
            </button>
          </div>
        </div>
      </section>

      {/* Original analysis */}

      {roomAnalysis && (
        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-10 md:px-10">
          <div className="rounded-[28px] border border-white/10 bg-[#111117]/80 p-7 backdrop-blur-2xl md:p-9">
            <div>
              <p className="text-[9px] font-semibold tracking-[0.25em] text-purple-300/70">
                AI ROOM ANALYSIS
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Understanding your current space
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                This analysis is used to guide the
                personalized redesign.
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <AnalysisCard
                title="Room Size"
                value={
                  roomAnalysis.roomSize
                }
              />

              <AnalysisCard
                title="Current Style"
                value={
                  roomAnalysis.currentStyle
                }
              />

              <AnalysisCard
                title="Flooring"
                value={
                  roomAnalysis.flooring
                }
              />

              <AnalysisCard
                title="Lighting"
                value={
                  roomAnalysis.lighting
                }
              />

              <AnalysisCard
                title="Walls"
                value={
                  roomAnalysis.walls
                }
              />

              <AnalysisCard
                title="Storage"
                value={
                  roomAnalysis.storage
                }
              />
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <p className="text-xs font-semibold text-white">
                  Current Furniture
                </p>

                <div className="mt-4">
                  {renderList(
                    roomAnalysis.furniture
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                <p className="text-xs font-semibold text-white">
                  Current Issues
                </p>

                <div className="mt-4">
                  {renderList(
                    roomAnalysis.issues
                  )}
                </div>
              </div>
            </div>

            {roomAnalysis.redesignDirection && (
              <div className="mt-6 rounded-2xl border border-purple-400/10 bg-purple-500/[0.04] p-6">
                <p className="text-xs font-semibold text-purple-200">
                  AI Redesign Direction
                </p>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {
                    roomAnalysis.redesignDirection
                  }
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Final report */}

      {finalAnalysis && (
        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 md:px-10">
          <div className="rounded-[32px] border border-purple-400/15 bg-[#111117]/90 p-7 shadow-2xl shadow-purple-950/10 backdrop-blur-2xl md:p-10">
            <div className="text-center">
              <p className="text-[9px] font-semibold tracking-[0.3em] text-purple-300/70">
                FINAL AI REPORT
              </p>

              <h2 className="mt-3 text-3xl font-semibold">
                Your redesigned room
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                A detailed summary of what changed,
                why it changed and how the selected
                budget was considered.
              </p>
            </div>

            {/* New room analysis */}

            {finalAnalysis.newRoomAnalysis && (
              <div className="mt-10">
                <ReportTitle>
                  New Room Analysis
                </ReportTitle>

                <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <AnalysisCard
                    title="Room Type"
                    value={
                      finalAnalysis
                        .newRoomAnalysis
                        .roomType
                    }
                  />

                  <AnalysisCard
                    title="Design Style"
                    value={
                      finalAnalysis
                        .newRoomAnalysis
                        .designStyle
                    }
                  />

                  <AnalysisCard
                    title="Flooring"
                    value={
                      finalAnalysis
                        .newRoomAnalysis
                        .flooring
                    }
                  />

                  <AnalysisCard
                    title="Walls"
                    value={
                      finalAnalysis
                        .newRoomAnalysis
                        .walls
                    }
                  />

                  <AnalysisCard
                    title="Lighting"
                    value={
                      finalAnalysis
                        .newRoomAnalysis
                        .lighting
                    }
                  />

                  <AnalysisCard
                    title="Curtains & Windows"
                    value={
                      finalAnalysis
                        .newRoomAnalysis
                        .curtainsAndWindows
                    }
                  />
                </div>

                {finalAnalysis
                  .newRoomAnalysis
                  .overallLook && (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                    <p className="text-xs font-semibold text-white">
                      Overall Look
                    </p>

                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {
                        finalAnalysis
                          .newRoomAnalysis
                          .overallLook
                      }
                    </p>
                  </div>
                )}

                <div className="mt-5 grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                    <p className="text-xs font-semibold text-white">
                      Furniture
                    </p>

                    <div className="mt-4">
                      {renderList(
                        finalAnalysis
                          .newRoomAnalysis
                          .furniture
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                    <p className="text-xs font-semibold text-white">
                      Decor
                    </p>

                    <div className="mt-4">
                      {renderList(
                        finalAnalysis
                          .newRoomAnalysis
                          .decor
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Changes */}

            {finalAnalysis.oldToNewChanges &&
              finalAnalysis.oldToNewChanges
                .length > 0 && (
                <div className="mt-10">
                  <ReportTitle>
                    What Changed
                  </ReportTitle>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                    {renderList(
                      finalAnalysis.oldToNewChanges
                    )}
                  </div>
                </div>
              )}

            {/* Improvements */}

            {finalAnalysis.improvements &&
              finalAnalysis.improvements
                .length > 0 && (
                <div className="mt-10">
                  <ReportTitle>
                    Improvements
                  </ReportTitle>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
                    {renderList(
                      finalAnalysis.improvements
                    )}
                  </div>
                </div>
              )}

            {/* Budget */}

            {(finalAnalysis.budgetBreakdown ||
              finalAnalysis.budgetSummary) && (
              <div className="mt-10">
                <ReportTitle>
                  Budget Plan
                </ReportTitle>

                {finalAnalysis.budgetSummary && (
                  <div className="mt-5 rounded-2xl border border-purple-400/10 bg-purple-500/[0.04] p-6">
                    <p className="text-sm leading-7 text-slate-300">
                      {
                        finalAnalysis.budgetSummary
                      }
                    </p>
                  </div>
                )}

                {finalAnalysis.budgetBreakdown &&
                  finalAnalysis
                    .budgetBreakdown
                    .length > 0 && (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
                      <div className="hidden grid-cols-3 border-b border-white/10 bg-white/[0.03] px-5 py-4 text-[9px] font-semibold tracking-[0.2em] text-slate-500 md:grid">
                        <span>
                          CATEGORY
                        </span>

                        <span>
                          ITEM
                        </span>

                        <span className="text-right">
                          ESTIMATE
                        </span>
                      </div>

                      {finalAnalysis.budgetBreakdown.map(
                        (
                          item,
                          index
                        ) => (
                          <div
                            key={`${item.category || "item"}-${index}`}
                            className="grid gap-2 border-b border-white/5 px-5 py-4 last:border-b-0 md:grid-cols-3"
                          >
                            <div>
                              <p className="text-xs font-medium text-slate-300">
                                {item.category ||
                                  "Interior"}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-slate-500">
                                {item.item ||
                                  "Estimated work"}
                              </p>
                            </div>

                            <div className="md:text-right">
                              <p className="text-sm font-semibold text-purple-200">
                                {getBreakdownAmount(
                                  item
                                )}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
            )}

            {/* Final recommendation */}

            {finalAnalysis.finalRecommendation && (
              <div className="mt-10 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-6">
                <p className="text-xs font-semibold text-emerald-300">
                  Final Recommendation
                </p>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {
                    finalAnalysis.finalRecommendation
                  }
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}

      <footer className="relative z-10 border-t border-white/5 px-6 py-8 text-center">
        <p className="text-[9px] tracking-[0.3em] text-slate-700">
          ROOMAI · AI POWERED INTERIOR DESIGN
        </p>
      </footer>
    </main>
  );
}

function BriefCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-400/15 bg-purple-500/[0.06] text-sm text-purple-300">
          {icon}
        </div>

        <p className="text-[9px] font-semibold tracking-[0.2em] text-slate-600">
          {label}
        </p>
      </div>

      <p className="mt-4 truncate text-base font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}

function AnalysisCard({
  title,
  value,
}: {
  title: string;
  value?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <p className="text-[9px] font-semibold tracking-[0.2em] text-slate-600">
        {title}
      </p>

      <p className="mt-3 text-sm leading-6 text-slate-300">
        {value || "Not available"}
      </p>
    </div>
  );
}

function ReportTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px w-8 bg-purple-400/40" />

      <h3 className="text-sm font-semibold tracking-wide text-white">
        {children}
      </h3>
    </div>
  );
}