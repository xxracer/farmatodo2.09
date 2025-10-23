
'use client';

import { Company } from "@/lib/company-schemas";
import { getAll, saveAll, saveById, deleteById, generateId } from "@/lib/local-storage-client";

const COMPANIES_KEY = 'companies';

function dispatchStorageEvent() {
    window.dispatchEvent(new Event('storage'));
}

export async function getCompanies(): Promise<Company[]> {
    return getAll<Company>(COMPANIES_KEY);
}

export async function getCompany(id: string): Promise<Company | null> {
    const companies = await getCompanies();
    return companies.find(c => c.id === id) || null;
}

export async function createOrUpdateCompany(companyData: Partial<Company>) {
    try {
        let companyToSave: Company;

        if (companyData.id) {
            // Update
            const existingCompany = await getCompany(companyData.id);
            if (!existingCompany) throw new Error("Company not found");
            companyToSave = { ...existingCompany, ...companyData };
        } else {
            // Create
            companyToSave = {
                ...companyData,
                id: generateId(),
                created_at: new Date().toISOString(),
            } as Company;
        }

        saveById<Company>(COMPANIES_KEY, companyToSave.id!, companyToSave);

        dispatchStorageEvent();
        return { success: true, company: companyToSave };

    } catch (error) {
        console.error("Error saving company data:", error);
        throw new Error(`Failed to save company data: ${(error as Error).message}`);
    }
}


export async function deleteCompany(id: string) {
    try {
        deleteById(COMPANIES_KEY, id);
        dispatchStorageEvent();
        return { success: true };
    } catch(error) {
        console.error("Error deleting company:", error);
        return { success: false, error: "Failed to delete company." };
    }
}
