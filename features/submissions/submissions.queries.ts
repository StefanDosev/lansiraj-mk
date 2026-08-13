import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  isEvidenceLinkType,
  isSubmissionStatus,
} from "@/features/submissions/submissions.validation";
import type {
  EvidenceDraft,
  EvidenceLinkType,
  SubmissionHistoryEntry,
} from "@/features/submissions/submissions.types";

export async function getEvidenceDraft(projectAssignmentId: string): Promise<EvidenceDraft> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assignment_drafts")
    .select("id,evidence_text,updated_at,assignment_draft_links(link_type,label,url,position)")
    .eq("project_assignment_id", projectAssignmentId)
    .maybeSingle();

  if (error) throw new Error("Unable to load the evidence draft.", { cause: error });

  return {
    id: data?.id ?? null,
    projectAssignmentId,
    evidenceText: data?.evidence_text ?? "",
    links: (data?.assignment_draft_links ?? [])
      .toSorted((left, right) => left.position - right.position)
      .map((link) => ({
        type: link.link_type as EvidenceLinkType,
        label: link.label,
        url: link.url,
      })),
    updatedAt: data?.updated_at ?? null,
    expectedUpdatedAt: data?.updated_at ?? "",
  };
}

export async function getSubmissionHistory(
  projectAssignmentId: string,
): Promise<SubmissionHistoryEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select(
      "id,version,evidence_text,status,submitted_at,reviewed_at,submission_links(id,link_type,label,url,position)",
    )
    .eq("project_assignment_id", projectAssignmentId)
    .order("version", { ascending: false });

  if (error) throw new Error("Unable to load submission history.", { cause: error });

  return data.map((submission) => {
    if (!isSubmissionStatus(submission.status)) {
      throw new Error("Submission history contains an unsupported status.");
    }

    const links = submission.submission_links
      .map((link) => {
        if (!isEvidenceLinkType(link.link_type)) {
          throw new Error("Submission history contains an unsupported link type.");
        }

        return {
          id: link.id,
          type: link.link_type,
          label: link.label,
          url: link.url,
          position: link.position,
        };
      })
      .toSorted((left, right) => left.position - right.position);

    return {
      id: submission.id,
      version: submission.version,
      evidenceText: submission.evidence_text,
      status: submission.status,
      submittedAt: submission.submitted_at,
      reviewedAt: submission.reviewed_at,
      links,
    };
  });
}
