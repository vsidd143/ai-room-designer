import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function parseBudget(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  // Already a number
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  // String budget
  if (typeof value === "string") {
    const original = value.trim();

    if (!original) {
      return null;
    }

    const cleaned = original
      .toLowerCase()
      .replace(/₹/g, "")
      .replace(/rs\.?/g, "")
      .replace(/inr/g, "")
      .replace(/,/g, "")
      .trim();

    if (!cleaned) {
      return null;
    }

    /*
     * Examples supported:
     *
     * ₹1,00,000
     * 100000
     * ₹1L
     * 1L
     * 1 lakh
     * ₹1 lakh
     * ₹50K
     * 50K
     * ₹2.5L
     * 2.5 lakh
     */

    // Lakh / Lakhs / L
    const lakhMatch = cleaned.match(
      /^([0-9]+(?:\.[0-9]+)?)\s*(l|lakh|lakhs)$/
    );

    if (lakhMatch) {
      const amount = Number(lakhMatch[1]);

      if (Number.isFinite(amount)) {
        return amount * 100000;
      }

      return null;
    }

    // Thousand / K
    const thousandMatch = cleaned.match(
      /^([0-9]+(?:\.[0-9]+)?)\s*k$/
    );

    if (thousandMatch) {
      const amount = Number(thousandMatch[1]);

      if (Number.isFinite(amount)) {
        return amount * 1000;
      }

      return null;
    }

    // Normal numeric value
    const numericValue = Number(
      cleaned.replace(/\s/g, "")
    );

    if (Number.isFinite(numericValue)) {
      return numericValue;
    }

    return null;
  }

  // Object budget
  if (typeof value === "object") {
    const budgetObject =
      value as Record<string, unknown>;

    const possibleValues = [
      budgetObject.amount,
      budgetObject.value,
      budgetObject.budget,
      budgetObject.total,
      budgetObject.estimate,
      budgetObject.estimated,
      budgetObject.cost,
      budgetObject.estimatedCost,
      budgetObject.price,
    ];

    for (const possibleValue of possibleValues) {
      const parsed = parseBudget(possibleValue);

      if (parsed !== null) {
        return parsed;
      }
    }

    return null;
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      originalImageUrl,
      generatedImageUrl,
      roomAnalysis,
      finalAnalysis,
      budget,
      style,
      roomType,
    } = body;

    console.log("SAVE DESIGN REQUEST:", {
      budget,
      budgetType: typeof budget,
      roomType,
      style,
    });

    if (!generatedImageUrl) {
      return NextResponse.json(
        {
          error:
            "Generated image is required.",
        },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "You must be logged in.",
        },
        { status: 401 }
      );
    }

    const parsedBudget =
      parseBudget(budget);

    console.log("PARSED BUDGET:", {
      original: budget,
      parsed: parsedBudget,
    });

    const { data, error } =
      await supabase
        .from("designs")
        .insert({
          user_id: user.id,

          original_image_url:
            originalImageUrl || null,

          generated_image_url:
            generatedImageUrl,

          room_analysis:
            roomAnalysis || null,

          final_analysis:
            finalAnalysis || null,

          budget:
            parsedBudget,

          style:
            style || null,
        })
        .select()
        .single();

    if (error) {
      console.error(
        "SAVE DESIGN ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Failed to save design.",
          details:
            error.message,
        },
        { status: 500 }
      );
    }

    console.log(
      "DESIGN SAVED SUCCESSFULLY:",
      {
        id: data.id,
        budget: data.budget,
      }
    );

    return NextResponse.json({
      success: true,
      design: data,
      savedBudget: parsedBudget,
    });
  } catch (error: any) {
    console.error(
      "SAVE DESIGN ROUTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to save design.",
      },
      { status: 500 }
    );
  }
}