"use client";

import { useEffect, useState } from "react";
import { ApplicationView } from "@/components/dashboard/application-view";
import { type ApplicationData } from "@/lib/schemas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSearch } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

export default function ApplicationViewPage() {
    const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();

    useEffect(() => {
        const candidateId = searchParams.get('id');
        let dataToView: ApplicationData | null = null;

        if (candidateId) {
            const dataList = localStorage.getItem("candidateApplicationDataList");
            if (dataList) {
                const candidates: ApplicationData[] = JSON.parse(dataList);
                dataToView = candidates.find(c => c.id === candidateId) || null;
            }
        } else {
             const data = localStorage.getItem("candidateApplicationData");
             if (data) {
                dataToView = JSON.parse(data);
             }
        }
        
        setApplicationData(dataToView);
        setIsLoading(false);
    }, [searchParams]);

    if (isLoading) {
        return <div className="p-8 text-center">Loading application data...</div>;
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
                            There is no submitted application data to display. Please ensure a candidate has applied.
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
                <Button asChild variant="outline">
                    <Link href="/dashboard/candidates">Back to Candidates</Link>
                </Button>
            </div>
            <ApplicationView data={applicationData} />
        </div>
    );
}
