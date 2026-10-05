import { NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";

const MODEL = "black-forest-labs/FLUX.2-dev";

const MAX_RETRIES = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      image,
      mimeType,
      budget,
      style,
      roomAnalysis,
    } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Room image is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "HUGGINGFACE_API_KEY is missing." },
        { status: 500 }
      );
    }

    // Convert base64 image to Blob
    const base64Data = image.includes(",")
      ? image.split(",")[1]
      : image;

    const imageBuffer = Buffer.from(base64Data, "base64");

    const inputImage = new Blob([imageBuffer], {
      type: mimeType || "image/jpeg",
    });

    const hf = new InferenceClient(apiKey);

    const prompt = `
Redesign this exact room into a realistic interior design.

IMPORTANT:
- Preserve the exact room architecture.
- Preserve walls, windows, doors, ceiling, floor layout and camera perspective.
- Do not change the room dimensions.
- Do not create a completely different room.
- Only improve the interior design, furniture, decoration, lighting and colors.

Design style: ${style || "modern"}

Budget: ₹${budget || "100000"}

Room analysis:
${roomAnalysis || "Analyze the existing room and improve its interior."}

Create a photorealistic, professionally designed interior.
Add suitable furniture, lighting, wall colors, curtains, decor and storage.
Keep the redesign realistic and achievable within the given budget.
`;

    let generatedImage: Blob | null = null;
    let lastError: any = null;

    // Retry temporary Hugging Face/provider failures.
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(
          `REDESIGN: Generation attempt ${attempt}/${MAX_RETRIES}`
        );

        generatedImage = await hf.imageToImage({
          model: MODEL,
          inputs: inputImage,
          parameters: {
            prompt,
          },
        });

        if (generatedImage) {
          break;
        }
      } catch (error: any) {
        lastError = error;

        const errorMessage =
          error?.message ||
          error?.response?.data?.error ||
          String(error);

        console.error(
          `REDESIGN: Attempt ${attempt} failed:`,
          errorMessage
        );

        // If this was the final attempt, stop retrying.
        if (attempt === MAX_RETRIES) {
          break;
        }

        // Wait longer after each failed attempt.
        // Attempt 1 -> 3 seconds
        // Attempt 2 -> 6 seconds
        const delay = attempt * 3000;

        console.log(
          `REDESIGN: Waiting ${delay / 1000}s before retry...`
        );

        await sleep(delay);
      }
    }

    if (!generatedImage) {
      const errorMessage =
        lastError?.message ||
        lastError?.response?.data?.error ||
        "The AI image generation service is temporarily unavailable.";

      return NextResponse.json(
        {
          error:
            "AI image generation is temporarily unavailable. Please try again after a short while.",
          details: errorMessage,
          model: MODEL,
          retried: MAX_RETRIES,
        },
        { status: 503 }
      );
    }

    const outputBuffer = Buffer.from(
      await generatedImage.arrayBuffer()
    );

    const base64Output = outputBuffer.toString("base64");

    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${base64Output}`,
      model: MODEL,
      style,
      budget,
    });
  } catch (error: any) {
    console.error("REDESIGN ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to generate redesigned room.",
        details: String(error),
      },
      { status: 500 }
    );
  }
}