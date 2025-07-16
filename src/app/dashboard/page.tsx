import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplicationForm } from "@/components/dashboard/application-form";
import { DocumentationPhase } from "@/components/dashboard/documentation-phase";
import { ProgressTracker } from "@/components/dashboard/progress-tracker";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-foreground">
          New Candidate: Jane Doe
        </h1>
        <p className="text-muted-foreground">
          Complete the steps below to onboard the new candidate.
        </p>
      </div>
      
      <ProgressTracker />

      <Tabs defaultValue="application" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="application">Phase 1: Application</TabsTrigger>
          <TabsTrigger value="documentation">Phase 2: Documentation</TabsTrigger>
        </TabsList>
        <TabsContent value="application" className="mt-6">
          <ApplicationForm />
        </TabsContent>
        <TabsContent value="documentation" className="mt-6">
          <DocumentationPhase />
        </TabsContent>
      </Tabs>
    </div>
  );
}
