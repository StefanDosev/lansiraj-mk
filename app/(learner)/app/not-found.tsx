import { RouteNotFoundState } from "@/components/ui/route-not-found-state";

export default function LearnerNotFound() {
  return (
    <RouteNotFoundState
      eyebrow="Нема работна содржина"
      title="Оваа содржина не е достапна."
      message="Отвори ја тековната задача за да продолжиш од активниот чекор."
      href="/app"
      linkLabel="Кон тековната задача"
    />
  );
}
