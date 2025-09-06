
"use client";

import { InterviewReviewForm } from "@/components/dashboard/interview-review-form";
import Image from "next/image";
import { getCompanies } from "@/app/actions/company-actions";
import { Company } from "@/lib/company-schemas";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";


async function getSignedUrl(path: string | null | undefined) {    
    if (!path || path.startsWith('http')) return path;
    const { data } = await supabase.storage.from('logos').getPublicUrl(path);
    return data?.publicUrl || path;
}


function InterviewPreview({ interviewImageUrl }: { interviewImageUrl: string | null }) {
  return (
    <div className="w-full max-w-4xl z-10">
        <div className="absolute inset-0 z-0">
            <Image
                src={interviewImageUrl || "https://placehold.co/1920x1080.png"}
                alt="Interview Background"
                fill
                objectFit="cover"
                className="opacity-10"
                data-ai-hint="office background"
            />
             <div className="absolute inset-0 bg-background/80" />
        </div>
      <div className="pointer-events-none opacity-70 relative z-10">
        <InterviewReviewForm candidateName="John Doe (Sample)" onReviewSubmit={() => {}} />
      </div>
    </div>
  );
}


export default function InterviewPreviewPage() {
  const [interviewImage, setInterviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const companies = await getCompanies();
      if (companies && companies.length > 0) {
        const firstCompany = companies[0];
        if (firstCompany.interviewImage) {
            const url = await getSignedUrl(firstCompany.interviewImage);
            setInterviewImage(url);
        }
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  if (loading) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 relative">
        <div className="fixed top-0 left-0 w-full bg-background/80 backdrop-blur-sm p-2 text-center text-sm font-semibold border-b shadow-sm z-20">
            PREVIEW MODE
        </div>
        <InterviewPreview interviewImageUrl={interviewImage} />
    </div>
  );
}
