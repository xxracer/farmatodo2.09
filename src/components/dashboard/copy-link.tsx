"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CopyApplicationLink() {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    // This runs only on the client, avoiding hydration issues.
    setBaseUrl(`${window.location.origin}/application`);
  }, []);

  const handleCopy = () => {
    if (!baseUrl) return;
    
    navigator.clipboard.writeText(baseUrl).then(() => {
      setIsCopied(true);
      toast({
        title: "Link Copied!",
        description: `The generic application link has been copied.`,
      });
      setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
    });
  };

  return (
    <Button variant="outline" onClick={handleCopy}>
       {isCopied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
      Copy Application Link
    </Button>
  );
}
