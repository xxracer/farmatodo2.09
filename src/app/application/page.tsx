import { ApplicationForm } from "@/components/dashboard/application-form";
import { ClipboardCheck } from "lucide-react";

export default function ApplicationPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 flex flex-col items-center">
          <ClipboardCheck className="mb-4 h-12 w-12 text-primary" />
          <h1 className="font-headline text-3xl font-bold text-center">Candidate Application</h1>
          <p className="text-muted-foreground text-center">Fill out the form below to apply.</p>
        </div>
        <ApplicationForm />
      </div>
    </div>
  );
}
