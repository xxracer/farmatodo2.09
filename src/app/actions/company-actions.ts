
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
    const extension = mimeType.split('/')[1] || 'png'; // default extension

    return { buffer, mimeType, extension };
}

// Helper to upload a file from a base64 string to a specified bucket
async function uploadBase64File(base64String: string, bucket: string, fileName: string) {
    if (!base64String || !base64String.startsWith('data:')) {
        return base64String; // Not a new upload, return the existing path/URL
    }
    const { buffer, mimeType } = dataUriToBuffer(base64String);
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, buffer, { contentType: mimeType, upsert: true });

    if (error) {
        console.error(`Error uploading to ${bucket}:`, error);
        throw new Error(`Failed to upload file to ${bucket}: ${error.message}`);
    }
    return data.path;
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

export async function createOrUpdateCompany(companyData: Partial<Company> & { phase1ImagesToUpload?: string[] }) {
    const companyNameSlug = companyData.name?.toLowerCase().replace(/\s+/g, '_') || 'company';
    
    // 1. Handle Logo Upload
    const logoToSave = await uploadBase64File(
        companyData.logo || '',
        'logos',
        `${companyNameSlug}_logo_${Date.now()}`
    );

    // 2. Handle Phase 1 Form Images Upload
    let phase1ImagePaths: string[] = companyData.phase1Images || [];
    if (companyData.phase1ImagesToUpload && companyData.phase1ImagesToUpload.length > 0) {
        const uploadPromises = companyData.phase1ImagesToUpload.map((imgBase64, index) =>
            uploadBase64File(
                imgBase64,
                'forms',
                `${companyNameSlug}_form_p1_${Date.now()}_${index}`
            )
        );
        const newPaths = await Promise.all(uploadPromises);
        phase1ImagePaths = [...phase1ImagePaths, ...newPaths];
    }
    
    // 3. Prepare data for saving
    const dataToSave: Omit<Company, 'created_at' | 'id'> & { id?: string } = {
        ...companyData,
        logo: logoToSave,
        phase1Images: phase1ImagePaths,
    };
    // Remove the temporary upload field
    delete (dataToSave as any).phase1ImagesToUpload;


    let error;
    let data;
    
    // 4. Upsert data into the database
    if (dataToSave.id) {
        // UPDATE existing company
        const { created_at, ...updateData } = dataToSave;
        
        const validatedData = {
            ...updateData,
            requiredDocs: typeof updateData.requiredDocs === 'string' ? JSON.parse(updateData.requiredDocs) : updateData.requiredDocs,
        };

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
        const { id, ...insertData } = dataToSave;
         const validatedData = {
            ...insertData,
            requiredDocs: insertData.requiredDocs ? JSON.parse(JSON.stringify(insertData.requiredDocs)) : null,
        };
        const { data: insertResult, error: insertError } = await supabase
            .from('companies')
            .insert(validatedData)
            .select()
            .single();
        data = insertResult;
        error = insertError;
    }
    
    if (error) {
        console.error("Error saving company data to the database:", error);
        throw new Error(`Failed to save company data: ${error.message}`);
    }
    
    // Revalidate paths to update cache
    revalidatePath('/dashboard/settings');
    revalidatePath('/super-admin');
    revalidatePath('/application');

    // After saving, get temporary signed URLs for display
    let finalLogoUrl = data.logo;
    if (data.logo && !data.logo.startsWith('http')) {
        const { data: signedUrlData } = await supabase.storage.from('logos').createSignedUrl(data.logo, 3600);
        finalLogoUrl = signedUrlData?.signedUrl;
    }
    
    let finalPhase1ImageUrls: (string | null)[] = [];
    if (data.phase1Images && data.phase1Images.length > 0) {
        finalPhase1ImageUrls = await Promise.all(
            data.phase1Images.map(async (path) => {
                 if (path && !path.startsWith('http')) {
                    const { data: signedUrlData } = await supabase.storage.from('forms').createSignedUrl(path, 3600);
                    return signedUrlData?.signedUrl || null;
                }
                return path;
            })
        );
    }
    
    // Return the company data with temporary, usable URLs
    return { 
        success: true, 
        company: { 
            ...data, 
            logo: finalLogoUrl,
            phase1Images: finalPhase1ImageUrls.filter((url): url is string => !!url)
        } 
    };
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
