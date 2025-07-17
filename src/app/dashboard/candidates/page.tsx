
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { type ApplicationData } from "@/lib/schemas";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCandidates } from "@/app/actions/candidates";
import { CandidatesActions } from "./_components/candidates-actions";

export default async function CandidatesPage() {
  const candidates = await getCandidates();

  if (candidates.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full">
        <div className="flex flex-col items-center gap-2 text-center">
          <Users className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-2xl font-bold tracking-tight">No Candidates Yet</h3>
          <p className="text-sm text-muted-foreground">
            When a candidate applies, they will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-headline font-bold text-foreground">Candidates</h1>
      <Card>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Applying For</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {candidates.map((candidate) => (
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
