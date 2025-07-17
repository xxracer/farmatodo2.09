'use server';

import { db } from "@/lib/firebase";
import { type ApplicationData, type ApplicationSchema } from "@/lib/schemas";
import { addDoc, collection, getDocs, doc, getDoc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { revalidatePath } from "next/cache";

export async function createCandidate(data: ApplicationSchema) {
    try {
        const docRef = await addDoc(collection(db, "candidates"), {
            ...data,
        });
        revalidatePath('/dashboard/candidates');
        revalidatePath('/dashboard');
        return { success: true, id: docRef.id };
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

export async function updateCandidateWithDocuments(id: string, data: { idCard?: string, proofOfAddress?: string }) {
    try {
        const docRef = doc(db, "candidates", id);
        await updateDoc(docRef, data);
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
