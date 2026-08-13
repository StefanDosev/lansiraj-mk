import Link from "next/link";

import ideaIllustration from "@/context/design/ilustrations/tools, business _ lightbulb, idea, innovation, light, woman 1.svg";
import reviewIllustration from "@/context/design/ilustrations/rating _ review, comment, star rating, customer, man 1.svg";
import { IllustrationFrame } from "@/components/ui/illustration-frame";
import { ProofArtifact } from "@/components/ui/proof-artifact";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const stages = [
  ["01", "Насока", "Избираш еден конкретен корисник и проблем што вреди да се реши."],
  ["02", "Обем", "Го прецртуваш вишокот и задржуваш една главна акција."],
  ["03", "Изработка", "Градиш мала, употреблива верзија наместо бескраен список функции."],
  ["04", "Доказ", "Покажуваш URL, истражување, тест или друг проверлив резултат."],
  ["05", "Ревизија", "Добиваш човечки коментар врзан за јасни критериуми."],
  ["06", "Лансирано", "Проектот излегува во живо и стигнува до реални луѓе."],
] as const;

const questions = [
  ["Дали е ова уште еден курс?", "Не. Нема пасивно гледање лекции. Секоја задача завршува со работа што може да се провери."],
  ["Што ако идејата ми е преголема?", "Првиот дел од процесот е намерно намалување на обемот. Тоа е дел од работата, не неуспех."],
  ["Кој го проверува доказот?", "Во beta, доказите ги чита основачот. Одлуката е врзана за објавените критериуми на задачата."],
  ["Морам ли веќе да знам да програмирам?", "Треба да можеш самостојно да изработиш мал веб-проект со алатките што ги избираш. Лансирај го води процесот, не ја заменува изработката."],
] as const;

export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1} className="flex-1 overflow-hidden">
      <section className="paper-grid relative border-b-2 border-ink py-12 md:py-20" aria-labelledby="hero-title">
        <div className="container-public">
          <Reveal className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-16">
            <div className="reveal-item">
              <p className="mb-6 max-w-max border-y border-ink py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink">
                4 недели · 10 докази · 1 проект во живо
              </p>
              <h1 id="hero-title" className="max-w-5xl font-display text-[clamp(2.75rem,7.2vw,6.75rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-ink">
                Не ти треба уште еден туторијал.
                <span className="mt-2 block text-cobalt">Треба да лансираш.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-stone-700 md:text-xl">
                Структуриран систем што ја претвора идејата во мал веб-проект: јасен обем, проверлив доказ и конкретен човечки фидбек.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/auth/sign-in" className="pressable inline-flex min-h-12 items-center justify-center border-2 border-ink bg-ink px-6 py-3 font-semibold text-white">
                  Започни со проект <span aria-hidden="true" className="ml-3">→</span>
                </Link>
                <a href="#how-it-works" className="inline-flex min-h-12 items-center justify-center px-3 font-semibold text-ink underline decoration-2 underline-offset-4">
                  Види го системот
                </a>
              </div>
            </div>

            <div className="reveal-item relative mt-4 min-h-[31rem]" style={{ "--reveal-index": 1 } as React.CSSProperties}>
              <ProofArtifact label="Белешка за обем" variant="launch" className="absolute right-2 top-0 z-10 w-[min(90%,20rem)] -rotate-2 proof-shadow">
                <p className="font-display text-xl font-semibold leading-tight">Гради само што мора да постои.</p>
                <ul className="mt-4 space-y-2 text-sm font-semibold">
                  <li>✓ еден корисник</li>
                  <li>✓ еден болен проблем</li>
                  <li>✓ една главна акција</li>
                </ul>
              </ProofArtifact>
              <ProofArtifact label="Нема да градиме" className="absolute bottom-16 left-0 w-[min(88%,19rem)] rotate-2">
                <ul className="space-y-3 text-base text-stone-700 line-through decoration-coral decoration-2">
                  <li>мобилна апликација</li>
                  <li>наплата и претплати</li>
                  <li>chat во реално време</li>
                </ul>
              </ProofArtifact>
              <div className="absolute bottom-0 right-0 border-2 border-ink bg-acid px-4 py-3 font-semibold text-ink">
                Доказ, не ветување. ↗
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="how-it-works" aria-labelledby="mechanism-title" className="bg-white py-16 md:py-24">
        <Reveal className="container-public">
          <div className="reveal-item">
            <SectionHeading
              id="mechanism-title"
              eyebrow="Механизмот"
              title="Не мериме мотивација. Мериме што постои."
              description="Секоја задача има јасен резултат, критериуми за проверка и точен услов за отклучување на следниот чекор."
            />
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-center">
            <div className="reveal-item editorial-rule" style={{ "--reveal-index": 1 } as React.CSSProperties}>
              <ol className="divide-y divide-stone-300">
                <li className="grid gap-3 py-6 sm:grid-cols-[4.5rem_1fr]"><span className="font-display text-4xl font-semibold text-cobalt">01</span><div><h3 className="text-xl font-semibold text-ink">Работа со јасен крај</h3><p className="mt-2 leading-relaxed text-stone-700">Нема неодредено „учи уште“. Има конкретна задача што може да заврши.</p></div></li>
                <li className="grid gap-3 py-6 sm:grid-cols-[4.5rem_1fr]"><span className="font-display text-4xl font-semibold text-cobalt">02</span><div><h3 className="text-xl font-semibold text-ink">Доказ што може да се отвори</h3><p className="mt-2 leading-relaxed text-stone-700">URL, белешки, preview, repository или резултат од тестирање.</p></div></li>
                <li className="grid gap-3 py-6 sm:grid-cols-[4.5rem_1fr]"><span className="font-display text-4xl font-semibold text-cobalt">03</span><div><h3 className="text-xl font-semibold text-ink">Одлука од човек</h3><p className="mt-2 leading-relaxed text-stone-700">Одобрено или една приоритетна корекција, без магливи оценки.</p></div></li>
              </ol>
            </div>
            <div className="reveal-item" style={{ "--reveal-index": 2 } as React.CSSProperties}>
              <IllustrationFrame
                src={ideaIllustration}
                alt="Креаторка што развива идеја покрај голема светилка"
                caption="Идејата станува мала, јасна и изводлива"
                className="bg-launch"
                eager
              />
            </div>
          </div>
        </Reveal>
      </section>

      <section aria-labelledby="journey-title" className="border-y-2 border-ink bg-canvas py-16 md:py-24">
        <Reveal className="container-public">
          <div className="reveal-item">
            <SectionHeading id="journey-title" eyebrow="Патеката" title="Шест фази. Еден јасен пат до јавен тест." />
          </div>
          <ol className="mt-12 border-t-2 border-ink">
            {stages.map(([number, title, description], index) => (
              <li key={number} className="reveal-item grid gap-4 border-b border-stone-300 py-6 md:grid-cols-[7rem_13rem_1fr] md:items-start" style={{ "--reveal-index": index + 1 } as React.CSSProperties}>
                <span className="font-display text-4xl font-semibold text-cobalt">{number}</span>
                <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
                <p className="max-w-2xl leading-relaxed text-stone-700">{description}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section aria-labelledby="exchange-title" className="bg-cobalt py-16 text-white md:py-24">
        <Reveal className="container-public">
          <div className="reveal-item"><SectionHeading id="exchange-title" eyebrow="Доказ + ревизија" title="Разговорот останува врзан за сработеното." description="Не добиваш општ совет. Добиваш одлука за точниот доказ што си го испратил." inverse /></div>
          <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <div className="reveal-item space-y-6" style={{ "--reveal-index": 1 } as React.CSSProperties}>
              <ProofArtifact label="Evidence snapshot · v2" className="text-ink">
                <p className="font-display text-xl font-semibold">Главниот flow е објавен и тестиран.</p>
                <a href="https://example.com" className="mt-5 block break-all border-y border-stone-300 py-3 font-semibold text-cobalt underline underline-offset-4">https://moj-proekt.example</a>
                <p className="mt-4 text-sm leading-relaxed text-stone-700">Три тестирања · две завршени задачи · една забележана пречка</p>
              </ProofArtifact>
              <ProofArtifact label="Reviewer annotation" variant="acid" className="ml-auto max-w-xl">
                <p className="font-display text-xl font-semibold">Одобрено — доказот е доволен.</p>
                <p className="mt-3 leading-relaxed">Следно: објави го јавниот URL и побарај реакција од три реални лица.</p>
              </ProofArtifact>
            </div>
            <div className="reveal-item" style={{ "--reveal-index": 2 } as React.CSSProperties}>
              <IllustrationFrame src={reviewIllustration} alt="Човек што разгледува оценка и коментар" caption="Човечки фидбек, не автоматски score" />
            </div>
          </div>
        </Reveal>
      </section>

      <section id="for-who" aria-labelledby="fit-title" className="bg-white py-16 md:py-24">
        <Reveal className="container-public grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="reveal-item"><SectionHeading id="fit-title" eyebrow="За кого е" title="За луѓе што знаат доволно за да почнат — но не завршуваат." /></div>
          <div className="reveal-item grid gap-0 border-y-2 border-ink" style={{ "--reveal-index": 1 } as React.CSSProperties}>
            <div className="border-b border-stone-300 py-6"><h3 className="text-xl font-semibold text-ink">Добар fit</h3><p className="mt-2 leading-relaxed text-stone-700">Имаш основни вештини, идеја и неколку часа неделно. Ти треба тесен процес и надворешна проверка.</p></div>
            <div className="py-6"><h3 className="text-xl font-semibold text-ink">Не е добар fit</h3><p className="mt-2 leading-relaxed text-stone-700">Бараш видео курс, готов код, тим што ќе гради наместо тебе или ветување за брз успех.</p></div>
          </div>
        </Reveal>
      </section>

      <section aria-labelledby="trust-title" className="paper-grid border-y-2 border-ink py-16 md:py-24">
        <Reveal className="container-public grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div className="reveal-item"><SectionHeading id="trust-title" eyebrow="Founder-reviewed beta" title="Во beta, секој доказ го чита човек." description="Стефан ги прегледува доказите според однапред видливи критериуми. Ако нешто недостига, добиваш една приоритетна корекција и јасен следен обид." /></div>
          <ProofArtifact label="Правило за ревизија" variant="launch" className="reveal-item rotate-1 proof-shadow" >
            <p className="font-display text-xl font-semibold">Една јасна одлука.</p><p className="mt-3 leading-relaxed">Одобрено — или точна причина што треба да се поправи.</p>
          </ProofArtifact>
        </Reveal>
      </section>

      <section id="faq" aria-labelledby="faq-title" className="bg-canvas py-16 md:py-24">
        <div className="container-public">
          <SectionHeading id="faq-title" eyebrow="FAQ" title="Прашања пред да почнеш." />
          <div className="mt-10 border-t-2 border-ink">
            {questions.map(([question, answer]) => (
              <details key={question} className="group border-b border-stone-300">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-lg font-semibold text-ink marker:hidden">
                  {question}<span aria-hidden="true" className="text-cobalt transition-transform duration-[var(--duration-base)] ease-[var(--ease-out)] group-open:rotate-45 motion-reduce:transform-none">+</span>
                </summary>
                <p className="max-w-3xl pb-6 leading-relaxed text-stone-700">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t-2 border-ink bg-launch py-16 md:py-24">
        <div className="container-public grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink">Beta е отворена</p><h2 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-[0.98] text-ink md:text-6xl">Следната идеја нека стане URL.</h2></div>
          <Link href="/auth/sign-in" className="pressable inline-flex min-h-14 items-center justify-center border-2 border-ink bg-ink px-7 py-4 font-semibold text-white">Пријави се за beta <span aria-hidden="true" className="ml-3">→</span></Link>
        </div>
      </section>
    </main>
  );
}
