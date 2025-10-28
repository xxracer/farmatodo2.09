
import { NextRequest } from "next/server";

// This route is no longer needed with localStorage.
// However, we keep it to prevent build errors if it's referenced somewhere.
// It will now return a 404.

export async function GET(
    request: NextRequest,
    { params }: { params: { fileKey: string } }
) {
    
    return new Response('File access is now handled via data URIs with localStorage.', { status: 404 });
}
