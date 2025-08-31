
import { ApplicationForm } from "@/components/dashboard/application-form";
import { getCompanies } from "@/app/actions/company-actions";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Company } from "@/lib/company-schemas";

async function getFirstCompany(): Promise<Partial<Company>> {
    const companies = await getCompanies();
    if (companies && companies.length > 0) {
        const firstCompany = companies[0];
        if (firstCompany.logo && !firstCompany.logo.startsWith('http')) {
            const { data } = await supabase.storage.from('logos').createSignedUrl(firstCompany.logo, 3600);
            return { ...firstCompany, logo: data?.signedUrl || null };
        }
        return firstCompany;
    }
    return { name: "Company", logo: "https://placehold.co/150x50.png" };
}

export default async function ApplicationPage() {
  const company = await getFirstCompany();

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 flex flex-col items-center">
            {company.logo && (
              <Image
                  src={company.logo}
                  alt={`${company.name} Logo`}
                  width={150}
                  height={50}
                  className="mb-4 object-contain"
                  data-ai-hint="company logo"
              />
            )}
          <h1 className="font-headline text-3xl font-bold text-center">Candidate Application for {company.name}</h1>
          <p className="text-muted-foreground text-center">Fill out the form below to apply.</p>
        </div>
        <ApplicationForm companyName={company.name || 'Default Company'} />
      </div>
    </div>
  );
}
