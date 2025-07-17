'use server';

import { db, storage } from "@/lib/firebase";
import { type ApplicationData, type ApplicationSchema } from "@/lib/schemas";
import { addDoc, collection, getDocs, doc, getDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { revalidatePath } from "next/cache";

async function uploadFileAndGetURL(candidateId: string, file: File, fileName: string): Promise<string> {
    const storageRef = ref(storage, `${candidateId}/${fileName}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
}

export async function createCandidate(data: ApplicationSchema, resume: File) {
    try {
        const docRef = await addDoc(collection(db, "candidates"), {
            ...data,
            resume: undefined // Clear resume from initial data
        });
        
        const candidateId = docRef.id;
        const resumeURL = await uploadFileAndGetURL(candidateId, resume, `resume-${resume.name}`);
        
        await updateDoc(docRef, { resume: resumeURL });

        revalidatePath('/dashboard/candidates');
        revalidatePath('/dashboard');
        return { success: true, id: candidateId };
    } catch (error) {
        console.error("Error adding document: ", error);
        return { success: false, error: "Failed to create candidate." };
    }
}

export async function getCandidates(): Promise<ApplicationData[]> {
    try {
        const q = query(collection(db, "candidates"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const candidates = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as ApplicationData));
        return candidates;
    } catch (error) {
        console.error("Error getting documents: ", error);
        return [];
    }
}

export async function getCandidate(id: string): Promise<ApplicationData | null> {
    try {
        const docRef = doc(db, "candidates", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as ApplicationData;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting document: ", error);
        return null;
    }
}

export async function updateCandidateWithDocuments(id: string, documents: { idCard?: File, proofOfAddress?: File }) {
    try {
        const docRef = doc(db, "candidates", id);
        const updates: { idCard?: string, proofOfAddress?: string } = {};

        if (documents.idCard) {
            updates.idCard = await uploadFileAndGetURL(id, documents.idCard, `idCard-${documents.idCard.name}`);
        }
        if (documents.proofOfAddress) {
            updates.proofOfAddress = await uploadFileAndGetURL(id, documents.proofOfAddress, `proofOfAddress-${documents.proofOfAddress.name}`);
        }

        if (Object.keys(updates).length > 0) {
            await updateDoc(docRef, updates);
        }
        
        revalidatePath(`/dashboard/candidates/view`, 'page');
        revalidatePath('/dashboard/candidates');
        return { success: true };
    } catch (error) {
        console.error("Error updating document: ", error);
        return { success: false, error: "Failed to update candidate." };
    }
}

export async function deleteCandidate(id: string) {
    try {
        await deleteDoc(doc(db, "candidates", id));

        // Note: This is a simplified deletion. For a production app,
        // you'd list all files in the candidate's folder and delete them one by one.
        // This example deletes known files.
        try {
            const candidateData = await getCandidate(id);
            if(candidateData?.resume) {
                await deleteObject(ref(storage, candidateData.resume));
            }
             if(candidateData?.idCard) {
                await deleteObject(ref(storage, candidateData.idCard));
            }
             if(candidateData?.proofOfAddress) {
                await deleteObject(ref(storage, candidateData.proofOfAddress));
            }
        } catch (storageError) {
            console.error("Could not delete associated files, they may not exist: ", storageError);
        }

        revalidatePath('/dashboard/candidates');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error deleting document: ", error);
        return { success: false, error: "Failed to delete candidate." };
    }
}

export async function hasCandidates() {
    try {
        const querySnapshot = await getDocs(collection(db, "candidates"));
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Error checking for candidates: ", error);
        return false;
    }
}
