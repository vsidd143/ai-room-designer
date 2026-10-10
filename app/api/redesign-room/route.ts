
import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "@cf/black-forest-labs/flux-2-klein-4b";

export async function POST(req: Request) {
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return NextResponse.json(
        { error: "Cloudflare Account ID or API token is missing." },
        { status: 500 }
      );
    }

    const body = await req.json();

    const { image, mimeType, budget, style, roomAnalysis } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Room image is required." },
        { status: 400 }
      );
    }

    if (
      mimeType &&
      !["image/jpeg", "image/png", "image/webp"].includes(mimeType)
    ) {
      return NextResponse.json(
        { error: "Please upload a JPG, PNG or WebP image." },
        { status: 400 }
      );
    }

    const base64Data = image.includes(",")
      ? image.split(",")[1]
      : image;

    const inputBuffer = Buffer.from(base64Data, "base64");

    if (!inputBuffer.length || inputBuffer.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image is empty or exceeds the 10 MB limit." },
        { status: 400 }
      );
    }

    // Cloudflare's reference image must be smaller than 512x512.
    const resizedBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({
        width: 480,
        height: 480,
        fit: "inside",
        withoutEnlargement: true,
      })
      .png()
      .toBuffer();

    const analysisText =
      typeof roomAnalysis === "string"
        ? roomAnalysis
        : JSON.stringify(roomAnalysis ?? {});

    const prompt = `
Redesign the uploaded room photograph as a photorealistic interior.

Preserve the original room architecture, walls, doors, windows,
floor layout and camera perspective as closely as possible.

Design style: ${String(style || "modern").slice(0, 100)}
Budget: ${String(budget || "not specified").slice(0, 100)}

Room analysis:
${analysisText.slice(0, 2000)}

Improve the furniture, lighting, wall colors, curtains, storage
and decor. Create a realistic, cohesive interior design.
Do not create a collage, floor plan, text or watermark.
`.trim();

    const form = new FormData();

    form.append("prompt", prompt);
    form.append(
      "input_image_0",
      new Blob([new Uint8Array(resizedBuffer)], {
        type: "image/png",
      }),
      "room.png"
    );
    form.append("width", "1024");
    form.append("height", "768");

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
        body: form,
        signal: AbortSignal.timeout(55000),
      }
    );

    if (!response.ok) {
      const details = await response.text();

      console.error(
        "Cloudflare AI error:",
        response.status,
        details.slice(0, 1500)
      );

      return NextResponse.json(
        {
          error:
            response.status === 401 || response.status === 403
              ? "Cloudflare authentication or permissions failed."
              : response.status === 429
                ? "Cloudflare usage limit reached. Please try later."
                : "Cloudflare image generation failed.",
        },
        {
          status: response.status === 429 ? 429 : 502,
        }
      );
    }

    const contentType = response.headers.get("content-type") || "";

    let outputBase64: string;

    if (contentType.includes("image/")) {
      const output = Buffer.from(await response.arrayBuffer());
      outputBase64 = output.toString("base64");
    } else {
      const result = await response.json();

      if (result.success === false) {
        console.error("Cloudflare model error:", result.errors);
        return NextResponse.json(
          { error: "Cloudflare could not generate the image." },
          { status: 502 }
        );
      }

      const generated = result.result?.image ?? result.result;

      if (typeof generated !== "string" || !generated.length) {
        console.error(
          "Unexpected Cloudflare response:",
          JSON.stringify(result).slice(0, 1000)
        );

        return NextResponse.json(
          { error: "Cloudflare returned an unexpected image format." },
          { status: 502 }
        );
      }

      outputBase64 = generated.replace(
        /^data:image\/[^;]+;base64,/,
        ""
      );
    }

    const outputImage = `data:image/png;base64,${outputBase64}`;

    return NextResponse.json({
      success: true,
      image: outputImage,
      model: MODEL,
      style,
      budget,
    });
  } catch (error) {
    console.error("REDESIGN ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error && error.name === "TimeoutError"
            ? "Image generation timed out. Please try again."
            : "Failed to generate the redesigned room.",
      },
      { status: 500 }
    );
  }
}
