
import { InterviewReviewForm } from "@/components/dashboard/interview-review-form";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";


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
        <div className="w-full max-w-4xl z-10">
            <div className="pointer-events-none opacity-70">
                <InterviewReviewForm candidateName="John Doe (Sample)" onReviewSubmit={() => {}} />
            </div>
        </div>
    </div>
  );
}
