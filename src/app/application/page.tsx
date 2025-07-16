import { ApplicationForm } from "@/components/dashboard/application-form";
import Image from "next/image";

export default function ApplicationPage() {

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 flex flex-col items-center">
            <Image
                src="https://placehold.co/150x50.png"
                alt="Company Logo"
                width={150}
                height={50}
                className="mb-4 object-contain"
                data-ai-hint="generic logo"
            />
          <h1 className="font-headline text-3xl font-bold text-center">Candidate Application</h1>
          <p className="text-muted-foreground text-center">Fill out the form below to apply.</p>
        </div>
        <ApplicationForm />
      </div>
    </div>
  );
}
