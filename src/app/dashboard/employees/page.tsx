
import { getEmployees } from "@/app/actions/candidates";
import { CandidatesActions } from "@/app/dashboard/candidates/_components/candidates-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApplicationData } from "@/lib/schemas";
import { Briefcase } from "lucide-react";
import { format } from "date-fns";

// Helper to convert Firestore Timestamp to JS Date
function toDate(timestamp: any): Date | null {
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return null;
}

export default async function EmployeesPage() {
  const employees = await getEmployees();

  if (employees.length === 0) {
    return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-2 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-2xl font-bold tracking-tight">No Employees</h3>
                <p className="text-sm text-muted-foreground">
                    New hires marked as "Employee" will appear here.
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-headline font-bold text-foreground">Employees</h1>
      <Card>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Date Hired</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.map((employee: ApplicationData) => {
                        const hiredDate = toDate(employee.date);
                        return (
                            <TableRow key={employee.id}>
                                <TableCell className="font-medium">{employee.firstName} {employee.lastName}</TableCell>
                                <TableCell>{employee.position}</TableCell>
                                <TableCell>{hiredDate ? format(hiredDate, 'PPP') : 'N/A'}</TableCell>
                                <TableCell className="text-right space-x-2">
                                <CandidatesActions candidateId={employee.id} />
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
