import { RouteNotFoundState } from "@/components/ui/route-not-found-state";

export default function AssignmentNotFound() {
  return (
    <RouteNotFoundState
      eyebrow="Задачата не е достапна"
      title="Нема достапна задача на оваа адреса."
      message="Отвори ја тековната задача за да продолжиш од активниот чекор."
      href="/app"
      linkLabel="Назад кон проектот"
    />
  );
}
