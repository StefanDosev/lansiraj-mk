import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Приватност",
  description: "Како Лансирај ги користи, штити и задржува личните податоци во затворената beta програма.",
};

export default function PrivacyPage() {
  return (
    <main id="main-content" tabIndex={-1} className="bg-canvas pt-32 pb-20 md:pt-40 md:pb-28">
      <article className="container-public grid gap-10 lg:grid-cols-[minmax(0,18rem)_minmax(0,46rem)] lg:justify-between">
        <header className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cobalt">Приватност · Затворена beta</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] text-ink md:text-6xl">
            Твојата работа е доказ, не производ за препродажба.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-stone-700">Последно ажурирано: 25 август 2026</p>
        </header>

        <div className="space-y-12 text-base leading-relaxed text-stone-700">
          <section aria-labelledby="controller-title" className="border-t-2 border-ink pt-6">
            <h2 id="controller-title" className="font-display text-2xl font-semibold text-ink">Кој ги контролира податоците</h2>
            <p className="mt-4">
              Стефан Досев е контролор на личните податоци обработени преку lansiraj.mk за оваа затворена beta програма.
              За прашање или барање поврзано со приватноста, пиши на:
            </p>
            <address className="mt-3 not-italic">
              <a className="inline-flex min-h-11 items-center font-semibold text-cobalt underline decoration-2 underline-offset-4" href="mailto:privacy@lansiraj.mk">
                privacy@lansiraj.mk
              </a>
            </address>
          </section>

          <section aria-labelledby="data-title" className="border-t-2 border-ink pt-6">
            <h2 id="data-title" className="font-display text-2xl font-semibold text-ink">Кои податоци ги обработуваме</h2>
            <ul className="mt-4 list-disc space-y-3 pl-6 marker:text-cobalt">
              <li>email адреса, податоци за најава и основни безбедносни записи;</li>
              <li>име за приказ, проектен опсег, целен датум и достапно време за работа;</li>
              <li>одговори, докази, јавни URL адреси и верзии што намерно ги испраќаш;</li>
              <li>одлуки и повратни информации од човечкиот преглед;</li>
              <li>минимални оперативни настани: идентификатори, тип на чекор, верзија и време на настанот.</li>
            </ul>
            <aside className="mt-6 border-l-4 border-coral bg-stone-100 p-4 text-ink">
              <p className="font-semibold">Не испраќај тајни или туѓи лични податоци.</p>
              <p className="mt-2 text-sm leading-relaxed">
                Не внесувај лозинки, API клучеви, приватни токени, здравствени или финансиски податоци, ниту лични податоци од интервјуирани лица.
                Користи анонимизирани белешки и само докази што смееш да ги споделиш.
              </p>
            </aside>
          </section>

          <section aria-labelledby="purpose-title" className="border-t-2 border-ink pt-6">
            <h2 id="purpose-title" className="font-display text-2xl font-semibold text-ink">Зошто ги користиме</h2>
            <p className="mt-4">
              Податоците ги користиме за да го обезбедиме побараното beta учество, да го зачуваме напредокот и да овозможиме човечки преглед на доказите.
              Оперативните идентификатори и безбедносните записи ги користиме за стабилност, спречување злоупотреба и проверка на клучните чекори.
            </p>
            <p className="mt-4">
              Правната основа е обработка потребна за да ја дадеме побараната beta услуга и човечкиот преглед, како и наш легитимен интерес за безбедност, спречување злоупотреба и минимална ревизорска трага.
              За идна опционална маркетинг комуникација или јавна студија на случај ќе побараме посебна согласност. Одбивањето нема да влијае врз beta учеството.
            </p>
          </section>

          <section aria-labelledby="sharing-title" className="border-t-2 border-ink pt-6">
            <h2 id="sharing-title" className="font-display text-2xl font-semibold text-ink">Кој може да има пристап</h2>
            <p className="mt-4">
              До работните податоци пристапува Стефан Досев за човечки преглед и ограничена администрација.
              Техничките даватели што ги користиме за хостирање, база, автентикација и email испорака може да ги обработуваат само податоците потребни за тие услуги, според договорни и безбедносни обврски.
              Не продаваме лични податоци.
            </p>
            <p className="mt-4">
              Некои технички даватели може да обработуваат податоци надвор од Северна Македонија. Кога тоа се случува, се потпираме на применливи договорни и организациски заштитни мерки.
            </p>
          </section>

          <section aria-labelledby="retention-title" className="border-t-2 border-ink pt-6">
            <h2 id="retention-title" className="font-display text-2xl font-semibold text-ink">Колку долго ги чуваме</h2>
            <p className="mt-4">
              Податоците ги чуваме додека трае активното учество и човечкиот преглед. Ќе ги избришеме или анонимизираме најдоцна 90 дена по завршувањето на cohort-от или pilot програмата, освен ако порано добиеме проверено барање за бришење или ако подолго задржување е законски неопходно.
            </p>
            <p className="mt-4">
              Јавните докази што ги објавуваш на надворешни услуги остануваат под правилата и контролите на тие услуги; отстрани ги и таму ако повеќе не сакаш да бидат јавни.
            </p>
          </section>

          <section aria-labelledby="rights-title" className="border-t-2 border-ink pt-6">
            <h2 id="rights-title" className="font-display text-2xl font-semibold text-ink">Твоите права</h2>
            <p className="mt-4">
              Во зависност од околностите, можеш да побараш пристап, исправка, бришење, ограничување или пренос на податоците, како и да приговориш на обработката.
              Кога обработката се темели на согласност, можеш да ја повлечеш без да влијае врз претходната законитост.
            </p>
            <p className="mt-4">
              Испрати барање на <a className="inline-flex min-h-11 items-center font-semibold text-cobalt underline decoration-2 underline-offset-4" href="mailto:privacy@lansiraj.mk">privacy@lansiraj.mk</a>.
              Може да побараме разумна потврда на идентитетот. Ќе го потврдиме приемот и ќе одговориме без непотребно одложување, најдоцна во 30 дена; ако барањето е сложено, ќе те известиме за секое дозволено продолжување.
            </p>
          </section>

          <section aria-labelledby="complaint-title" className="border-y-2 border-ink py-6">
            <h2 id="complaint-title" className="font-display text-2xl font-semibold text-ink">Прашање или поплака</h2>
            <p className="mt-4">
              Најпрво можеш да ни пишеш за да го разгледаме прашањето. Имаш право и да се обратиш до Агенцијата за заштита на личните податоци на Северна Македонија.
            </p>
            <a
              className="mt-4 inline-flex min-h-11 items-center font-semibold text-cobalt underline decoration-2 underline-offset-4"
              href="https://azlp.mk/"
              target="_blank"
              rel="noreferrer"
            >
              Отвори ја веб-страницата на АЗЛП <span aria-hidden="true" className="ml-2">↗</span>
            </a>
          </section>
        </div>
      </article>
    </main>
  );
}
