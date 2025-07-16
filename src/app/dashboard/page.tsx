import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentationPhase } from "@/components/dashboard/documentation-phase";
import { ProgressTracker } from "@/components/dashboard/progress-tracker";
import { CopyApplicationLink } from "@/components/dashboard/copy-link";
import { Suspense } from "react";
import { CandidateView } from "@/components/dashboard/candidate-view";
import { InterviewPhase } from "@/components/dashboard/interview-phase";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="space-y-8">Loading...</div>}>
      <CandidateView />
    </Suspense>
  );
}
