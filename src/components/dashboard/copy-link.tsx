"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const companies = [
  { id: "central-home-texas", name: "Central Home Texas" },
  { id: "noble-health", name: "Noble Health" },
  { id: "lifecare", name: "Lifecare" },
];

export function CopyApplicationLink() {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(`${window.location.origin}/application`);
  }, []);

  const handleCopy = (companyId: string) => {
    if (!baseUrl) return;

    const urlToCopy = `${baseUrl}?company=${companyId}`;
    
    navigator.clipboard.writeText(urlToCopy).then(() => {
      setIsCopied(true);
      toast({
        title: "Link Copied!",
        description: `Application link for ${companyId} copied.`,
      });
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {isCopied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
          Copy Application Link
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {companies.map((company) => (
          <DropdownMenuItem key={company.id} onClick={() => handleCopy(company.id)}>
            <LinkIcon className="mr-2 h-4 w-4" />
            <span>For {company.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
