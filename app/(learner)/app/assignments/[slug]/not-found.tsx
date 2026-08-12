import Link from "next/link";

export default function AssignmentNotFound() {
  return (
    <section className="mx-auto max-w-3xl rounded-md border border-stone-300 bg-white p-5 md:p-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">Задачата не е пронајдена</p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink">Нема задача на оваа адреса</h1>
      <p className="mt-4 text-lg leading-relaxed text-stone-700">
        Провери ја патеката на активниот проект и отвори задача што му припаѓа на твојот curriculum.
      </p>
      <Link className="mt-6 inline-flex min-h-11 items-center font-semibold text-cobalt underline decoration-2 underline-offset-4" href="/app">
        Назад кон проектот
      </Link>
    </section>
  );
}
