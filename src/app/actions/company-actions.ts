
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
    let logoToSave = companyData.logo;

    // Handle logo upload if it's a new base64 image
    if (logoToSave && logoToSave.startsWith('data:image')) {
        const { buffer, mimeType, extension } = dataUriToBuffer(logoToSave);
        const companyNameSlug = companyData.name?.toLowerCase().replace(/\s+/g, '_') || 'company';
        const logoFileName = `${companyNameSlug}_logo_${Date.now()}.${extension}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('logos')
            .upload(logoFileName, buffer, { contentType: mimeType, upsert: true });

        if (uploadError) {
            console.error("Error uploading logo:", uploadError);
            throw new Error("Failed to upload logo.");
        }
        
        // We store the path from the upload, not the original base64 string.
        logoToSave = uploadData.path;
    }

    // Prepare data for saving. The logo field now contains either the new path or the existing path/URL.
    const dataToSave = { ...companyData, logo: logoToSave };

    let error;
    let data;

    if (dataToSave.id) {
        // UPDATE existing company
        const { created_at, ...updateData } = dataToSave;
        const validatedData = companySchema.partial().parse(updateData);
        const { data: updateResult, error: updateError } = await supabase
            .from('companies')
            .update(validatedData)
            .eq('id', validatedData.id!)
            .select()
            .single();
        data = updateResult;
        error = updateError;
    } else {
        // INSERT new company
        const { id, ...insertData } = dataToSave; // Exclude null/undefined id
        const validatedData = companySchema.omit({ id: true, created_at: true }).partial().parse(insertData);
        const { data: insertResult, error: insertError } = await supabase
            .from('companies')
            .insert(validatedData)
            .select()
            .single();
        data = insertResult;
        error = insertError;
    }
    
    if (error) {
        console.error("Error saving company:", error);
        // This is a more specific error message now
        throw new Error(`Failed to save company data to the database: ${error.message}`);
    }
    
    revalidatePath('/dashboard/settings');
    revalidatePath('/super-admin');

    // After saving, get a temporary signed URL for the logo path to return to the client.
    // This allows displaying the logo from a private bucket.
    let finalLogoUrl = data.logo;
    if (data.logo && !data.logo.startsWith('http')) {
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('logos')
            .createSignedUrl(data.logo, 60 * 60); // 1-hour expiry
        
        if (signedUrlError) {
             console.error("Error creating signed URL for logo:", signedUrlError);
             // We don't throw here, just return the data without the temporary URL
        } else {
            finalLogoUrl = signedUrlData.signedUrl;
        }
    }
    
    // Return the company data with a temporary, usable logo URL
    return { success: true, company: { ...data, logo: finalLogoUrl } };
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
