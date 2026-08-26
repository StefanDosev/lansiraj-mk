import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { completeOnboarding } from "@/features/onboarding/onboarding.actions";
import { startProject } from "@/features/projects/projects.actions";
import { submitReviewDecision } from "@/features/reviews/reviews.actions";
import { saveEvidenceDraft, submitEvidence } from "@/features/submissions/submissions.actions";
import { getLocalSupabaseEnvironment, runLocalSql } from "@/tests/helpers/local-supabase";

const actionContext = vi.hoisted(() => ({ client: undefined as unknown as SupabaseClient }));
const nextMocks = vi.hoisted(() => ({ redirect: vi.fn(), revalidatePath: vi.fn() }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => actionContext.client,
}));
vi.mock("next/cache", () => ({ revalidatePath: nextMocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: nextMocks.redirect }));

const runId = randomUUID();
const cohortId = randomUUID();
const learnerEmail = `integration-learner-${runId}@example.test`;
const reviewerEmail = `integration-reviewer-${runId}@example.test`;

let admin: SupabaseClient;
let learner: SupabaseClient;
let reviewer: SupabaseClient;
let learnerId: string;
let reviewerId: string;
let projectId: string;

function formData(entries: ReadonlyArray<readonly [string, string]>) {
  const data = new FormData();
  for (const [key, value] of entries) data.append(key, value);
  return data;
}

async function createAuthenticatedFixtureClient(email: string, userId: string) {
  const environment = getLocalSupabaseEnvironment();
  const client = createClient(environment.apiUrl, environment.publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const generatedLink = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const properties = generatedLink.data.properties;

  if (generatedLink.error || !properties) {
    throw generatedLink.error ?? new Error("Supabase did not return fixture magic-link properties.");
  }

  expect(generatedLink.error).toBeNull();
  expect(properties.verification_type).toBe("magiclink");

  const { data, error } = await client.auth.verifyOtp({
    token_hash: properties.hashed_token,
    type: "magiclink",
  });

  expect(error).toBeNull();
  expect(data.session).not.toBeNull();
  expect(data.user?.id).toBe(userId);
  return client;
}

beforeAll(async () => {
  const environment = getLocalSupabaseEnvironment();
  admin = createClient(environment.apiUrl, environment.secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const learnerResult = await admin.auth.admin.createUser({
    email: learnerEmail,
    email_confirm: true,
  });
  expect(learnerResult.error).toBeNull();
  learnerId = learnerResult.data.user!.id;

  const reviewerResult = await admin.auth.admin.createUser({
    email: reviewerEmail,
    email_confirm: true,
  });
  expect(reviewerResult.error).toBeNull();
  reviewerId = reviewerResult.data.user!.id;

  runLocalSql(`do $integration$
    begin
      insert into public.cohorts (id, name, status)
      values ('${cohortId}', 'Integration ${runId}', 'active');
      insert into public.profiles (user_id, display_name)
      values ('${learnerId}', null), ('${reviewerId}', 'Integration reviewer');
      insert into public.cohort_members (cohort_id, user_id)
      values ('${cohortId}', '${learnerId}');
      insert into private.reviewer_roles (user_id)
      values ('${reviewerId}');
    end
  $integration$;`);
  [learner, reviewer] = await Promise.all([
    createAuthenticatedFixtureClient(learnerEmail, learnerId),
    createAuthenticatedFixtureClient(reviewerEmail, reviewerId),
  ]);
});

afterAll(async () => {
  await Promise.allSettled([learner?.auth.signOut(), reviewer?.auth.signOut()]);

  try {
    runLocalSql(`do $integration$
      begin
        delete from public.projects where cohort_id = '${cohortId}';
        delete from public.cohort_members where cohort_id = '${cohortId}';
        delete from public.cohorts where id = '${cohortId}';
      end
    $integration$;`);
  } finally {
    if (learnerId) await admin.auth.admin.deleteUser(learnerId);
    if (reviewerId) await admin.auth.admin.deleteUser(reviewerId);
  }
});

describe.sequential("Server Actions with local Supabase", () => {
  it("carries a learner project through revision, resubmission, approval, and unlock", async () => {
    actionContext.client = learner;
    const targetLaunchDate = new Date();
    targetLaunchDate.setUTCDate(targetLaunchDate.getUTCDate() + 28);
    const onboardingValues = {
      displayName: "Ана Интеграција",
      projectTitle: "Интеграциски планер",
      targetUser: "Студент што самостојно организира конкретни задачи",
      problemStatement: "Ги губи малите задачи и не знае кој е следниот важен чекор.",
      coreAction: "Да ја означи следната важна задача.",
      nonFeatures: "Плаќања\nChat",
      weeklyHours: "5",
      targetLaunchDate: targetLaunchDate.toISOString().slice(0, 10),
    };
    await completeOnboarding(
      { status: "idle", values: onboardingValues },
      formData(Object.entries(onboardingValues)),
    );
    expect(nextMocks.redirect).toHaveBeenCalledWith("/app");

    const startState = await startProject({ status: "idle" }, new FormData());
    expect(startState).toEqual({ status: "idle" });
    expect(nextMocks.revalidatePath).toHaveBeenCalledWith("/app");

    const { data: project, error: projectError } = await admin
      .from("projects")
      .select("id,status,curriculum_version")
      .eq("owner_id", learnerId)
      .single();
    expect(projectError).toBeNull();
    expect(project).toMatchObject({ status: "active", curriculum_version: "v1" });
    projectId = project!.id;

    const { data: firstAssignment, error: assignmentError } = await admin
      .from("project_assignments")
      .select("id,assignment_id,state,assignment:assignments!inner(position)")
      .eq("project_id", projectId)
      .eq("assignments.position", 1)
      .single();
    expect(assignmentError).toBeNull();
    expect(firstAssignment?.state).toBe("available");

    const firstDraft = await saveEvidenceDraft(
      { status: "idle", values: { projectAssignmentId: "", evidenceText: "", expectedUpdatedAt: "", links: [] } },
      formData([
        ["projectAssignmentId", firstAssignment!.id],
        ["evidenceText", "Три разговори со конкретни корисници и една сегашна алтернатива."],
        ["expectedUpdatedAt", ""],
        ["linkType", "research"],
        ["linkLabel", "Анонимизирани белешки"],
        ["linkUrl", "https://example.com/integration-notes"],
      ]),
    );
    expect(firstDraft.status).toBe("success");
    if (firstDraft.status !== "success") {
      throw new Error("message" in firstDraft ? firstDraft.message : "Draft action returned an idle state.");
    }

    const firstSubmission = await submitEvidence(
      { status: "idle", values: { projectAssignmentId: "", expectedUpdatedAt: "", confirmation: "" } },
      formData([
        ["projectAssignmentId", firstAssignment!.id],
        ["expectedUpdatedAt", firstDraft.values.expectedUpdatedAt],
        ["confirmation", "confirmed"],
      ]),
    );
    expect(firstSubmission).toMatchObject({ status: "success", message: "Верзија 1 е испратена на човечка проверка." });

    const { data: versionOne, error: versionOneError } = await admin
      .from("submissions")
      .select("id,version,status")
      .eq("project_assignment_id", firstAssignment!.id)
      .single();
    expect(versionOneError).toBeNull();
    expect(versionOne).toMatchObject({ version: 1, status: "submitted" });

    const { data: criteria, error: criteriaError } = await learner
      .from("acceptance_criteria")
      .select("id,position")
      .eq("assignment_id", firstAssignment!.assignment_id)
      .order("position");
    expect(criteriaError).toBeNull();
    expect(criteria).toHaveLength(3);

    actionContext.client = reviewer;
    nextMocks.redirect.mockClear();
    const revisionEntries: Array<readonly [string, string]> = [
      ["submissionId", versionOne!.id],
      ["decision", "revision_required"],
      ["summary", "Доказот е јасен, но недостига една конкретна корекција."],
      ["priorityCorrection", "Именувај ја сегашната алтернатива појасно."],
      ["confirmation", "confirmed"],
    ];
    for (const [index, criterion] of criteria!.entries()) {
      revisionEntries.push(["criterionId", criterion.id]);
      revisionEntries.push([`criterionOutcome:${criterion.id}`, index === 0 ? "revise" : "pass"]);
      revisionEntries.push([`criterionNote:${criterion.id}`, index === 0 ? "Додај конкретна алтернатива." : ""]);
    }
    await submitReviewDecision(
      { status: "idle", values: { submissionId: "", decision: "", summary: "", priorityCorrection: "", confirmation: "", criteria: [] } },
      formData(revisionEntries),
    );
    expect(nextMocks.redirect).toHaveBeenCalledWith("/admin?reviewed=revision_required");

    actionContext.client = learner;
    const revisedDraft = await saveEvidenceDraft(
      firstDraft,
      formData([
        ["projectAssignmentId", firstAssignment!.id],
        ["evidenceText", "Три разговори со конкретни корисници; сегашната алтернатива е рачна листа."],
        ["expectedUpdatedAt", firstDraft.values.expectedUpdatedAt],
        ["linkType", "research"],
        ["linkLabel", "Ревидирани белешки"],
        ["linkUrl", "https://example.com/integration-notes-v2"],
      ]),
    );
    expect(revisedDraft.status).toBe("success");
    if (revisedDraft.status !== "success") {
      throw new Error("message" in revisedDraft ? revisedDraft.message : "Revision draft action returned an idle state.");
    }

    const resubmission = await submitEvidence(
      { status: "idle", values: { projectAssignmentId: "", expectedUpdatedAt: "", confirmation: "" } },
      formData([
        ["projectAssignmentId", firstAssignment!.id],
        ["expectedUpdatedAt", revisedDraft.values.expectedUpdatedAt],
        ["confirmation", "confirmed"],
      ]),
    );
    expect(resubmission).toMatchObject({ status: "success", message: "Верзија 2 е испратена на човечка проверка." });

    const { data: versionTwo, error: versionTwoError } = await admin
      .from("submissions")
      .select("id,version,status")
      .eq("project_assignment_id", firstAssignment!.id)
      .eq("version", 2)
      .single();
    expect(versionTwoError).toBeNull();

    actionContext.client = reviewer;
    nextMocks.redirect.mockClear();
    const approvalEntries: Array<readonly [string, string]> = [
      ["submissionId", versionTwo!.id],
      ["decision", "approved"],
      ["summary", "Ревидираната верзија ги исполнува сите критериуми."],
      ["priorityCorrection", ""],
      ["confirmation", "confirmed"],
    ];
    for (const criterion of criteria!) {
      approvalEntries.push(["criterionId", criterion.id]);
      approvalEntries.push([`criterionOutcome:${criterion.id}`, "pass"]);
      approvalEntries.push([`criterionNote:${criterion.id}`, ""]);
    }
    await submitReviewDecision(
      { status: "idle", values: { submissionId: "", decision: "", summary: "", priorityCorrection: "", confirmation: "", criteria: [] } },
      formData(approvalEntries),
    );
    expect(nextMocks.redirect).toHaveBeenCalledWith("/admin?reviewed=approved");

    const { data: assignmentStates, error: statesError } = await admin
      .from("project_assignments")
      .select("state,assignment:assignments!inner(position)")
      .eq("project_id", projectId)
      .in("assignments.position", [1, 2])
      .order("position", { referencedTable: "assignments" });
    expect(statesError).toBeNull();
    expect(assignmentStates).toEqual([
      { state: "approved", assignment: { position: 1 } },
      { state: "available", assignment: { position: 2 } },
    ]);

    const { data: versions, error: versionsError } = await admin
      .from("submissions")
      .select("version,status")
      .eq("project_assignment_id", firstAssignment!.id)
      .order("version");
    expect(versionsError).toBeNull();
    expect(versions).toEqual([
      { version: 1, status: "revision_required" },
      { version: 2, status: "approved" },
    ]);
    expect(nextMocks.revalidatePath).toHaveBeenCalledWith("/app/assignments/[slug]", "page");
    expect(nextMocks.revalidatePath).toHaveBeenCalledWith("/admin");
  });
});
