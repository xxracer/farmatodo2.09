
import { Suspense } from "react";
import { CandidateView } from "@/components/dashboard/candidate-view";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="space-y-8">Loading...</div>}>
      <CandidateView />
    </Suspense>
  );
}
