
import { getNewHires } from "@/app/actions/candidates";
import { CandidatesActions } from "@/app/dashboard/candidates/_components/candidates-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApplicationData } from "@/lib/schemas";
import { UserCheck } from "lucide-react";

export default async function NewHiresPage() {
  const newHires = await getNewHires();

  if (newHires.length === 0) {
    return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-2 text-center">
                <UserCheck className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-2xl font-bold tracking-tight">No New Hires</h3>
                <p className="text-sm text-muted-foreground">
                    Candidates marked as "New Hire" will appear here.
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-headline font-bold text-foreground">New Hires</h1>
      <Card>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Applying For</TableHead>
                        <TableHead>Date Applied</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {newHires.map((candidate: ApplicationData) => (
                        <TableRow key={candidate.id}>
                            <TableCell className="font-medium">{candidate.firstName} {candidate.lastName}</TableCell>
                            <TableCell>{candidate.applyingFor.join(', ')}</TableCell>
                            <TableCell>{candidate.date}</TableCell>
                            <TableCell className="text-right space-x-2">
                               <CandidatesActions candidateId={candidate.id} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
