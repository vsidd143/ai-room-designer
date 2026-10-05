import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
];

const MAX_ATTEMPTS = 2;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      image,
      mimeType,
      roomType,
      budget,
      style,
    } = body;

    if (!image) {
      return NextResponse.json(
        {
          error: "Room image is required.",
        },
        { status: 400 }
      );
    }

    if (!roomType) {
      return NextResponse.json(
        {
          error: "Room type is required.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is missing.",
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const base64Image = image.includes(",")
      ? image.split(",")[1]
      : image;

    const imageMimeType =
      mimeType ||
      image.match(/^data:(.*?);base64,/)?.[1] ||
      "image/jpeg";

    const readableRoomType = roomType
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char: string) =>
        char.toUpperCase()
      );

    const prompt = `
You are an expert interior designer, architect-level space planner, and room renovation consultant.

Analyze the uploaded room photograph carefully.

The user has explicitly selected this room type:

ROOM TYPE: ${readableRoomType}

This selected room type is VERY IMPORTANT.

You must analyze and plan the room specifically as a ${readableRoomType}.

Do NOT treat this as a generic room.

If the visible image appears different from the selected room type, still use the user's selected room type as the design target, but clearly describe what is actually visible in the photograph.

USER SETTINGS:

Selected Room Type: ${readableRoomType}
Budget: ₹${budget || "Not specified"}
Preferred Design Style: ${style || "Modern"}

ROOM-SPECIFIC ANALYSIS:

For a Bedroom, focus especially on:
- bed
- headboard
- bedside tables
- wardrobe
- dressing area
- curtains
- bedroom lighting
- storage
- wall colors
- relaxing atmosphere

For a Living Room / Hall, focus especially on:
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

For a Kitchen, focus especially on:
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
- ventilation
- flooring
- work triangle

For a Bathroom, focus especially on:
- shower area
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

For a Dining Room, focus especially on:
- dining table
- dining chairs
- lighting above table
- storage
- crockery cabinet
- wall decor
- circulation space
- flooring
- overall dining atmosphere

For a Study Room / Office, focus especially on:
- work desk
- ergonomic chair
- bookshelf
- storage
- computer/workstation
- task lighting
- electrical arrangement
- organization
- wall colors
- productivity

For a Kids Room, focus especially on:
- bed
- study area
- wardrobe
- toy storage
- child-safe furniture
- lighting
- colors
- organization
- playful decor

For a Dressing Room, focus especially on:
- wardrobes
- dressing table
- mirror
- drawers
- shoe storage
- clothing organization
- lighting
- storage efficiency

For a Balcony, focus especially on:
- seating
- plants
- planters
- outdoor furniture
- railing
- flooring
- lighting
- weather-resistant materials
- space utilization

For an Office, focus especially on:
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

IMPORTANT GENERAL INSTRUCTIONS:

1. Analyze the actual room shown in the image.
2. Use the selected room type as the primary design context.
3. Identify the visible furniture and architectural elements.
4. Estimate the visible room size approximately if possible.
5. Analyze the current interior design.
6. Identify existing furniture.
7. Identify walls and wall colors.
8. Identify flooring.
9. Identify lighting.
10. Identify windows and curtains.
11. Identify storage.
12. Identify major design problems.
13. Suggest practical improvements.
14. Recommend furniture and decor appropriate for the selected room type.
15. Consider the user's budget.
16. Consider the preferred design style.
17. Keep recommendations realistic for the Indian market.
18. Do not invent architectural elements that are not visible.
19. Do not assume measurements that cannot reasonably be determined.
20. The goal is to improve the existing room rather than completely change its architecture.
21. Preserve the existing room structure.
22. Do not add imaginary doors or windows.
23. Do not change the room dimensions.
24. Recommendations must be practical and visually achievable.
25. The final redesign direction must be useful for an AI image-generation model.

Return ONLY valid JSON.

Do NOT use markdown.
Do NOT put the JSON inside a code block.

Return exactly this structure:

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

FIELD REQUIREMENTS:

roomType:
Return the selected room type:
"${readableRoomType}"

Do not replace the selected room type with a generic value unless the selected room type is impossible to interpret.

roomSize:
Give an approximate description such as:
"Small"
"Medium"
"Large"

or an approximate size if it can reasonably be estimated.

currentStyle:
Describe the existing visual style.

colors:
List the major visible colors.

flooring:
Describe the visible flooring.

lighting:
Describe natural and artificial lighting.

walls:
Describe wall colors, finishes and visible wall condition.

windows:
Describe visible windows.

curtains:
Describe visible curtains or blinds.

furniture:
List visible furniture and its approximate condition.
Focus especially on furniture relevant to the selected room type.

storage:
List visible storage solutions.

decor:
List visible decorative elements.

issues:
List the main problems that should be improved.

suggestions:
Give practical redesign suggestions specifically for the selected room type.

recommendedStyles:
Recommend 2-4 suitable interior styles for this selected room.

estimatedBudget:
Give a realistic approximate renovation budget in Indian Rupees.
Consider the user's selected budget when making recommendations.

redesignDirection:
Write a detailed but concise description that another AI image-generation model can use to redesign the SAME room as a ${readableRoomType}.

The redesign direction must mention:
- furniture changes
- room-specific furniture
- wall colors
- lighting
- curtains
- flooring if necessary
- storage
- decoration
- overall style
- realistic budget considerations
- preservation of the existing architecture

The redesign must look like a realistic ${readableRoomType}, not a generic room.

Do not change the room's architecture.
Do not add imaginary windows or doors.
Do not change the room dimensions.
`;

    let lastError: any = null;

    for (const model of MODELS) {
      for (
        let attempt = 1;
        attempt <= MAX_ATTEMPTS;
        attempt++
      ) {
        try {
          console.log(
            `ROOM ANALYSIS: Trying ${model}, attempt ${attempt}/${MAX_ATTEMPTS}`
          );

          console.log(
            "ROOM TYPE:",
            readableRoomType
          );

          console.log(
            "BUDGET:",
            budget || "Not specified"
          );

          console.log(
            "STYLE:",
            style || "Modern"
          );

          const response =
            await ai.models.generateContent({
              model,
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      inlineData: {
                        mimeType: imageMimeType,
                        data: base64Image,
                      },
                    },
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
            });

          const text = response.text?.trim();

          if (!text) {
            throw new Error(
              "Gemini returned an empty response."
            );
          }

          let cleanedText = text
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

          let parsed;

          try {
            parsed = JSON.parse(cleanedText);
          } catch {
            console.error(
              `ROOM ANALYSIS JSON PARSE ERROR - ${model}:`,
              cleanedText
            );

            throw new Error(
              "Gemini returned invalid JSON."
            );
          }

          console.log(
            `ROOM ANALYSIS SUCCESS with ${model}`
          );

          return NextResponse.json({
            success: true,
            model,
            analysis: parsed,
            roomType,
            budget,
            style,
          });
        } catch (error: any) {
          lastError = error;

          const errorMessage =
            error?.message ||
            String(error);

          console.error(
            `ROOM ANALYSIS FAILED - ${model} attempt ${attempt}:`,
            errorMessage
          );

          const isTemporaryError =
            errorMessage.includes("503") ||
            errorMessage.includes("UNAVAILABLE") ||
            errorMessage.includes("high demand") ||
            errorMessage.includes("429") ||
            errorMessage.includes("RESOURCE_EXHAUSTED") ||
            errorMessage.includes("500") ||
            errorMessage.includes("INTERNAL");

          if (!isTemporaryError) {
            break;
          }

          if (attempt < MAX_ATTEMPTS) {
            console.log(
              "Temporary Gemini error. Retrying..."
            );
          }
        }
      }

      console.log(
        `Model ${model} failed. Trying next model...`
      );
    }

    return NextResponse.json(
      {
        error:
          "Room analysis is temporarily unavailable. Please try again.",
        details:
          lastError?.message ||
          String(lastError),
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error(
      "ROOM ANALYSIS ROUTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to analyze the room.",
      },
      { status: 500 }
    );
  }
}