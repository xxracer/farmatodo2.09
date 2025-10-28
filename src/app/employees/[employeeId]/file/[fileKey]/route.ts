
import { getFileAsResponse } from "@/app/actions/kv-actions";
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { employeeId: string, fileKey: string } }
) {
    // The params are URL-encoded, so decode them.
    const employeeId = decodeURIComponent(params.employeeId);
    const fileKey = decodeURIComponent(params.fileKey);

    // The fileKey from the ApplicationView component is already the full key.
    // No reconstruction needed.
    return await getFileAsResponse(fileKey);
}
