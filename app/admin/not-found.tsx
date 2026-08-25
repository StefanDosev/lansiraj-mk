import { RouteNotFoundState } from "@/components/ui/route-not-found-state";

export default function ReviewerNotFound() {
  return (
    <RouteNotFoundState
      eyebrow="Нема достапен запис"
      title="Овој reviewer запис не е достапен."
      message="Провери го линкот или продолжи од редот за преглед."
      href="/admin"
      linkLabel="Назад кон редот"
    />
  );
}
