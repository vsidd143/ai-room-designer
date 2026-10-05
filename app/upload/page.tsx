"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Analysis = {
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

export default function UploadPage() {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState("");

  const [selectedRoom, setSelectedRoom] = useState("");
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [message, setMessage] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);

    const savedRoom =
      localStorage.getItem("smartroom_room_type") || "";

    const savedBudget =
      localStorage.getItem("smartroom_budget") || "";

    const savedStyle =
      localStorage.getItem("smartroom_design_style") || "";

    setSelectedRoom(savedRoom);
    setSelectedBudget(savedBudget);
    setSelectedStyle(savedStyle);

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
    };

    loadUser();
  }, [router, supabase]);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setMessage("");
    setAnalysis(null);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage(
        "Please select a JPG, PNG, or WebP image."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage(
        "Image size must be less than 10MB."
      );
      return;
    }

    setSelectedFile(file);

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);

    localStorage.removeItem(
      "smartroom_generated_image"
    );

    localStorage.removeItem(
      "smartroom_final_analysis"
    );
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreview("");
    setAnalysis(null);
    setMessage("");

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
  };

  const convertToBase64 = (
    file: File
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;

        const base64 = result.split(",")[1];

        resolve(base64);
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  const validateConfiguration = () => {
    if (!selectedRoom) {
      setMessage(
        "Room type is missing. Please go back to Room Planner."
      );
      return false;
    }

    if (!selectedBudget) {
      setMessage(
        "Budget is missing. Please go back to Budget."
      );
      return false;
    }

    if (!selectedStyle) {
      setMessage(
        "Design style is missing. Please go back to Design Style."
      );
      return false;
    }

    return true;
  };

  const analyzeRoom = async (): Promise<Analysis | null> => {
    if (!selectedFile) {
      setMessage(
        "Please upload a room image first."
      );
      return null;
    }

    if (!validateConfiguration()) {
      return null;
    }

    try {
      setAnalyzing(true);
      setMessage("");

      const base64Image =
        await convertToBase64(selectedFile);

      const response = await fetch(
        "/api/analyze-room",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: base64Image,
            mimeType: selectedFile.type,
            roomType: selectedRoom,
            budget: selectedBudget,
            style: selectedStyle,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Room analysis failed."
        );
      }

      if (!data.analysis) {
        throw new Error(
          "AI analysis was not returned."
        );
      }

      const roomAnalysis =
        data.analysis as Analysis;

      setAnalysis(roomAnalysis);

      localStorage.setItem(
        "smartroom_room_image",
        base64Image
      );

      localStorage.setItem(
        "smartroom_room_mime",
        selectedFile.type
      );

      localStorage.setItem(
        "smartroom_room_analysis",
        JSON.stringify(roomAnalysis)
      );

      localStorage.setItem(
        "smartroom_room_type",
        selectedRoom
      );

      localStorage.setItem(
        "smartroom_budget",
        selectedBudget
      );

      localStorage.setItem(
        "smartroom_design_style",
        selectedStyle
      );

      setMessage(
        "AI analysis completed successfully."
      );

      return roomAnalysis;
    } catch (error) {
      console.error(
        "ANALYSIS ERROR:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while analyzing the room."
      );

      return null;
    } finally {
      setAnalyzing(false);
    }
  };

  const uploadRoomImage = async () => {
    if (!selectedFile || !userId) {
      setMessage(
        "Please upload an image first."
      );
      return false;
    }

    try {
      setUploading(true);

      const extension =
        selectedFile.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("room-images")
        .upload(
          filePath,
          selectedFile,
          {
            contentType:
              selectedFile.type,
            upsert: false,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      localStorage.setItem(
        "smartroom_uploaded_path",
        filePath
      );

      return true;
    } catch (error) {
      console.error(
        "UPLOAD ERROR:",
        error
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Image upload failed."
      );

      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleContinueToDesignResult =
    async () => {
      if (!selectedFile) {
        setMessage(
          "Please upload a room image first."
        );
        return;
      }

      if (!validateConfiguration()) {
        return;
      }

      try {
        setMessage("");

        /*
         * STEP 1
         * Analyze the room if it has not already
         * been analyzed.
         */
        let currentAnalysis = analysis;

        if (!currentAnalysis) {
          currentAnalysis =
            await analyzeRoom();

          if (!currentAnalysis) {
            return;
          }
        }

        /*
         * STEP 2
         * Upload original image to Supabase.
         */
        const uploadSuccess =
          await uploadRoomImage();

        if (!uploadSuccess) {
          return;
        }

        /*
         * STEP 3
         * Make sure all required information
         * is available to the result page.
         */
        localStorage.setItem(
          "smartroom_room_type",
          selectedRoom
        );

        localStorage.setItem(
          "smartroom_budget",
          selectedBudget
        );

        localStorage.setItem(
          "smartroom_design_style",
          selectedStyle
        );

        localStorage.setItem(
          "smartroom_room_analysis",
          JSON.stringify(currentAnalysis)
        );

        /*
         * STEP 4
         * Go to the ACTUAL result page.
         *
         * IMPORTANT:
         * This is /design-result,
         * NOT /redesign.
         */
        router.push("/design-result");
      } catch (error) {
        console.error(
          "CONTINUE ERROR:",
          error
        );

        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to continue to the design result."
        );
      }
    };

  return (
    <main
      className={`min-h-screen overflow-hidden bg-[#08080c] text-white transition-opacity duration-700 ${
        loaded
          ? "opacity-100"
          : "opacity-0"
      }`}
    >
      {/* Background */}

      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(139,92,246,0.16),transparent_32%),radial-gradient(circle_at_10%_70%,rgba(59,130,246,0.07),transparent_25%),radial-gradient(circle_at_90%_70%,rgba(168,85,247,0.07),transparent_25%)]" />

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
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/[0.06] shadow-[0_0_30px_rgba(139,92,246,0.12)] transition duration-500 group-hover:scale-105">
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

      {/* Progress */}

      <div className="relative z-10 mx-auto max-w-4xl px-6 pt-4">
        <div className="flex items-center justify-between">
          <Step
            number="01"
            label="Room"
            completed
          />

          <Line completed />

          <Step
            number="02"
            label="Budget"
            completed
          />

          <Line completed />

          <Step
            number="03"
            label="Style"
            completed
          />

          <Line active />

          <Step
            number="04"
            label="Upload"
            active
          />
        </div>
      </div>

      {/* Main */}

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-14">
        <div className="text-center">
          <p className="text-[10px] font-semibold tracking-[0.35em] text-purple-300/80">
            STEP 04 · ROOM IMAGE
          </p>

          <h1 className="mt-5 text-5xl font-light tracking-[-0.04em] sm:text-6xl md:text-7xl">
            Upload your{" "}
            <span className="font-serif italic text-purple-200">
              space.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-400">
            Upload a clear photograph of your room.
            Our AI will analyze the existing space and
            prepare it for your personalized redesign.
          </p>
        </div>

        {/* Selected configuration */}

        <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
          <InfoCard
            label="ROOM"
            value={
              selectedRoom ||
              "Not selected"
            }
          />

          <InfoCard
            label="BUDGET"
            value={
              selectedBudget ||
              "Not selected"
            }
          />

          <InfoCard
            label="STYLE"
            value={
              selectedStyle ||
              "Not selected"
            }
          />
        </div>

        {/* Upload area */}

        <div className="mx-auto mt-10 max-w-3xl">
          {!preview ? (
            <label className="group relative flex min-h-[390px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[32px] border border-dashed border-white/15 bg-[#111117]/80 p-8 backdrop-blur-2xl transition duration-500 hover:border-purple-400/40 hover:bg-[#15151d]">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleFileChange
                }
                className="hidden"
              />

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.08),transparent_45%)] opacity-0 transition duration-500 group-hover:opacity-100" />

              <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-purple-400/20 bg-purple-500/10 shadow-[0_0_60px_rgba(139,92,246,0.12)] transition duration-500 group-hover:scale-105 group-hover:border-purple-400/40">
                <span className="text-4xl">
                  ↑
                </span>
              </div>

              <h2 className="relative mt-8 text-xl font-medium">
                Drop your room image here
              </h2>

              <p className="relative mt-3 text-sm text-slate-500">
                or click to browse from your device
              </p>

              <div className="relative mt-6 flex gap-3 text-[10px] tracking-wider text-slate-600">
                <span>JPG</span>
                <span>•</span>
                <span>PNG</span>
                <span>•</span>
                <span>WEBP</span>
                <span>•</span>
                <span>MAX 10MB</span>
              </div>
            </label>
          ) : (
            <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#111117]/90 p-4 shadow-2xl backdrop-blur-2xl">
              <div className="relative overflow-hidden rounded-[24px]">
                <img
                  src={preview}
                  alt="Selected room"
                  className="max-h-[600px] w-full object-cover"
                />

                <button
                  type="button"
                  onClick={
                    removeImage
                  }
                  className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs text-white backdrop-blur-xl transition hover:bg-black/80"
                >
                  Remove
                </button>
              </div>

              <div className="flex flex-col gap-4 px-2 pb-2 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    {selectedFile?.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {selectedFile
                      ? `${(
                          selectedFile.size /
                          1024 /
                          1024
                        ).toFixed(2)} MB`
                      : ""}
                  </p>
                </div>

                <label className="cursor-pointer rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-xs text-slate-300 transition hover:bg-white/[0.08] hover:text-white">
                  Change Image

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleFileChange
                    }
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Message */}

        {message && (
          <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-purple-400/20 bg-purple-500/10 px-5 py-4 text-center text-sm text-purple-200">
            {message}
          </div>
        )}

        {/* Action */}

        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={
              handleContinueToDesignResult
            }
            disabled={
              analyzing ||
              uploading ||
              !selectedFile
            }
            className="group relative inline-flex items-center gap-4 overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-semibold text-black shadow-[0_0_40px_rgba(255,255,255,0.08)] transition duration-500 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(255,255,255,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            <span className="relative">
              {analyzing
                ? "AI Analyzing..."
                : uploading
                ? "Uploading..."
                : analysis
                ? "Continue to AI Design"
                : "Analyze My Room"}
            </span>

            <span className="relative text-lg transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>

        {/* AI status */}

        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[10px] tracking-[0.2em] text-slate-600">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            AI READY
          </span>

          <span>ROOM ANALYSIS</span>

          <span>PERSONALIZED REDESIGN</span>

          <span>BUDGET AWARE</span>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </main>
  );
}

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
            ? "border-purple-400/50 bg-purple-500/15 text-purple-200 shadow-[0_0_25px_rgba(139,92,246,0.15)]"
            : completed
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
            : "border-white/10 bg-white/[0.03] text-slate-600"
        }`}
      >
        {completed && !active
          ? "✓"
          : number}
      </div>

      <span
        className={`text-[9px] tracking-[0.2em] ${
          active
            ? "text-purple-300"
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
          ? "bg-purple-400/30"
          : "bg-white/10"
      }`}
    />
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 backdrop-blur-xl">
      <p className="text-[9px] font-semibold tracking-[0.25em] text-slate-600">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-medium text-slate-200">
        {value}
      </p>
    </div>
  );
}