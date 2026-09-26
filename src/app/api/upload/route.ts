import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"];

function getUploadsDir() {
  const dir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * POST /api/upload
 * Supports:
 * 1. multipart/form-data with file or image
 * 2. application/json with { url: "https://..." } to import remote images (e.g. ChatGPT, CDN) to local disk
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // 1. Multipart Form Data (Direct File Upload from Device)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = (formData.get("file") || formData.get("image") || formData.get("poster")) as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No image file provided." },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: "Image size exceeds 15MB limit." },
          { status: 413 }
        );
      }

      if (!file.type.startsWith("image/") && !file.name.match(/\.(jpe?g|png|webp|gif|svg|avif)$/i)) {
        return NextResponse.json(
          { success: false, error: "Only image files (JPG, PNG, WebP, GIF, SVG, AVIF) are allowed." },
          { status: 400 }
        );
      }

      const rawExt = file.name.split(".").pop()?.toLowerCase() || "";
      const ext = ALLOWED_EXTENSIONS.includes(rawExt)
        ? rawExt
        : file.type.includes("png")
        ? "png"
        : file.type.includes("webp")
        ? "webp"
        : file.type.includes("svg")
        ? "svg"
        : "jpg";

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = getUploadsDir();
      const safeBasename = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 30);
      const filename = `img_${safeBasename || "upload"}_${Date.now()}.${ext}`;
      const destPath = path.join(uploadsDir, filename);

      await fs.promises.writeFile(destPath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${filename}`,
        filename,
        size: file.size,
      });
    }

    // 2. JSON Body (Import & Cache Remote URL, e.g. ChatGPT estuary, CDN, external link)
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const remoteUrl = body.url || body.imageUrl;

      if (!remoteUrl || typeof remoteUrl !== "string") {
        return NextResponse.json(
          { success: false, error: "No remote image URL provided." },
          { status: 400 }
        );
      }

      if (!remoteUrl.startsWith("http://") && !remoteUrl.startsWith("https://")) {
        return NextResponse.json(
          { success: false, error: "Invalid URL protocol." },
          { status: 400 }
        );
      }

      // Fetch remote image with standard browser headers to bypass CORS/referrer blocks
      const fetchHeaders: HeadersInit = {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      };

      // If remote URL is from chatgpt.com, do not send a foreign referrer
      if (remoteUrl.includes("chatgpt.com")) {
        fetchHeaders["Referer"] = "https://chatgpt.com/";
      }

      const res = await fetch(remoteUrl, {
        headers: fetchHeaders,
        redirect: "follow",
      });

      if (!res.ok) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to download remote image (Status ${res.status}: ${res.statusText}). You can download it to your device and use direct file upload instead.`,
          },
          { status: 422 }
        );
      }

      const mimeType = res.headers.get("content-type") || "image/jpeg";
      let ext = "jpg";
      if (mimeType.includes("png")) ext = "png";
      else if (mimeType.includes("webp")) ext = "webp";
      else if (mimeType.includes("gif")) ext = "gif";
      else if (mimeType.includes("svg")) ext = "svg";
      else if (mimeType.includes("avif")) ext = "avif";

      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: "Remote image is larger than 15MB." },
          { status: 413 }
        );
      }

      const uploadsDir = getUploadsDir();
      const filename = `imported_${Date.now()}.${ext}`;
      const destPath = path.join(uploadsDir, filename);

      await fs.promises.writeFile(destPath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${filename}`,
        filename,
        size: buffer.length,
      });
    }

    return NextResponse.json(
      { success: false, error: "Unsupported Content-Type header." },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error("Upload API error:", err);
    const message = err instanceof Error ? err.message : "Internal server upload failure";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
