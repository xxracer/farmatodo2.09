
import { getFileAsResponse } from "@/app/actions/kv-actions";
import { NextRequest } from "next/server";

// This route is deprecated and no longer needed with the new /employees/[id]/file/[key] route
// but is kept to avoid breaking old links during transition.
export async function GET(
    request: NextRequest,
    { params }: { params: { fileKey: string } }
) {
    
    // The param is URL-encoded, so decode it.
    const fileKey = decodeURIComponent(params.fileKey);

    return await getFileAsResponse(fileKey);
}
