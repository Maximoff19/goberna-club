import { Suspense, lazy, useEffect, useState } from 'react';
import Footer from './domains/marketing/home/footer/Footer';
import ConsultantSearchController from './domains/consultants/profile/ConsultantSearchController';
import ProfileCreatePage from './domains/consultants/onboarding/ProfileCreatePage';
import ConsultantAuthPage from './domains/consultants/auth/ConsultantAuthPage';
import './App.css';

const VITE_PRELOAD_RELOAD_KEY = 'goberna:vite-preload-reload';

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

type ViewMode = 'home' | 'profile' | 'explore' | 'consultant-auth' | 'create-profile-form';

interface RouteState {
  viewMode: ViewMode;
  profileSlug: string;
  profileId: string;
}

interface CreatedProfile {
  id: string;
  [key: string]: unknown;
}

function resolveRouteFromHash(hashValue: string): RouteState {
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
  const [viewMode, setViewMode] = useState<ViewMode>(initialRoute.viewMode);
  const [selectedProfileSlug, setSelectedProfileSlug] = useState(initialRoute.profileSlug);
  const [selectedProfileId, setSelectedProfileId] = useState(initialRoute.profileId);
  const [createdProfile, setCreatedProfile] = useState<CreatedProfile | null>(null);

  useEffect(() => {
    let resetTimer = 0;

    const handleVitePreloadError = (event: Event) => {
      const customEvent = event as Event & {
        payload?: {
          message?: string;
        };
      };

      const errorMessage = String(customEvent.payload?.message || '');
      const hasAlreadyReloaded = window.sessionStorage.getItem(VITE_PRELOAD_RELOAD_KEY) === 'true';

      if (!errorMessage.includes('Unable to preload') || hasAlreadyReloaded) {
        return;
      }

      event.preventDefault();
      window.sessionStorage.setItem(VITE_PRELOAD_RELOAD_KEY, 'true');
      window.location.reload();
    };

    const clearReloadFlag = () => {
      resetTimer = window.setTimeout(() => {
        window.sessionStorage.removeItem(VITE_PRELOAD_RELOAD_KEY);
      }, 30000);
    };

    window.addEventListener('vite:preloadError', handleVitePreloadError as EventListener);
    clearReloadFlag();

    return () => {
      window.removeEventListener('vite:preloadError', handleVitePreloadError as EventListener);
      window.clearTimeout(resetTimer);
    };
  }, []);

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

    const onProgrammaticScroll = (event: Event) => {
      const detail = (event as CustomEvent<{ selector?: string }>).detail;
      const selector = typeof detail?.selector === 'string' ? detail.selector : '';
      if (!selector) {
        return;
      }

      const targetNode = document.querySelector(selector) as HTMLElement | null;
      if (!targetNode) {
        return;
      }

      targetNode.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    };

    window.addEventListener('app:smooth-scroll-to', onProgrammaticScroll);

    let observer: IntersectionObserver | undefined;

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
        observer!.observe(section);
      });
    }

    return () => {
      window.removeEventListener('app:smooth-scroll-to', onProgrammaticScroll);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [viewMode]);

  const handleProfileCreated = (profileData: CreatedProfile | null) => {
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
