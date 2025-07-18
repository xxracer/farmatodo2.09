
"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, FileCheck, Lightbulb, Loader2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { detectMissingDocuments, DetectMissingDocumentsInput } from "@/ai/flows/detect-missing-documents";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CopyDocumentationLink } from "./copy-documentation-link";
import { getCandidate } from "@/app/actions/candidates";
import { ApplicationData } from "@/lib/schemas";


function buildCandidateProfile(candidate: ApplicationData | null): string {
  if (!candidate) return "No candidate data available.";
  return `
    Name: ${candidate.firstName} ${candidate.lastName}
    Position Applying For: ${candidate.position}
    Applying to: ${candidate.applyingFor.join(", ")}
    Education: College - ${candidate.education.college?.degree || 'N/A'}, High School - ${candidate.education.highSchool?.degree || 'N/A'}
    Key Skills: ${candidate.specializedSkills || 'N/A'}
  `;
}

export function DocumentationPhase({ candidateId }: { candidateId: string, candidateProfile: string, submittedDocuments: string[]}) {
  const [missingDocuments, setMissingDocuments] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidate, setCandidate] = useState<ApplicationData | null>(null);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    if (candidateId) {
      const data = await getCandidate(candidateId);
      setCandidate(data ? JSON.parse(JSON.stringify(data)) : null);
    }
  }, [candidateId]);

  useEffect(() => {
    loadData();

    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
    };
  }, [loadData]);


  const handleDetectMissing = async () => {
    if (!candidate) {
      setError("Candidate data is not loaded yet.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setMissingDocuments(null);

    const submittedDocs = ["Resume/CV", "Application Form"];
    if (candidate.idCard) submittedDocs.push("Proof of Identity");
    if (candidate.proofOfAddress) submittedDocs.push("Proof of Address");

    const input: DetectMissingDocumentsInput = {
      candidateProfile: buildCandidateProfile(candidate),
      onboardingPhase: "Detailed Documentation",
      submittedDocuments: submittedDocs,
    };

    try {
      const result = await detectMissingDocuments(input);
      setMissingDocuments(result.missingDocuments);
    } catch (e) {
      setError("Failed to detect missing documents. Please try again.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConnectDrive = () => {
    toast({
        title: "Connection Simulated",
        description: "Successfully connected to Google Drive account.",
    });
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Request Documentation</CardTitle>
            <CardDescription>
                Send the candidate a link to a secure portal where they can upload the necessary documents for the final phase.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CopyDocumentationLink candidateId={candidateId} companyName={candidate?.applyingFor[0]} />
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Automated Actions</CardTitle>
                <CardDescription>Use AI to streamline documentation and setup.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleDetectMissing} disabled={isLoading || !candidate}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                        Detect Missing Documents
                    </Button>
                    <Button onClick={handleConnectDrive} variant="secondary">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Connect to Google Drive
                    </Button>
                </div>
            </CardContent>
        </Card>

      </div>

      <div className="space-y-6">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="font-headline">Document Suggestions</CardTitle>
            <CardDescription>AI-powered check for potentially missing documents.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {missingDocuments && (
                <Alert>
                    <FileCheck className="h-4 w-4" />
                    <AlertTitle>Potentially Missing Documents</AlertTitle>
                    <AlertDescription>
                        <ul className="mt-2 list-disc pl-5 space-y-1">
                            {missingDocuments.map((doc, index) => (
                                <li key={index}>{doc}</li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}
             {!isLoading && !error && !missingDocuments && (
                <div className="text-center text-sm text-muted-foreground p-4">
                    Click 'Detect Missing Documents' to begin analysis.
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
