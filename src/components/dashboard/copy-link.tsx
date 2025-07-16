"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CopyApplicationLink() {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [applicationUrl, setApplicationUrl] = useState('');

  useEffect(() => {
    // This runs only on the client, avoiding hydration issues.
    setApplicationUrl(`${window.location.origin}/application`);
  }, []);

  const handleCopy = () => {
    if (!applicationUrl) return;

    navigator.clipboard.writeText(applicationUrl).then(() => {
      setIsCopied(true);
      toast({
        title: "Link Copied!",
        description: "The application form link has been copied to your clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
    });
  };

  return (
    <Button onClick={handleCopy} variant="outline">
      {isCopied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
      Copy Application Link
    </Button>
  );
}
