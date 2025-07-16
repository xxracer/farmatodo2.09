"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CopyDocumentationLink() {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [candidateCompany, setCandidateCompany] = useState<string | null>(null);

  useEffect(() => {
    // This runs only on the client, avoiding hydration issues.
    setBaseUrl(`${window.location.origin}/documentation`);
    
    const company = localStorage.getItem("candidateCompany");
    if (company) {
        setCandidateCompany(company.toLowerCase().replace(/\s+/g, '-'));
    }
  }, []);

  const handleCopy = () => {
    if (!baseUrl || !candidateCompany) {
      toast({
        variant: "destructive",
        title: "Cannot copy link",
        description: "No active candidate company found. An application must be submitted first.",
      });
      return;
    };
    
    const urlToCopy = `${baseUrl}?company=${candidateCompany}`;

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
     <Button onClick={handleCopy} disabled={!candidateCompany}>
        {isCopied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Link className="mr-2 h-4 w-4" />}
        Copy Documentation Link
    </Button>
  );
}
