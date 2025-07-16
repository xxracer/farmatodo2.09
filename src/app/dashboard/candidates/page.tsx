"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Users, Trash2, View } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { type ApplicationData } from "@/lib/schemas";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<ApplicationData[]>([]);
  const router = useRouter();

  useEffect(() => {
    const updateCandidates = () => {
      const data = localStorage.getItem("candidateApplicationDataList");
      if (data) {
        setCandidates(JSON.parse(data));
      } else {
        setCandidates([]);
      }
    };

    updateCandidates();

    window.addEventListener('storage', updateCandidates);

    return () => {
      window.removeEventListener('storage', updateCandidates);
    };
  }, []);

  const handleDeleteCandidate = (candidateId: string) => {
    const updatedCandidates = candidates.filter(c => c.id !== candidateId);
    localStorage.setItem("candidateApplicationDataList", JSON.stringify(updatedCandidates));
    setCandidates(updatedCandidates);
    // Also remove single candidate view if it's the one being deleted
    const currentCandidate = localStorage.getItem("candidateApplicationData");
    if(currentCandidate) {
        const parsedCurrent = JSON.parse(currentCandidate);
        if(parsedCurrent.id === candidateId) {
            localStorage.removeItem("candidateApplicationData");
            localStorage.removeItem("candidateName");
            localStorage.removeItem("candidateCompany");
        }
    }
  };
  
  const handleViewCandidate = (candidate: ApplicationData) => {
    localStorage.setItem('candidateApplicationData', JSON.stringify(candidate));
    localStorage.setItem('candidateName', `${candidate.firstName} ${candidate.lastName}`);
    localStorage.setItem('candidateCompany', candidate.applyingFor.join(', '));
    router.push(`/dashboard/candidates/view?id=${candidate.id}`);
  }

  if (candidates.length === 0) {
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
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Applying For</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {candidates.map((candidate) => (
                        <TableRow key={candidate.id}>
                            <TableCell className="font-medium">{candidate.firstName} {candidate.lastName}</TableCell>
                            <TableCell>{candidate.applyingFor.join(', ')}</TableCell>
                            <TableCell>{candidate.date}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleViewCandidate(candidate)}>
                                    <View className="mr-2 h-4 w-4" />
                                    View
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDeleteCandidate(candidate.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
