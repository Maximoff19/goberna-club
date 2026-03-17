import { useEffect, useRef } from 'react';
import ProfileCard from './ProfileCard';
import GradualBlur from '../../../GradualBlur.jsx';
import ScrollReveal from '../../../ScrollReveal.jsx';
import SectionTitle from '../../../ui/SectionTitle';
import './popularProfiles.css';

const FIRST_NAMES = ['Lucia', 'Matias', 'Carolina', 'Federico', 'Julieta', 'Santiago', 'Paula', 'Nicolas'];
const LAST_NAMES = ['Ibarra', 'Mendez', 'Lopez', 'Quiroga', 'Sosa', 'Romero', 'Aguirre', 'Paz'];
const DESCRIPTIONS = [
  'Estratega politico especializado en narrativa y posicionamiento de candidatos.',
  'Consultora en opinion publica con foco en investigacion electoral territorial.',
  'Arquitecto de campanas con experiencia en crisis, debate y mensaje central.',
  'Director de analitica politica orientada a toma de decisiones en tiempo real.',
];

const PROFILE_IMAGES = ['/perfiles/1.png', '/perfiles/2.png', '/perfiles/3.png', '/perfiles/4.png', '/perfiles/5.jpg', '/perfiles/6.jpg', '/perfiles/7.jpg'];

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function createProfiles(total) {
  return Array.from({ length: total }, (_, index) => {
    const followers = `${Math.floor(Math.random() * 50 + 15)}k`;
    const clicks = `${Math.floor(Math.random() * 80 + 30)}k`;

    return {
      id: `profile-${index + 1}`,
      name: `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`,
      description: DESCRIPTIONS[index % DESCRIPTIONS.length],
      followers,
      clicks,
      imageSrc: PROFILE_IMAGES[index % PROFILE_IMAGES.length],
    };
  });
}

const POPULAR_PROFILES = createProfiles(10);

function PopularProfiles() {
  const sectionRef = useRef(null);
  const carouselRef = useRef(null);
  const autoScrollRef = useRef(0);
  const manualOffsetRef = useRef(0);
  const programmaticScrollRef = useRef(false);
  const isUserInteractingRef = useRef(false);
  const interactionTimeoutRef = useRef(0);
  const isSectionActiveRef = useRef(false);
  const scrollRafRef = useRef(0);

  useEffect(() => {
    const sectionNode = sectionRef.current;
    const carouselNode = carouselRef.current;

    if (!sectionNode || !carouselNode) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobileOrTablet = window.matchMedia('(max-width: 1120px)').matches;

    if (prefersReducedMotion || isMobileOrTablet) {
      return undefined;
    }

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const markUserInteraction = () => {
      isUserInteractingRef.current = true;
      if (interactionTimeoutRef.current) {
        window.clearTimeout(interactionTimeoutRef.current);
      }
      interactionTimeoutRef.current = window.setTimeout(() => {
        isUserInteractingRef.current = false;
      }, 160);
    };

    const updateFromWindowScroll = () => {
      const maxScrollLeft = Math.max(0, carouselNode.scrollWidth - carouselNode.clientWidth);
      if (maxScrollLeft === 0) {
        return;
      }

      const sectionRect = sectionNode.getBoundingClientRect();
      const sectionTop = sectionRect.top + window.scrollY;
      const start = sectionTop - window.innerHeight;
      const end = sectionTop + sectionRect.height;
      const range = Math.max(1, end - start);

      const progress = clamp((window.scrollY - start) / range, 0, 1);
      const autoTarget = progress * maxScrollLeft * 1.45;
      autoScrollRef.current = autoTarget;

      if (!isUserInteractingRef.current) {
        manualOffsetRef.current *= 0.92;
        if (Math.abs(manualOffsetRef.current) < 0.5) {
          manualOffsetRef.current = 0;
        }
      }

      const nextScrollLeft = clamp(autoTarget + manualOffsetRef.current, 0, maxScrollLeft);
      programmaticScrollRef.current = true;
      carouselNode.scrollLeft = nextScrollLeft;
      requestAnimationFrame(() => {
        programmaticScrollRef.current = false;
      });
    };

    const scheduleWindowSync = () => {
      if (!isSectionActiveRef.current || scrollRafRef.current) {
        return;
      }

      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = 0;
        updateFromWindowScroll();
      });
    };

    const startWindowSync = () => {
      window.addEventListener('scroll', scheduleWindowSync, { passive: true });
      window.addEventListener('resize', scheduleWindowSync);
      scheduleWindowSync();
    };

    const stopWindowSync = () => {
      window.removeEventListener('scroll', scheduleWindowSync);
      window.removeEventListener('resize', scheduleWindowSync);
      window.cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = 0;
    };

    const onCarouselScroll = () => {
      if (programmaticScrollRef.current || !isUserInteractingRef.current) {
        return;
      }

      const maxScrollLeft = Math.max(0, carouselNode.scrollWidth - carouselNode.clientWidth);
      const currentScrollLeft = clamp(carouselNode.scrollLeft, 0, maxScrollLeft);
      manualOffsetRef.current = currentScrollLeft - autoScrollRef.current;
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry) {
          return;
        }

        if (entry.isIntersecting) {
          if (!isSectionActiveRef.current) {
            isSectionActiveRef.current = true;
            startWindowSync();
          }
          return;
        }

        if (isSectionActiveRef.current) {
          isSectionActiveRef.current = false;
          stopWindowSync();
        }
      },
      {
        threshold: 0.01,
        rootMargin: '140px 0px',
      }
    );

    sectionObserver.observe(sectionNode);

    carouselNode.addEventListener('wheel', markUserInteraction, { passive: true });
    carouselNode.addEventListener('touchstart', markUserInteraction, { passive: true });
    carouselNode.addEventListener('pointerdown', markUserInteraction, { passive: true });
    carouselNode.addEventListener('scroll', onCarouselScroll, { passive: true });

    return () => {
      if (interactionTimeoutRef.current) {
        window.clearTimeout(interactionTimeoutRef.current);
      }
      sectionObserver.disconnect();
      stopWindowSync();
      carouselNode.removeEventListener('wheel', markUserInteraction);
      carouselNode.removeEventListener('touchstart', markUserInteraction);
      carouselNode.removeEventListener('pointerdown', markUserInteraction);
      carouselNode.removeEventListener('scroll', onCarouselScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} id="popular-profiles" className="popular-profiles" aria-labelledby="popular-profiles-title">
      <div className="popular-profiles__safe-area">
        <SectionTitle color="#FFC502" className="popular-profiles__title" id="popular-profiles-title">
          <ScrollReveal
            text="PERFILES POPULARES"
            className="popular-profiles__title-reveal popular-profiles__title-reveal--desktop"
            animateBy="letters"
            baseOpacity={0.03}
            baseRotation={5}
            blurStrength={10}
            rotationStart="top bottom+=22%"
            wordAnimationStart="top bottom+=18%"
            wordAnimationEnd="+=520"
          />
          <ScrollReveal
            text="PERFILES POPULARES"
            className="popular-profiles__title-reveal popular-profiles__title-reveal--mobile"
            animateBy="words"
            baseOpacity={0.03}
            baseRotation={5}
            blurStrength={10}
            rotationStart="top bottom+=22%"
            wordAnimationStart="top bottom+=18%"
            wordAnimationEnd="+=520"
          />
        </SectionTitle>

        <div className="popular-profiles__carousel">
          <GradualBlur
            position="left"
            width="clamp(130px, 15vw, 220px)"
            divCount={9}
            strength={1.15}
            className="popular-profiles__edge-blur popular-profiles__edge-blur--left"
          />
          <GradualBlur
            position="right"
            width="clamp(130px, 15vw, 220px)"
            divCount={9}
            strength={1.15}
            className="popular-profiles__edge-blur popular-profiles__edge-blur--right"
          />

          <div ref={carouselRef} className="popular-profiles__cards-row">
            {POPULAR_PROFILES.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        </div>

        <p className="popular-profiles__description">
          Conecta con los estrategas, encuestadores y arquitectos de campanas que definen el rumbo de la politica.
        </p>
      </div>
    </section>
  );
}

export default PopularProfiles;
