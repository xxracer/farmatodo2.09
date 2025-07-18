
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentationPhase } from "@/components/dashboard/documentation-phase";
import { ProgressTracker } from "@/components/dashboard/progress-tracker";
import { CopyApplicationLink } from "@/components/dashboard/copy-link";
import { InterviewPhase } from "@/components/dashboard/interview-phase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ClipboardCheck, Users } from "lucide-react";
import { getInterviewCandidates } from "@/app/actions/client-actions";
import { useEffect, useState, useCallback } from "react";
import type { ApplicationData } from "@/lib/schemas";
import { CandidateName } from "./candidate-name";

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
               <CandidateName />
                <CopyApplicationLink />
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
                    <InterviewPhase 
                        candidateName={`${interviewCandidate.firstName} ${interviewCandidate.lastName}`}
                        onReviewSubmit={handleInterviewSubmit}
                    />
                </TabsContent>
                <TabsContent value="documentation" className="mt-6">
                    <DocumentationPhase candidateId={interviewCandidate.id} candidateProfile="" submittedDocuments={[]} />
                </TabsContent>
            </Tabs>
        </div>
    );
}


export function CandidateView() {
    const [interviewCandidate, setInterviewCandidate] = useState<ApplicationData | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        const candidates = await getInterviewCandidates();
        // Display the most recent candidate set to interview
        setInterviewCandidate(candidates[0] || null);
        setLoading(false);
    }, []);

    useEffect(() => {
        loadData();

        const handleStorageChange = () => {
            loadData();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadData]);

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <Users className="h-12 w-12 text-muted-foreground animate-pulse" />
            </div>
        )
    }

    if (!interviewCandidate) {
        return (
            <div className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-headline font-bold text-foreground">Welcome to the Onboard Panel</h1>
                         <p className="text-muted-foreground">
                            Share the application link to start onboarding a new candidate.
                        </p>
                    </div>
                    <CopyApplicationLink />
                </div>
                <Card className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px]">
                    <CardHeader>
                        <div className="flex justify-center mb-4">
                            <ClipboardCheck className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <CardTitle className="font-headline text-2xl">No Active Candidate for Interview</CardTitle>
                        <CardDescription>
                            Once a candidate is set for an interview, their progress will appear here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <p className="text-sm text-muted-foreground">Go to the 'Candidates' section to select one for an interview.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return <CandidateDetails interviewCandidate={interviewCandidate} />;
}
