
'use server';

import { kv } from '@vercel/kv';

// Helper to convert a File to a base64 data URI string
async function fileToDataURL(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    return `data:${file.type};base64,${base64}`;
}


/**
 * Uploads a file to Vercel KV.
 * The key will be the `fileName`.
 * @param file The file to upload.
 * @param fileName The name to use as the key in KV.
 * @returns The key under which the file was stored.
 */
export async function uploadFile(file: File, fileName: string): Promise<string> {
  try {
    const dataUrl = await fileToDataURL(file);
    await kv.set(fileName, dataUrl);
    // We return the key, which now acts as the URL/identifier
    return fileName; 
  } catch (error) {
    console.error("KV Upload Error:", error);
    throw new Error("Failed to upload file to Vercel KV.");
  }
}

/**
 * Retrieves a file (as a data URL string) from Vercel KV.
 * @param fileKey The key of the file to retrieve.
 * @returns The data URL of the file, or null if not found.
 */
export async function getFile(fileKey: string): Promise<string | null> {
   try {
    const dataUrl = await kv.get<string>(fileKey);
    return dataUrl;
  } catch (error) {
    console.error("KV Fetch Error:", error);
    return null;
  }
}

/**
 * Deletes a file from Vercel KV.
 * @param fileKey The key of the file to delete.
 */
export async function deleteFile(fileKey: string): Promise<void> {
   try {
    await kv.del(fileKey);
  } catch (error) {
    console.error("KV Deletion Error:", error);
  }
}
