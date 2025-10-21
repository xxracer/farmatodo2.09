
import { ApplicationForm } from "@/components/dashboard/application-form";
import { getCompanies } from "@/app/actions/company-actions";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Company } from "@/lib/company-schemas";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { notFound } from "next/navigation";


async function getFirstCompany(): Promise<Partial<Company>> {
    const companies = await getCompanies();
    if (companies && companies.length > 0) {
        const firstCompany = companies[0];

        // Fetch signed URL for logo
        if (firstCompany.logo && !firstCompany.logo.startsWith('http')) {
            const { data } = await supabase.storage.from('logos').createSignedUrl(firstCompany.logo, 3600);
            firstCompany.logo = data?.signedUrl || null;
        }

        // Fetch signed URLs for phase 1 images
        if (firstCompany.phase1Images && firstCompany.phase1Images.length > 0) {
            const urls = await Promise.all(firstCompany.phase1Images.map(async p => {
                if (p && !p.startsWith('http')) {
                    const { data } = await supabase.storage.from('forms').createSignedUrl(p, 3600);
                    return data?.signedUrl;
                }
                return p;
            }));
            firstCompany.phase1Images = urls.filter(Boolean) as string[];
        }
        
        return firstCompany;
    }
    // If no company is configured, we can't show an application form.
    // In a real app you might redirect or show a generic "not found" page.
    return { name: "Company", logo: "https://placehold.co/150x50.png" };
}

export default async function ApplicationPage() {
  const company = await getFirstCompany();

  if (!company.name) {
    notFound();
  }

  const useTemplate = !company.formCustomization || company.formCustomization === 'template';

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
        
        {useTemplate ? (
            <ApplicationForm companyName={company.name || 'Default Company'} />
        ) : (
             <Card>
                <CardContent className="p-2 md:p-4">
                     {company.phase1Images && company.phase1Images.length > 0 ? (
                        <Carousel className="w-full">
                            <CarouselContent>
                                {company.phase1Images.map((url, index) => (
                                    <CarouselItem key={index}>
                                        <Image
                                            src={url}
                                            alt={`Application form page ${index + 1}`}
                                            width={800}
                                            height={1100}
                                            className="w-full h-auto rounded-md object-contain"
                                        />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>
                     ) : (
                        <div className="text-center py-20 text-muted-foreground">
                            The application form for this company is not available at the moment.
                        </div>
                     )}
                     <div className="text-center text-sm text-muted-foreground p-4 border-t mt-4">
                         Since this is a custom form, please contact the company directly to submit your application.
                     </div>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
