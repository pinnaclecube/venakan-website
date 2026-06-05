import React, { useEffect, useRef, useState } from "react";

type RevealVariant = "heading" | "body" | "card";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  from?: "bottom" | "top" | "left" | "right";
  /**
   * Differentiates the reveal motion by content type:
   *  - "heading": translateY(16px) + opacity, 500ms, expressive ease
   *  - "body":    opacity only (no movement), 400ms — body text fades in cleanly
   *  - "card":    translateY(12px) + opacity, 350ms — pair with a 60ms stagger
   * Numbers/stats and buttons/CTAs should NOT be wrapped in Reveal at all.
   */
  variant?: RevealVariant;
  className?: string;
}

const VARIANT_CONFIG: Record<
  RevealVariant,
  { distance: number; duration: number; easing: string; move: boolean }
> = {
  heading: { distance: 16, duration: 500, easing: "cubic-bezier(0.23, 1, 0.32, 1)", move: true },
  body: { distance: 0, duration: 400, easing: "ease-out", move: false },
  card: { distance: 12, duration: 350, easing: "cubic-bezier(0.23, 1, 0.32, 1)", move: true },
};

export function Reveal({
  children,
  delay = 0,
  from = "bottom",
  variant = "card",
  className = "",
}: RevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const config = VARIANT_CONFIG[variant];

  const getTransform = () => {
    if (!config.move || isVisible) return "translate(0, 0)";
    const d = config.distance;
    switch (from) {
      case "bottom": return `translateY(${d}px)`;
      case "top": return `translateY(-${d}px)`;
      case "left": return `translateX(-${d}px)`;
      case "right": return `translateX(${d}px)`;
      default: return `translateY(${d}px)`;
    }
  };

  const transition = config.move
    ? `opacity ${config.duration}ms ${config.easing} ${delay}ms, transform ${config.duration}ms ${config.easing} ${delay}ms`
    : `opacity ${config.duration}ms ${config.easing} ${delay}ms`;

  return (
    <div
      ref={ref}
      className={`reveal ${className}`.trim()}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition,
      }}
    >
      {children}
    </div>
  );
}
