"use client";

import { useEffect, useState } from "react";

export function CandidateName() {
  const [candidateName, setCandidateName] = useState("Jane Doe");

  useEffect(() => {
    const name = sessionStorage.getItem("candidateName");
    if (name) {
      setCandidateName(name);
    }
  }, []);
  
  return (
    <h1 className="text-3xl font-headline font-bold text-foreground">
      New Candidate: {candidateName}
    </h1>
  );
}
