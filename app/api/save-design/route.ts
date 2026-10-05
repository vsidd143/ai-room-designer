import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    } = body;

    if (!generatedImageUrl) {
      return NextResponse.json(
        { error: "Generated image is required." },
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
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("designs")
      .insert({
        user_id: user.id,
        original_image_url: originalImageUrl || null,
        generated_image_url: generatedImageUrl,
        room_analysis: roomAnalysis || null,
        final_analysis: finalAnalysis || null,
        budget: budget ? Number(budget) : null,
        style: style || null,
      })
      .select()
      .single();

    if (error) {
      console.error("SAVE DESIGN ERROR:", error);

      return NextResponse.json(
        {
          error: "Failed to save design.",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      design: data,
    });
  } catch (error: any) {
    console.error("SAVE DESIGN ROUTE ERROR:", error);

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