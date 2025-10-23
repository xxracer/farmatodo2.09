
'use client';

import { type ApplicationData, type ApplicationSchema } from "@/lib/schemas";
import { getAll, getById, saveAll, saveById, deleteById, generateId } from "@/lib/local-storage-client";

const CANDIDATES_KEY = 'candidates';

function dispatchStorageEvent() {
    window.dispatchEvent(new Event('storage'));
}

export async function createCandidate(data: ApplicationSchema) {
    try {
        const newCandidate: ApplicationData = {
            ...data,
            id: generateId(),
            status: 'candidate',
        };

        const candidates = await getCandidates();
        candidates.push(newCandidate);
        saveAll<ApplicationData>(CANDIDATES_KEY, candidates);
        
        dispatchStorageEvent();
        return { success: true, id: newCandidate.id };
    } catch (error) {
        console.error("Error creating candidate: ", error);
        return { success: false, error: (error as Error).message || "Failed to create candidate." };
    }
}


export async function createLegacyEmployee(employeeData: Partial<ApplicationData>) {
    try {
        const newEmployee: ApplicationData = {
            ...employeeData,
            id: generateId(),
            status: 'employee',
        } as ApplicationData;

        const candidates = await getCandidates();
        candidates.push(newEmployee);
        saveAll<ApplicationData>(CANDIDATES_KEY, candidates);

        dispatchStorageEvent();
        return { success: true, id: newEmployee.id };

    } catch (error) {
         console.error("Error creating legacy employee: ", error);
        return { success: false, error: (error as Error).message || "Failed to create legacy employee." };
    }
}


export async function getCandidates(): Promise<ApplicationData[]> {
    const all = getAll<ApplicationData>(CANDIDATES_KEY);
    return all.filter(c => c.status === 'candidate').sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
}

export async function getInterviewCandidates(): Promise<ApplicationData[]> {
    const all = getAll<ApplicationData>(CANDIDATES_KEY);
    return all.filter(c => c.status === 'interview').sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
}

export async function getNewHires(): Promise<ApplicationData[]> {
    const all = getAll<ApplicationData>(CANDIDATES_KEY);
    return all.filter(c => c.status === 'new-hire').sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
}

export async function getEmployees(): Promise<ApplicationData[]> {
    const all = getAll<ApplicationData>(CANDIDATES_KEY);
    return all.filter(c => c.status === 'employee').sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
}

export async function getPersonnel(): Promise<ApplicationData[]> {
    const all = getAll<ApplicationData>(CANDIDATES_KEY);
    return all.filter(c => ['new-hire', 'employee'].includes(c.status!)).sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
}

export async function getCandidate(id: string): Promise<ApplicationData | null> {
    return getById<ApplicationData>(CANDIDATES_KEY, id);
}

export async function updateCandidateWithDocuments(
    id: string, 
    documents: Record<string, string>
) {
    try {
        const candidate = await getCandidate(id);
        if (!candidate) throw new Error("Candidate not found");

        const updatedCandidate = { ...candidate, ...documents };
        saveById<ApplicationData>(CANDIDATES_KEY, id, updatedCandidate);
        
        dispatchStorageEvent();
        return { success: true };
    } catch (error) {
        console.error("Error updating document: ", error);
        return { success: false, error: (error as Error).message || "Failed to update candidate." };
    }
}


export async function updateCandidateStatus(id: string, status: 'interview' | 'new-hire' | 'employee') {
    try {
        const candidate = await getCandidate(id);
        if (!candidate) throw new Error("Candidate not found");
        
        const updatedCandidate = { ...candidate, status };
        saveById<ApplicationData>(CANDIDATES_KEY, id, updatedCandidate);

        dispatchStorageEvent();
        return { success: true };
    } catch (error) {
        console.error("Error updating status: ", error);
        return { success: false, error: "Failed to update candidate status." };
    }
}


export async function deleteCandidate(id: string) {
    try {
        deleteById(CANDIDATES_KEY, id);
        dispatchStorageEvent();
        return { success: true };
    } catch (error) {
        console.error("Error deleting document: ", error);
        return { success: false, error: "Failed to delete candidate." };
    }
}

export async function hasCandidates(): Promise<boolean> {
    const candidates = getAll<ApplicationData>(CANDIDATES_KEY);
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