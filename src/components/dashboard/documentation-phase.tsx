"use client";

import { useState } from "react";
import { AlertCircle, FileCheck, FolderPlus, Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { detectMissingDocuments, DetectMissingDocumentsInput } from "@/ai/flows/detect-missing-documents";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const submittedDocs = [
  { id: "resume", label: "Resume/CV" },
  { id: "cover_letter", label: "Cover Letter" },
  { id: "id_proof", label: "Government-issued ID" },
];

const candidateProfileText = `
Name: Jane Doe
Position Applying For: Senior Software Engineer
Experience: 8 years in full-stack development.
Education: M.S. in Computer Science.
Nationality: Non-US Citizen, requires work visa sponsorship.
`;

export function DocumentationPhase() {
  const [checkedDocuments, setCheckedDocuments] = useState<string[]>(['resume']);
  const [missingDocuments, setMissingDocuments] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setCheckedDocuments(prev =>
      checked ? [...prev, id] : prev.filter(docId => docId !== id)
    );
  };

  const handleDetectMissing = async () => {
    setIsLoading(true);
    setError(null);
    setMissingDocuments(null);

    const input: DetectMissingDocumentsInput = {
      candidateProfile: candidateProfileText,
      onboardingPhase: "Detailed Documentation",
      submittedDocuments: checkedDocuments.map(id => submittedDocs.find(d => d.id === id)?.label || ''),
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
  
  const handleCreateFolder = () => {
    toast({
        title: "Folder Creation Simulated",
        description: "A Google Drive folder for Jane_Doe_2023-10-27 has been created.",
        action: (
            <div className="p-2 bg-green-500 text-white rounded-full">
                <FolderPlus className="h-5 w-5" />
            </div>
        )
    });
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Submitted Documents</CardTitle>
            <CardDescription>Verify the documents submitted by the candidate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {submittedDocs.map(doc => (
              <div key={doc.id} className="flex items-center space-x-3 rounded-md border p-4">
                <Checkbox
                  id={doc.id}
                  checked={checkedDocuments.includes(doc.id)}
                  onCheckedChange={(checked) => handleCheckboxChange(doc.id, !!checked)}
                />
                <Label htmlFor={doc.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {doc.label}
                </Label>
              </div>
            ))}
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
                    <Button onClick={handleCreateFolder} variant="secondary">
                        <FolderPlus className="mr-2 h-4 w-4" />
                        Create Google Drive Folder
                    </Button>
                </div>
            </CardContent>
        </Card>

      </div>

      <div className="space-y-6">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="font-headline">AI Analysis</CardTitle>
            <CardDescription>Results from the missing document detection.</CardDescription>
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
