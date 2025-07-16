import { ApplicationForm } from "@/components/dashboard/application-form";
import Image from "next/image";

type CompanyInfo = {
  name: string;
  logo: string;
  hint: string;
};

const companyDetails: Record<string, CompanyInfo> = {
  "central-home-texas": { name: "Central Home Texas", logo: "https://static.wixstatic.com/media/c5947c_6d477e7f7f0d4e78af2b7d14a7013825~mv2.jpg", hint: "company logo" },
  lifecare: { name: "Lifecare", logo: "https://static.wixstatic.com/media/c5947c_63b4f7e57d284143872826e9176b0448~mv2.jpg", hint: "healthcare logo" },
  "noble-health": { name: "Noble Health", logo: "https://static.wixstatic.com/media/c5947c_b368149f9fad4a548d3266fd4e26cae9~mv2.jpg", hint: "health logo" },
  default: { name: "Onboard Panel", logo: "https://placehold.co/150x50.png", hint: "generic logo" },
};


export default function ApplicationPage({ searchParams }: { searchParams: { company?: string } }) {
  const companyKey = searchParams.company || "default";
  const company = companyDetails[companyKey] || companyDetails.default;

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
          <h1 className="font-headline text-3xl font-bold text-center">Candidate Application</h1>
          <p className="text-muted-foreground text-center">Fill out the form below to apply.</p>
        </div>
        <ApplicationForm />
      </div>
    </div>
  );
}
