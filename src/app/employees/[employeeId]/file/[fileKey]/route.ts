
import { getFileAsResponse } from "@/app/actions/kv-actions";
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { employeeId: string, fileKey: string } }
) {
    // The params are URL-encoded, so decode them.
    const employeeId = decodeURIComponent(params.employeeId);
    const fileKey = decodeURIComponent(params.fileKey);

    // Reconstruct the full key as it was saved.
    // This part depends on the saving logic in `employees/page.tsx`.
    // Example reconstruction:
    // const fullKey = `${employeeId}/required/${fileKey}`; 
    // You MUST know the full path. For this example, we assume the fileKey is the full path.
    const fullKey = fileKey;

    return await getFileAsResponse(fullKey);
}
