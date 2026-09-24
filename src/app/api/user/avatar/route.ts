import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/db";
import { extractTokenFromRequest, verifyAuthToken } from "@/lib/auth-security";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "svg", "avif"];

/**
 * POST /api/user/avatar
 * Allows any authenticated user (USER, VIP, ADMIN) to upload or update their profile avatar.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be signed in to upload an avatar." },
        { status: 401 }
      );
    }

    const payload = await verifyAuthToken(token);
    if (!payload?.sub) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or expired session." },
        { status: 401 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let avatarUrl: string | null = null;

    // 2. Handle multipart/form-data (File Upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = (formData.get("avatar") || formData.get("file")) as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "Bad Request", message: "No image file provided in form data." },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Payload Too Large", message: "Avatar file size cannot exceed 5MB." },
          { status: 413 }
        );
      }

      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Bad Request", message: "Only image files (JPG, PNG, WebP, GIF, SVG) are supported." },
          { status: 400 }
        );
      }

      // Determine extension
      const rawExt = file.name.split(".").pop()?.toLowerCase() || "";
      const ext = ALLOWED_EXTENSIONS.includes(rawExt)
        ? rawExt
        : file.type.includes("png")
        ? "png"
        : file.type.includes("webp")
        ? "webp"
        : file.type.includes("gif")
        ? "gif"
        : "jpg";

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create uploads directory in public/avatars
      const uploadsDir = path.join(process.cwd(), "public", "avatars");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `avatar-${payload.sub}-${Date.now()}.${ext}`;
      const filePath = path.join(uploadsDir, filename);

      await fs.promises.writeFile(filePath, buffer);
      avatarUrl = `/avatars/${filename}`;
    } else if (contentType.includes("application/json")) {
      // 3. Handle JSON with avatarUrl
      const body = await request.json();
      if (!body.avatarUrl || typeof body.avatarUrl !== "string") {
        return NextResponse.json(
          { error: "Bad Request", message: "Invalid avatarUrl provided." },
          { status: 400 }
        );
      }
      avatarUrl = body.avatarUrl.trim();
    } else {
      return NextResponse.json(
        { error: "Unsupported Media Type", message: "Expected multipart/form-data or application/json." },
        { status: 415 }
      );
    }

    if (!avatarUrl) {
      return NextResponse.json(
        { error: "Bad Request", message: "Failed to determine avatar URL." },
        { status: 400 }
      );
    }

    // 4. Remove previous local avatar file if it was in /avatars/
    const existingUser = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { avatar: true },
    });

    if (existingUser?.avatar && existingUser.avatar.startsWith("/avatars/")) {
      try {
        const oldFile = path.join(process.cwd(), "public", existingUser.avatar);
        if (fs.existsSync(oldFile)) {
          fs.unlinkSync(oldFile);
        }
      } catch (err) {
        console.warn("Could not delete old avatar file:", err);
      }
    }

    // 5. Save updated avatar in Database
    const updatedUser = await prisma.user.update({
      where: { id: payload.sub },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      avatar: updatedUser.avatar,
      user: updatedUser,
      message: "Profile avatar updated successfully!",
    });
  } catch (error: any) {
    console.error("Avatar upload API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message || "Failed to upload avatar." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/avatar
 * Removes the avatar and resets user profile to default initials.
 */
export async function DELETE(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyAuthToken(token);
    if (!payload?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Remove local file if exists
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { avatar: true },
    });

    if (user?.avatar && user.avatar.startsWith("/avatars/")) {
      try {
        const oldFile = path.join(process.cwd(), "public", user.avatar);
        if (fs.existsSync(oldFile)) {
          fs.unlinkSync(oldFile);
        }
      } catch (err) {
        console.warn("Could not delete old avatar file:", err);
      }
    }

    // Clear avatar in database
    await prisma.user.update({
      where: { id: payload.sub },
      data: { avatar: null },
    });

    return NextResponse.json({
      success: true,
      avatar: null,
      message: "Avatar removed. Reverted to default initials.",
    });
  } catch (error: any) {
    console.error("Avatar deletion API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to remove avatar." },
      { status: 500 }
    );
  }
}
