
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CandidateView } from "@/components/dashboard/candidate-view";
import { Settings, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // In a real multi-tenant app, you'd fetch company settings from a database.
    // We simulate this by checking localStorage.
    const settings = localStorage.getItem('companySettings');
    if (settings) {
      setIsConfigured(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
        <p className="ml-4 text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!isConfigured) {
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

  return <CandidateView />;
}
