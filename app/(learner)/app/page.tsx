import { requireCompletedLearnerAccess } from "@/features/auth";
import { getCurrentProject, StartProjectForm } from "@/features/projects";
import { CurrentAssignmentDashboard, deriveCurrentAssignmentDashboard } from "@/features/progress";
import { getLatestRevisionFeedback } from "@/features/submissions";

export default async function LearnerFoundationPage() {
  await requireCompletedLearnerAccess();
  const project = await getCurrentProject();

  if (project.status === "active" || project.status === "completed") {
    const dashboard = deriveCurrentAssignmentDashboard(project.assignments);
    const revisionFeedback = dashboard.kind === "current" && dashboard.state === "revision_required"
      ? await getLatestRevisionFeedback(dashboard.projectAssignmentId)
      : null;

    return (
      <CurrentAssignmentDashboard
        projectTitle={project.title}
        curriculumVersion={project.curriculumVersion ?? "—"}
        dashboard={dashboard}
        revisionFeedback={revisionFeedback}
      />
    );
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,46rem)_minmax(18rem,1fr)]">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cobalt">Подготвено за почеток</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">{project.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-stone-700">
          Провери ја насоката што ја зачува. Кога ќе го започнеш проектот, ќе се подготват десетте задачи и ќе се отклучи првата.
        </p>

        <dl className="mt-8 space-y-6 border-y-2 border-ink bg-white px-5 py-6 md:px-6">
          <div>
            <dt className="text-sm font-semibold text-ink">Корисник</dt>
            <dd className="mt-1 leading-relaxed text-stone-700">{project.targetUser}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-ink">Болен проблем</dt>
            <dd className="mt-1 leading-relaxed text-stone-700">{project.problemStatement}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-ink">Главна акција</dt>
            <dd className="mt-1 leading-relaxed text-stone-700">{project.coreAction}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <StartProjectForm />
        </div>
      </section>
      <aside className="border-2 border-ink bg-launch p-5 proof-shadow lg:sticky lg:top-24">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink">Што следува</p>
        <h2 className="mt-3 font-display text-xl font-semibold text-ink">Десет докази до јавен тест</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink">
          <li>Само Задача 01 ќе биде достапна.</li>
          <li>Следниот чекор се отклучува по одобрен доказ.</li>
          <li>Започнувањето не го менува зачуваниот scope.</li>
        </ul>
      </aside>
    </div>
  );
}
