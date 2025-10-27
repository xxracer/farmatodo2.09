/**
 * Generates a simple unique ID for server-side operations.
 * @returns A string representing a unique ID.
 */
export function generateIdForServer(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
