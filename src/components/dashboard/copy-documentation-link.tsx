"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type ApplicationData } from "@/lib/schemas";

export function CopyDocumentationLink() {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [candidateCompany, setCandidateCompany] = useState<string | null>(null);
  const [candidateId, setCandidateId] = useState<string | null>(null);

  useEffect(() => {
    // This runs only on the client, avoiding hydration issues.
    setBaseUrl(`${window.location.origin}/documentation`);
    
    const candidateData = localStorage.getItem("candidateApplicationData");
    if (candidateData) {
        const parsed: ApplicationData = JSON.parse(candidateData);
        // Take the first company, assuming it's the primary one for branding
        const companyId = parsed.applyingFor[0]?.toLowerCase().replace(/\s+/g, '-') || 'default';
        setCandidateCompany(companyId);
        setCandidateId(parsed.id);
    }
  }, []);

  const handleCopy = () => {
    if (!baseUrl || !candidateCompany || !candidateId) {
      toast({
        variant: "destructive",
        title: "Cannot copy link",
        description: "No active candidate found. An application must be submitted first.",
      });
      return;
    };
    
    const urlToCopy = `${baseUrl}?company=${candidateCompany}&candidateId=${candidateId}`;

    navigator.clipboard.writeText(urlToCopy).then(() => {
      setIsCopied(true);
      toast({
        title: "Link Copied!",
        description: `The documentation link for the candidate has been copied.`,
      });
      setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
    });
  };

  return (
     <Button onClick={handleCopy} disabled={!candidateId}>
        {isCopied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <LinkIcon className="mr-2 h-4 w-4" />}
        Copy Documentation Link
    </Button>
  );
}
