import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
//hola-11
function buildKeyframes(from, steps) {
  const keys = new Set([
    ...Object.keys(from),
    ...steps.flatMap((step) => Object.keys(step)),
  ]);

  const keyframes = {};
  keys.forEach((key) => {
    keyframes[key] = [from[key], ...steps.map((step) => step[key])];
  });

  return keyframes;
}

function BlurText({
  text = "",
  as = "span",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing = (value) => value,
  onAnimationComplete,
  stepDuration = 0.35,
}) {
  const isTestEnv = process.env.NODE_ENV === "test";
  const [isMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.matchMedia("(max-width: 1120px)").matches ||
        "ontouchstart" in window),
  );
  const segments = animateBy === "words" ? text.split(" ") : text.split("");
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  const RootTag = as;

  useEffect(() => {
    if (!ref.current) {
      return undefined;
    }

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const defaultFrom = useMemo(
    () =>
      direction === "top"
        ? { filter: "blur(10px)", opacity: 0, y: -50 }
        : { filter: "blur(10px)", opacity: 0, y: 50 },
    [direction],
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: "blur(5px)",
        opacity: 0.5,
        y: direction === "top" ? 5 : -5,
      },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ],
    [direction],
  );

  const fromSnapshot = animationFrom || defaultFrom;
  const toSnapshots = animationTo || defaultTo;
  const segmentOccurrences = {};
  const keyedSegments = segments.map((segment) => {
    segmentOccurrences[segment] = (segmentOccurrences[segment] || 0) + 1;

    return {
      segment,
      key: `${segment}-${segmentOccurrences[segment]}`,
    };
  });

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, index) =>
    stepCount === 1 ? 0 : index / (stepCount - 1),
  );

  return (
    <RootTag ref={ref} className={`blur-text ${className}`}>
      {keyedSegments.map((item, index) => {
        const { segment, key } = item;
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

        if (isTestEnv || isMobile) {
          return (
            <span key={key} style={{ display: "inline-block" }}>
              {segment === " " ? "\u00A0" : segment}
              {animateBy === "words" && index < segments.length - 1 && "\u00A0"}
            </span>
          );
        }

        return (
          <motion.span
            key={key}
            initial={fromSnapshot}
            animate={inView ? animateKeyframes : fromSnapshot}
            transition={{
              duration: totalDuration,
              times,
              delay: (index * delay) / 1000,
              ease: easing,
            }}
            onAnimationComplete={
              index === segments.length - 1 ? onAnimationComplete : undefined
            }
            style={{
              display: "inline-block",
              willChange: "transform, filter, opacity",
            }}
          >
            {segment === " " ? "\u00A0" : segment}
            {animateBy === "words" && index < segments.length - 1 && "\u00A0"}
          </motion.span>
        );
      })}
    </RootTag>
  );
}

export default BlurText;
