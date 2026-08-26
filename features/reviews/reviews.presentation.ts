import type {
  ReviewerAssignmentSource,
  ReviewerAssignmentState,
  ReviewerCohortStatus,
  ReviewerLearnerJourneyState,
  ReviewerProjectSource,
  ReviewerWorkspace,
  ReviewerWorkspaceSource,
} from "@/features/reviews/reviews.types";

export const cohortStatusPresentation: Record<
  ReviewerCohortStatus,
  { label: string; tone: "neutral" | "active" | "approved" }
> = {
  draft: { label: "Подготовка", tone: "neutral" },
  active: { label: "Активна", tone: "active" },
  completed: { label: "Завршена", tone: "approved" },
};

export const assignmentStatePresentation: Record<
  ReviewerAssignmentState,
  { label: string; tone: "neutral" | "active" | "revision" | "approved" }
> = {
  locked: { label: "Заклучено", tone: "neutral" },
  available: { label: "Во работа", tone: "neutral" },
  submitted: { label: "На проверка", tone: "active" },
  revision_required: { label: "Потребна е корекција", tone: "revision" },
  approved: { label: "Одобрено", tone: "approved" },
};

export const learnerJourneyPresentation: Record<
  ReviewerLearnerJourneyState,
  { label: string; tone: "neutral" | "active" | "approved" }
> = {
  onboarding: { label: "Го пополнува onboarding-от", tone: "neutral" },
  project_not_started: { label: "Проектот не е започнат", tone: "neutral" },
  in_progress: { label: "Активен проект", tone: "active" },
  complete: { label: "Патеката е завршена", tone: "approved" },
};

const cohortOrder: Record<ReviewerCohortStatus, number> = {
  active: 0,
  draft: 1,
  completed: 2,
};

const projectOrder: Record<ReviewerProjectSource["status"], number> = {
  active: 0,
  draft: 1,
  completed: 2,
};

function memberKey(cohortId: string, userId: string): string {
  return `${cohortId}:${userId}`;
}

function pickOperationalProject(
  current: ReviewerProjectSource | undefined,
  candidate: ReviewerProjectSource,
): ReviewerProjectSource {
  if (!current) return candidate;

  const statusDifference = projectOrder[candidate.status] - projectOrder[current.status];
  if (statusDifference < 0) return candidate;
  if (statusDifference > 0) return current;

  return Date.parse(candidate.updatedAt) > Date.parse(current.updatedAt) ? candidate : current;
}

function deriveCurrentAssignment(assignments: ReviewerAssignmentSource[]): {
  approvedCount: number;
  currentAssignment: ReviewerAssignmentSource | null;
} {
  let approvedCount = 0;
  let currentAssignment: ReviewerAssignmentSource | null = null;

  for (const assignment of assignments.toSorted((left, right) => left.position - right.position)) {
    if (assignment.state === "approved") {
      approvedCount += 1;
    } else if (!currentAssignment) {
      currentAssignment = assignment;
    }
  }

  return { approvedCount, currentAssignment };
}

export function buildReviewerWorkspace(source: ReviewerWorkspaceSource): ReviewerWorkspace {
  const profileByUserId = new Map(source.profiles.map((profile) => [profile.userId, profile]));
  const projectByMember = new Map<string, ReviewerProjectSource>();
  const activeMemberKeys = new Set(
    source.members.map((member) => memberKey(member.cohortId, member.userId)),
  );
  const pendingSubmissions = source.pendingSubmissions.filter((submission) =>
    activeMemberKeys.has(memberKey(submission.cohortId, submission.learnerId)),
  );

  for (const project of source.projects) {
    const key = memberKey(project.cohortId, project.ownerId);
    projectByMember.set(key, pickOperationalProject(projectByMember.get(key), project));
  }

  const pendingByMember = new Set(
    pendingSubmissions.map((submission) => memberKey(submission.cohortId, submission.learnerId)),
  );
  const pendingCountByCohort = new Map<string, number>();
  for (const submission of pendingSubmissions) {
    pendingCountByCohort.set(
      submission.cohortId,
      (pendingCountByCohort.get(submission.cohortId) ?? 0) + 1,
    );
  }

  const queue = pendingSubmissions
    .map((submission) => ({
      ...submission,
      learnerName: profileByUserId.get(submission.learnerId)?.displayName ?? "Неименуван ученик",
    }))
    .toSorted((left, right) => {
      const submittedDifference = Date.parse(left.submittedAt) - Date.parse(right.submittedAt);
      return submittedDifference === 0 ? left.id.localeCompare(right.id) : submittedDifference;
    });

  const membersByCohort = new Map<string, ReviewerWorkspaceSource["members"]>();
  for (const member of source.members) {
    const cohortMembers = membersByCohort.get(member.cohortId) ?? [];
    cohortMembers.push(member);
    membersByCohort.set(member.cohortId, cohortMembers);
  }

  const cohorts = source.cohorts
    .map((cohort) => {
      const learners = (membersByCohort.get(cohort.id) ?? [])
        .map((member) => {
          const profile = profileByUserId.get(member.userId);
          const project = projectByMember.get(memberKey(cohort.id, member.userId));
          const assignments = project?.assignments ?? [];
          const { approvedCount, currentAssignment } = deriveCurrentAssignment(assignments);

          let journeyState: ReviewerLearnerJourneyState;
          if (!profile?.onboardingCompletedAt) journeyState = "onboarding";
          else if (!project || project.status === "draft") journeyState = "project_not_started";
          else if (project.status === "completed") journeyState = "complete";
          else journeyState = "in_progress";

          return {
            userId: member.userId,
            displayName: profile?.displayName ?? "Неименуван ученик",
            journeyState,
            project: project
              ? { id: project.id, title: project.title, status: project.status }
              : null,
            approvedCount,
            assignmentCount: assignments.length,
            currentAssignment,
            hasPendingReview: pendingByMember.has(memberKey(cohort.id, member.userId)),
          };
        })
        .toSorted((left, right) => left.displayName.localeCompare(right.displayName, "mk"));

      return {
        id: cohort.id,
        name: cohort.name,
        status: cohort.status,
        startsAt: cohort.startsAt,
        endsAt: cohort.endsAt,
        activeLearnerCount: learners.length,
        activeProjectCount: learners.filter((learner) => learner.project?.status === "active").length,
        pendingReviewCount: pendingCountByCohort.get(cohort.id) ?? 0,
        learners,
      };
    })
    .toSorted((left, right) => {
      const statusDifference = cohortOrder[left.status] - cohortOrder[right.status];
      return statusDifference === 0 ? left.name.localeCompare(right.name, "mk") : statusDifference;
    });

  return { queue, cohorts };
}

export function formatWaitingDuration(submittedAt: string, now: Date): string {
  const elapsedMilliseconds = Math.max(0, now.getTime() - Date.parse(submittedAt));
  const minutes = Math.floor(elapsedMilliseconds / 60_000);

  if (minutes < 1) return "помалку од 1 мин.";
  if (minutes < 60) return `${minutes} мин.`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч.`;

  const days = Math.floor(hours / 24);
  return days === 1 ? "1 ден" : `${days} дена`;
}
