
import { ApplicationForm } from "@/components/dashboard/application-form";
import Image from "next/image";

// In a real scenario, this would be dynamically fetched from settings
const company = {
  name: "Your Company",
  logo: "https://placehold.co/150x50.png",
  hint: "company logo"
};

export default function ApplicationPreviewPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-muted/40 p-4">
        <div className="fixed top-0 left-0 w-full bg-background/80 backdrop-blur-sm p-2 text-center text-sm font-semibold border-b shadow-sm">
            PREVIEW MODE
        </div>
        <div className="w-full max-w-4xl mt-12">
            <div className="mb-8 flex flex-col items-center">
                <Image
                    src={company.logo}
                    alt={`${company.name} Logo`}
                    width={150}
                    height={50}
                    className="mb-4 object-contain"
                    data-ai-hint={company.hint}
                />
            <h1 className="font-headline text-3xl font-bold text-center">Candidate Application</h1>
            <p className="text-muted-foreground text-center">Fill out the form below to apply.</p>
            </div>
            <div className="pointer-events-none opacity-70">
                 <ApplicationForm />
            </div>
        </div>
    </div>
  );
}

