import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import Footer from './components/sections/home/footer/Footer';
import ConsultantSearchController from './components/sections/profile/ConsultantSearchController';
import './App.css';

const Hero = lazy(() => import('./components/sections/home/hero/Hero'));
const PopularProfiles = lazy(() => import('./components/sections/home/popular-profiles/PopularProfiles'));
const AboutIntro = lazy(() => import('./components/sections/home/about-intro/AboutIntro'));
const Methodology = lazy(() => import('./components/sections/home/methodology/Methodology'));
const Values = lazy(() => import('./components/sections/home/values/Values'));
const WantToBeConsultant = lazy(() => import('./components/sections/home/want-to-be-consultant/WantToBeConsultant'));
const PricingSection = lazy(() => import('./components/sections/home/pricing/PricingSection'));
const BenefitsSection = lazy(() => import('./components/sections/home/benefits/BenefitsSection'));
const RequirementsInfoBlock = lazy(() => import('./components/sections/home/requirements/RequirementsInfoBlock'));
const ReferralSection = lazy(() => import('./components/sections/home/referral/ReferralSection'));
const ProfilePage = lazy(() => import('./components/sections/profile/ProfilePage'));
const ConsultantsExplorePage = lazy(() => import('./components/sections/explore/ConsultantsExplorePage'));

function resolveViewFromHash(hashValue) {
  if (hashValue === '#perfil') {
    return 'profile';
  }

  if (hashValue === '#explorar-consultores') {
    return 'explore';
  }

  return 'home';
}

function App() {
  const [viewMode, setViewMode] = useState(resolveViewFromHash(window.location.hash));
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef(0);

  useEffect(() => {
    const syncWithHash = () => {
      setViewMode(resolveViewFromHash(window.location.hash));
    };

    window.addEventListener('hashchange', syncWithHash);

    return () => {
      window.removeEventListener('hashchange', syncWithHash);
    };
  }, []);

  useEffect(() => {
    if (viewMode !== 'home') {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    currentScrollRef.current = window.scrollY;
    targetScrollRef.current = window.scrollY;

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    const animateToTarget = () => {
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const target = clamp(targetScrollRef.current, 0, maxScroll);
      const distance = target - currentScrollRef.current;

      velocityRef.current += distance * 0.055;
      velocityRef.current *= 0.78;

      const nextScroll = currentScrollRef.current + velocityRef.current;

      if (Math.abs(distance) < 0.5 && Math.abs(velocityRef.current) < 0.05) {
        currentScrollRef.current = target;
        velocityRef.current = 0;
        window.scrollTo(0, target);
        animationFrameRef.current = 0;
        return;
      }

      currentScrollRef.current = nextScroll;
      window.scrollTo(0, nextScroll);
      animationFrameRef.current = window.requestAnimationFrame(animateToTarget);
    };

    const onWheel = (event) => {
      event.preventDefault();

      if (!animationFrameRef.current) {
        currentScrollRef.current = window.scrollY;
        targetScrollRef.current = window.scrollY;
        velocityRef.current = 0;
      }

      targetScrollRef.current += event.deltaY * 0.45;

      if (!animationFrameRef.current) {
        animationFrameRef.current = window.requestAnimationFrame(animateToTarget);
      }
    };

    const onProgrammaticScroll = (event) => {
      const selector = typeof event.detail?.selector === 'string' ? event.detail.selector : '';
      if (!selector) {
        return;
      }

      const targetNode = document.querySelector(selector);
      if (!targetNode) {
        return;
      }

      if (prefersReducedMotion) {
        targetNode.scrollIntoView({ behavior: 'auto', block: 'start' });
        return;
      }

      currentScrollRef.current = window.scrollY;
      targetScrollRef.current = targetNode.offsetTop;
      velocityRef.current = 0;

      if (!animationFrameRef.current) {
        animationFrameRef.current = window.requestAnimationFrame(animateToTarget);
      }
    };

    window.addEventListener('app:smooth-scroll-to', onProgrammaticScroll);

    let observer;

    if (!prefersReducedMotion) {
      const sections = Array.from(document.querySelectorAll('section'));
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('section--focus');
            } else {
              entry.target.classList.remove('section--focus');
            }
          });
        },
        {
          threshold: 0.55,
        }
      );

      sections.forEach((section) => {
        observer.observe(section);
      });

      window.addEventListener('wheel', onWheel, { passive: false });
    }

    return () => {
      if (!prefersReducedMotion) {
        window.removeEventListener('wheel', onWheel);
      }
      window.removeEventListener('app:smooth-scroll-to', onProgrammaticScroll);
      if (observer) {
        observer.disconnect();
      }
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
      velocityRef.current = 0;
    };
  }, [viewMode]);

  return (
    <>
      <ConsultantSearchController />
      {viewMode === 'profile' ? (
        <Suspense fallback={null}>
          <ProfilePage />
          <Footer enableReveal={false} />
        </Suspense>
      ) : viewMode === 'explore' ? (
        <Suspense fallback={null}>
          <ConsultantsExplorePage />
        </Suspense>
      ) : (
        <Suspense fallback={null}>
          <main>
            <Hero />
            <PopularProfiles />
            <AboutIntro />
            <Methodology />
            <Values />
            <WantToBeConsultant />
            <PricingSection />
            <BenefitsSection />
            <RequirementsInfoBlock />
            <ReferralSection />
          </main>
          <Footer />
        </Suspense>
      )}
    </>
  );
}

export default App;
