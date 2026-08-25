import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { SubmissionReviewPreview } from "@/features/reviews/components/submission-review-preview";
import { getSubmissionForReview } from "@/features/reviews/reviews.queries";
import { submissionIdSchema } from "@/features/reviews/reviews.schema";

type SubmissionReviewPageProps = Readonly<{
  params: Promise<{ submissionId: string }>;
}>;

const getSubmission = cache(getSubmissionForReview);

export async function generateMetadata({ params }: SubmissionReviewPageProps): Promise<Metadata> {
  const { submissionId } = await params;
  if (!submissionIdSchema.safeParse(submissionId).success) {
    return { title: "Доказот не е пронајден" };
  }

  const submission = await getSubmission(submissionId);
  return {
    title: submission ? `${submission.assignmentTitle} — Преглед` : "Доказот не е пронајден",
  };
}

export default async function SubmissionReviewPage({ params }: SubmissionReviewPageProps) {
  const { submissionId } = await params;
  if (!submissionIdSchema.safeParse(submissionId).success) notFound();

  const submission = await getSubmission(submissionId);
  if (!submission) notFound();

  return <SubmissionReviewPreview submission={submission} />;
}
