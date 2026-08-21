import { NextRequest, NextResponse } from "next/server";
import { bucket, extractGcsFilename } from "@/lib/gcs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    const filename = pathSegments.join("/");

    if (!filename) {
      return NextResponse.json({ message: "File path is required" }, { status: 400 });
    }

    const cleanFilename = extractGcsFilename(filename);
    const file = bucket.file(cleanFilename);
    const [exists] = await file.exists();

    if (!exists) {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    }

    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType || "image/jpeg";

    // Download file buffer
    const [buffer] = await file.download();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json({ message: "Failed to load image" }, { status: 500 });
  }
}
