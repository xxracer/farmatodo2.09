
'use client';

/**
 * A client-side module to mimic a simple key-value database using localStorage.
 */

// Helper to safely parse JSON from localStorage
function getFromStorage<T>(key: string): T | null {
    if (typeof window === 'undefined') {
        return null;
    }
    const item = window.localStorage.getItem(key);
    if (!item) return null;
    try {
        return JSON.parse(item) as T;
    } catch (e) {
        console.error(`Failed to parse ${key} from localStorage`, e);
        return null;
    }
}

// Helper to safely stringify and save JSON to localStorage
function saveToStorage<T>(key:string, data: T) {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        const item = JSON.stringify(data);
        window.localStorage.setItem(key, item);
    } catch (e) {
        console.error(`Failed to save ${key} to localStorage`, e);
    }
}

/**
 * Retrieves all items for a given key.
 * @param key The key for the collection (e.g., 'candidates', 'companies').
 * @returns An array of items, or an empty array if none are found.
 */
export function getAll<T>(key: string): T[] {
    return getFromStorage<T[]>(key) || [];
}

/**
 * Retrieves a single item by its ID.
 * @param key The key for the collection.
 * @param id The ID of the item to retrieve.
 * @returns The item, or null if not found.
 */
export function getById<T extends { id: string }>(key: string, id: string): T | null {
    const items = getAll<T>(key);
    return items.find(item => item.id === id) || null;
}

/**
 * Saves a single item by its ID. If the item exists, it's updated. If not, it's added.
 * @param key The key for the collection.
 * @param id The ID of the item to save.
 * @param data The item data to save.
 */
export function saveById<T extends { id: string }>(key: string, id: string, data: T) {
    const items = getAll<T>(key);
    const index = items.findIndex(item => item.id === id);
    if (index > -1) {
        items[index] = data; // Update existing
    } else {
        items.push(data); // Add new
    }
    saveToStorage(key, items);
}

/**
 * Overwrites an entire collection with a new array of items.
 * @param key The key for the collection.
 * @param data The new array of items.
 */
export function saveAll<T>(key: string, data: T[]) {
    saveToStorage(key, data);
}

/**
 * Deletes an item by its ID.
 * @param key The key for the collection.
 * @param id The ID of the item to delete.
 */
export function deleteById(key: string, id: string) {
    let items = getAll<{id: string}>(key);
    items = items.filter(item => item.id !== id);
    saveToStorage(key, items);
}

/**
 * Generates a simple unique ID.
 * @returns A string representing a unique ID.
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
