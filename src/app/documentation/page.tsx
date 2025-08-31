
import { DocumentationForm } from "@/components/dashboard/documentation-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Image from "next/image";
import { getCompanies } from "@/app/actions/company-actions";
import { supabase } from "@/lib/supabaseClient";
import { Company } from "@/lib/company-schemas";

async function getCompanyForDocumentation(companyId?: string): Promise<Partial<Company>> {
    if (!companyId) return { name: "Company", logo: "https://placehold.co/150x50.png" };

    const companies = await getCompanies();
    // In a multi-company setup, we'd find the specific one. For now, we find the one that matches the slug.
    const company = companies.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === companyId);
    
    if (company) {
         if (company.logo && !company.logo.startsWith('http')) {
            const { data } = await supabase.storage.from('logos').createSignedUrl(company.logo, 3600);
            return { ...company, logo: data?.signedUrl || null };
        }
        return company;
    }
    
    return { name: "Company", logo: "https://placehold.co/150x50.png" };
}


export default async function DocumentationPage({ searchParams }: { searchParams: { candidateId?: string, company?: string } }) {
  const { candidateId, company: companyId } = searchParams;
  const company = await getCompanyForDocumentation(companyId);
  
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
          <h1 className="font-headline text-3xl font-bold text-center">Detailed Documentation</h1>
          <p className="text-muted-foreground text-center">Please upload the required documents for {company.name}.</p>
        </div>
        
        {candidateId ? (
          <DocumentationForm company={company.name || ''} candidateId={candidateId} />
        ) : (
          <Card className="w-full max-w-lg mx-auto text-center">
            <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                    <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
              <CardTitle className="font-headline text-2xl mt-4">Invalid Link</CardTitle>
              <CardDescription>
                This documentation link is missing a candidate identifier. Please use the unique link provided by HR.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please contact the hiring manager.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
