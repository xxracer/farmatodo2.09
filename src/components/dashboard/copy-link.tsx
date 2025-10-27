
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Link } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CopyApplicationLinkProps = {
    processId?: string;
    processName?: string;
};

export function CopyApplicationLink({ processId, processName }: CopyApplicationLinkProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    // This runs only on the client, avoiding hydration issues.
    setBaseUrl(`${window.location.origin}/application`);
  }, []);

  const handleCopy = () => {
    if (!baseUrl) return;

    // If a processId is provided, append it to the URL
    const urlToCopy = processId ? `${baseUrl}?processId=${encodeURIComponent(processId)}` : baseUrl;
    
    navigator.clipboard.writeText(urlToCopy).then(() => {
      setIsCopied(true);
      toast({
        title: "Link Copied!",
        description: `${processName || 'Generic application'} link copied to clipboard.`,
      });
      setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
    });
  };

  const buttonText = processName ? `Copy Link for ${processName}` : "Copy Generic Link";
  const Icon = isCopied ? Check : Copy;

  return (
    <Button variant="outline" onClick={handleCopy}>
        <Icon className={`mr-2 h-4 w-4 ${isCopied ? 'text-green-500' : ''}`} />
        {processName ? `Copy Link` : 'Copy Application Link'}
    </Button>
  );
}
