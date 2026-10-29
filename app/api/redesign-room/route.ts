
import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "@cf/black-forest-labs/flux-2-klein-4b";

function parseBudget(value: unknown): number | null {
  const raw =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>).amount ??
        (value as Record<string, unknown>).value ??
        (value as Record<string, unknown>).budget
      : value;

  if (
    raw === undefined ||
    raw === null ||
    (typeof raw === "string" && raw.trim() === "")
  ) {
    return null;
  }

  // Accept numbers and strings such as "500000" or "₹5,00,000".
  const normalized =
    typeof raw === "number"
      ? raw
      : String(raw).replace(/[₹,\s]/g, "");

  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return amount;
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(amount);
}

export async function POST(req: Request) {
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: "Cloudflare Account ID or API token is missing." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { image, mimeType, budget, style, roomAnalysis } = body;

    if (typeof image !== "string" || !image.trim()) {
      return NextResponse.json(
        { error: "Room image is required." },
        { status: 400 }
      );
    }

    if (
      mimeType &&
      !["image/jpeg", "image/png", "image/webp"].includes(mimeType)
    ) {
      return NextResponse.json(
        { error: "Please upload a JPG, PNG or WebP image." },
        { status: 400 }
      );
    }

    // Never silently replace a missing or invalid user budget with ₹1 lakh.
    const budgetNumber = parseBudget(budget);

    if (budgetNumber === null) {
      return NextResponse.json(
        {
          error:
            "A valid budget is required. Please enter your budget and try again.",
          receivedBudget: budget ?? null,
        },
        { status: 400 }
      );
    }

    const base64Data = image.includes(",")
      ? image.split(",")[1]
      : image;

    const inputBuffer = Buffer.from(base64Data, "base64");

    if (!inputBuffer.length || inputBuffer.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image is empty or exceeds the 10 MB limit." },
        { status: 400 }
      );
    }

    // Validate that the supplied data is a readable image.
    let resizedBuffer: Buffer;

    try {
      resizedBuffer = await sharp(inputBuffer)
        .rotate()
        .resize({
          width: 480,
          height: 480,
          fit: "inside",
          withoutEnlargement: true,
        })
        .png()
        .toBuffer();
    } catch {
      return NextResponse.json(
        { error: "The uploaded image could not be processed." },
        { status: 400 }
      );
    }

    const analysisText =
      typeof roomAnalysis === "string"
        ? roomAnalysis
        : JSON.stringify(roomAnalysis ?? {});

    const selectedStyle =
      typeof style === "string" && style.trim()
        ? style.trim().slice(0, 100)
        : "modern";

    const budgetINR = formatINR(budgetNumber);

    const prompt = `
Redesign the uploaded room photograph as a photorealistic Indian interior.

USER'S EXACT TOTAL PROJECT BUDGET: INR ${budgetINR}.
This is the user's selected budget. It is not a default or suggested budget.
You MUST base the design choices on this exact amount.

BUDGET RULES:
- Plan the room within the user's total budget of INR ${budgetINR}.
- Do not assume a fixed budget of INR 100000 or any other amount.
- Do not silently change the user's budget.
- Choose furniture, materials, lighting, curtains, storage and decor
  that are realistic and affordable for this specific budget in India.
- For a smaller budget, prioritize low-cost changes, repainting,
  rearranging existing furniture, economical materials and essential decor.
- For a larger budget, consider better-quality furniture, materials,
  lighting, storage and additional decor as the budget permits.
- Do not automatically choose luxury furniture or expensive materials.
- Avoid unnecessary structural work, demolition or major renovations.
- Treat the stated amount as the total project spending limit, not the
  amount for each item. Aim to keep estimated project costs within it.
- If the budget is limited, make sensible compromises rather than
  ignoring the budget.

PRESERVE THE ROOM:
Keep the original room's architecture, walls, doors, windows, floor layout
and camera perspective as close to the reference photo as possible.
Do not change room dimensions or invent doors and windows.

DESIGN STYLE: ${selectedStyle}

ROOM ANALYSIS:
${String(analysisText).slice(0, 2000)}

Create one cohesive, realistic redesigned room photograph.
Show changes that match the selected style and the exact budget.
Do not create a collage, floor plan, text, price labels or watermark.
`.trim();

    const form = new FormData();

    form.append("prompt", prompt);
    form.append(
      "input_image_0",
      new Blob([new Uint8Array(resizedBuffer)], {
        type: "image/png",
      }),
      "room.png"
    );
    form.append("width", "1024");
    form.append("height", "768");

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
        body: form,
        signal: AbortSignal.timeout(55000),
      }
    );

    if (!response.ok) {
      const details = await response.text();

      console.error(
        "Cloudflare AI error:",
        response.status,
        details.slice(0, 1500)
      );

      return NextResponse.json(
        {
          error:
            response.status === 401 || response.status === 403
              ? "Cloudflare authentication or permissions failed."
              : response.status === 429
                ? "Cloudflare usage limit reached. Please try later."
                : "Cloudflare image generation failed.",
        },
        {
          status: response.status === 429 ? 429 : 502,
        }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    let outputBase64: string;

    if (contentType.includes("image/")) {
      const output = Buffer.from(await response.arrayBuffer());
      outputBase64 = output.toString("base64");
    } else {
      const result = await response.json();

      if (result.success === false) {
        console.error("Cloudflare model error:", result.errors);

        return NextResponse.json(
          { error: "Cloudflare could not generate the image." },
          { status: 502 }
        );
      }

      const generated = result.result?.image ?? result.result;

      if (typeof generated !== "string" || !generated.length) {
        console.error(
          "Unexpected Cloudflare response:",
          JSON.stringify(result).slice(0, 1000)
        );

        return NextResponse.json(
          { error: "Cloudflare returned an unexpected image format." },
          { status: 502 }
        );
      }

      outputBase64 = generated.replace(
        /^data:image\/[^;]+;base64,/i,
        ""
      );
    }

    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${outputBase64}`,
      model: MODEL,
      style: selectedStyle,
      budget: budgetNumber,
    });
  } catch (error) {
    console.error("REDESIGN ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error && error.name === "TimeoutError"
            ? "Image generation timed out. Please try again."
            : "Failed to generate the redesigned room.",
      },
      { status: 500 }
    );
  }
}
