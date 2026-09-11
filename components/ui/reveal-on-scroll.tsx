"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type RevealContextValue = {
  observe: (el: HTMLElement, options?: { staggerIndex?: number; threshold?: number; rootMargin?: string }) => () => void;
};

const RevealContext = createContext<RevealContextValue | null>(null);

function useRevealContext() {
  const ctx = useContext(RevealContext);
  if (!ctx) throw new Error("RevealOnScroll components phải dùng trong <RevealRoot> hoặc body.");
  return ctx;
}

export function RevealRoot({
  children,
  defaultThreshold = 0.12,
  defaultRootMargin = "0px 0px -8% 0px",
}: {
  children: ReactNode;
  defaultThreshold?: number;
  defaultRootMargin?: string;
}) {
  const registryRef = useRef<
    Map<
      HTMLElement,
      { observer: IntersectionObserver | null; staggerIndex: number; visible: boolean }
    >
  >(new Map());
  const prefersReducedRef = useRef<boolean | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setMounted(true);
    prefersReducedRef.current = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedRef.current) {
      document.querySelectorAll<HTMLElement>(".lv-reveal, .lv-reveal-item").forEach((node) => {
        node.classList.add("is-visible");
      });
    }
  }, []);

  const observe = useCallback<RevealContextValue["observe"]>(
    (el, options) => {
      if (prefersReducedRef.current) {
        el.classList.add("is-visible");
        return () => undefined;
      }
      const staggerIndex = options?.staggerIndex ?? 0;
      const existing = registryRef.current.get(el);
      if (existing) return () => undefined;

      const applyVisible = () => {
        const delay = Math.min(staggerIndex * 80, 640);
        if (delay > 0) {
          el.style.transitionDelay = `${delay}ms`;
        }
        requestAnimationFrame(() => el.classList.add("is-visible"));
      };

      if (typeof IntersectionObserver === "undefined") {
        applyVisible();
        return () => undefined;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              applyVisible();
              observer.unobserve(entry.target);
              const reg = registryRef.current.get(el);
              if (reg) reg.visible = true;
            }
          }
        },
        {
          threshold: options?.threshold ?? defaultThreshold,
          rootMargin: options?.rootMargin ?? defaultRootMargin,
        },
      );
      registryRef.current.set(el, { observer, staggerIndex, visible: false });
      observer.observe(el);

      return () => {
        const reg = registryRef.current.get(el);
        if (reg?.observer) reg.observer.unobserve(el);
        registryRef.current.delete(el);
      };
    },
    [defaultRootMargin, defaultThreshold],
  );

  const value = useMemo(() => ({ observe }), [observe]);
  void mounted;

  return <RevealContext.Provider value={value}>{children}</RevealContext.Provider>;
}

type RevealOnScrollProps = {
  children: ReactNode;
  className?: string;
  variant?: "section" | "item";
  delay?: 100 | 200 | 300 | 400 | 500 | 0;
  threshold?: number;
  rootMargin?: string;
  staggerIndex?: number;
};

export function RevealOnScroll({
  children,
  className = "",
  variant = "section",
  delay = 0,
  threshold,
  rootMargin,
  staggerIndex,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      node.classList.add("is-visible");
      return;
    }
    if (staggerIndex !== undefined && staggerIndex > 0) {
      const ms = Math.min(staggerIndex * 80, 640);
      if (delay > 0) {
        node.style.transitionDelay = `${ms + delay}ms`;
      } else {
        node.style.transitionDelay = `${ms}ms`;
      }
    }

    if (typeof IntersectionObserver === "undefined") {
      node.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      {
        threshold: threshold ?? 0.12,
        rootMargin: rootMargin ?? "0px 0px -8% 0px",
      },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [delay, rootMargin, staggerIndex, threshold]);

  const baseClass = variant === "item" ? "lv-reveal-item" : "lv-reveal";
  const delayClass =
    typeof staggerIndex === "undefined" && delay > 0
      ? delay === 100
        ? " lv-reveal-delay-100"
        : delay === 200
          ? " lv-reveal-delay-200"
          : delay === 300
            ? " lv-reveal-delay-300"
            : delay === 400
              ? " lv-reveal-delay-400"
              : " lv-reveal-delay-500"
      : "";
  const finalClassName = `${baseClass}${delayClass}${className ? ` ${className}` : ""}`;

  return <div ref={ref} className={finalClassName}>
      {children}
    </div>;
}
