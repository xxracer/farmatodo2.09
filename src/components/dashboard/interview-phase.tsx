import { InterviewReviewForm } from "./interview-review-form";

type InterviewPhaseProps = {
    candidateName: string;
    onReviewSubmit: () => void;
}

export function InterviewPhase({ candidateName, onReviewSubmit }: InterviewPhaseProps) {
  return <InterviewReviewForm candidateName={candidateName} onReviewSubmit={onReviewSubmit} />;
}
