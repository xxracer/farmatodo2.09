
'use client'

import { getNewHires } from "@/app/actions/candidates";
import { CandidatesActions } from "@/app/dashboard/candidates/_components/candidates-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { type ApplicationData } from "@/lib/schemas";
import { add, isBefore } from "date-fns";
import { AlertTriangle, UserCheck, Mail, Copy } from "lucide-react";
import { useEffect, useState } from "react";

const isLicenseExpiringSoon = (expirationDate: string | undefined): boolean => {
  if (!expirationDate) return false;
  const thirtyDaysFromNow = add(new Date(), { days: 30 });
  const expiry = new Date(expirationDate);
  return isBefore(expiry, thirtyDaysFromNow);
};

export default function NewHiresPage() {
  const [newHires, setNewHires] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchNewHires() {
      const data = await getNewHires();
      setNewHires(data);
      setLoading(false);
    }
    fetchNewHires();
  }, []);

  const handleRenewLicense = (candidate: ApplicationData) => {
    toast({
      title: "Email Simulation",
      description: `An email has been sent to ${candidate.firstName} with a link to renew their license documentation.`,
    });

    const companyId = candidate.applyingFor[0]?.toLowerCase().replace(/\s+/g, '-') || 'default';
    const renewalLink = `${window.location.origin}/documentation?company=${companyId}&candidateId=${candidate.id}`;
    navigator.clipboard.writeText(renewalLink);
    
    toast({
      title: "Link Copied!",
      description: `The license renewal link for ${candidate.firstName} has been copied to your clipboard.`,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <UserCheck className="h-12 w-12 text-muted-foreground animate-pulse" />
      </div>
    );
  }

  if (newHires.length === 0) {
    return (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-2 text-center">
                <UserCheck className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-2xl font-bold tracking-tight">No New Hires</h3>
                <p className="text-sm text-muted-foreground">
                    Candidates marked as "New Hire" will appear here.
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-headline font-bold text-foreground">New Hires</h1>
      <Card>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Applying For</TableHead>
                        <TableHead>Date Applied</TableHead>
                        <TableHead>License Expires</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {newHires.map((candidate: ApplicationData) => (
                        <TableRow key={candidate.id} className={isLicenseExpiringSoon(candidate.driversLicenseExpiration) ? "bg-yellow-100/50 dark:bg-yellow-900/20" : ""}>
                            <TableCell className="font-medium flex items-center gap-2">
                                {isLicenseExpiringSoon(candidate.driversLicenseExpiration) && (
                                    <AlertTriangle className="h-5 w-5 text-yellow-500" title="License expires soon!" />
                                )}
                                {candidate.firstName} {candidate.lastName}
                            </TableCell>
                            <TableCell>{candidate.applyingFor.join(', ')}</TableCell>
                            <TableCell>{candidate.date}</TableCell>
                            <TableCell>{candidate.driversLicenseExpiration || 'N/A'}</TableCell>
                            <TableCell className="text-right space-x-2">
                               {isLicenseExpiringSoon(candidate.driversLicenseExpiration) && (
                                 <Button variant="secondary" size="sm" onClick={() => handleRenewLicense(candidate)}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Renew License
                                 </Button>
                               )}
                               <CandidatesActions candidateId={candidate.id} />
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
