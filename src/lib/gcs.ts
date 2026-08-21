import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

export const bucket = storage.bucket(process.env.GCS_BUCKET_NAME || "");

/**
 * Uploads a file buffer to Google Cloud Storage and returns an accessible Signed URL (valid for 2 years).
 */
export async function uploadToGCS(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const file = bucket.file(filename);

  await file.save(buffer, {
    metadata: {
      contentType: contentType,
    },
    resumable: false,
  });

  try {
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 365 * 2, // 2 years
    });
    return signedUrl;
  } catch (error) {
    console.warn("Failed to generate signed URL, falling back to standard URL:", error);
    return `https://storage.googleapis.com/${bucket.name}/${filename}`;
  }
}

/**
 * Generates a fresh signed URL for any existing GCS file.
 */
export async function getSignedImageUrl(
  fileUrlOrName: string,
  expiresInDays: number = 730
): Promise<string> {
  try {
    const filename = extractGcsFilename(fileUrlOrName);
    const file = bucket.file(filename);
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24 * expiresInDays,
    });
    return signedUrl;
  } catch (error) {
    console.error("Failed to generate signed URL:", error);
    return fileUrlOrName;
  }
}

/**
 * Helper to extract the relative filename from a full GCS URL, Signed URL, or raw filename.
 */
export function extractGcsFilename(fileUrlOrName: string): string {
  // Strip query parameters (if signed URL)
  const cleanUrl = fileUrlOrName.split("?")[0];
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    const parts = cleanUrl.split(`${bucket.name}/`);
    if (parts.length > 1) {
      return decodeURIComponent(parts[1]);
    }
    const urlObj = new URL(cleanUrl);
    return decodeURIComponent(urlObj.pathname.replace(`/${bucket.name}/`, "").replace(/^\//, ""));
  }
  return cleanUrl;
}

/**
 * Deletes an object from Google Cloud Storage.
 */
export async function deleteFromGCS(fileUrlOrName: string | null | undefined): Promise<boolean> {
  if (!fileUrlOrName) return false;
  try {
    const filename = extractGcsFilename(fileUrlOrName);
    const file = bucket.file(filename);
    const [exists] = await file.exists();
    if (exists) {
      await file.delete();
      return true;
    }
    return false;
  } catch (error) {
    console.error("GCS delete error:", error);
    return false;
  }
}
