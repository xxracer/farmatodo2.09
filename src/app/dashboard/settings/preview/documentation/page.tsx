
"use client";

import { getCompanies } from "@/app/actions/company-actions";
import { Company } from "@/lib/company-schemas";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Form, FormProvider, useForm } from "react-hook-form";


function I9FormPreview({ companyData }: { companyData: Partial<Company> | null }) {
    // Dummy form for preview purposes to satisfy the FormProvider context
    const form = useForm();
    
    return (
        <FormProvider {...form}>
            <Card className="border">
                <CardHeader>
                    <CardTitle className="font-headline">Form I-9: Employment Eligibility Verification</CardTitle>
                    <CardDescription>
                        This is a preview of the system-generated form. The candidate will be able to fill out the fields directly. The employer information below is pre-filled based on your settings.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full">
                        {/* Using a static image of the form as a background */}
                        <Image
                            src="/images/form-i9.png"
                            alt="Form I-9"
                            width={2000}
                            height={2588}
                            priority
                            className="w-full h-auto"
                            data-ai-hint="document form"
                        />
                        
                        {/* Overlay for Employer's Business Name */}
                        <div
                            className="absolute"
                            style={{
                                top: '73.2%', 
                                left: '11.8%',
                                width: '45.5%',
                                height: '2.5%'
                            }}
                        >
                            <Input
                                className="bg-blue-100/50 border-blue-300 text-sm h-full"
                                readOnly
                                value={companyData?.name || "Your Company Name"}
                            />
                        </div>

                        {/* Overlay for Employer's Address */}
                        <div
                            className="absolute"
                            style={{
                                top: '73.2%',
                                left: '58.8%',
                                width: '38.2%',
                                height: '2.5%'
                            }}
                        >
                            <Input
                                className="bg-blue-100/50 border-blue-300 text-sm h-full"
                                readOnly
                                value={companyData?.address || "Your Company Address"}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </FormProvider>
    );
}


export default function DocumentationPreviewPage() {
  const [company, setCompany] = useState<Partial<Company> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const companies = await getCompanies();
        if (companies && companies.length > 0) {
          setCompany(companies[0]);
        } else {
          setCompany({ name: "Your Company Name", address: "Your Company Address" });
        }
      } catch (error) {
        console.error("Failed to load company settings:", error);
        setCompany({ name: "Your Company Name", address: "Your Company Address" });
      } finally {
        setLoading(false);
      }
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

  return (
    <div className="flex min-h-screen flex-col items-center bg-muted/40 p-4 relative">
        <div className="fixed top-0 left-0 w-full bg-background/80 backdrop-blur-sm p-2 text-center text-sm font-semibold border-b shadow-sm z-20">
            PREVIEW MODE
        </div>
        <div className="w-full max-w-4xl z-10 mt-12">
            <I9FormPreview companyData={company} />
        </div>
    </div>
  );
}
