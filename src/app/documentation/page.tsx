
'use client';

import { DocumentationForm } from "@/components/dashboard/documentation-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Loader2 } from "lucide-react";
import Image from "next/image";
import { getCompanies } from "@/app/actions/company-actions";
import { Company, OnboardingProcess, RequiredDoc } from "@/lib/company-schemas";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { getFile } from "../actions/kv-actions";


function DocumentationPageContent() {
    const searchParams = useSearchParams();
    const candidateId = searchParams.get('candidateId');
    const companyIdFromUrl = searchParams.get('company'); // This is a slug like 'licoreria'

    const [company, setCompany] = useState<Partial<Company> | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [process, setProcess] = useState<Partial<OnboardingProcess> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const companies = await getCompanies();
            let foundCompany: Company | null = null;
            let foundProcess: OnboardingProcess | null = null;

            if (companyIdFromUrl) {
                // Find the company whose name, when slugified, matches the URL parameter
                foundCompany = companies.find(
                    c => c.name?.toLowerCase().replace(/\s+/g, '-') === companyIdFromUrl
                ) || null;
                // For documentation, we assume it's linked to the first available process.
                // A more robust solution might pass a processId as well.
                if (foundCompany) {
                    foundProcess = foundCompany.onboardingProcesses?.[0] || null;
                }
            } else if (companies.length > 0) {
                 // Fallback to the first company if no companyId is in the URL
                foundCompany = companies[0];
                foundProcess = foundCompany.onboardingProcesses?.[0] || null;
            }

            setCompany(foundCompany);
            setProcess(foundProcess);
            
            if (foundCompany?.logo) {
                const url = await getFile(foundCompany.logo);
                setLogoUrl(url);
            } else {
                setLogoUrl(null);
            }

            setLoading(false);
        }

        loadData();
    }, [companyIdFromUrl]);

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!company) {
         return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
                <Card className="w-full max-w-lg mx-auto text-center">
                    <CardHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                        </div>
                    <CardTitle className="font-headline text-2xl mt-4">Company Not Found</CardTitle>
                    <CardDescription>
                        The company specified in the link could not be found. Please check the URL.
                    </CardDescription>
                    </CardHeader>
                </Card>
            </div>
         )
    }

    const requiredDocs: RequiredDoc[] = process?.requiredDocs || [];

    return (
        <div className="flex min-h-screen flex-col items-center bg-background p-4">
            <div className="w-full max-w-4xl">
                <div className="mb-8 flex flex-col items-center">
                    {logoUrl && (
                    <Image
                        src={logoUrl}
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
