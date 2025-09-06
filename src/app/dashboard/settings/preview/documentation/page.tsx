
"use client";

import { I9Form } from "@/components/dashboard/i9-form";
import { getCompanies } from "@/app/actions/company-actions";
import { Company } from "@/lib/company-schemas";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";


export default function DocumentationPreviewPage() {
  const [company, setCompany] = useState<Partial<Company> | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Create a dummy form instance for preview purposes.
  // This is required to provide context to the form components inside I9Form.
  const form = useForm();

  useEffect(() => {
    async function loadSettings() {
      const companies = await getCompanies();
      if (companies && companies.length > 0) {
        setCompany(companies[0]);
      } else {
        // Provide a default object for the preview if no company is configured
        setCompany({ name: "Your Company Name", address: "Your Company Address" });
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 relative">
        <div className="fixed top-0 left-0 w-full bg-background/80 backdrop-blur-sm p-2 text-center text-sm font-semibold border-b shadow-sm z-20">
            PREVIEW MODE
        </div>
        <div className="w-full max-w-4xl z-10 pointer-events-none opacity-70 mt-12">
            <h1 className="text-2xl font-bold text-center mb-4">Form I-9 Preview</h1>
            <p className="text-muted-foreground text-center mb-8">This is what the candidate will see when asked to fill out the form digitally.</p>
            <Form {...form}>
                <form>
                    <I9Form form={form} companyData={company} />
                </form>
            </Form>
        </div>
    </div>
  );
}

    