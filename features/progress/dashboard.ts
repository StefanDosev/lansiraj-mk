import type { ProjectAssignmentSummary } from "@/features/projects/projects.types";
import type { CurrentAssignmentDashboard } from "@/features/progress/dashboard.types";

const currentStateCopy = {
  available: {
    statusLabel: "Подготвено за работа",
    statusDescription: "Ова е првата незавршена задача во твојата патека.",
    unlockCondition: "Следната задача ќе се отклучи откако ќе испратиш доказ и тој ќе биде одобрен со човечки преглед.",
    feedbackMessage: "Сè уште нема повратна информација. Таа ќе се појави тука по преглед на испратениот доказ.",
    actionLabel: "Отвори ја задачата",
  },
  submitted: {
    statusLabel: "На проверка",
    statusDescription: "Доказот е испратен и чека човечки преглед.",
    unlockCondition: "Следната задача ќе се отклучи само ако рецензентот го одобри тековниот доказ.",
    feedbackMessage: "Рецензијата сè уште не е завршена. Повратната информација ќе се појави тука по одлуката.",
    actionLabel: "Види ја задачата",
  },
  revision_required: {
    statusLabel: "Потребна е 1 корекција",
    statusDescription: "Испратениот доказ треба да се поправи и повторно да се испрати.",
    unlockCondition: "Испрати нова верзија со побараната корекција; следната задача останува заклучена до одобрување.",
    feedbackMessage: "Последната рецензија ќе се прикаже тука штом историјата на докази биде достапна.",
    actionLabel: "Поправи го доказот",
  },
} as const;

export function deriveCurrentAssignmentDashboard(
  assignments: ProjectAssignmentSummary[],
): CurrentAssignmentDashboard {
  const ordered = assignments.toSorted(
    (left, right) => left.assignment.position - right.assignment.position,
  );
  const progress = {
    approved: ordered.filter((item) => item.state === "approved").length,
    total: ordered.length,
  };

  if (ordered.length === 0) return { kind: "empty", progress };

  const unresolved = ordered.find((item) => item.state !== "approved");
  if (!unresolved) return { kind: "complete", progress };
  if (unresolved.state === "approved") return { kind: "complete", progress };

  if (unresolved.state === "locked") {
    const previous = ordered.find(
      (item) => item.assignment.position === unresolved.assignment.position - 1,
    );
    return {
      kind: "locked",
      progress,
      assignment: unresolved.assignment,
      statusLabel: "Прво заврши го претходниот чекор",
      unlockCondition: previous
        ? `Задача ${String(unresolved.assignment.position).padStart(2, "0")} ќе се отклучи кога „${previous.assignment.title}“ ќе биде одобрена.`
        : "Патеката не може да започне додека првата задача не стане достапна.",
    };
  }

  return {
    kind: "current",
    progress,
    assignment: unresolved.assignment,
    state: unresolved.state,
    ...currentStateCopy[unresolved.state],
  };
}
