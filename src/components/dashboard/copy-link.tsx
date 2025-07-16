"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const companies = [
  { id: "central", name: "Central" },
  { id: "lifecare", name: "Lifecare" },
  { id: "noble-health", name: "Noble Health" },
];

export function CopyApplicationLink() {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    // This runs only on the client, avoiding hydration issues.
    setBaseUrl(`${window.location.origin}/application`);
  }, []);

  const handleCopy = (companyId: string) => {
    if (!baseUrl) return;
    
    const urlToCopy = `${baseUrl}?company=${companyId}`;

    navigator.clipboard.writeText(urlToCopy).then(() => {
      setIsCopied(true);
      toast({
        title: "Link Copied!",
        description: `The application link for ${companyId} has been copied.`,
      });
      setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
    });
  };

  return (
     <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
           {isCopied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
          Copy Application Link
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {companies.map((company) => (
            <DropdownMenuItem key={company.id} onClick={() => handleCopy(company.id)}>
                <span>{company.name}</span>
            </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
