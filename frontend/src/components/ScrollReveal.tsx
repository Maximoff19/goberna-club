import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';

type AnimateByOption = 'words' | 'letters';

interface ScrollRevealProps {
  text?: string;
  animateBy?: AnimateByOption;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  className?: string;
  rotationStart?: string;
  wordAnimationStart?: string;
  wordAnimationEnd?: string;
}

function ScrollReveal({
  text = '',
  animateBy = 'words',
  enableBlur = true,
  baseOpacity = 0.14,
  baseRotation = 2,
  blurStrength = 4,
  className = '',
  rotationStart = 'top bottom',
  wordAnimationStart = 'top bottom-=20%',
  wordAnimationEnd = 'bottom bottom',
}: ScrollRevealProps) {
  const textRef = useRef<HTMLSpanElement>(null);

  const splitText = useMemo(
    (): ReactNode[] => {
      const occurrences: Record<string, number> = {};

      const tokens = animateBy === 'letters' ? text.split('') : text.split(/(\s+)/);

      return tokens.map((token) => {
        if (/^\s+$/.test(token)) {
          return token;
        }

        occurrences[token] = (occurrences[token] || 0) + 1;

        return (
          <span className="scroll-reveal__word" key={`${token}-${occurrences[token]}`}>
            {token}
          </span>
        );
      });
    },
    [animateBy, text]
  );

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      return undefined;
    }

    const node = textRef.current;
    if (!node) {
      return undefined;
    }

    const isMobile = window.matchMedia('(max-width: 1120px)').matches || 'ontouchstart' in window;
    if (isMobile) {
      const wordElements = node.querySelectorAll<HTMLElement>('.scroll-reveal__word');
      wordElements.forEach((word) => {
        word.style.opacity = '1';
        word.style.filter = 'none';
      });
      node.style.transform = 'none';
      return undefined;
    }

    let cancelled = false;
    let ctx: gsap.Context | undefined;

    const run = async () => {
      const module = await import('gsap/ScrollTrigger');
      if (cancelled || !node.isConnected) {
        return;
      }

      const ScrollTrigger = module.ScrollTrigger || module.default;

      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.fromTo(
          node,
          { transformOrigin: '0% 50%', rotate: baseRotation },
          {
            ease: 'none',
            rotate: 0,
            scrollTrigger: {
              trigger: node,
              start: rotationStart,
              end: wordAnimationEnd,
              scrub: true,
            },
          }
        );

        const wordElements = node.querySelectorAll('.scroll-reveal__word');

        gsap.fromTo(
          wordElements,
          { opacity: baseOpacity, willChange: 'opacity' },
          {
            ease: 'none',
            opacity: 1,
            stagger: 0.045,
            scrollTrigger: {
              trigger: node,
              start: wordAnimationStart,
              end: wordAnimationEnd,
              scrub: true,
            },
          }
        );

        if (enableBlur) {
          gsap.fromTo(
            wordElements,
            { filter: `blur(${blurStrength}px)` },
            {
              ease: 'none',
              filter: 'blur(0px)',
              stagger: 0.045,
              scrollTrigger: {
                trigger: node,
                start: wordAnimationStart,
                end: wordAnimationEnd,
                scrub: true,
              },
            }
          );
        }
      }, node);
    };

    run();

    return () => {
      cancelled = true;
      if (ctx) {
        ctx.revert();
      }
    };
  }, [baseOpacity, baseRotation, blurStrength, enableBlur, rotationStart, wordAnimationEnd, wordAnimationStart]);

  return (
    <span ref={textRef} className={`scroll-reveal ${className}`}>
      {splitText}
    </span>
  );
}

export default ScrollReveal;
