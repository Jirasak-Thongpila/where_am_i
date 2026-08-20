import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

export const bucket = storage.bucket(process.env.GCS_BUCKET_NAME || "");

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

  return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}

export async function deleteFromGCS(fileUrlOrName: string | null | undefined): Promise<boolean> {
  if (!fileUrlOrName) return false;
  try {
    let filename = fileUrlOrName;
    if (fileUrlOrName.startsWith("http://") || fileUrlOrName.startsWith("https://")) {
      const parts = fileUrlOrName.split(`${bucket.name}/`);
      if (parts.length > 1) {
        filename = parts[1];
      } else {
        const urlObj = new URL(fileUrlOrName);
        filename = urlObj.pathname.replace(`/${bucket.name}/`, "").replace(/^\//, "");
      }
    }
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
