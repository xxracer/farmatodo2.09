"use client";

import { useState } from "react";
import { AlertCircle, FileCheck, Lightbulb, Loader2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { detectMissingDocuments, DetectMissingDocumentsInput } from "@/ai/flows/detect-missing-documents";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CopyDocumentationLink } from "./copy-documentation-link";

const submittedDocs = [
  { id: "resume", label: "Resume/CV" },
  { id: "id_proof", label: "Government-issued ID" },
];

const candidateProfileText = `
Name: Jane Doe
Position Applying For: Senior Software Engineer
Experience: 8 years in full-stack development.
Education: M.S. in Computer Science.
`;

export function DocumentationPhase() {
  const [missingDocuments, setMissingDocuments] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();


  const handleDetectMissing = async () => {
    setIsLoading(true);
    setError(null);
    setMissingDocuments(null);

    const input: DetectMissingDocumentsInput = {
      candidateProfile: candidateProfileText,
      onboardingPhase: "Detailed Documentation",
      submittedDocuments: ["Resume/CV", "Application Form"],
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
            <CopyDocumentationLink />
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Automated Actions</CardTitle>
                <CardDescription>Use AI to streamline documentation and setup.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleDetectMissing} disabled={isLoading}>
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
