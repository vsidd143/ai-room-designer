
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_RETRIES_PER_MODEL = 1;

const MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null) {
    const e = error as {
      message?: string;
      error?: { message?: string };
    };

    return e.message || e.error?.message || String(error);
  }

  return String(error);
}

function shouldTryNextModel(message: string): boolean {
  const m = message.toLowerCase();

  return [
    "429",
    "503",
    "500",
    "502",
    "504",
    "resource_exhausted",
    "rate limit",
    "quota",
    "unavailable",
    "high demand",
    "overloaded",
    "timeout",
    "deadline",
    "not found",
    "404",
    "unsupported",
    "permission_denied",
  ].some((term) => m.includes(term));
}

function cleanJsonResponse(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function getBase64(image: string): string {
  return image.includes(",")
    ? image.slice(image.indexOf(",") + 1)
    : image;
}

function getMimeType(image: string, fallback: string): string {
  return image.match(/^data:(.*?);base64,/)?.[1] || fallback;
}

/**
 * Accepts:
 * 5000
 * "5000"
 * "₹5,000"
 * { amount: 5000 }
 * { value: "5000" }
 * { budget: 5000 }
 *
 * Missing or invalid budget returns null.
 * It NEVER defaults to ₹100,000.
 */
function parseBudget(value: unknown): number | null {
  let raw: unknown = value;

  if (typeof raw === "object" && raw !== null) {
    const obj = raw as {
      amount?: unknown;
      value?: unknown;
      budget?: unknown;
    };

    raw = obj.amount ?? obj.value ?? obj.budget;
  }

  if (typeof raw === "string") {
    raw = raw.replace(/[₹,\s]/g, "");
  }

  if (
    (typeof raw !== "number" && typeof raw !== "string") ||
    raw === ""
  ) {
    return null;
  }

  const amount = Number(raw);

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return Math.round(amount * 100) / 100;
}

function safeCost(value: unknown): number {
  const amount =
    typeof value === "string"
      ? Number(value.replace(/[₹,\s]/g, ""))
      : Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }

  return Math.round(amount * 100) / 100;
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is missing." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    const {
      originalImage,
      generatedImage,
      originalAnalysis,
      roomType,
      budget,
      style,
    } = body;

    if (!originalImage || !generatedImage) {
      return NextResponse.json(
        {
          error:
            "Both originalImage and generatedImage are required.",
        },
        { status: 400 }
      );
    }

    // IMPORTANT: Never silently replace the user's budget.
    const budgetNumber = parseBudget(budget);

    if (budgetNumber === null) {
      return NextResponse.json(
        {
          error:
            "A valid budget is required. Send the user's selected budget as a number or { amount: number }.",
          receivedBudget: budget ?? null,
        },
        { status: 400 }
      );
    }

    const originalBase64 = getBase64(originalImage);
    const generatedBase64 = getBase64(generatedImage);

    const originalMimeType = getMimeType(
      originalImage,
      "image/jpeg"
    );

    const generatedMimeType = getMimeType(
      generatedImage,
      "image/png"
    );

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(originalMimeType) ||
      !allowedTypes.includes(generatedMimeType)
    ) {
      return NextResponse.json(
        { error: "Images must be JPG, PNG, or WebP." },
        { status: 400 }
      );
    }

    const readableRoomType = String(roomType || "Room")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const prompt = `
You are an expert Indian interior designer and cost planner.

Compare these two images:
IMAGE 1: original room.
IMAGE 2: AI-generated redesigned room.

Room type: ${readableRoomType}
Design style: ${String(style || "Modern")}
USER'S EXACT TOTAL BUDGET: INR ${budgetNumber}

IMPORTANT BUDGET RULES:
- The user's selected budget is INR ${budgetNumber}.
- Do not replace it with INR 100000 or any other default.
- Plan materials, furniture, lighting and decor according to this exact budget.
- Prefer affordable alternatives for a small budget.
- For a larger budget, recommend better-quality items only when appropriate.
- Keep the sum of budgetBreakdown estimated costs within the selected budget whenever practical.
- Do not invent prices as facts; provide reasonable estimates for the Indian market.
- totalBudget must be exactly ${budgetNumber}.

Previous analysis:
${JSON.stringify(originalAnalysis ?? {}).slice(0, 700)}

Analyze the NEW image and compare it with the original.
Only describe visible changes. Do not invent doors, windows,
dimensions, or architectural changes.
Estimate realistic Indian market costs in INR.
Return ONLY valid JSON, no Markdown.

Use exactly this structure:
{
  "newRoomAnalysis": {
    "roomType": "",
    "designStyle": "",
    "overallLook": "",
    "colorPalette": [],
    "flooring": "",
    "walls": "",
    "lighting": "",
    "furniture": [],
    "decor": [],
    "curtainsAndWindows": "",
    "storage": "",
    "overallRating": 0
  },
  "oldToNewChanges": [
    {
      "category": "",
      "before": "",
      "after": "",
      "improvement": ""
    }
  ],
  "improvements": [
    {
      "item": "",
      "reason": "",
      "estimatedCost": 0,
      "priority": "High"
    }
  ],
  "budgetBreakdown": [
    {
      "category": "",
      "item": "",
      "estimatedCost": 0
    }
  ],
  "budgetSummary": {
    "totalBudget": ${budgetNumber},
    "estimatedTotal": 0,
    "remainingBudget": 0,
    "budgetUsedPercentage": 0
  },
  "designSummary": ""
}

Requirements:
- Include 5-8 visible changes.
- Include 4-8 practical improvements.
- Include 5-8 relevant budget items when practical for the selected budget.
- Use numeric costs, not strings.
- totalBudget must equal ${budgetNumber}.
- estimatedTotal must equal the sum of budgetBreakdown costs.
- remainingBudget = totalBudget - estimatedTotal.
- budgetUsedPercentage = estimatedTotal / totalBudget * 100.
- overallRating must be from 1 to 10.
- Keep all arrays as arrays.
`;

    const ai = new GoogleGenAI({ apiKey });
    const failures: string[] = [];

    for (const model of MODELS) {
      for (
        let attempt = 1;
        attempt <= MAX_RETRIES_PER_MODEL;
        attempt++
      ) {
        try {
          console.log(
            `Final analysis: ${model}, attempt ${attempt}, selected budget: INR ${budgetNumber}`
          );

          const response = await ai.models.generateContent({
            model,
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType: originalMimeType,
                      data: originalBase64,
                    },
                  },
                  {
                    inlineData: {
                      mimeType: generatedMimeType,
                      data: generatedBase64,
                    },
                  },
                  { text: prompt },
                ],
              },
            ],
            config: {
              responseMimeType: "application/json",
              maxOutputTokens: 3000,
            },
          });

          const text = response.text?.trim();

          if (!text) {
            failures.push(`${model}: empty response`);
            break;
          }

          let report: any;

          try {
            report = JSON.parse(cleanJsonResponse(text));
          } catch {
            failures.push(`${model}: invalid JSON`);
            break;
          }

          if (
            !report ||
            typeof report !== "object" ||
            !report.newRoomAnalysis ||
            typeof report.newRoomAnalysis !== "object"
          ) {
            failures.push(`${model}: incomplete report`);
            break;
          }

          // Normalize budget rows so totals can be calculated reliably.
          const budgetBreakdown = Array.isArray(report.budgetBreakdown)
            ? report.budgetBreakdown.map((item: any) => ({
                ...item,
                category: String(item?.category ?? ""),
                item: String(item?.item ?? ""),
                estimatedCost: safeCost(item?.estimatedCost),
              }))
            : [];

          const estimatedTotal = Math.round(
            budgetBreakdown.reduce(
              (sum: number, item: { estimatedCost: number }) =>
                sum + item.estimatedCost,
              0
            ) * 100
          ) / 100;

          const remainingBudget =
            Math.round((budgetNumber - estimatedTotal) * 100) / 100;

          const budgetUsedPercentage = Math.round(
            (estimatedTotal / budgetNumber) * 10000
          ) / 100;

          // Server-side values override any incorrect values returned by AI.
          report.budgetBreakdown = budgetBreakdown;
          report.budgetSummary = {
            totalBudget: budgetNumber,
            estimatedTotal,
            remainingBudget,
            budgetUsedPercentage,
          };

          if (Array.isArray(report.improvements)) {
            report.improvements = report.improvements.map(
              (item: any) => ({
                ...item,
                estimatedCost: safeCost(item?.estimatedCost),
              })
            );
          } else {
            report.improvements = [];
          }

          console.log(
            `Final analysis succeeded: ${model}; selected budget INR ${budgetNumber}; estimated total INR ${estimatedTotal}`
          );

          return NextResponse.json({
            success: true,
            model,
            report,
            data: report,
            roomType,
            budget: budgetNumber,
            style,
          });
        } catch (error: unknown) {
          const message = getErrorMessage(error);

          console.error(
            `Final analysis failed (${model}):`,
            message
          );

          failures.push(`${model}: ${message.slice(0, 180)}`);

          if (!shouldTryNextModel(message)) {
            return NextResponse.json(
              {
                error:
                  "Gemini rejected the analysis request. Check the API key, image format, and model access.",
                model,
                details: message,
              },
              { status: 502 }
            );
          }

          break;
        }
      }
    }

    console.error("All final-analysis models failed:", failures);

    return NextResponse.json(
      {
        success: false,
        error:
          "All configured Gemini models failed. Check model access, quota, or try again later.",
        attemptedModels: MODELS,
        failures,
      },
      { status: 503 }
    );
  } catch (error: unknown) {
    console.error("Final analysis route error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate final room analysis.",
        details: getErrorMessage(error),
      },
      { status: 500 }
    );
  }
}
