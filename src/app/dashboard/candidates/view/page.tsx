
import { getCandidate, updateCandidateStatus } from "@/app/actions/candidates";
import { ApplicationView } from "@/components/dashboard/application-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ApplicationData } from "@/lib/schemas";
import { Briefcase, UserCheck, UserSearch } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

async function handleMarkAsNewHire(candidateId: string) {
    'use server';
    const result = await updateCandidateStatus(candidateId, 'new-hire');
    if (result.success) {
        redirect('/dashboard/new-hires');
    }
    // Handle error case if needed
}

async function handleMarkAsEmployee(candidateId: string) {
    'use server';
    const result = await updateCandidateStatus(candidateId, 'employee');
    if (result.success) {
        redirect('/dashboard/employees');
    }
    // Handle error case if needed
}

// Helper to convert Firestore Timestamps to ISO strings for serialization
function serializeDates(data: ApplicationData): ApplicationData {
    const toISODate = (timestamp: any): string | undefined => {
        if (!timestamp) return undefined;
        if (typeof timestamp.toDate === 'function') {
            return timestamp.toDate().toISOString();
        }
        if (timestamp instanceof Date) {
            return timestamp.toISOString();
        }
        return timestamp; // Assume it's already a string
    };
    
    return {
        ...data,
        date: toISODate(data.date) as any, // Cast to any to satisfy the type temporarily
        driversLicenseExpiration: toISODate(data.driversLicenseExpiration) as any,
        employmentHistory: data.employmentHistory.map(job => ({
            ...job,
            dateFrom: toISODate(job.dateFrom) as any,
            dateTo: toISODate(job.dateTo) as any,
        })),
    };
}

export default async function ApplicationViewPage({ searchParams }: { searchParams: { id?: string } }) {
    const candidateId = searchParams.id;
    let applicationData: ApplicationData | null = null;

    if (candidateId) {
        applicationData = await getCandidate(candidateId);
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

    const serializableData = serializeDates(applicationData);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                 <h1 className="text-3xl font-headline font-bold text-foreground">
                    Viewing Application: {applicationData.firstName} {applicationData.lastName}
                </h1>
                <div className="flex gap-2">
                    {isCandidate && (
                        <form action={handleMarkAsNewHire.bind(null, applicationData.id)}>
                            <Button type="submit">
                                <UserCheck className="mr-2 h-4 w-4" />
                                Mark as New Hire
                            </Button>
                        </form>
                    )}
                    {isNewHire && (
                         <form action={handleMarkAsEmployee.bind(null, applicationData.id)}>
                            <Button type="submit">
                                <Briefcase className="mr-2 h-4 w-4" />
                                Mark as Employee
                            </Button>
                        </form>
                    )}
                    <Button asChild variant="outline">
                       {isEmployee ? <Link href="/dashboard/employees">Back to Employees</Link> : isNewHire ? <Link href="/dashboard/new-hires">Back to New Hires</Link> : <Link href="/dashboard/candidates">Back to Candidates</Link>}
                    </Button>
                </div>
            </div>
            <ApplicationView data={serializableData} />
        </div>
    );
}
