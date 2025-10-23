
'use client';

import { ApplicationForm } from "@/components/dashboard/application-form";
import Image from "next/image";
import { getCompanies } from "@/app/actions/company-actions";
import { Company } from "@/lib/company-schemas";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";


export default function ApplicationPreviewPage() {
  const [company, setCompany] = useState<Partial<Company> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const companies = await getCompanies();
      if (companies && companies.length > 0) {
        setCompany(companies[0]);
      } else {
        setCompany({ name: "Your Company", logo: "https://placehold.co/150x50.png" });
      }
      setLoading(false);
    }
    loadSettings();
  }, []);


  if (loading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }
  
  const useTemplate = !company || !company.formCustomization || company.formCustomization === 'template';

  return (
    <div className="flex min-h-screen flex-col items-center bg-muted/40 p-4">
        <div className="fixed top-0 left-0 w-full bg-background/80 backdrop-blur-sm p-2 text-center text-sm font-semibold border-b shadow-sm z-20">
            PREVIEW MODE
        </div>
        <div className="w-full max-w-4xl mt-12">
            <div className="mb-8 flex flex-col items-center">
                <Image
                    src={company?.logo || 'https://placehold.co/150x50.png'}
                    alt={`${company?.name || 'Company'} Logo`}
                    width={150}
                    height={50}
                    className="mb-4 object-contain"
                    data-ai-hint="company logo"
                />
            <h1 className="font-headline text-3xl font-bold text-center">Candidate Application for {company?.name}</h1>
            <p className="text-muted-foreground text-center">Fill out the form below to apply.</p>
            </div>
            
            <div className="pointer-events-none opacity-70">
                {useTemplate ? (
                    <ApplicationForm companyName={company?.name || "Your Company"} />
                ) : (
                    <Card>
                        <CardContent className="p-2 md:p-4">
                             {(company?.phase1Images && company.phase1Images.length > 0) ? (
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
                                    {company.phase1Images.length > 1 && (
                                        <>
                                            <CarouselPrevious className="ml-12" />
                                            <CarouselNext className="mr-12" />
                                        </>
                                    )}
                                </Carousel>
                             ) : (
                                <div className="text-center py-20 text-muted-foreground">
                                    No custom form images have been uploaded.
                                </div>
                             )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    </div>
  );
}
