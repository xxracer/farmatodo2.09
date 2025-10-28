
'use client';

import { generateId } from "@/lib/local-storage-client";
import { type ApplicationData, type ApplicationSchema } from "@/lib/schemas";
import { uploadKvFile, deleteFile } from "./kv-actions";

// This file now acts as a client-side API for interacting with localStorage.

const CANDIDATES_KEY = 'candidates';

// --- Private Helper Functions ---

function getAllFromStorage(): ApplicationData[] {
    if (typeof window === 'undefined') return [];
    const stored = window.localStorage.getItem(CANDIDATES_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveAllToStorage(data: ApplicationData[]) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(CANDIDATES_KEY, JSON.stringify(data));
    // Dispatch a storage event to notify other tabs/windows
    window.dispatchEvent(new Event('storage'));
}

// --- Public Client Actions ---

export async function createCandidate(data: ApplicationSchema): Promise<{ success: boolean, id?: string, error?: string }> {
    try {
        const id = generateId();
        let resumeKey: string | undefined = undefined;
        let licenseKey: string | undefined = undefined;

        // Upload files to KV and get their keys
        if (data.resume instanceof File) {
            resumeKey = await uploadKvFile(data.resume, `${id}/resume/${data.resume.name}`);
        }
        if (data.driversLicense instanceof File) {
            licenseKey = await uploadKvFile(data.driversLicense, `${id}/driversLicense/${data.driversLicense.name}`);
        }

        const newCandidate: ApplicationData = {
            ...data,
            id: id,
            created_at: new Date().toISOString(),
            status: 'candidate',
            documents: [],
            miscDocuments: [],
            // Store the KV keys instead of the files or data URLs
            resume: resumeKey,
            driversLicense: licenseKey,
        };

        const candidates = getAllFromStorage();
        candidates.push(newCandidate);
        saveAllToStorage(candidates);
        
        return { success: true, id: newCandidate.id };
    } catch (error) {
        console.error("Error creating candidate: ", error);
        return { success: false, error: (error as Error).message || "Failed to create candidate." };
    }
}

export async function createLegacyEmployee(employeeData: Partial<ApplicationData>): Promise<{ success: boolean, id?: string, error?: string }> {
    try {
        const newEmployee: ApplicationData = {
            ...employeeData,
            id: generateId(),
            created_at: new Date().toISOString(),
            status: 'employee',
            applyingFor: employeeData.applyingFor || [],
            education: employeeData.education || { college: {}, voTech: {}, highSchool: {}, other: {} },
        } as ApplicationData;
        
        const candidates = getAllFromStorage();
        candidates.push(newEmployee);
        saveAllToStorage(candidates);

        return { success: true, id: newEmployee.id };
    } catch (error) {
        console.error("Error creating legacy employee: ", error);
        return { success: false, error: (error as Error).message || "Failed to create legacy employee." };
    }
}


export async function getCandidates(): Promise<ApplicationData[]> {
    const all = getAllFromStorage();
    const sorted = all.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
    return sorted.filter(c => c.status === 'candidate');
}

export async function getInterviewCandidates(): Promise<ApplicationData[]> {
    const all = getAllFromStorage();
    const sorted = all.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
    return sorted.filter(c => c.status === 'interview');
}

export async function getNewHires(): Promise<ApplicationData[]> {
    const all = getAllFromStorage();
    const sorted = all.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
    return sorted.filter(c => c.status === 'new-hire');
}

export async function getEmployees(): Promise<ApplicationData[]> {
    const all = getAllFromStorage();
    const sorted = all.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
    return sorted.filter(c => ['employee', 'inactive'].includes(c.status!));
}

export async function getPersonnel(): Promise<ApplicationData[]> {
    const all = getAllFromStorage();
    const sorted = all.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
    return sorted.filter(c => ['new-hire', 'employee', 'inactive'].includes(c.status!));
}

export async function getCandidate(id: string): Promise<ApplicationData | null> {
    const candidates = getAllFromStorage();
    return candidates.find(c => c.id === id) || null;
}

export async function updateCandidateWithDocuments(id: string, documentFiles: { [key: string]: File }): Promise<{ success: boolean, error?: string }> {
    try {
        const candidates = getAllFromStorage();
        const index = candidates.findIndex(c => c.id === id);

        if (index > -1) {
            const documentsToUpdate: { [key: string]: string } = {};
            for (const docKey in documentFiles) {
                const file = documentFiles[docKey];
                const kvKey = await uploadKvFile(file, `${id}/docs/${docKey}/${file.name}`);
                documentsToUpdate[docKey] = kvKey;
            }

            candidates[index] = { ...candidates[index], ...documentsToUpdate };
            saveAllToStorage(candidates);
        } else {
            throw new Error("Could not find candidate to update.")
        }
        
        return { success: true };
    } catch (error) {
        console.error("Error updating document: ", error);
        return { success: false, error: (error as Error).message || "Failed to update candidate." };
    }
}

export async function updateCandidateWithFileUpload(id: string, file: File, title: string, type: 'required' | 'misc'): Promise<{ success: boolean, error?: string, fileKey?: string }> {
     try {
        const candidates = getAllFromStorage();
        const index = candidates.findIndex(c => c.id === id);

        if (index > -1) {
            const fileKey = await uploadKvFile(file, `${id}/${type}/${title.replace(/\s+/g, '_')}-${file.name}`);
            const newDoc = { id: fileKey, title: title };

            if (type === 'required') {
                if (!candidates[index].documents) candidates[index].documents = [];
                candidates[index].documents!.push(newDoc);
            } else {
                if (!candidates[index].miscDocuments) candidates[index].miscDocuments = [];
                candidates[index].miscDocuments!.push(newDoc);
            }
            
            saveAllToStorage(candidates);
            return { success: true, fileKey };
        } else {
            throw new Error("Could not find candidate to update.");
        }
     } catch (error) {
         console.error("Error updating with file upload: ", error);
        return { success: false, error: (error as Error).message || "Failed to update candidate." };
     }
}


export async function updateCandidateStatus(id: string, status: 'interview' | 'new-hire' | 'employee' | 'inactive', inactiveInfo?: any): Promise<{ success: boolean, error?: string }> {
    try {
        const candidates = getAllFromStorage();
        const index = candidates.findIndex(c => c.id === id);
        
        if (index > -1) {
            candidates[index].status = status;
            if (inactiveInfo) {
                candidates[index].inactiveInfo = inactiveInfo;
            }
            saveAllToStorage(candidates);
        } else {
            throw new Error("Candidate not found");
        }

        return { success: true };
    } catch (error) {
        console.error("Error updating status: ", error);
        return { success: false, error: "Failed to update candidate status." };
    }
}

export async function deleteCandidate(id: string): Promise<{ success: boolean, error?: string }> {
    try {
        // Here we could also add logic to delete associated files from KV if needed
        const candidates = getAllFromStorage();
        const updatedCandidates = candidates.filter(c => c.id !== id);
        saveAllToStorage(updatedCandidates);
        return { success: true };
    } catch (error) {
        console.error("Error deleting document: ", error);
        return { success: false, error: "Failed to delete candidate." };
    }
}

export async function hasCandidates(): Promise<boolean> {
    const candidates = getAllFromStorage();
    return candidates.length > 0;
}

export async function checkForExpiringDocuments(): Promise<boolean> {
    try {
        const personnel = await getPersonnel();
        const sixtyDaysFromNow = new Date();
        sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
        
        return personnel.some(p => {
          if (!p.driversLicenseExpiration) return false;
          const expiry = new Date(p.driversLicenseExpiration);
          return expiry < sixtyDaysFromNow;
        });
    } catch (error) {
        console.error("Error checking for expiring documents:", error);
        return false;
    }
}

export async function resetDemoData() {
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem(CANDIDATES_KEY);
        // Dispatch a storage event to notify other tabs/windows
        window.dispatchEvent(new Event('storage'));
    }
}

export async function deleteEmployeeFile(employeeId: string, fileKey: string, type: 'required' | 'misc'): Promise<{ success: boolean, error?: string }> {
    try {
        await deleteFile(fileKey);
        const candidates = getAllFromStorage();
        const index = candidates.findIndex(c => c.id === employeeId);

        if (index > -1) {
            if (type === 'required' && candidates[index].documents) {
                candidates[index].documents = candidates[index].documents!.filter(doc => doc.id !== fileKey);
            }
            if (type === 'misc' && candidates[index].miscDocuments) {
                candidates[index].miscDocuments = candidates[index].miscDocuments!.filter(doc => doc.id !== fileKey);
            }
            saveAllToStorage(candidates);
            return { success: true };
        } else {
             throw new Error("Could not find employee to update.");
        }
    } catch (error) {
        console.error("Error deleting file:", error);
        return { success: false, error: "Failed to delete file." };
    }
}
