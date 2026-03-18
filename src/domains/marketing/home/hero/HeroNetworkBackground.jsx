import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadLinksPreset } from '@tsparticles/preset-links';

const LINKS_OPTIONS = {
  preset: 'links',
  fullScreen: {
    enable: false,
  },
  background: {
    color: 'transparent',
  },
  detectRetina: true,
  interactivity: {
    detectsOn: 'canvas',
    events: {
      onHover: {
        enable: true,
        mode: ['grab', 'bubble'],
      },
      onClick: {
        enable: true,
        mode: 'repulse',
      },
      resize: true,
    },
    modes: {
      grab: {
        distance: 140,
        links: {
          opacity: 0.34,
        },
      },
      bubble: {
        distance: 130,
        size: 4.2,
        opacity: 0.92,
        duration: 0.4,
      },
      repulse: {
        distance: 140,
        duration: 0.5,
      },
    },
  },
  particles: {
    number: {
      value: 88,
      density: {
        enable: true,
      },
    },
    color: {
      value: '#FFFFFF',
    },
    size: {
      value: {
        min: 1.6,
        max: 2.8,
      },
    },
    opacity: {
      value: 0.62,
    },
    move: {
      enable: true,
      speed: 0.42,
      outModes: {
        default: 'out',
      },
    },
    links: {
      enable: true,
      distance: 128,
      color: '#FFFFFF',
      opacity: 0.24,
      width: 1,
    },
  },
};

function HeroNetworkBackground({ className = 'hero__particles', particleId = 'hero-tsparticles', disableOnMobile = true }) {
  const [isParticlesReady, setIsParticlesReady] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobileViewport = window.matchMedia('(max-width: 860px)').matches;
    const memoryLevel = typeof navigator !== 'undefined' && navigator.deviceMemory ? navigator.deviceMemory : 8;
    const lowPowerDevice = memoryLevel <= 4;

    if (prefersReducedMotion || (disableOnMobile && isMobileViewport) || lowPowerDevice) {
      setIsParticlesReady(false);
      return undefined;
    }

    let isMounted = true;

    initParticlesEngine(async (engine) => {
      await loadLinksPreset(engine);
    }).then(() => {
      if (isMounted) {
        setIsParticlesReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [disableOnMobile]);

  if (process.env.NODE_ENV === 'test' || !isParticlesReady) {
    return null;
  }

  return (
    <Particles
      id={particleId}
      options={LINKS_OPTIONS}
      className={className}
      aria-hidden="true"
    />
  );
}

export default HeroNetworkBackground;
