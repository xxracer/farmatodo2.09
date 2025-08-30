
'use server';

import { supabase } from "@/lib/supabaseClient";
import { Company, companySchema } from "@/lib/company-schemas";
import { revalidatePath } from "next/cache";

// Helper to decode a base64 data URI and convert it to a Buffer
function dataUriToBuffer(dataUri: string): { buffer: Buffer, mimeType: string, extension: string } {
    const regex = /^data:(.+);base64,(.*)$/;
    const matches = dataUri.match(regex);
    if (!matches || matches.length !== 3) {
        throw new Error("Invalid data URI");
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const extension = mimeType.split('/')[1];

    return { buffer, mimeType, extension };
}

export async function getCompanies(): Promise<Company[]> {
    const { data, error } = await supabase.from('companies').select('*');
    if (error) {
        console.error("Error fetching companies:", error);
        return [];
    }
    return data || [];
}

export async function getCompany(id: string): Promise<Company | null> {
    const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();
    if (error) {
        console.error("Error fetching company:", error);
        return null;
    }
    return data;
}

export async function createOrUpdateCompany(companyData: Partial<Company>) {
    let logoUrl = companyData.logo;

    // Handle logo upload if it's a new base64 image
    if (logoUrl && logoUrl.startsWith('data:image')) {
        const { buffer, mimeType, extension } = dataUriToBuffer(logoUrl);
        const logoFileName = `logo_${Date.now()}.${extension}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('logos')
            .upload(logoFileName, buffer, { contentType: mimeType, upsert: true });

        if (uploadError) {
            console.error("Error uploading logo:", uploadError);
            throw new Error("Failed to upload logo.");
        }
        
        const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(uploadData.path);
        logoUrl = publicUrlData.publicUrl;
    }

    const dataToSave = { ...companyData, logo: logoUrl };

    let error;
    let data;

    if (dataToSave.id) {
        // UPDATE existing company
        const validatedData = companySchema.partial().parse(dataToSave);
        const { data: updateData, error: updateError } = await supabase
            .from('companies')
            .update(validatedData)
            .eq('id', validatedData.id!)
            .select()
            .single();
        data = updateData;
        error = updateError;
    } else {
        // INSERT new company, let Supabase generate the ID
        const { id, ...insertData } = dataToSave; // Exclude null/undefined id
        const validatedData = companySchema.omit({ id: true, created_at: true }).partial().parse(insertData);
        const { data: insertDataResult, error: insertError } = await supabase
            .from('companies')
            .insert(validatedData)
            .select()
            .single();
        data = insertDataResult;
        error = insertError;
    }
    
    if (error) {
        console.error("Error saving company:", error);
        throw new Error("Failed to save company settings.");
    }
    
    revalidatePath('/dashboard/settings');
    revalidatePath('/super-admin');

    return { success: true, company: data };
}


export async function deleteCompany(id: string) {
    const { error } = await supabase.from('companies').delete().eq('id', id);
    if (error) {
        console.error("Error deleting company:", error);
        return { success: false, error: "Failed to delete company." };
    }
    
    revalidatePath('/dashboard/settings');
    revalidatePath('/super-admin');
    
    return { success: true };
}
