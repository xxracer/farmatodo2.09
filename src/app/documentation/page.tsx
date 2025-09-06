
'use client';

import { DocumentationForm } from "@/components/dashboard/documentation-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Loader2 } from "lucide-react";
import Image from "next/image";
import { getCompanies } from "@/app/actions/company-actions";
import { supabase } from "@/lib/supabaseClient";
import { Company, RequiredDoc } from "@/lib/company-schemas";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";


async function getSignedUrl(path: string | null | undefined) {    
    if (!path || path.startsWith('http')) return path;
    const { data } = await supabase.storage.from('logos').createSignedUrl(path, 3600);
    return data?.signedUrl || path;
}


function DocumentationPageContent() {
    const searchParams = useSearchParams();
    // We will use a dummy candidateId for this simulation
    const candidateId = searchParams.get('candidateId') || 'simulated-candidate-123';
    const companyId = searchParams.get('company');

    const [company, setCompany] = useState<Partial<Company> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getCompanyForDocumentation(): Promise<Partial<Company>> {
            // --- SIMULATION ---
            // Instead of fetching from DB, we are hardcoding the requested company data.
            const simulatedCompany: Partial<Company> = {
                name: "licoreria",
                address: "antimano",
                logo: "https://placehold.co/150x50.png",
                // We force the required documents to ensure the I-9 is shown.
                requiredDocs: [
                    { id: "i9", label: "Form I-9", type: "digital" }
                ]
            };
            
            return simulatedCompany;
        }

        async function loadData() {
            setLoading(true);
            const companyData = await getCompanyForDocumentation();
            setCompany(companyData);
            setLoading(false);
        }

        loadData();
    }, [companyId]);

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const requiredDocs = company?.requiredDocs || [];

    return (
        <div className="flex min-h-screen flex-col items-center bg-background p-4">
            <div className="w-full max-w-4xl">
                <div className="mb-8 flex flex-col items-center">
                    {company?.logo && (
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
                <p className="text-muted-foreground text-center">Please upload or fill out the required documents for {company?.name}.</p>
                </div>
                
                {candidateId ? (
                <DocumentationForm 
                    companyName={company?.name || ''} 
                    candidateId={candidateId} 
                    requiredDocs={requiredDocs}
                    companyData={company} 
                />
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

export default function DocumentationPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <DocumentationPageContent />
        </Suspense>
    );
}
