"use client";

import { useState } from "react";
import { type Candidate } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { generatePhase3Link } from "../actions";
import { getMissingDocuments } from "../ai-actions";

interface CandidatesDataTableProps {
  data: Candidate[];
}

export function CandidatesDataTable({ data }: CandidatesDataTableProps) {
  const { toast } = useToast();
  const [generatingLinkId, setGeneratingLinkId] = useState<string | null>(null);
  const [analyzingDocsId, setAnalyzingDocsId] = useState<string | null>(null);

  const handleAnalyzeDocs = async (candidateId: string) => {
    setAnalyzingDocsId(candidateId);
    const result = await getMissingDocuments(candidateId);
    setAnalyzingDocsId(null);

    if (result.error) {
      toast({
        title: "Analysis Failed",
        description: result.error,
        variant: "destructive",
      });
    } else {
      const missingDocs = result.missingDocuments ?? [];
      toast({
        title: "Analysis Complete",
        description: missingDocs.length > 0
          ? `Missing documents: ${missingDocs.join(", ")}`
          : "All documents are present.",
      });
    }
  };

  const handleGenerateLink = async (candidateId: string) => {
    setGeneratingLinkId(candidateId);
    const result = await generatePhase3Link(candidateId);
    setGeneratingLinkId(null);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      // In a real app, you might show a dialog with the link to copy.
      console.log(result.url);
      toast({
        title: "Link Generated",
        description: "The unique link has been copied to the console.",
      });
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied On</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell>{`${candidate.firstName} ${candidate.lastName}`}</TableCell>
              <TableCell>{candidate.email}</TableCell>
              <TableCell>{candidate.status}</TableCell>
              <TableCell>{new Date(candidate.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handleGenerateLink(candidate.id)}
                  disabled={generatingLinkId === candidate.id}
                  size="sm"
                >
                  {generatingLinkId === candidate.id ? "Generating..." : "Generate Phase 3 Link"}
                </Button>
                <Button
                  onClick={() => handleAnalyzeDocs(candidate.id)}
                  disabled={analyzingDocsId === candidate.id}
                  size="sm"
                  variant="outline"
                  className="ml-2"
                >
                  {analyzingDocsId === candidate.id ? "Analyzing..." : "Analyze Docs"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
