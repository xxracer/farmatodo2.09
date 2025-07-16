"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Users, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function CandidatesPage() {
  const [candidateName, setCandidateName] = useState<string | null>(null);
  const [candidateCompany, setCandidateCompany] = useState<string | null>(null);

  useEffect(() => {
    const updateCandidateInfo = () => {
      const name = localStorage.getItem("candidateName");
      const company = localStorage.getItem("candidateCompany");
      setCandidateName(name);
      setCandidateCompany(company);
    };

    updateCandidateInfo();

    window.addEventListener('storage', updateCandidateInfo);

    return () => {
      window.removeEventListener('storage', updateCandidateInfo);
    };
  }, []);

  const handleDeleteCandidate = () => {
    localStorage.removeItem("candidateName");
    localStorage.removeItem("candidateCompany");
    setCandidateName(null);
    setCandidateCompany(null);
  };

  if (!candidateName) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            <span>{candidateName}</span>
          </CardTitle>
          <CardDescription>
            Applied for a position at {candidateCompany || 'the company'} recently. Ready for review.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                This is a placeholder for candidate details. You can view progress on the dashboard.
            </p>
        </CardContent>
        <CardFooter>
            <Button variant="destructive" onClick={handleDeleteCandidate}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Candidate
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
