import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function CandidatesPage() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
      <div className="flex flex-col items-center gap-2 text-center">
        <Users className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-2xl font-bold tracking-tight">Candidates Page</h3>
        <p className="text-sm text-muted-foreground">
          This page is under construction.
        </p>
      </div>
    </div>
  );
}
