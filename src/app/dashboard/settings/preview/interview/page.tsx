
"use client";

import { InterviewReviewForm } from "@/components/dashboard/interview-review-form";
import Image from "next/image";

// This is a new Client Component that wraps the form.
// It can safely handle client-side logic and pass function props.
function InterviewPreview() {
  return (
    <div className="w-full max-w-4xl z-10">
      <div className="pointer-events-none opacity-70">
        {/* The form is now rendered within a Client Component, and we can pass the function */}
        <InterviewReviewForm candidateName="John Doe (Sample)" onReviewSubmit={() => {}} />
      </div>
    </div>
  );
}


// This remains the main page component (a Server Component by default).
// It no longer passes any functions as props.
export default function InterviewPreviewPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 relative">
        <div className="fixed top-0 left-0 w-full bg-background/80 backdrop-blur-sm p-2 text-center text-sm font-semibold border-b shadow-sm">
            PREVIEW MODE
        </div>
        <div className="absolute inset-0 z-0">
            <Image
                src="https://placehold.co/1920x1080.png"
                alt="Interview Background"
                layout="fill"
                objectFit="cover"
                className="opacity-10"
                data-ai-hint="office background"
            />
             <div className="absolute inset-0 bg-background/80" />
        </div>
        {/* It now renders the client component wrapper */}
        <InterviewPreview />
    </div>
  );
}
