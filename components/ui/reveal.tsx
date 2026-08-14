"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
};

export function Reveal({ children, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"pending" | "visible">("visible");

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const bounds = node.getBoundingClientRect();
    if (bounds.top < window.innerHeight * 0.9 && bounds.bottom > 0) {
      setState("pending");
      const frame = window.requestAnimationFrame(() => setState("visible"));
      return () => window.cancelAnimationFrame(frame);
    }

    setState("pending");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState("visible");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10%", threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} data-reveal={state} className={className}>{children}</div>;
}
