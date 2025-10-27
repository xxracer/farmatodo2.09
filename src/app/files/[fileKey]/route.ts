
import { getFileAsResponse } from "@/app/actions/kv-actions";
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { fileKey: string } }
) {
    // The fileKey is URL-encoded, so we decode it.
    // The fileKey should be the full, unique path as it was stored in Vercel KV.
    const fileKey = decodeURIComponent(params.fileKey);

    // No need to reconstruct the path, as the `fileKey` parameter now contains the full path.
    return await getFileAsResponse(fileKey);
}
