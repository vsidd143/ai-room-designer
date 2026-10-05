import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "room-images";

export async function GET() {
  try {
    const supabase = await createClient();

    // Check logged-in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    // Get user's saved designs
    const {
      data: designs,
      error: designsError,
    } = await supabase
      .from("designs")
      .select(
        `
        id,
        user_id,
        original_image_url,
        generated_image_url,
        room_analysis,
        final_analysis,
        budget,
        style,
        created_at
        `
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (designsError) {
      console.error(
        "MY DESIGNS DATABASE ERROR:",
        designsError
      );

      return NextResponse.json(
        {
          error: "Failed to load your designs.",
          details: designsError.message,
        },
        { status: 500 }
      );
    }

    // Generate temporary signed URLs for private images
    const designsWithImages = await Promise.all(
      (designs || []).map(async (design) => {
        let originalImageUrl = "";
        let generatedImageUrl = "";

        if (design.original_image_url) {
          const {
            data: originalSigned,
            error: originalError,
          } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(
              design.original_image_url,
              60 * 60
            );

          if (originalError) {
            console.error(
              "ORIGINAL SIGNED URL ERROR:",
              originalError
            );
          } else {
            originalImageUrl =
              originalSigned?.signedUrl || "";
          }
        }

        if (design.generated_image_url) {
          const {
            data: generatedSigned,
            error: generatedError,
          } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(
              design.generated_image_url,
              60 * 60
            );

          if (generatedError) {
            console.error(
              "GENERATED SIGNED URL ERROR:",
              generatedError
            );
          } else {
            generatedImageUrl =
              generatedSigned?.signedUrl || "";
          }
        }

        return {
          ...design,
          original_image_url: originalImageUrl,
          generated_image_url: generatedImageUrl,
        };
      })
    );

    return NextResponse.json({
      success: true,
      designs: designsWithImages,
    });
  } catch (error: any) {
    console.error(
      "MY DESIGNS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to load designs.",
      },
      { status: 500 }
    );
  }
}