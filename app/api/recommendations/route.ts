import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      budget,
      style,
      roomAnalysis,
    } = body;

    if (!roomAnalysis) {
      return NextResponse.json(
        { error: "Room analysis is required." },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert interior designer and furniture planner.

Based on the room analysis, selected design style and budget, recommend
practical furniture and interior items for this room.

ROOM ANALYSIS:
${roomAnalysis}

DESIGN STYLE:
${style || "modern"}

TOTAL BUDGET:
₹${budget || "100000"}

Return ONLY valid JSON in this exact structure:

{
  "recommendations": [
    {
      "category": "Furniture",
      "item": "Sofa",
      "description": "Compact 3-seater sofa suitable for the room",
      "quantity": 1,
      "estimatedPrice": 25000,
      "priority": "High"
    }
  ],
  "budgetSummary": {
    "estimatedTotal": 85000,
    "remainingBudget": 15000
  }
}

Rules:
- Recommend realistic items for the analyzed room.
- Keep the total estimated cost within the given budget.
- Use Indian Rupee prices.
- Include 6 to 10 useful items.
- Consider the room size and existing furniture.
- Do not recommend unnecessary items.
- Priority must be High, Medium, or Low.
- estimatedPrice must be a number only.
- estimatedTotal and remainingBudget must be numbers only.
- Return JSON only.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const text = response.text || "";

    // Remove possible markdown code fences
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const recommendations = JSON.parse(cleaned);

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error: any) {
    console.error("RECOMMENDATIONS ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to generate recommendations.",
      },
      { status: 500 }
    );
  }
}