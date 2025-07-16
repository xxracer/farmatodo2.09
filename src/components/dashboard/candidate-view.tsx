"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentationPhase } from "@/components/dashboard/documentation-phase";
import { ProgressTracker } from "@/components/dashboard/progress-tracker";
import { CopyApplicationLink } from "@/components/dashboard/copy-link";
import { CandidateName } from "@/components/dashboard/candidate-name";
import { InterviewPhase } from "@/components/dashboard/interview-phase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ClipboardCheck } from "lucide-react";

export function CandidateView() {
    const [hasCandidate, setHasCandidate] = useState(false);

    useEffect(() => {
        // Using localStorage to persist state for prototype purposes
        const name = localStorage.getItem("candidateName");
        if (name) {
            setHasCandidate(true);
        }

        // Listen for storage changes to update the view in real-time if the form is submitted in another tab
        const handleStorageChange = () => {
            const name = localStorage.getItem("candidateName");
            setHasCandidate(!!name);
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };

    }, []);

    if (!hasCandidate) {
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
                        <CardTitle className="font-headline text-2xl">No Active Candidate</CardTitle>
                        <CardDescription>
                            Once a candidate submits an application, their details and progress will appear here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <p className="text-sm text-muted-foreground">Use the button above to copy and share the application link.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                   <CandidateName />
                    <p className="text-muted-foreground">
                        Complete the steps below to onboard the new candidate.
                    </p>
                </div>
                <CopyApplicationLink />
            </div>

            <ProgressTracker />

            <Tabs defaultValue="interview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                    <TabsTrigger value="interview">Phase 2: Interview</TabsTrigger>
                    <TabsTrigger value="documentation">Phase 3: Documentation</TabsTrigger>
                </TabsList>
                <TabsContent value="interview" className="mt-6">
                    <InterviewPhase />
                </TabsContent>
                <TabsContent value="documentation" className="mt-6">
                    <DocumentationPhase />
                </TabsContent>
            </Tabs>
        </div>
    );
}
