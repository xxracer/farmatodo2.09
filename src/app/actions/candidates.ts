
'use server';

import { type ApplicationData, type ApplicationSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

// NOTE: Since we are using localStorage, these actions will be called from client components.
// The 'use server' directive is kept for structural consistency, but the logic
// within will effectively be client-side logic passed to the server action context.
// In a real app, these would be true server-side database operations.

// Helper to convert a File to a base64 data URI
async function fileToDataURL(file: File): Promise<string> {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Client-side helpers for localStorage. These would be API calls in a real app.
const getCandidatesFromStorage = (): ApplicationData[] => {
    if (typeof window === 'undefined') return [];
    const data = window.localStorage.getItem('candidates');
    return data ? JSON.parse(data) : [];
};

const saveCandidatesToStorage = (candidates: ApplicationData[]) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('candidates', JSON.stringify(candidates));
};

export async function createCandidate(data: Omit<ApplicationSchema, 'resume' | 'driversLicense'> & { resume: string; driversLicense: string }) {
    try {
        const newCandidate: ApplicationData = {
            id: crypto.randomUUID(),
            ...data,
            date: new Date(),
            employmentHistory: data.employmentHistory.map(job => ({
                ...job,
                dateFrom: job.dateFrom ? new Date(job.dateFrom) : undefined,
                dateTo: job.dateTo ? new Date(job.dateTo) : undefined,
                startingPay: parseFloat(job.startingPay as any) || 0,
            })),
            driversLicenseExpiration: data.driversLicenseExpiration ? new Date(data.driversLicenseExpiration) : undefined,
            status: 'candidate',
        };

        const candidates = getCandidatesFromStorage();
        candidates.unshift(newCandidate); // Add to the beginning
        saveCandidatesToStorage(candidates);
        
        if (typeof window !== 'undefined') {
            localStorage.setItem('candidateName', `${newCandidate.firstName} ${newCandidate.lastName}`);
            localStorage.setItem('candidateCompany', newCandidate.applyingFor.join(', '));
            window.dispatchEvent(new Event('storage'));
        }

        revalidatePath('/dashboard/candidates');
        revalidatePath('/dashboard');
        return { success: true, id: newCandidate.id };
    } catch (error) {
        console.error("Error creating candidate: ", error);
        return { success: false, error: (error as Error).message || "Failed to create candidate." };
    }
}


export async function getCandidates(): Promise<ApplicationData[]> {
    const all = getCandidatesFromStorage();
    return all.filter(c => c.status === 'candidate');
}

export async function getNewHires(): Promise<ApplicationData[]> {
     const all = getCandidatesFromStorage();
    return all.filter(c => c.status === 'new-hire');
}

export async function getEmployees(): Promise<ApplicationData[]> {
     const all = getCandidatesFromStorage();
    return all.filter(c => c.status === 'employee');
}

export async function getPersonnel(): Promise<ApplicationData[]> {
     const all = getCandidatesFromStorage();
    return all.filter(p => p.status === 'new-hire' || p.status === 'employee');
}

export async function getCandidate(id: string): Promise<ApplicationData | null> {
    const candidates = getCandidatesFromStorage();
    const candidate = candidates.find(c => c.id === id) || null;
    return JSON.parse(JSON.stringify(candidate)); // Ensure plain object
}

export async function updateCandidateWithDocuments(
    id: string, 
    documents: { 
        idCard?: string, 
        proofOfAddress?: string, 
    }
) {
    try {
        let candidates = getCandidatesFromStorage();
        const candidateIndex = candidates.findIndex(c => c.id === id);

        if (candidateIndex === -1) {
            throw new Error("Candidate not found");
        }
        
        const candidate = candidates[candidateIndex];

        if (documents.idCard) {
            candidate.idCard = documents.idCard;
        }
        if (documents.proofOfAddress) {
            candidate.proofOfAddress = documents.proofOfAddress;
        }

        candidates[candidateIndex] = candidate;
        saveCandidatesToStorage(candidates);
        
        revalidatePath(`/dashboard/candidates/view`, 'page');
        revalidatePath('/dashboard/candidates');
        revalidatePath('/dashboard/new-hires');
        revalidatePath('/dashboard/expiring-documentation');
        return { success: true };
    } catch (error) {
        console.error("Error updating document: ", error);
        return { success: false, error: (error as Error).message || "Failed to update candidate." };
    }
}


export async function updateCandidateStatus(id: string, status: 'new-hire' | 'employee') {
    try {
        let candidates = getCandidatesFromStorage();
        const candidateIndex = candidates.findIndex(c => c.id === id);
        if (candidateIndex > -1) {
            candidates[candidateIndex].status = status;
            saveCandidatesToStorage(candidates);
        } else {
            throw new Error("Candidate not found");
        }

        revalidatePath('/dashboard/candidates');
        revalidatePath('/dashboard/candidates/view', 'page');
        revalidatePath('/dashboard/new-hires');
        revalidatePath('/dashboard/employees');
        revalidatePath('/dashboard/expiring-documentation');
        return { success: true };
    } catch (error) {
        console.error("Error updating status: ", error);
        return { success: false, error: "Failed to update candidate status." };
    }
}


export async function deleteCandidate(id: string) {
    try {
        let candidates = getCandidatesFromStorage();
        const updatedCandidates = candidates.filter(c => c.id !== id);
        saveCandidatesToStorage(updatedCandidates);

        revalidatePath('/dashboard/candidates');
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/new-hires');
        revalidatePath('/dashboard/employees');
        revalidatePath('/dashboard/expiring-documentation');
        return { success: true };
    } catch (error) {
        console.error("Error deleting document: ", error);
        return { success: false, error: "Failed to delete candidate." };
    }
}

export async function hasCandidates(): Promise<boolean> {
    const candidates = await getCandidates();
    return candidates.length > 0;
}

export async function checkForExpiringDocuments(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
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
