"use client";

import { useEffect, useState } from "react";

export function CandidateName() {
  const [candidateName, setCandidateName] = useState<string | null>(null);

  useEffect(() => {
    const name = sessionStorage.getItem("candidateName");
    if (name) {
      setCandidateName(name);
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
      New Candidate: {candidateName}
    </h1>
  );
}
