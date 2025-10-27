
'use client';

import { useEffect, useState } from 'react';
import { CandidateView } from "@/components/dashboard/candidate-view";
import { Settings, Loader2, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getCompanies } from '../actions/company-actions';
import { type Company } from '@/lib/company-schemas';
import { CopyApplicationLink } from '@/components/dashboard/copy-link';


export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    async function checkConfiguration() {
        setLoading(true);
        try {
            const companies = await getCompanies();
            setCompany(companies[0] || null);
        } catch (error) {
            console.error("Failed to load company data", error);
            setCompany(null);
        } finally {
            setLoading(false);
        }
    }
    checkConfiguration();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
        <p className="ml-4 text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!company) {
    return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full">
            <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Settings className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="font-headline text-2xl mt-4">Welcome to Onboard Panel!</CardTitle>
                    <CardDescription>
                       To get started, you need to set up your company profile. This will customize the application portal for your candidates.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/dashboard/settings">Go to Settings</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
  }

  const onboardingProcesses = company.onboardingProcesses || [];

  return (
    <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-headline font-bold text-foreground">Welcome to the Onboard Panel</h1>
                <p className="text-muted-foreground">
                    Manage candidates or share application links to start onboarding.
                </p>
            </div>
        </div>

        {onboardingProcesses.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5" />
                        Application Links
                    </CardTitle>
                    <CardDescription>
                        Share these links with candidates to start a specific onboarding process.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {onboardingProcesses.map(process => (
                        <div key={process.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                            <span className="font-medium">{process.name}</span>
                            <CopyApplicationLink 
                                processId={process.id}
                                processName={process.name}
                            />
                        </div>
                    ))}
                    {onboardingProcesses.length > 1 && (
                         <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 border-t mt-2 pt-3">
                            <span className="font-medium text-muted-foreground">Generic Application</span>
                             <CopyApplicationLink />
                         </div>
                    )}
                </CardContent>
            </Card>
        )}

        {onboardingProcesses.length === 0 && (
            <div className="flex items-center justify-between rounded-lg border p-4">
                 <div>
                    <p className="font-medium">Generic Application Link</p>
                    <p className="text-sm text-muted-foreground">
                        No onboarding processes configured. This link uses the default application.
                    </p>
                 </div>
                 <CopyApplicationLink />
            </div>
        )}

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">
                    Active Candidate Pipeline
                </CardTitle>
                 <CardDescription>
                    Track candidates currently in the interview or documentation phase.
                </CardDescription>
            </CardHeader>
             <CardContent>
                <CandidateView />
            </CardContent>
        </Card>
    </div>
  );
}
