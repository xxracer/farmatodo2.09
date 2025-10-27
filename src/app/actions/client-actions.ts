
'use server';

import { kv } from '@vercel/kv';
import { type ApplicationData, type ApplicationSchema } from "@/lib/schemas";
import { generateIdForServer } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';
import { uploadKvFile } from './kv-actions';

const CANDIDATES_KEY = 'candidates';

async function getAllCandidates(): Promise<ApplicationData[]> {
    return await kv.get<ApplicationData[]>(CANDIDATES_KEY) || [];
}

async function saveAllCandidates(candidates: ApplicationData[]) {
    await kv.set(CANDIDATES_KEY, candidates);
    revalidatePath('/dashboard'); // Revalidate all dashboard paths
}

export async function createCandidate(data: ApplicationSchema) {
    try {
        const id = generateIdForServer();
        const newCandidate: Partial<ApplicationData> = {
            ...data,
            id: id,
            created_at: new Date().toISOString(),
            status: 'candidate',
            documents: [],
            miscDocuments: []
        };
        
        if (data.resume instanceof File) {
            const resumeUrl = await uploadKvFile(data.resume, `${id}/resume-${data.resume.name}`);
            newCandidate.resume = resumeUrl;
        }
        if (data.driversLicense instanceof File) {
            const licenseUrl = await uploadKvFile(data.driversLicense, `${id}/license-${data.driversLicense.name}`);
            newCandidate.driversLicense = licenseUrl;
        }

        const candidates = await getAllCandidates();
        candidates.push(newCandidate as ApplicationData);
        await saveAllCandidates(candidates);
        
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
            id: generateIdForServer(),
            created_at: new Date().toISOString(),
            status: 'employee',
            applyingFor: employeeData.applyingFor || [],
            education: employeeData.education || { college: {}, voTech: {}, highSchool: {}, other: {} },
        } as ApplicationData;

        const candidates = await getAllCandidates();
        candidates.push(newEmployee);
        await saveAllCandidates(candidates);

        return { success: true, id: newEmployee.id };
    } catch (error) {
        console.error("Error creating legacy employee: ", error);
        return { success: false, error: (error as Error).message || "Failed to create legacy employee." };
    }
}


export async function getCandidates(): Promise<ApplicationData[]> {
    const all = await getAllCandidates();
    const sorted = all.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
    return sorted.filter(c => c.status === 'candidate');
}

export async function getInterviewCandidates(): Promise<ApplicationData[]> {
    const all = await getAllCandidates();
    const sorted = all.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
    return sorted.filter(c => c.status === 'interview');
}

export async function getNewHires(): Promise<ApplicationData[]> {
    const all = await getAllCandidates();
    const sorted = all.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
    return sorted.filter(c => c.status === 'new-hire');
}

export async function getEmployees(): Promise<ApplicationData[]> {
    const all = await getAllCandidates();
    const sorted = all.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
    return sorted.filter(c => ['employee', 'inactive'].includes(c.status!));
}

export async function getPersonnel(): Promise<ApplicationData[]> {
    const all = await getAllCandidates();
    const sorted = all.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at-!).getTime());
    return sorted.filter(c => ['new-hire', 'employee', 'inactive'].includes(c.status!));
}

export async function getCandidate(id: string): Promise<ApplicationData | null> {
    const candidates = await getAllCandidates();
    return candidates.find(c => c.id === id) || null;
}

export async function updateCandidateWithDocuments(id: string, documents: { [key: string]: string }) {
    try {
        const candidates = await getAllCandidates();
        const index = candidates.findIndex(c => c.id === id);

        if (index > -1) {
            candidates[index] = { ...candidates[index], ...documents };
            await saveAllCandidates(candidates);
        } else {
            throw new Error("Could not find candidate to update.")
        }
        
        return { success: true };
    } catch (error) {
        console.error("Error updating document: ", error);
        return { success: false, error: (error as Error).message || "Failed to update candidate." };
    }
}

export async function updateCandidateStatus(id: string, status: 'interview' | 'new-hire' | 'employee' | 'inactive', inactiveInfo?: any) {
    try {
        const candidates = await getAllCandidates();
        const index = candidates.findIndex(c => c.id === id);
        
        if (index > -1) {
            candidates[index].status = status;
            if (inactiveInfo) {
                candidates[index].inactiveInfo = inactiveInfo;
            }
            await saveAllCandidates(candidates);
        } else {
            throw new Error("Candidate not found");
        }

        return { success: true };
    } catch (error) {
        console.error("Error updating status: ", error);
        return { success: false, error: "Failed to update candidate status." };
    }
}

export async function deleteCandidate(id: string) {
    try {
        const candidates = await getAllCandidates();
        const updatedCandidates = candidates.filter(c => c.id !== id);
        await saveAllCandidates(updatedCandidates);
        return { success: true };
    } catch (error) {
        console.error("Error deleting document: ", error);
        return { success: false, error: "Failed to delete candidate." };
    }
}

export async function hasCandidates(): Promise<boolean> {
    const candidates = await getAllCandidates();
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
    await kv.del(CANDIDATES_KEY);
    revalidatePath('/dashboard');
}
