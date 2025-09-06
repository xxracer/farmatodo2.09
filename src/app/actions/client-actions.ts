
'use server';

import { supabase } from "@/lib/supabaseClient";
import { type ApplicationData, type ApplicationSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

// Helper function to decode a base64 data URI and convert it to a File-like object for Supabase
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


export async function createCandidate(data: Omit<ApplicationSchema, 'resume' | 'driversLicense'> & { resume: string; driversLicense: string }) {
    try {
        // 1. Upload Resume (to a private bucket)
        const { buffer: resumeBuffer, mimeType: resumeMimeType, extension: resumeExtension } = dataUriToBuffer(data.resume);
        const resumeFileName = `resume_${crypto.randomUUID()}.${resumeExtension}`;
        const { data: resumeUploadData, error: resumeUploadError } = await supabase.storage
            .from('resumes')
            .upload(resumeFileName, resumeBuffer, { contentType: resumeMimeType, upsert: true });

        if (resumeUploadError) throw resumeUploadError;
        const resumePath = resumeUploadData.path;


        // 2. Upload Driver's License (to a private bucket)
        const { buffer: licenseBuffer, mimeType: licenseMimeType, extension: licenseExtension } = dataUriToBuffer(data.driversLicense);
        const licenseFileName = `license_${crypto.randomUUID()}.${licenseExtension}`;
        const { data: licenseUploadData, error: licenseUploadError } = await supabase.storage
            .from('licenses')
            .upload(licenseFileName, licenseBuffer, { contentType: licenseMimeType, upsert: true });
            
        if (licenseUploadError) throw licenseUploadError;
        const licensePath = licenseUploadData.path;
        
        
        // 3. Insert candidate data into the database
        const newCandidate: Omit<ApplicationData, 'id'> = {
            ...data,
            resume: resumePath,
            driversLicense: licensePath,
            status: 'candidate',
        };

        const { data: insertedData, error: insertError } = await supabase
            .from('candidates')
            .insert([newCandidate])
            .select()
            .single();

        if (insertError) throw insertError;
        
        return { success: true, id: insertedData.id };
    } catch (error) {
        console.error("Error creating candidate: ", error);
        return { success: false, error: (error as Error).message || "Failed to create candidate." };
    }
}


export async function createLegacyEmployee(employeeData: Partial<ApplicationData>) {
    try {
        const dataToInsert = {
            ...employeeData,
            status: 'employee',
        };

        const { data: insertedData, error: insertError } = await supabase
            .from('candidates')
            .insert([dataToInsert])
            .select()
            .single();
        
        if (insertError) throw insertError;
        
        revalidatePath('/dashboard/employees');
        return { success: true, id: insertedData.id };

    } catch (error) {
         console.error("Error creating legacy employee: ", error);
        return { success: false, error: (error as Error).message || "Failed to create legacy employee." };
    }
}


export async function getCandidates(): Promise<ApplicationData[]> {
    const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('status', 'candidate')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching candidates:", error);
        return [];
    }
    return data;
}

export async function getInterviewCandidates(): Promise<ApplicationData[]> {
    const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('status', 'interview')
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error("Error fetching interview candidates:", error);
        return [];
    }
    return data;
}

export async function getNewHires(): Promise<ApplicationData[]> {
     const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('status', 'new-hire')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching new hires:", error);
        return [];
    }
    return data;
}

export async function getEmployees(): Promise<ApplicationData[]> {
     const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('status', 'employee')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching employees:", error);
        return [];
    }
    return data;
}

export async function getPersonnel(): Promise<ApplicationData[]> {
     const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .in('status', ['new-hire', 'employee'])
        .order('created_at', { ascending: false });
        
    if (error) {
        console.error("Error fetching personnel:", error);
        return [];
    }
    return data;
}

export async function getCandidate(id: string): Promise<ApplicationData | null> {
    const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) {
        console.error("Error fetching candidate:", error);
        return null;
    }
    return data;
}

export async function updateCandidateWithDocuments(
    id: string, 
    documents: Record<string, string>
) {
    try {
        const updates: Record<string, string> = {};
        
        for (const docKey in documents) {
            if (Object.prototype.hasOwnProperty.call(documents, docKey)) {
                const dataUri = documents[docKey];
                 const { buffer, mimeType, extension } = dataUriToBuffer(dataUri);
                 const fileName = `${docKey}_${id}.${extension}`;
                 const { data: uploadData, error } = await supabase.storage.from('documents').upload(fileName, buffer, { contentType: mimeType, upsert: true });
                 if (error) throw error;
                 updates[docKey] = uploadData.path;
            }
        }

        if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase.from('candidates').update(updates).eq('id', id);
            if (updateError) throw updateError;
        }
        
        return { success: true };
    } catch (error) {
        console.error("Error updating document: ", error);
        return { success: false, error: (error as Error).message || "Failed to update candidate." };
    }
}


export async function updateCandidateStatus(id: string, status: 'interview' | 'new-hire' | 'employee') {
    const { error } = await supabase
        .from('candidates')
        .update({ status: status })
        .eq('id', id);

    if (error) {
        console.error("Error updating status: ", error);
        return { success: false, error: "Failed to update candidate status." };
    }
    return { success: true };
}


export async function deleteCandidate(id: string) {
    const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting document: ", error);
        return { success: false, error: "Failed to delete candidate." };
    }
    return { success: true };
}

export async function hasCandidates(): Promise<boolean> {
    const { count, error } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error("Error checking for candidates:", error);
        return false;
    }
    return (count || 0) > 0;
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
