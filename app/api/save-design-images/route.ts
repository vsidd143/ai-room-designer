import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function dataUrlToBuffer(dataUrl: string) {
  const match = dataUrl.match(
    /^data:(.+?);base64,(.+)$/
  );

  if (!match) {
    throw new Error("Invalid image data.");
  }

  const mimeType = match[1];
  const base64Data = match[2];

  const buffer = Buffer.from(base64Data, "base64");

  return {
    buffer,
    mimeType,
  };
}

function getExtension(mimeType: string) {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      originalImage,
      generatedImage,
    } = body;

    if (!originalImage || !generatedImage) {
      return NextResponse.json(
        {
          error:
            "Original and generated images are required.",
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
          error: "You must be logged in.",
        },
        { status: 401 }
      );
    }

    // Convert original image
    const original = dataUrlToBuffer(originalImage);

    // Convert generated image
    const generated = dataUrlToBuffer(generatedImage);

    const originalExtension = getExtension(
      original.mimeType
    );

    const generatedExtension = getExtension(
      generated.mimeType
    );

    const timestamp = Date.now();

    const originalPath =
      `${user.id}/designs/${timestamp}-original.${originalExtension}`;

    const generatedPath =
      `${user.id}/designs/${timestamp}-generated.${generatedExtension}`;

    // Upload original image
    const { error: originalUploadError } =
      await supabase.storage
        .from("room-images")
        .upload(
          originalPath,
          original.buffer,
          {
            contentType: original.mimeType,
            upsert: false,
          }
        );

    if (originalUploadError) {
      console.error(
        "ORIGINAL IMAGE UPLOAD ERROR:",
        originalUploadError
      );

      return NextResponse.json(
        {
          error:
            "Failed to upload original room image.",
          details:
            originalUploadError.message,
        },
        { status: 500 }
      );
    }

    // Upload generated image
    const { error: generatedUploadError } =
      await supabase.storage
        .from("room-images")
        .upload(
          generatedPath,
          generated.buffer,
          {
            contentType: generated.mimeType,
            upsert: false,
          }
        );

    if (generatedUploadError) {
      console.error(
        "GENERATED IMAGE UPLOAD ERROR:",
        generatedUploadError
      );

      // Remove original if generated upload fails
      await supabase.storage
        .from("room-images")
        .remove([originalPath]);

      return NextResponse.json(
        {
          error:
            "Failed to upload generated room image.",
          details:
            generatedUploadError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      originalImagePath: originalPath,
      generatedImagePath: generatedPath,
    });
  } catch (error: any) {
    console.error(
      "SAVE DESIGN IMAGES ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to save design images.",
      },
      { status: 500 }
    );
  }
}