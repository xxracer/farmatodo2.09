
'use client';

import { getCandidate, updateCandidateStatus } from "@/app/actions/client-actions";
import { ApplicationView } from "@/components/dashboard/application-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ApplicationData } from "@/lib/schemas";
import { Briefcase, Printer, UserCheck, UserSearch, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function ApplicationViewPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const candidateId = searchParams.get('id');

    const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        if (candidateId) {
            setLoading(true);
            const data = await getCandidate(candidateId);
            setApplicationData(data);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [candidateId]);

    useEffect(() => {
        loadData();
        
        window.addEventListener('storage', loadData);
        return () => {
          window.removeEventListener('storage', loadData);
        };
    }, [loadData]);

    const handleSetToInterview = async (id: string) => {
        const result = await updateCandidateStatus(id, 'interview');
        if (result.success) {
            router.push('/dashboard');
        }
        // Handle error case if needed
    }

    const handleMarkAsNewHire = async (id: string) => {
        const result = await updateCandidateStatus(id, 'new-hire');
        if (result.success) {
            router.push('/dashboard/new-hires');
        }
        // Handle error case if needed
    }

    const handleMarkAsEmployee = async (id: string) => {
        const result = await updateCandidateStatus(id, 'employee');
        if (result.success) {
            router.push('/dashboard/employees');
        }
        // Handle error case if needed
    }

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <UserSearch className="h-12 w-12 text-muted-foreground animate-pulse" />
            </div>
        );
    }
    
    if (!applicationData) {
        return (
             <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full">
                <Card className="w-full max-w-lg text-center">
                    <CardHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <UserSearch className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardTitle className="font-headline text-2xl mt-4">No Application Data Found</CardTitle>
                        <CardDescription>
                           Could not find application data. The link may be invalid or the candidate was deleted.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/dashboard/candidates">Back to Candidates</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const isCandidate = applicationData.status === 'candidate';
    const isNewHire = applicationData.status === 'new-hire';
    const isEmployee = applicationData.status === 'employee';

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                 <h1 className="text-3xl font-headline font-bold text-foreground">
                    Viewing Application: {applicationData.firstName} {applicationData.lastName}
                </h1>
                <div className="flex gap-2">
                     <Button variant="outline">
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    {isCandidate && (
                        <>
                            <Button onClick={() => handleSetToInterview(applicationData.id)}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Set to Interview
                            </Button>
                            <Button onClick={() => handleMarkAsNewHire(applicationData.id)}>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Mark as New Hire
                            </Button>
                        </>
                    )}
                    {isNewHire && (
                        <Button onClick={() => handleMarkAsEmployee(applicationData.id)}>
                            <Briefcase className="mr-2 h-4 w-4" />
                            Mark as Employee
                        </Button>
                    )}
                    <Button asChild variant="outline">
                       {isEmployee ? <Link href="/dashboard/employees">Back to Employees</Link> : isNewHire ? <Link href="/dashboard/new-hires">Back to New Hires</Link> : <Link href="/dashboard/candidates">Back to Candidates</Link>}
                    </Button>
                </div>
            </div>
            <ApplicationView data={applicationData} />
        </div>
    );
}
