
'use server';

import { db, storage } from "@/lib/firebase";
import { type ApplicationData, type ApplicationSchema } from "@/lib/schemas";
import { addDoc, collection, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { revalidatePath } from "next/cache";
import { format, add, isBefore } from "date-fns";

// Helper to convert Firestore Timestamp to JS Date
function toDate(timestamp: any): Date | null {
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return null;
}

// Helper to process a document, converting all timestamps
function processDoc(docData: any): any {
    if (!docData) return null;

    const data = { ...docData };

    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate();
        }
    }

    if (data.employmentHistory && Array.isArray(data.employmentHistory)) {
        data.employmentHistory = data.employmentHistory.map((job: any) => {
            const newJob = { ...job };
            if (newJob.dateFrom instanceof Timestamp) {
                newJob.dateFrom = newJob.dateFrom.toDate();
            }
            if (newJob.dateTo instanceof Timestamp) {
                newJob.dateTo = newJob.dateTo.toDate();
            }
            return newJob;
        });
    }

    return data;
}

async function uploadFileAndGetURL(candidateId: string, file: File, fileName: string): Promise<string> {
    const storageRef = ref(storage, `candidates/${candidateId}/${fileName}`);
    try {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error(`Error uploading file ${fileName} for candidate ${candidateId}:`, error);
        throw new Error(`Failed to upload ${fileName}.`);
    }
}

export async function createCandidate(data: ApplicationSchema, resume: File) {
    let candidateId: string | null = null;
    try {
        // Create the document in Firestore first without the resume URL
        const docData = {
            ...data,
            resume: undefined, // Will be updated after upload
            date: data.date ? new Date(data.date) : new Date(),
            employmentHistory: data.employmentHistory.map(job => ({
                ...job,
                dateFrom: job.dateFrom ? new Date(job.dateFrom) : undefined,
                dateTo: job.dateTo ? new Date(job.dateTo) : undefined,
                startingPay: parseFloat(job.startingPay as any) || 0,
            })),
            status: 'candidate',
        };

        const docRef = await addDoc(collection(db, "candidates"), docData);
        candidateId = docRef.id;

        // Now upload the resume file
        const resumeURL = await uploadFileAndGetURL(candidateId, resume, `resume-${resume.name}`);
        
        // Update the document with the resume URL
        await updateDoc(docRef, { resume: resumeURL });

        revalidatePath('/dashboard/candidates');
        revalidatePath('/dashboard');
        return { success: true, id: candidateId };
    } catch (error) {
        console.error("Error creating candidate: ", error);
        // If something fails (e.g., file upload), delete the created Firestore document
        if (candidateId) {
            await deleteDoc(doc(db, "candidates", candidateId));
        }
        return { success: false, error: (error as Error).message || "Failed to create candidate." };
    }
}


export async function getCandidates(): Promise<ApplicationData[]> {
    try {
        const q = query(collection(db, "candidates"), where("status", "==", "candidate"));
        const querySnapshot = await getDocs(q);
        const candidates = querySnapshot.docs.map(doc => {
            return processDoc({
                id: doc.id,
                ...doc.data(),
            }) as ApplicationData;
        });
        return candidates;
    } catch (error) {
        console.error("Error getting documents: ", error);
        return [];
    }
}

export async function getNewHires(): Promise<ApplicationData[]> {
    try {
        const q = query(collection(db, "candidates"), where("status", "==", "new-hire"));
        const querySnapshot = await getDocs(q);
        const candidates = querySnapshot.docs.map(doc => {
             return processDoc({
                id: doc.id,
                ...doc.data(),
            }) as ApplicationData;
        });
        return candidates;
    } catch (error) {
        console.error("Error getting new hires: ", error);
        return [];
    }
}

export async function getEmployees(): Promise<ApplicationData[]> {
    try {
        const q = query(collection(db, "candidates"), where("status", "==", "employee"));
        const querySnapshot = await getDocs(q);
        const employees = querySnapshot.docs.map(doc => {
             return processDoc({
                id: doc.id,
                ...doc.data(),
            }) as ApplicationData;
        });
        return employees;
    } catch (error) {
        console.error("Error getting employees: ", error);
        return [];
    }
}

export async function getPersonnel(): Promise<ApplicationData[]> {
    try {
        const q = query(collection(db, "candidates"), where("status", "in", ["new-hire", "employee"]));
        const querySnapshot = await getDocs(q);
        const personnel = querySnapshot.docs.map(doc => {
             return processDoc({
                id: doc.id,
                ...doc.data(),
            }) as ApplicationData;
        });
        return personnel;
    } catch (error) {
        console.error("Error getting personnel: ", error);
        return [];
    }
}


export async function getCandidate(id: string): Promise<ApplicationData | null> {
    try {
        const docRef = doc(db, "candidates", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return processDoc({ id: docSnap.id, ...docSnap.data() }) as ApplicationData;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting document: ", error);
        return null;
    }
}

export async function updateCandidateWithDocuments(
    id: string, 
    documents: { 
        idCard?: File, 
        proofOfAddress?: File, 
        driversLicense?: File 
    },
    metadata: {
        driversLicenseName?: string,
        driversLicenseExpiration?: Date,
    }
) {
    try {
        const docRef = doc(db, "candidates", id);
        const updates: { [key: string]: any } = {};

        if (documents.idCard) {
            updates.idCard = await uploadFileAndGetURL(id, documents.idCard, `idCard-${documents.idCard.name}`);
        }
        if (documents.proofOfAddress) {
            updates.proofOfAddress = await uploadFileAndGetURL(id, documents.proofOfAddress, `proofOfAddress-${documents.proofOfAddress.name}`);
        }
        if (documents.driversLicense) {
            updates.driversLicense = await uploadFileAndGetURL(id, documents.driversLicense, `driversLicense-${documents.driversLicense.name}`);
        }
        if (metadata.driversLicenseName) {
            updates.driversLicenseName = metadata.driversLicenseName;
        }
        if (metadata.driversLicenseExpiration) {
            updates.driversLicenseExpiration = Timestamp.fromDate(new Date(metadata.driversLicenseExpiration));
        }


        if (Object.keys(updates).length > 0) {
            await updateDoc(docRef, updates);
        }
        
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
        const docRef = doc(db, "candidates", id);
        await updateDoc(docRef, { status });

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
        const candidateDocRef = doc(db, "candidates", id);
        const candidateSnap = await getDoc(candidateDocRef);
        const candidateData = candidateSnap.data() as ApplicationData | undefined;

        await deleteDoc(candidateDocRef);

        // Delete associated files from storage
        const filesToDelete = [candidateData?.resume, candidateData?.idCard, candidateData?.proofOfAddress, candidateData?.driversLicense];
        for (const fileUrl of filesToDelete) {
            if (fileUrl) {
                try {
                    const fileRef = ref(storage, fileUrl);
                    await deleteObject(fileRef);
                } catch (storageError: any) {
                    if (storageError.code !== 'storage/object-not-found') {
                       console.error("Could not delete associated file:", fileUrl, storageError);
                    }
                }
            }
        }

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

export async function hasCandidates() {
    try {
        const q = query(collection(db, "candidates"), where("status", "==", "candidate"));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Error checking for candidates: ", error);
        return false;
    }
}

export async function checkForExpiringDocuments(): Promise<boolean> {
  try {
    const personnel = await getPersonnel();
    const sixtyDaysFromNow = add(new Date(), { days: 60 });
    
    return personnel.some(p => {
      if (!p.driversLicenseExpiration) return false;
      const expiry = toDate(p.driversLicenseExpiration);
      if (!expiry) return false;
      return isBefore(expiry, sixtyDaysFromNow);
    });
  } catch (error) {
    console.error("Error checking for expiring documents:", error);
    return false;
  }
}
