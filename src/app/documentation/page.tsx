import { DocumentationForm } from "@/components/dashboard/documentation-form";
import Image from "next/image";

// Company details will eventually be fetched from settings.
const company = {
  name: "Company",
  logo: "https://placehold.co/150x50.png",
  hint: "company logo"
};


export default function DocumentationPage({ searchParams }: { searchParams: { candidateId?: string } }) {
  const candidateId = searchParams.candidateId;
  
  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 flex flex-col items-center">
            <Image 
                src={company.logo} 
                alt={`${company.name} Logo`}
                width={150}
                height={50}
                className="mb-4 object-contain"
                data-ai-hint={company.hint}
            />
          <h1 className="font-headline text-3xl font-bold text-center">Detailed Documentation</h1>
          <p className="text-muted-foreground text-center">Please upload the required documents for {company.name}.</p>
        </div>
        <DocumentationForm company={company.name} candidateId={candidateId} />
      </div>
    </div>
  );
}
