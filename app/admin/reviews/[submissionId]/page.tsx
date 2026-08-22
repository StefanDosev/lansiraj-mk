import { notFound } from "next/navigation";

import { SubmissionReviewPreview } from "@/features/reviews/components/submission-review-preview";
import { getSubmissionForReview } from "@/features/reviews/reviews.queries";
import { submissionIdSchema } from "@/features/reviews/reviews.schema";

export default async function SubmissionReviewPage({
  params,
}: Readonly<{ params: Promise<{ submissionId: string }> }>) {
  const { submissionId } = await params;
  if (!submissionIdSchema.safeParse(submissionId).success) notFound();

  const submission = await getSubmissionForReview(submissionId);
  if (!submission) notFound();

  return <SubmissionReviewPreview submission={submission} />;
}
