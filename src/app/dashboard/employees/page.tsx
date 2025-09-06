
'use client';

import { getEmployees } from "@/app/actions/client-actions";
import { CandidatesActions } from "@/app/dashboard/candidates/_components/candidates-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ApplicationData } from "@/lib/schemas";
import { Briefcase, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddLegacyEmployeeForm } from "./_components/add-legacy-employee-form";


// Helper to convert string to JS Date
function toDate(dateString: string | Date | undefined): Date | null {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  try {
    return new Date(dateString);
  } catch (e) {
    return null;
  }
}


export default function EmployeesPage() {
  const [employees, setEmployees] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getEmployees();
    setEmployees(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();

    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
    };
  }, []);
  
  const onEmployeeAdded = () => {
    setIsFormOpen(false);
    loadData();
  }


  if (loading) {
    return (
         <div className="flex flex-1 items-center justify-center">
            <Briefcase className="h-12 w-12 text-muted-foreground animate-pulse" />
        </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold text-foreground">Employees</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Legacy Employee
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add Legacy Employee</DialogTitle>
                    <CardDescription>Upload an old employee's application PDF. The AI will extract their information.</CardDescription>
                </DialogHeader>
                <AddLegacyEmployeeForm onEmployeeAdded={onEmployeeAdded} />
            </DialogContent>
        </Dialog>
      </div>

      {employees.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[400px]">
              <div className="flex flex-col items-center gap-2 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground" />
                  <h3 className="text-2xl font-bold tracking-tight">No Employees</h3>
                  <p className="text-sm text-muted-foreground">
                      New hires marked as "Employee" or added legacy employees will appear here.
                  </p>
              </div>
          </div>
      ) : (
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
      )}
    </div>
  );
}
