export default function ReviewerLoading() {
  return (
    <div role="status" aria-label="Се вчитува reviewer workspace">
      <div className="border-b-2 border-ink pb-6">
        <div className="h-4 w-36 bg-stone-200" />
        <div className="mt-4 h-10 max-w-xl bg-stone-200" />
      </div>
      <div className="mt-9 space-y-10">
        <div className="border-y border-stone-300 py-6">
          <div className="h-7 w-64 bg-stone-200" />
          <div className="mt-6 h-24 bg-stone-100" />
        </div>
        <div className="border-y border-stone-300 py-6">
          <div className="h-7 w-56 bg-stone-200" />
          <div className="mt-6 h-40 bg-stone-100" />
        </div>
      </div>
      <span className="sr-only">Се вчитуваат редот и кохортите.</span>
    </div>
  );
}
