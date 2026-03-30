import { useEffect, useRef, useState } from 'react';

const PRESETS = {
  top: { position: 'top', height: '6rem' },
  bottom: { position: 'bottom', height: '6rem' },
  left: { position: 'left', height: '6rem' },
  right: { position: 'right', height: '6rem' },
};

function curveProgress(curve, value) {
  if (curve === 'bezier') {
    return value * value * (3 - 2 * value);
  }

  if (curve === 'ease-in') {
    return value * value;
  }

  return value;
}

function directionFromPosition(position) {
  if (position === 'top') {
    return 'to top';
  }

  if (position === 'left') {
    return 'to left';
  }

  if (position === 'right') {
    return 'to right';
  }

  return 'to bottom';
}

function GradualBlur({
  position = 'bottom',
  strength = 2,
  height = '6rem',
  width,
  divCount = 5,
  exponential = false,
  curve = 'linear',
  opacity = 1,
  animated = false,
  duration = '0.3s',
  easing = 'ease-out',
  hoverIntensity,
  target = 'parent',
  preset,
  responsive = false,
  zIndex = 1000,
  onAnimationComplete,
  className = '',
  style,
}) {
  const rootRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(animated !== 'scroll');

  const presetConfig = preset && PRESETS[preset] ? PRESETS[preset] : null;
  const finalPosition = presetConfig?.position || position;
  const finalHeight = presetConfig?.height || height;

  useEffect(() => {
    if (animated !== 'scroll' || !rootRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [animated]);

  useEffect(() => {
    if (!isVisible || !onAnimationComplete || !animated) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      onAnimationComplete();
    }, Math.max(1, Number.parseFloat(duration) * 1000));

    return () => clearTimeout(timeout);
  }, [animated, duration, isVisible, onAnimationComplete]);

  const isHorizontal = finalPosition === 'left' || finalPosition === 'right';
  const resolvedWidth = isHorizontal ? width || finalHeight : width || '100%';
  const resolvedHeight = isHorizontal ? '100%' : finalHeight;
  const direction = directionFromPosition(finalPosition);

  const hoverMultiplier = isHovered && hoverIntensity ? hoverIntensity : 1;
  const activeStrength = strength * hoverMultiplier;

  const layers = Array.from({ length: divCount }, (_, index) => {
    const step = index + 1;
    const progress = curveProgress(curve, step / divCount);
    const blurBase = exponential ? Math.pow(2, progress * 4) * 0.0625 : 0.0625 * (progress * divCount + 1);
    const blurValue = blurBase * activeStrength;

    const middle = Math.min(100, step * (100 / divCount));
    const feather = Math.max(10, 42 / Math.max(3, divCount));
    const outer = feather * 2.2;

    const p0 = Math.max(0, middle - outer);
    const p1 = Math.max(0, middle - feather);
    const p2 = middle;
    const p3 = Math.min(100, middle + feather);
    const p4 = Math.min(100, middle + outer);

    return (
      <div
        key={`${finalPosition}-${step}`}
        style={{
          position: 'absolute',
          inset: 0,
          opacity,
          WebkitBackdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
          backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
          WebkitMaskImage: `linear-gradient(${direction}, transparent ${p0}%, rgba(0,0,0,0.22) ${p1}%, rgba(0,0,0,0.92) ${p2}%, rgba(0,0,0,0.22) ${p3}%, transparent ${p4}%)`,
          maskImage: `linear-gradient(${direction}, transparent ${p0}%, rgba(0,0,0,0.22) ${p1}%, rgba(0,0,0,0.92) ${p2}%, rgba(0,0,0,0.22) ${p3}%, transparent ${p4}%)`,
          transition: animated === true ? `backdrop-filter ${duration} ${easing}` : undefined,
          willChange: 'backdrop-filter, -webkit-backdrop-filter',
        }}
      />
    );
  });

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: target === 'page' ? 'fixed' : 'absolute',
        top: finalPosition === 'top' ? 0 : isHorizontal ? 0 : 'auto',
        bottom: finalPosition === 'bottom' ? 0 : isHorizontal ? 0 : 'auto',
        left: finalPosition === 'left' ? 0 : isHorizontal ? 'auto' : 0,
        right: finalPosition === 'right' ? 0 : isHorizontal ? 'auto' : 0,
        width: resolvedWidth,
        height: resolvedHeight,
        zIndex: target === 'page' ? zIndex + 100 : zIndex,
        pointerEvents: hoverIntensity ? 'auto' : 'none',
        opacity: animated ? (isVisible ? 1 : 0) : 1,
        transition: animated ? `opacity ${duration} ${easing}` : undefined,
        ...style,
      }}
      onMouseEnter={hoverIntensity ? () => setIsHovered(true) : undefined}
      onMouseLeave={hoverIntensity ? () => setIsHovered(false) : undefined}
      data-responsive={responsive ? 'true' : 'false'}
      aria-hidden="true"
    >
      {layers}
    </div>
  );
}

export default GradualBlur;
