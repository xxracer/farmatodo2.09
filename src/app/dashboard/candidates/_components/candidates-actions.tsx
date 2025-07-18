
"use client";

import { deleteCandidate } from "@/app/actions/client-actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2, View } from "lucide-react";
import { useRouter } from "next/navigation";

export function CandidatesActions({ candidateId }: { candidateId: string }) {
    const router = useRouter();
    const { toast } = useToast();

    const handleViewCandidate = () => {
        router.push(`/dashboard/candidates/view?id=${candidateId}`);
    }

    const handleDeleteCandidate = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this candidate?");
        if (confirmed) {
            const result = await deleteCandidate(candidateId);
            if (result.success) {
                toast({ title: "Candidate Deleted", description: "The candidate has been removed." });
            } else {
                toast({ variant: "destructive", title: "Error", description: result.error });
            }
        }
    }

    return (
        <>
            <Button variant="outline" size="sm" onClick={handleViewCandidate}>
                <View className="mr-2 h-4 w-4" />
                View
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteCandidate}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
            </Button>
        </>
    );
}
