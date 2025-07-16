import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentationPhase } from "@/components/dashboard/documentation-phase";
import { ProgressTracker } from "@/components/dashboard/progress-tracker";
import { CopyApplicationLink } from "@/components/dashboard/copy-link";
import { Suspense } from "react";
import { CandidateName } from "@/components/dashboard/candidate-name";
import { InterviewPhase } from "@/components/dashboard/interview-phase";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Suspense fallback={<h1 className="text-3xl font-headline font-bold text-foreground">New Candidate</h1>}>
            <CandidateName />
          </Suspense>
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
