
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_MODELS_TO_TRY = 15;

// Used only if Gemini's model-list endpoint is temporarily unavailable.
const FALLBACK_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.1-pro-preview",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
];

function isSuitableModel(model: any): boolean {
  const name = String(model?.name ?? "")
    .replace(/^models\//, "")
    .toLowerCase();

  const methods = model?.supportedGenerationMethods ?? [];

  if (!name || !methods.includes("generateContent")) {
    return false;
  }

  // Exclude models meant for unrelated tasks.
  const excluded = [
    "embedding",
    "tts",
    "transcribe",
    "live",
    "image",
    "audio",
    "video",
    "robotics",
    "lyria",
    "deep-research",
    "antigravity",
    "computer-use",
  ];

  return !excluded.some((word) => name.includes(word));
}

function modelPriority(name: string): number {
  const id = name.toLowerCase();

  if (id.includes("flash-lite")) return 1;
  if (id.includes("flash")) return 2;
  if (id.includes("pro")) return 3;
  return 4;
}

function extractJson(text: string): any {
  const cleaned = text
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }

    throw new Error("Gemini returned invalid JSON.");
  }
}

async function getAvailableModels(apiKey: string): Promise<string[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}&pageSize=1000`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`Could not list Gemini models (${response.status}).`);
  }

  const data = await response.json();

  return (data.models ?? [])
    .filter(isSuitableModel)
    .map((model: any) =>
      String(model.name).replace(/^models\//, "")
    )
    .sort((a: string, b: string) => modelPriority(a) - modelPriority(b));
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        error: "GEMINI_API_KEY is missing from environment variables.",
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    let image = String(body.image ?? "");
    const mimeType = String(body.mimeType ?? "image/jpeg");
    const roomType = String(body.roomType ?? "Living Room");
    const budget = body.budget ?? "Not specified";
    const style = String(body.style ?? "Modern");

    if (!image) {
      return NextResponse.json(
        { success: false, error: "Please upload a room image first." },
        { status: 400 }
      );
    }

    // Accept either raw base64 or a data URL.
    if (image.startsWith("data:")) {
      image = image.split(",")[1] ?? "";
    }

    if (!image) {
      return NextResponse.json(
        { success: false, error: "The uploaded image is invalid." },
        { status: 400 }
      );
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedMimeTypes.includes(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Use a JPG, PNG, or WebP image.",
        },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert interior designer and room-image analyst.

Analyze the uploaded image of the user's actual room.

Selected room type: ${roomType}
Selected design style: ${style}
User's budget: ${JSON.stringify(budget)}

Rules:
- Analyze only what is visible in the image.
- Do not invent doors, windows, furniture, or room dimensions.
- If exact room size is unknown, say "Cannot determine from image".
- Recommend practical, realistic options suitable for an Indian home.
- Keep recommendations consistent with the user's budget.
- Preserve the room's existing architecture wherever possible.
- Give clear suggestions for furniture, storage, lighting, colours, walls,
  flooring, curtains, and decor where relevant.
- Return ONLY valid JSON. Do not include Markdown or explanations outside JSON.
- estimatedBudget must contain numeric min and max values in INR.
- Arrays must always be arrays, even if empty.

Return exactly this JSON structure:
{
  "roomType": "",
  "roomSize": "",
  "currentStyle": "",
  "colors": [],
  "flooring": "",
  "lighting": "",
  "walls": "",
  "windows": "",
  "curtains": "",
  "furniture": [],
  "storage": [],
  "decor": [],
  "issues": [],
  "suggestions": [],
  "recommendedStyles": [],
  "estimatedBudget": {
    "min": 0,
    "max": 0
  },
  "redesignDirection": ""
}
`;

    let models: string[] = [];

    // Discover models actually available to this API key/project.
    try {
      models = await getAvailableModels(apiKey);
    } catch (error) {
      console.error(
        "Gemini model discovery failed:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }

    // Use the fallback list only if model discovery failed or returned nothing.
    if (models.length === 0) {
      models = FALLBACK_MODELS;
    }

    const modelsToTry = [...new Set(models)].slice(
      0,
      MAX_MODELS_TO_TRY
    );

    const failures: string[] = [];

    for (const model of modelsToTry) {
      try {
        console.log(`Trying room analysis model: ${model}`);

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: prompt },
                    {
                      inline_data: {
                        mime_type: mimeType,
                        data: image,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 4096,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          const message =
            result?.error?.message ??
            `Gemini returned HTTP ${response.status}`;

          console.warn(
            `Model ${model} failed (${response.status}):`,
            message
          );

          failures.push(`${model}: HTTP ${response.status}`);

          // Try the next model for quota, overload, unavailable,
          // unsupported-model, and other API errors.
          continue;
        }

        const responseText = (
          result?.candidates?.[0]?.content?.parts ?? []
        )
          .map((part: any) => part.text ?? "")
          .join("")
          .trim();

        if (!responseText) {
          failures.push(`${model}: Empty response`);
          continue;
        }

        let analysis: any;

        try {
          analysis = extractJson(responseText);
        } catch {
          failures.push(`${model}: Invalid JSON response`);
          continue;
        }

        if (!analysis || typeof analysis !== "object") {
          failures.push(`${model}: Invalid analysis format`);
          continue;
        }

        // Keep the same response structure expected by the frontend.
        return NextResponse.json({
          success: true,
          model,
          analysis,
          roomType,
          budget,
          style,
        });
      } catch (error) {
        console.error(
          `Model ${model} request failed:`,
          error instanceof Error ? error.message : "Unknown error"
        );

        failures.push(`${model}: Network/request failure`);
        continue;
      }
    }

    console.error("All Gemini model attempts failed:", failures);

    return NextResponse.json(
      {
        success: false,
        error:
          "Room analysis is temporarily unavailable. All compatible Gemini model attempts failed. Check quota, model availability, and API limits.",
        attemptedModels: modelsToTry,
        failures,
      },
      { status: 503 }
    );
  } catch (error) {
    console.error(
      "Room analysis route error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        success: false,
        error: "Invalid request or unexpected room-analysis error.",
      },
      { status: 500 }
    );
  }
}
