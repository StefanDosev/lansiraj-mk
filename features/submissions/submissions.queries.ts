import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { EvidenceDraft, EvidenceLinkType } from "@/features/submissions/submissions.types";

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
