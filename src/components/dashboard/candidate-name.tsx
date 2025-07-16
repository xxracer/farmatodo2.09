"use client";

import { useEffect, useState } from "react";

export function CandidateName() {
  const [candidateName, setCandidateName] = useState<string | null>(null);
  const [candidateCompany, setCandidateCompany] = useState<string | null>(null);

  useEffect(() => {
    // Using localStorage to persist candidate info across sessions for prototype purposes
    const name = localStorage.getItem("candidateName");
    const company = localStorage.getItem("candidateCompany");
    if (name) {
      setCandidateName(name);
    }
    if (company) {
      setCandidateCompany(company);
    }
  }, []);

  if (!candidateName) {
    return (
      <h1 className="text-3xl font-headline font-bold text-foreground">
        Onboarding Workflow
      </h1>
    );
  }
  
  return (
    <h1 className="text-3xl font-headline font-bold text-foreground">
      New Candidate for {candidateCompany}: {candidateName}
    </h1>
  );
}
