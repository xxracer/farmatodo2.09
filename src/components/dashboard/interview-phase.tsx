import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export function InterviewPhase() {
  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline">Interview</CardTitle>
            <CardDescription>Manage the candidate's interview process.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold tracking-tight">Interview Form</h3>
                <p className="text-sm text-muted-foreground">
                    This section is under construction. The HR interview form will be added here.
                </p>
            </div>
        </CardContent>
    </Card>
  );
}
