
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentationPhase } from "@/components/dashboard/documentation-phase";
import { ProgressTracker } from "@/components/dashboard/progress-tracker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ClipboardCheck, Users } from "lucide-react";
import { getInterviewCandidates } from "@/app/actions/client-actions";
import { useEffect, useState, useCallback, useTransition } from "react";
import type { ApplicationData } from "@/lib/schemas";
import { InterviewReviewForm } from "./interview-review-form";

function CandidateDetails({ interviewCandidate }: { interviewCandidate: ApplicationData }) {
    if (!interviewCandidate) return null;

    const [currentPhase, setCurrentPhase] = useState<"interview" | "documentation">("interview");
    const [activeTab, setActiveTab] = useState<string>("interview");

    const handleInterviewSubmit = () => {
        const nextPhase = "documentation";
        setCurrentPhase(nextPhase);
        setActiveTab(nextPhase);
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-headline font-semibold text-foreground">
                  New Candidate for {interviewCandidate.applyingFor.join(', ')}: {interviewCandidate.firstName} {interviewCandidate.lastName}
                </h2>
            </div>

            <ProgressTracker 
                candidateId={interviewCandidate.id} 
                currentPhase={currentPhase}
            />

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                    <TabsTrigger value="interview">Phase 2: Interview</TabsTrigger>
                    <TabsTrigger value="documentation">Phase 3: Documentation</TabsTrigger>
                </TabsList>
                <TabsContent value="interview" className="mt-6">
                    <InterviewReviewForm 
                        candidateName={`${interviewCandidate.firstName} ${interviewCandidate.lastName}`}
                        onReviewSubmit={handleInterviewSubmit}
                    />
                </TabsContent>
                <TabsContent value="documentation" className="mt-6">
                    <DocumentationPhase candidateId={interviewCandidate.id} />
                </TabsContent>
            </Tabs>
        </div>
    );
}


export function CandidateView() {
    const [interviewCandidate, setInterviewCandidate] = useState<ApplicationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const loadData = useCallback(async () => {
        setLoading(true);
        const candidates = await getInterviewCandidates();
        // Display the most recent candidate set to interview
        setInterviewCandidate(candidates[0] || null);
        setLoading(false);
    }, []);

    useEffect(() => {
        startTransition(() => {
            loadData();
        });
    }, [loadData]);

    if (loading || isPending) {
        return (
            <div className="flex flex-1 items-center justify-center p-8">
                <Users className="h-12 w-12 text-muted-foreground animate-pulse" />
            </div>
        )
    }

    if (!interviewCandidate) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[200px]">
                <CardHeader className="p-0">
                    <div className="flex justify-center mb-4">
                        <Users className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <CardTitle className="font-headline text-xl">No Active Candidate for Interview</CardTitle>
                    <CardDescription>
                        Once a candidate is set for an interview, their progress will appear here.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0 mt-4">
                    <p className="text-sm text-muted-foreground">Go to the 'Candidates' section to select one for an interview.</p>
                </CardContent>
            </div>
        )
    }

    return <CandidateDetails interviewCandidate={interviewCandidate} />;
}
