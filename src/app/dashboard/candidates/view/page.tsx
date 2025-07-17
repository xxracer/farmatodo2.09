
import { getCandidate, updateCandidateStatus } from "@/app/actions/candidates";
import { ApplicationView } from "@/components/dashboard/application-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ApplicationData } from "@/lib/schemas";
import { UserCheck, UserSearch } from "lucide-react";
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                 <h1 className="text-3xl font-headline font-bold text-foreground">
                    Viewing Application: {applicationData.firstName} {applicationData.lastName}
                </h1>
                <div className="flex gap-2">
                    <form action={handleMarkAsNewHire.bind(null, applicationData.id)}>
                        <Button type="submit">
                            <UserCheck className="mr-2 h-4 w-4" />
                            Mark as New Hire
                        </Button>
                    </form>
                    <Button asChild variant="outline">
                        <Link href="/dashboard/candidates">Back to Candidates</Link>
                    </Button>
                </div>
            </div>
            <ApplicationView data={applicationData} />
        </div>
    );
}
