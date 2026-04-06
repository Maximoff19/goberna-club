// Trigger frontend build – Apr 06 2026 v3
import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import Footer from './domains/marketing/home/footer/Footer';
import ConsultantSearchController from './domains/consultants/profile/ConsultantSearchController';
import ProfileCreatePage from './domains/consultants/onboarding/ProfileCreatePage';
import ConsultantAuthPage from './domains/consultants/auth/ConsultantAuthPage';
import './App.css';

const Hero = lazy(() => import('./domains/marketing/home/hero/Hero'));
const PopularProfiles = lazy(() => import('./domains/marketing/home/popular-profiles/PopularProfiles'));
const AboutIntro = lazy(() => import('./domains/marketing/home/about-intro/AboutIntro'));
const Methodology = lazy(() => import('./domains/marketing/home/methodology/Methodology'));
const Values = lazy(() => import('./domains/marketing/home/values/Values'));
const WantToBeConsultant = lazy(() => import('./domains/marketing/home/want-to-be-consultant/WantToBeConsultant'));
const PricingSection = lazy(() => import('./domains/marketing/home/pricing/PricingSection'));
const BenefitsSection = lazy(() => import('./domains/marketing/home/benefits/BenefitsSection'));
const RequirementsInfoBlock = lazy(() => import('./domains/marketing/home/requirements/RequirementsInfoBlock'));
const ReferralSection = lazy(() => import('./domains/marketing/home/referral/ReferralSection'));
const ProfilePage = lazy(() => import('./domains/consultants/profile/ProfilePage'));
const ConsultantsExplorePage = lazy(() => import('./domains/consultants/explore/ConsultantsExplorePage'));

function resolveRouteFromHash(hashValue) {
  if (hashValue.startsWith('#mi-perfil/')) {
    return {
      viewMode: 'profile',
      profileSlug: '',
      profileId: hashValue.replace('#mi-perfil/', ''),
    };
  }

  if (hashValue.startsWith('#perfil/')) {
    return {
      viewMode: 'profile',
      profileSlug: hashValue.replace('#perfil/', ''),
      profileId: '',
    };
  }

  if (hashValue === '#perfil') {
    return {
      viewMode: 'explore',
      profileSlug: '',
      profileId: '',
    };
  }

  if (hashValue === '#explorar-consultores') {
    return {
      viewMode: 'explore',
      profileSlug: '',
      profileId: '',
    };
  }

  if (hashValue === '#acceso-consultor') {
    return {
      viewMode: 'consultant-auth',
      profileSlug: '',
      profileId: '',
    };
  }

  if (hashValue === '#formulario-perfil') {
    return {
      viewMode: 'create-profile-form',
      profileSlug: '',
      profileId: '',
    };
  }

  return {
    viewMode: 'home',
    profileSlug: '',
    profileId: '',
  };
}

function App() {
  const initialRoute = resolveRouteFromHash(window.location.hash);
  const [viewMode, setViewMode] = useState(initialRoute.viewMode);
  const [selectedProfileSlug, setSelectedProfileSlug] = useState(initialRoute.profileSlug);
  const [selectedProfileId, setSelectedProfileId] = useState(initialRoute.profileId);
  const [createdProfile, setCreatedProfile] = useState(null);
  const targetScrollRef = useRef(0);
  const currentScrollRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef(0);

  useEffect(() => {
    const syncWithHash = () => {
      const route = resolveRouteFromHash(window.location.hash);
      setViewMode(route.viewMode);
      setSelectedProfileSlug(route.profileSlug);
      setSelectedProfileId(route.profileId);
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
    const isMobile = window.matchMedia('(max-width: 1120px)').matches || 'ontouchstart' in window;

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

      if (prefersReducedMotion || isMobile) {
        targetNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        },
      );

      sections.forEach((section) => {
        observer.observe(section);
      });

      if (!isMobile) {
        window.addEventListener('wheel', onWheel, { passive: false });
      }
    }

    return () => {
      if (!prefersReducedMotion && !isMobile) {
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

  const handleProfileCreated = (profileData) => {
    setCreatedProfile(profileData);
    setSelectedProfileSlug('');
    setSelectedProfileId(profileData?.id || '');
  };

  return (
    <>
      <ConsultantSearchController />
      {viewMode === 'profile' ? (
        <Suspense fallback={null}>
          <ProfilePage initialProfile={createdProfile} selectedProfileSlug={selectedProfileSlug} selectedProfileId={selectedProfileId} />
          <Footer enableReveal={false} />
        </Suspense>
      ) : viewMode === 'explore' ? (
        <Suspense fallback={null}>
          <ConsultantsExplorePage />
        </Suspense>
      ) : viewMode === 'consultant-auth' ? (
        <ConsultantAuthPage />
      ) : viewMode === 'create-profile-form' ? (
        <ProfileCreatePage onProfileCreated={handleProfileCreated} />
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
