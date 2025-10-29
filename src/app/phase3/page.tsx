"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { verifyPhase3Token } from "./actions";

export default function Phase3Page() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      verifyPhase3Token(token)
        .then((result) => {
          if (result.error) {
            setError(result.error);
          } else {
            setCandidateId(result.candidateId ?? null);
          }
        })
        .catch(() => {
          setError("An unexpected error occurred.");
        });
    } else {
      setError("No token provided.");
    }
  }, [token]);

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (candidateId === null) {
    return <div className="text-center mt-10">Verifying...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold">Phase 3 Onboarding</h1>
      <p className="mt-4">Welcome, Candidate {candidateId}. Please upload the required documents below.</p>

      <div className="mt-8 p-4 border-l-4 border-yellow-400 bg-yellow-50">
        <p className="font-bold">Under Construction</p>
        <p>The document upload form is not yet implemented. Please check back later.</p>
      </div>
    </div>
  );
}
