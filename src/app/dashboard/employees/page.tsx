
'use client';

import { getEmployees } from "@/app/actions/client-actions";
import { CandidatesActions } from "@/app/dashboard/candidates/_components/candidates-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationData } from "@/lib/schemas";
import { Briefcase, UserPlus, Folder, Calendar as CalendarIcon, User } from "lucide-react";
import { format, getMonth, getYear } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddLegacyEmployeeForm } from "./_components/add-legacy-employee-form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


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

// Group employees by year and month
type GroupedEmployees = {
  [year: number]: {
    [month: string]: ApplicationData[];
  };
};

function groupEmployees(employees: ApplicationData[]): GroupedEmployees {
  return employees.reduce((acc, employee) => {
    const hireDate = toDate(employee.date);
    if (hireDate) {
      const year = getYear(hireDate);
      const month = format(hireDate, 'MMMM');
      if (!acc[year]) {
        acc[year] = {};
      }
      if (!acc[year][month]) {
        acc[year][month] = [];
      }
      acc[year][month].push(employee);
    }
    return acc;
  }, {} as GroupedEmployees);
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

    const handleReload = () => loadData();
    window.addEventListener('data-changed', handleReload);

    return () => {
      window.removeEventListener('data-changed', handleReload);
    };
  }, []);
  
  const onEmployeeAdded = () => {
    setIsFormOpen(false);
    loadData();
    window.dispatchEvent(new CustomEvent('data-changed'));
  }

  if (loading) {
    return (
         <div className="flex flex-1 items-center justify-center">
            <Briefcase className="h-12 w-12 text-muted-foreground animate-pulse" />
        </div>
    )
  }
  
  const groupedEmployees = groupEmployees(employees);
  const sortedYears = Object.keys(groupedEmployees).map(Number).sort((a, b) => b - a);

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
            <CardContent className="p-4">
               <Accordion type="multiple" className="w-full">
                  {sortedYears.map(year => (
                    <AccordionItem key={year} value={`year-${year}`}>
                      <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Folder className="h-6 w-6 text-primary" />
                          {year}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-6">
                        <Accordion type="multiple" className="w-full">
                          {Object.keys(groupedEmployees[year]).map(month => (
                             <AccordionItem key={month} value={`month-${year}-${month}`}>
                                <AccordionTrigger className="hover:no-underline">
                                   <div className="flex items-center gap-2">
                                     <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                                     {month}
                                   </div>
                                </AccordionTrigger>
                                <AccordionContent className="pl-8 pt-2">
                                  <div className="space-y-2">
                                    {groupedEmployees[year][month].map(employee => (
                                      <div key={employee.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                        <div className="flex items-center gap-2">
                                          <User className="h-4 w-4" />
                                          <span>{employee.firstName} {employee.lastName}</span>
                                          <span className="text-xs text-muted-foreground">- {employee.position}</span>
                                        </div>
                                        <div className="space-x-2">
                                          <CandidatesActions candidateId={employee.id} />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                             </AccordionItem>
                          ))}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
               </Accordion>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
