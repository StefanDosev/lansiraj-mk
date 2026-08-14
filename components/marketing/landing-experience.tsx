"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Reveal } from "@/components/ui/reveal";
import styles from "./landing-experience.module.css";

const FRAME_COUNT = 77;
const FRAME_CROP_TOP = 84;
const FRAME_CROP_BOTTOM = 105;
const FRAME_FOCAL_X = 0.39;
const HERO_TEXT_PHASE = 1 / 3;
const MOBILE_FRAME_STEP = 3;

const processSteps = [
  ["01", "Намали", "Еден корисник. Еден болен проблем. Една главна акција."],
  ["02", "Изгради", "Мала верзија што работи, наместо уште една бескрајна листа."],
  ["03", "Испрати доказ", "URL, repository, тест или белешка што може да се отвори."],
  ["04", "Добиј ревизија", "Човек го проверува сработеното според видливи критериуми."],
  ["05", "Поправи", "Една приоритетна корекција. Нов обид. Нова верзија."],
  ["06", "Лансирај", "Јавен URL и реакција од реални луѓе — не уште еден tutorial."],
] as const;

const questions = [
  ["Дали е ова уште еден курс?", "Не. Нема пасивно гледање лекции. Секоја задача завршува со работа што може да се провери."],
  ["Што ако идејата ми е преголема?", "Првиот дел од процесот намерно го намалува обемот. Тоа е дел од работата, не неуспех."],
  ["Кој го проверува доказот?", "Во beta, доказите ги чита основачот според однапред видливите критериуми на задачата."],
  ["Колку време ми треба?", "Патеката е дизајнирана за приближно четири недели со 5–10 фокусирани часа неделно."],
] as const;

export function LandingExperience() {
  const rootRef = useRef<HTMLElement>(null);
  const [framesReady, setFramesReady] = useState(false);
  const [framesFailed, setFramesFailed] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const root = rootRef.current;
    if (!root) return;

    const heroCanvas = root.querySelector<HTMLCanvasElement>("[data-hero-canvas]");
    const processCanvas = root.querySelector<HTMLCanvasElement>("[data-sequence-canvas]");
    const mobileCanvas = root.querySelector<HTMLCanvasElement>("[data-mobile-canvas]");
    if (!heroCanvas || !processCanvas || !mobileCanvas) return;

    const animatedMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const representativeFrame = Math.floor((FRAME_COUNT - 1) / 2);
    const initialFrame = reducedMotion.matches ? representativeFrame : 0;

    let heroFrame = initialFrame;
    let processFrame = initialFrame;
    let settledFrames = 0;
    let cancelled = false;
    const frames: Array<HTMLImageElement | undefined> = new Array(FRAME_COUNT);
    const frameIndexes = reducedMotion.matches
      ? [initialFrame]
      : animatedMedia.matches
        ? Array.from({ length: FRAME_COUNT }, (_, index) => index)
        : Array.from(
            new Set([
              ...Array.from(
                { length: Math.ceil(FRAME_COUNT / MOBILE_FRAME_STEP) },
                (_, index) => Math.min(index * MOBILE_FRAME_STEP, FRAME_COUNT - 1),
              ),
              FRAME_COUNT - 1,
            ]),
          );

    const frameAtProgress = (progress: number) => (
      frameIndexes[Math.round(Math.max(0, Math.min(1, progress)) * (frameIndexes.length - 1))]
      ?? initialFrame
    );

    const drawFrame = (canvas: HTMLCanvasElement, index: number) => {
      const image = frames[index];
      if (!image?.complete || image.naturalWidth === 0) return;

      const context2d = canvas.getContext("2d");
      if (!context2d) return;

      const { width, height } = canvas.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const backingWidth = Math.round(width * pixelRatio);
      const backingHeight = Math.round(height * pixelRatio);
      if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
        canvas.width = backingWidth;
        canvas.height = backingHeight;
      }
      context2d.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context2d.clearRect(0, 0, width, height);

      const sourceY = FRAME_CROP_TOP;
      const sourceHeight = image.naturalHeight - FRAME_CROP_TOP - FRAME_CROP_BOTTOM;
      const scale = Math.max(width / image.naturalWidth, height / sourceHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = sourceHeight * scale;
      const subjectCenteredX = width / 2 - image.naturalWidth * FRAME_FOCAL_X * scale;
      const drawX = Math.min(0, Math.max(width - drawWidth, subjectCenteredX));
      context2d.drawImage(
        image,
        0,
        sourceY,
        image.naturalWidth,
        sourceHeight,
        drawX,
        (height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      );
    };

    const resizeObserver = new ResizeObserver(() => {
      drawFrame(heroCanvas, heroFrame);
      drawFrame(processCanvas, processFrame);
      drawFrame(mobileCanvas, initialFrame);
    });
    resizeObserver.observe(heroCanvas);
    resizeObserver.observe(processCanvas);
    resizeObserver.observe(mobileCanvas);

    frameIndexes.forEach((index) => {
      const image = new window.Image();
      frames[index] = image;
      image.decoding = "async";
      image.fetchPriority = index === initialFrame ? "high" : "low";
      image.onload = () => {
        if (cancelled) return;
        settledFrames += 1;
        if (index === heroFrame) drawFrame(heroCanvas, heroFrame);
        if (index === processFrame) drawFrame(processCanvas, processFrame);
        if (index === initialFrame) drawFrame(mobileCanvas, initialFrame);
        if (settledFrames === frameIndexes.length) setFramesReady(true);
      };
      image.onerror = () => {
        if (cancelled) return;
        settledFrames += 1;
        setFramesFailed(true);
        if (settledFrames === frameIndexes.length) setFramesReady(true);
      };
      image.src = `/media/hero-animation/ezgif-frame-${String(index + 1).padStart(3, "0")}.jpg`;
    });

    const pointerCleanups: Array<() => void> = [];
    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: "(min-width: 64rem)",
        sequenceMotion: "(hover: hover) and (pointer: fine)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { desktop, sequenceMotion, reduceMotion } = context.conditions as {
          desktop: boolean;
          sequenceMotion: boolean;
          reduceMotion: boolean;
        };

        if (reduceMotion) {
          gsap.set(root.querySelectorAll("[data-motion]"), { clearProps: "all" });
          gsap.set(root.querySelector("[data-hero-media]"), { clipPath: "inset(0% 0% 0% 0%)" });
          drawFrame(heroCanvas, heroFrame);
          drawFrame(processCanvas, processFrame);
          return;
        }

        const intro = gsap.timeline({
          scrollTrigger: {
            trigger: root.querySelector("[data-hero]"),
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
            onUpdate: (self) => {
              const sequenceProgress = Math.max(
                0,
                Math.min(1, (self.progress - HERO_TEXT_PHASE) / (1 - HERO_TEXT_PHASE)),
              );
              const nextFrame = frameAtProgress(sequenceProgress);
              if (nextFrame !== heroFrame) {
                heroFrame = nextFrame;
                drawFrame(heroCanvas, heroFrame);
              }
            },
          },
        });

        intro.to(root.querySelector("[data-hero-copy]"), { yPercent: -100, duration: 1, ease: "none" }, 0);
        intro.fromTo(
          root.querySelector("[data-hero-media]"),
          { clipPath: "inset(64% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power3.inOut" },
          0,
        );
        intro.to(heroCanvas, { scale: 1.04, duration: 2, ease: "none" }, 1);

        if (desktop) {
          const steps = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-process-step]"));
          const processTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: root.querySelector("[data-process]"),
              start: "top top",
              end: "bottom bottom",
              scrub: 0.75,
              onUpdate: (self) => {
                processFrame = frameAtProgress(self.progress);
                drawFrame(processCanvas, processFrame);
              },
            },
          });

          processTimeline.to(root.querySelector("[data-sequence-canvas]"), { scale: 1.04, duration: 6, ease: "none" }, 0);

          steps.forEach((step, index) => {
            processTimeline.to(steps, { autoAlpha: (itemIndex) => (itemIndex === index ? 1 : 0.15), duration: 0.45, stagger: 0, ease: "power2.inOut" }, index);
          });
        } else if (sequenceMotion) {
          ScrollTrigger.create({
            trigger: root.querySelector("[data-process]"),
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
              processFrame = frameAtProgress(self.progress);
              drawFrame(processCanvas, processFrame);
            },
          });
        }

        const pointerMedia = window.matchMedia("(hover: hover) and (pointer: fine)").matches
          ? gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-hover-media]"))
          : [];
        pointerMedia.forEach((media) => {
          const plane = media.querySelector<HTMLElement>("[data-hover-plane]");
          if (!plane) return;
          const xTo = gsap.quickTo(plane, "x", { duration: 0.5, ease: "power3.out" });
          const yTo = gsap.quickTo(plane, "y", { duration: 0.5, ease: "power3.out" });
          const handlePointer = (event: PointerEvent) => {
            const bounds = media.getBoundingClientRect();
            xTo(((event.clientX - bounds.left) / bounds.width - 0.5) * 16);
            yTo(((event.clientY - bounds.top) / bounds.height - 0.5) * 12);
          };
          const resetPointer = () => { xTo(0); yTo(0); };
          media.addEventListener("pointermove", handlePointer);
          media.addEventListener("pointerleave", resetPointer);
          pointerCleanups.push(() => {
            media.removeEventListener("pointermove", handlePointer);
            media.removeEventListener("pointerleave", resetPointer);
            xTo.tween.kill();
            yTo.tween.kill();
          });
        });

        gsap.to(root.querySelector("[data-manifesto-line]"), {
          xPercent: desktop ? -18 : -8,
          ease: "none",
          scrollTrigger: {
            trigger: root.querySelector("[data-manifesto]"),
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });

        gsap.fromTo(
          root.querySelector("[data-manifesto]"),
          { backgroundColor: "var(--color-canvas)", color: "var(--color-ink)" },
          {
            backgroundColor: "var(--color-cobalt)",
            color: "var(--color-white)",
            ease: "none",
            scrollTrigger: { trigger: root.querySelector("[data-manifesto]"), start: "top 90%", end: "top 25%", scrub: 0.8 },
          },
        );

        gsap.from(root.querySelector("[data-proof-card]"), {
          y: 40,
          rotation: -2,
          ease: "none",
          scrollTrigger: { trigger: root.querySelector("[data-proof-card]"), start: "top 90%", end: "top 58%", scrub: 0.6 },
        });

        gsap.fromTo(
          root.querySelector("[data-review]"),
          { backgroundColor: "var(--color-cobalt)", color: "var(--color-white)" },
          {
            backgroundColor: "var(--color-launch)",
            color: "var(--color-ink)",
            ease: "none",
            scrollTrigger: { trigger: root.querySelector("[data-review]"), start: "top 90%", end: "top 22%", scrub: 0.8 },
          },
        );
      },
      root,
    );

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      mm.revert();
      pointerCleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <main ref={rootRef} id="main-content" tabIndex={-1} className={styles.root}>
      <div className={styles.coordinate} aria-hidden="true">X 00.00<br />Y 00.00</div>

      <section data-hero className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroSticky}>
          <div data-hero-copy data-motion className={styles.heroCopy}>
            <p className={styles.kicker}>4 недели · 10 докази · 1 проект во живо</p>
            <h1 id="hero-title" className={styles.heroTitle}>
              Од идеја<br />до <span>лансирано.</span>
            </h1>
            <div className={styles.heroNotes} aria-hidden="true">
              <span>не уште еден курс ↘</span>
              <span>доказ, не ветување ↗</span>
            </div>
          </div>
          <div data-hero-media data-hover-media data-motion className={styles.heroMedia}>
            <div data-hover-plane className={styles.mediaPlane}>
              <canvas data-hero-canvas role="img" aria-label="Анимирана секвенца од идеја до лансиран проект" />
            </div>
            <div className={styles.heroMediaLabel}><span>Скролувај за целата слика</span><span>77 рамки ↘</span></div>
          </div>
          <div className={styles.heroMobileMedia}>
            <canvas data-mobile-canvas role="img" aria-label="Работно биро со проект во развој">
              Работно биро со проект во развој.
            </canvas>
          </div>
        </div>
      </section>

      <section className={styles.statementShell} aria-labelledby="statement-title">
        <Reveal className={styles.statement}>
          <p className={`${styles.sectionIndex} reveal-item`}>01 / ЗОШТО</p>
          <h2 id="statement-title" className="reveal-item">Не ти недостигаат информации. Ти недостига јасен крај.</h2>
          <p className="reveal-item">Лансирај го заменува бескрајното учење со тесен процес: задача, доказ, човечка ревизија и следен отклучен чекор.</p>
        </Reveal>
      </section>

      <section id="process" data-process className={styles.process} aria-labelledby="process-title">
        <div className={styles.processSticky}>
          <div data-hover-media className={styles.processMedia}>
            <div data-hover-plane className={styles.mediaPlane}>
              <canvas data-sequence-canvas data-motion role="img" aria-label="Анимирана секвенца од идеја до изграден проект">
                Анимирана секвенца од Lansiraj процесот.
              </canvas>
            </div>
            <p className={styles.frameStatus} data-ready={framesReady && !framesFailed} aria-live="polite">
              {framesFailed ? "Дел од секвенцата не се вчита" : framesReady ? "Секвенцата е подготвена" : "Се вчитува секвенцата…"}
            </p>
            <div className={styles.mediaLabel}><span>Систем 01</span><span>Доказ → ревизија</span></div>
          </div>
          <div className={styles.processCopy}>
            <div className={styles.processHeading}>
              <p className={styles.sectionIndex}>02 / ПРОЦЕС</p>
              <h2 id="process-title">Еден тек.<br />Без скриени чекори.</h2>
            </div>
            <ol className={styles.stepList}>
              {processSteps.map(([number, title, description]) => (
                <li key={number} data-process-step data-motion className={styles.step}>
                  <span>{number}</span>
                  <div><h3>{title}</h3><p>{description}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section data-manifesto className={styles.manifesto} aria-label="Главен принцип">
        <p data-manifesto-line data-motion>ПРЕСТАНИ ДА СОБИРАШ ТУТОРИЈАЛИ · ЛАНСИРАЈ ГО ПРОЕКТОТ ·</p>
        <div className={styles.manifestoBody}>
          <p className={styles.sectionIndex}>03 / ПРИНЦИП</p>
          <blockquote>„Напредок“ значи прифатен доказ — не гледано видео, не означен checkbox, не чувство дека скоро си готов.</blockquote>
        </div>
      </section>

      <section id="stages" className={styles.stages} aria-labelledby="stages-title">
        <Reveal className={styles.stagesIntro}>
          <p className={styles.sectionIndex}>04 / ПАТЕКА</p>
          <h2 id="stages-title" className="reveal-item">Шест фази.<br />Еден јавен URL.</h2>
        </Reveal>
        <Reveal className={styles.stageGridWrap}>
        <ol className={`${styles.stageGrid} reveal-item`}>
          {[
            ["01", "Истражи"], ["02", "Намали"], ["03", "Дизајнирај"],
            ["04", "Изгради"], ["05", "Тестирај"], ["06", "Лансирај"],
          ].map(([number, label]) => (
            <li key={number}><span>{number}</span><h3>{label}</h3></li>
          ))}
        </ol>
        </Reveal>
      </section>

      <section className={styles.fit} aria-labelledby="fit-title">
        <Reveal className={styles.fitIntro}>
          <p className={`${styles.sectionIndex} reveal-item`}>05 / ЗА КОГО Е</p>
          <h2 id="fit-title" className="reveal-item">Не бараме совршена идеја.<br />Бараме одлука да ја довршиш.</h2>
        </Reveal>
        <Reveal className={styles.fitGrid}>
          <div className="reveal-item">
            <p>Пријави се ако:</p>
            <ul><li>имаш идеја што постојано ја одложуваш;</li><li>можеш да одвоиш 5–10 часа неделно;</li><li>сакаш искрен feedback, не само мотивација.</li></ul>
          </div>
          <div className="reveal-item">
            <p>На крај носиш:</p>
            <ul><li>јавен проект што може да се отвори;</li><li>доказ за секоја важна одлука;</li><li>следен чекор заснован на реална реакција.</li></ul>
          </div>
          <Link className="reveal-item" href="/auth/sign-in">Аплицирај за следната beta група <span aria-hidden="true">↗</span></Link>
        </Reveal>
      </section>

      <section data-review className={styles.review} aria-labelledby="review-title">
        <p className={styles.sectionIndex}>06 / ЧОВЕЧКА РЕВИЗИЈА</p>
        <div>
          <h2 id="review-title">Не добиваш score.<br />Добиваш одлука.</h2>
          <div data-proof-card data-motion className={styles.reviewDecision}>
            <p>ОДОБРЕНО</p>
            <strong>Доказот е доволен.</strong>
            <span>Следно: објави го јавниот URL и побарај реакција од три реални лица.</span>
          </div>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-title">
        <Reveal className={styles.faq}>
        <div><p className={styles.sectionIndex}>07 / FAQ</p><h2 id="faq-title">Пред да<br />почнеш.</h2></div>
        <div className={styles.questions}>
          {questions.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}<span aria-hidden="true">+</span></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
        </Reveal>
      </section>

      <section className={styles.finalCta} aria-labelledby="cta-title">
        <p>Beta е отворена</p>
        <h2 id="cta-title">Следната идеја<br />нека стане <span>URL.</span></h2>
        <div className={styles.ctaFacts}><span>4 недели</span><span>5–10 часа неделно</span><span>Човечка ревизија</span></div>
        <Link href="/auth/sign-in">Пријави се за beta <span aria-hidden="true">↗</span></Link>
        <small>Пријавата трае помалку од 3 минути. Ќе добиеш јасен одговор дали програмата е вистинскиот следен чекор.</small>
      </section>
    </main>
  );
}
