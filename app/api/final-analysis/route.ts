import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/*
 * Gemini fallback chain.
 *
 * Order:
 * 1. Gemini 3.8 Flash
 * 2. Gemini 3.7 Flash
 * 3. Gemini 3.6 Flash
 * 4. Gemini 3.5 Flash
 * 5. Gemini 3.5 Flash-Lite
 * 6. Gemini 3.1 Flash-Lite
 * 7. Gemini 3.1 Pro Preview
 * 8. Gemini 2.5 Flash
 *
 * All selected models support multimodal/image understanding.
 */
const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.1-pro-preview",
  "gemini-2.5-flash",
];

const MAX_RETRIES_PER_MODEL = 2;

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function getErrorMessage(error: any): string {
  return (
    error?.message ||
    error?.error?.message ||
    error?.response?.data?.error?.message ||
    String(error)
  );
}

function isTemporaryError(message: string): boolean {
  const normalized = message.toUpperCase();

  return (
    normalized.includes("503") ||
    normalized.includes("UNAVAILABLE") ||
    normalized.includes("HIGH DEMAND") ||
    normalized.includes("429") ||
    normalized.includes("RESOURCE_EXHAUSTED") ||
    normalized.includes("500") ||
    normalized.includes("INTERNAL") ||
    normalized.includes("OVERLOADED") ||
    normalized.includes("RATE LIMIT") ||
    normalized.includes("TIMEOUT") ||
    normalized.includes("DEADLINE")
  );
}

function isModelUnavailableError(message: string): boolean {
  const normalized = message.toUpperCase();

  return (
    normalized.includes("404") ||
    normalized.includes("NOT_FOUND") ||
    normalized.includes("NOT FOUND") ||
    normalized.includes("MODEL_NOT_FOUND") ||
    normalized.includes("UNSUPPORTED") ||
    normalized.includes("INVALID MODEL") ||
    normalized.includes("PERMISSION_DENIED")
  );
}

function cleanJsonResponse(text: string): string {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export async function POST(req: Request) {
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

    if (!originalImage) {
      return NextResponse.json(
        {
          error: "Original room image is required.",
        },
        { status: 400 }
      );
    }

    if (!generatedImage) {
      return NextResponse.json(
        {
          error: "Generated room image is required.",
        },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is missing.",
        },
        { status: 500 }
      );
    }

    const cleanBase64 = (image: string) => {
      if (image.includes(",")) {
        return image.split(",")[1];
      }

      return image;
    };

    const originalBase64 = cleanBase64(originalImage);
    const generatedBase64 = cleanBase64(generatedImage);

    const originalMimeType =
      originalImage.match(/^data:(.*?);base64,/)?.[1] ||
      "image/jpeg";

    const generatedMimeType =
      generatedImage.match(/^data:(.*?);base64,/)?.[1] ||
      "image/png";

    const readableRoomType =
      roomType
        ?.replace(/-/g, " ")
        ?.replace(/\b\w/g, (char: string) =>
          char.toUpperCase()
        ) ||
      "Room";

    const selectedBudget =
      typeof budget === "object" && budget !== null
        ? budget.amount ??
          budget.value ??
          budget.budget ??
          100000
        : budget || 100000;

    const prompt = `
You are an expert interior designer and interior renovation cost planner.

You are given TWO images:

IMAGE 1 = ORIGINAL ROOM
IMAGE 2 = AI GENERATED REDESIGNED ROOM

The user's selected room type is:

${readableRoomType}

The generated design must be evaluated specifically as a
${readableRoomType}.

Your task is to carefully compare both images and create a professional
AI Interior Design Report.

SELECTED DESIGN SETTINGS:

Room Type:
${readableRoomType}

Design Style:
${style || "Modern"}

User Budget:
₹${selectedBudget}

The original Gemini room analysis was:

${originalAnalysis || "No previous analysis available."}

IMPORTANT:

1. Analyze the NEW GENERATED ROOM independently.
2. Compare the original and generated room.
3. Identify exactly what changed.
4. Explain what improvements were made to transform the original room
   into the new room.
5. Estimate realistic Indian prices for the visible improvements.
6. Keep the total estimated cost within the user's selected budget whenever
   reasonably possible.
7. Do NOT invent architectural changes that are not visible.
8. Do NOT claim exact prices. These are estimated prices.
9. Use Indian Rupees.
10. Return ONLY valid JSON.
11. Do not use markdown.
12. Do not wrap the JSON in code fences.
13. Treat ${readableRoomType} as the primary room type.
14. Make all recommendations relevant to this room type.

ROOM-SPECIFIC EVALUATION:

If the room is a Bedroom, evaluate:
- bed
- headboard
- bedside tables
- wardrobe
- dressing area
- curtains
- bedroom lighting
- storage
- relaxing atmosphere

If the room is a Living Room / Hall, evaluate:
- sofa
- TV unit
- center table
- side tables
- seating arrangement
- curtains
- lighting
- wall design
- entertainment area
- decor

If the room is a Kitchen, evaluate:
- kitchen cabinets
- countertop
- backsplash
- sink
- stove/cooktop
- refrigerator
- appliances
- storage
- work areas
- kitchen lighting
- flooring
- overall kitchen workflow

If the room is a Bathroom, evaluate:
- shower
- toilet
- vanity
- wash basin
- mirror
- bathroom storage
- wall tiles
- floor tiles
- waterproof materials
- ventilation
- lighting

If the room is a Dining Room, evaluate:
- dining table
- dining chairs
- lighting above table
- storage
- crockery cabinet
- wall decor
- circulation space
- flooring

If the room is a Study Room / Office, evaluate:
- work desk
- ergonomic chair
- bookshelf
- storage
- workstation
- task lighting
- organization
- electrical arrangement
- productivity

If the room is a Kids Room, evaluate:
- bed
- study area
- wardrobe
- toy storage
- child-safe furniture
- lighting
- colors
- organization
- playful decor

If the room is a Dressing Room, evaluate:
- wardrobes
- dressing table
- mirror
- drawers
- shoe storage
- clothing organization
- lighting
- storage efficiency

If the room is a Balcony, evaluate:
- seating
- plants
- planters
- outdoor furniture
- flooring
- railing
- lighting
- weather-resistant materials
- space utilization

If the room is an Office, evaluate:
- workstations
- office desks
- ergonomic seating
- storage
- meeting area if visible
- lighting
- cable management
- professional appearance
- productivity
- space efficiency

Return JSON in EXACTLY this structure:

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
    "totalBudget": 0,
    "estimatedTotal": 0,
    "remainingBudget": 0,
    "budgetUsedPercentage": 0
  },

  "designSummary": ""
}

RULES FOR newRoomAnalysis:

- roomType: identify the selected room type.
- designStyle: identify the style visible in the generated image.
- overallLook: short professional description.
- colorPalette: 3 to 6 important colors.
- flooring: describe visible flooring.
- walls: describe wall colors, panels, paint or accent wall.
- lighting: describe visible natural/artificial lighting.
- furniture: list major visible furniture.
- decor: list visible decorative elements.
- curtainsAndWindows: describe curtains/window treatment.
- storage: describe visible storage.
- overallRating: number from 1 to 10.

RULES FOR oldToNewChanges:

Include 5 to 10 meaningful changes.

Examples:
- Furniture
- Lighting
- Wall treatment
- Curtains
- Flooring/rug
- Decor
- Storage
- Color scheme
- Layout
- Ambience

Only mention changes that are actually visible or strongly supported
by the two images.

RULES FOR improvements:

Explain the practical work/items needed to recreate the generated design
from the original room.

For every improvement:

- item = specific work or item
- reason = why it improves the room
- estimatedCost = realistic approximate INR amount
- priority = High, Medium or Low

RULES FOR budgetBreakdown:

Include 6 to 12 items where possible.

Examples:
- Bed
- Sofa
- Side table
- Wardrobe
- Curtains
- Lighting
- Wall paint
- Accent wall
- Area rug
- Decorative items
- Plants
- Electrical work

Only include items relevant to the generated room.

RULES FOR budgetSummary:

- totalBudget must equal the user's selected budget.
- estimatedTotal must be the sum of budgetBreakdown estimatedCost values.
- remainingBudget = totalBudget - estimatedTotal.
- budgetUsedPercentage = estimatedTotal / totalBudget * 100.
- Keep numbers as numbers, not strings.

designSummary:

Write 2 to 4 sentences explaining how the original room was transformed
into the generated ${readableRoomType} and what the user would need to do
in real life to achieve a similar result.

Do not change the room's architecture.
Do not add imaginary windows or doors.
Do not change the room dimensions.
`;

    let lastError: any = null;
    let response: any = null;
    let successfulModel = "";

    /*
     * Try every compatible Gemini model.
     *
     * If a model is temporarily unavailable:
     * - Retry it once.
     * - Then move to the next model.
     *
     * If a model is not available for the project:
     * - Immediately move to the next model.
     */

    for (const model of MODELS) {
      response = null;

      for (
        let attempt = 1;
        attempt <= MAX_RETRIES_PER_MODEL;
        attempt++
      ) {
        try {
          console.log(
            `FINAL ANALYSIS: Trying ${model}, attempt ${attempt}/${MAX_RETRIES_PER_MODEL}`
          );

          console.log(
            "FINAL ANALYSIS ROOM TYPE:",
            readableRoomType
          );

          console.log(
            "FINAL ANALYSIS BUDGET:",
            selectedBudget
          );

          console.log(
            "FINAL ANALYSIS STYLE:",
            style || "Modern"
          );

          response = await ai.models.generateContent({
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
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          });

          if (response) {
            successfulModel = model;

            console.log(
              `FINAL ANALYSIS SUCCESS with ${model}`
            );

            break;
          }
        } catch (error: any) {
          lastError = error;

          const message = getErrorMessage(error);

          console.error(
            `FINAL ANALYSIS FAILED - ${model} attempt ${attempt}:`,
            message
          );

          /*
           * If this model is unavailable/not supported,
           * don't waste another retry on it.
           */
          if (isModelUnavailableError(message)) {
            console.log(
              `Model ${model} is unavailable. Moving to next model.`
            );

            break;
          }

          /*
           * Temporary errors:
           * retry this model once, then move to next model.
           */
          if (isTemporaryError(message)) {
            if (attempt < MAX_RETRIES_PER_MODEL) {
              const waitTime = 2500 * attempt;

              console.log(
                `Temporary Gemini error. Waiting ${waitTime}ms before retry...`
              );

              await sleep(waitTime);
            }

            continue;
          }

          /*
           * Unknown/non-temporary error.
           * Try the next model instead of stopping the entire chain.
           */
          console.log(
            `Non-temporary error on ${model}. Moving to next model.`
          );

          break;
        }
      }

      if (response) {
        break;
      }

      console.log(
        `Model ${model} did not complete final analysis. Trying next fallback model...`
      );
    }

    if (!response) {
      console.error(
        "ALL GEMINI FINAL ANALYSIS MODELS FAILED:",
        lastError
      );

      return NextResponse.json(
        {
          error:
            "All Gemini analysis models are temporarily unavailable. Please try again in a moment.",
          details: getErrorMessage(lastError),
          attemptedModels: MODELS,
        },
        { status: 503 }
      );
    }

    const text =
      response.text?.trim() || "";

    if (!text) {
      return NextResponse.json(
        {
          error:
            "Gemini returned an empty final analysis.",
          model: successfulModel,
        },
        { status: 500 }
      );
    }

    const cleaned = cleanJsonResponse(text);

    let finalAnalysis;

    try {
      finalAnalysis = JSON.parse(cleaned);
    } catch (parseError) {
      console.error(
        "FINAL ANALYSIS JSON PARSE ERROR:",
        parseError
      );

      console.error(
        "SUCCESSFUL MODEL:",
        successfulModel
      );

      console.error(
        "GEMINI RAW RESPONSE:",
        text
      );

      return NextResponse.json(
        {
          error:
            "Gemini returned an invalid analysis format. Please try again.",
          model: successfulModel,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,

      /*
       * This tells us which fallback model actually succeeded.
       * Very useful during your project presentation/debugging.
       */
      model: successfulModel,

      // Frontend expects data.report
      report: finalAnalysis,

      // Backward compatibility
      data: finalAnalysis,

      roomType,
      budget,
      style,
    });
  } catch (error: any) {
    console.error(
      "FINAL ANALYSIS UNEXPECTED ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to generate final AI design analysis.",
        details: String(error),
      },
      {
        status: 500,
      }
    );
  }
}