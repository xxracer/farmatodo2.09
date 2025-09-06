
'use client'

import { getPersonnel } from "@/app/actions/client-actions";
import { CandidatesActions } from "@/app/dashboard/candidates/_components/candidates-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { type ApplicationData } from "@/lib/schemas";
import { add, isBefore, format } from "date-fns";
import { AlertTriangle, FileClock, Mail } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

// Helper to convert string to JS Date
function toDate(dateString: string | Date | undefined): Date | null {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch (e) {
    return null;
  }
}

const isLicenseExpiringSoon = (expirationDate: any): boolean => {
  const expiry = toDate(expirationDate);
  if (!expiry) return false;
  // Documents expiring in the next 60 days or are already expired
  const sixtyDaysFromNow = add(new Date(), { days: 60 });
  return isBefore(expiry, sixtyDaysFromNow);
};

export default function ExpiringDocumentationPage() {
  const [expiringPersonnel, setExpiringPersonnel] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPersonnel = useCallback(async () => {
    setLoading(true);
    const data = await getPersonnel();
    const filteredData = data.filter(p => isLicenseExpiringSoon(p.driversLicenseExpiration));
    setExpiringPersonnel(filteredData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPersonnel();
    
    // Listen for custom event to reload data
    const handleReload = () => fetchPersonnel();
    window.addEventListener('data-changed', handleReload);

    return () => {
      window.removeEventListener('data-changed', handleReload);
    };
  }, [fetchPersonnel]);

  const handleRenewLicense = (candidate: ApplicationData) => {
    toast({
      title: "Email Simulation",
      description: `An email has been sent to ${candidate.firstName} with a link to renew their license documentation.`,
    });

    const companyId = candidate.applyingFor?.[0]?.toLowerCase().replace(/\s+/g, '-') || 'default';
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
        <FileClock className="h-12 w-12 text-muted-foreground animate-pulse" />
      </div>
    );
  }

  if (expiringPersonnel.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-full">
        <div className="flex flex-col items-center gap-2 text-center">
          <FileClock className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-2xl font-bold tracking-tight">No Expiring Documents</h3>
          <p className="text-sm text-muted-foreground">
            All personnel documentation is up-to-date.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-headline font-bold text-foreground">Expiring Documentation</h1>
      <Card>
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Document</TableHead>
                        <TableHead>Expiration Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expiringPersonnel.map((person) => {
                        const expirationDate = toDate(person.driversLicenseExpiration);
                        const isExpired = expirationDate ? isBefore(expirationDate, new Date()) : false;
                        return (
                          <TableRow key={person.id} className={isExpired ? "bg-destructive/10" : "bg-yellow-100/50 dark:bg-yellow-900/20"}>
                              <TableCell className="font-medium flex items-center gap-2">
                                  <AlertTriangle className={`h-5 w-5 ${isExpired ? 'text-destructive' : 'text-yellow-500'}`} title={isExpired ? "License Expired!" : "License expires soon!"} />
                                  {person.firstName} {person.lastName}
                              </TableCell>
                              <TableCell className="capitalize">{person.status}</TableCell>
                              <TableCell>Driver's License</TableCell>
                              <TableCell>{expirationDate ? format(expirationDate, 'PPP') : 'N/A'}</TableCell>
                              <TableCell className="text-right space-x-2">
                                  <Button variant="secondary" size="sm" onClick={() => handleRenewLicense(person)}>
                                      <Mail className="mr-2 h-4 w-4" />
                                      Renew License
                                  </Button>
                                 <CandidatesActions candidateId={person.id} />
                              </TableCell>
                          </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
