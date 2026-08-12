import type { ProjectAssignmentSummary } from "@/features/projects/projects.types";
import type { JourneyStage, JourneyState, ProjectJourney } from "@/features/journey/journey.types";

const stateLabels: Record<JourneyState, string> = {
  locked: "Заклучено",
  available: "Подготвено за работа",
  submitted: "На проверка",
  revision_required: "Потребна е 1 корекција",
  approved: "Одобрено — доказот е доволен",
};

const launchAssignmentSlug = "public-launch-outreach";

export function deriveProjectJourney(
  assignments: ProjectAssignmentSummary[],
  liveUrl: string | null,
): ProjectJourney {
  const ordered = assignments.toSorted(
    (left, right) => left.assignment.position - right.assignment.position,
  );
  const currentIndex = ordered.findIndex((item) => item.state !== "approved");
  const normalized = ordered.map((item, index) => {
    const state: JourneyState = currentIndex !== -1 && index > currentIndex ? "locked" : item.state;
    const previous = ordered[index - 1];
    return {
      position: item.assignment.position,
      slug: item.assignment.slug,
      title: item.assignment.title,
      state,
      stateLabel: stateLabels[state],
      unlockCondition:
        state === "locked"
          ? previous
            ? `Се отклучува кога „${previous.assignment.title}“ ќе биде одобрено.`
            : "Патеката мора да биде активирана пред да започне оваа задача."
          : null,
      isCurrent: index === currentIndex,
      stage: item.assignment.stage,
    };
  });

  const stageMap = new Map<number, JourneyStage>();
  for (const task of normalized) {
    const existing = stageMap.get(task.stage.position);
    if (existing) {
      existing.tasks.push(task);
      continue;
    }
    stageMap.set(task.stage.position, {
      position: task.stage.position,
      title: task.stage.title,
      state: task.state,
      stateLabel: stateLabels[task.state],
      isCurrent: false,
      tasks: [task],
    });
  }

  const stages = [...stageMap.values()]
    .toSorted((left, right) => left.position - right.position)
    .map((stage) => {
      const currentTask = stage.tasks.find((task) => task.isCurrent);
      const allApproved = stage.tasks.every((task) => task.state === "approved");
      const state = allApproved ? "approved" : currentTask?.state ?? "locked";
      return {
        ...stage,
        state,
        stateLabel: stateLabels[state],
        isCurrent: Boolean(currentTask),
      };
    });

  const launchTask = normalized.find((task) => task.slug === launchAssignmentSlug);
  const launchApproved = launchTask?.state === "approved";
  const endpoint = !launchApproved
    ? {
        kind: "locked" as const,
        unlockCondition: launchTask
          ? `Се отклучува кога „${launchTask.title}“ ќе биде одобрено.`
          : "Се отклучува по одобрен доказ за јавно лансирање.",
      }
    : liveUrl
      ? { kind: "live" as const, url: liveUrl }
      : {
          kind: "missing_url" as const,
          message: "Лансирањето е одобрено, но јавниот URL недостасува. Побарај помош за да се поправи проектот.",
        };

  return {
    stages,
    endpoint,
    approvedCount: normalized.filter((task) => task.state === "approved").length,
    taskCount: normalized.length,
  };
}
