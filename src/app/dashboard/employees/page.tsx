
import { Briefcase } from "lucide-react";

export default function EmployeesPage() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
      <div className="flex flex-col items-center gap-2 text-center">
        <Briefcase className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-2xl font-bold tracking-tight">Employees</h3>
        <p className="text-sm text-muted-foreground">
          This page is under construction. Active employees will be managed here.
        </p>
      </div>
    </div>
  );
}
