import fs from "fs";
import path from "path";

/**
 * Saves a base64 image data URL to the public/uploads directory.
 * If the input is not a base64 data URL, it returns the input as is.
 * Returns the path to the saved file (e.g., /uploads/filename.png).
 */
export const saveBase64Image = (imageStr: string | null | undefined, prefix: string): string | null => {
  if (!imageStr) return null;
  if (typeof imageStr !== "string") return null;

  const trimmed = imageStr.trim();
  if (!trimmed.startsWith("data:image/")) {
    return trimmed; // Already a URL or empty
  }

  try {
    // Format: data:image/png;base64,iVBORw0KGgo...
    const matches = trimmed.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return trimmed; // Not a valid base64 data URL
    }

    const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, "base64");

    // Create unique filename
    const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    
    // In Next.js, the project root is process.cwd()
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return `/uploads/${filename}`;
  } catch (error) {
    console.error("Error saving base64 image:", error);
    return trimmed;
  }
};
