import { useEffect, useRef, useState } from 'react';
import ProfileCard from './ProfileCard';
import PopularProfileWideCard from './PopularProfileWideCard';
import { fetchConsultants } from '../../../../shared/api/gobernaApi';
import PrimaryButton from '../../../../shared/ui/PrimaryButton';
import './popularProfiles.css';

interface Consultant {
  id: string;
  ownerId?: string;
  slug?: string;
  name?: string;
  specialization?: string;
  summary?: string;
  imageSrc?: string;
  hasUploadedPhoto?: boolean;
}

interface PopularProfile {
  id: string;
  slug?: string;
  name?: string;
  description: string;
  imageSrc?: string;
}

const ROW_INDEX = {
  FIRST: 0,
  SECOND: 1,
} as const;

const MOBILE_AUTO_SCROLL_MEDIA_QUERY = '(max-width: 860px)';
const MOBILE_CARD_LAYOUT_MEDIA_QUERY = '(max-width: 768px)';
const DESKTOP_AUTO_SCROLL_SPEED_PX_PER_SECOND = 72;
const MOBILE_AUTO_SCROLL_SPEED_PX_PER_SECOND = 42;
const INITIAL_SCROLL_DIRECTION = -1;

function pickPopularProfiles(consultants: Consultant[]): PopularProfile[] {
  const seen = new Set<string>();
  const unique = consultants.filter((consultant) => {
    if (!consultant.hasUploadedPhoto) {
      return false;
    }

    const ownerKey = consultant.ownerId || consultant.id;
    if (seen.has(ownerKey)) {
      return false;
    }

    seen.add(ownerKey);
    return true;
  });

  return unique.slice(0, 10).map((consultant) => ({
    id: consultant.id,
    slug: consultant.slug,
    name: consultant.name,
    description: consultant.specialization || consultant.summary || 'Consultor politico acreditado en Goberna Club.',
    imageSrc: consultant.imageSrc,
  }));
}

function splitProfilesIntoRows(profiles: PopularProfile[]): [PopularProfile[], PopularProfile[]] {
  const firstRow = profiles.filter((_, index) => index % 2 === 0);
  const secondRow = profiles.filter((_, index) => index % 2 !== 0);
  return [firstRow, secondRow];
}

function PopularProfiles() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [isMobileCardLayout, setIsMobileCardLayout] = useState(false);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const goToConsultants = () => {
    window.location.hash = '#explorar-consultores';
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_CARD_LAYOUT_MEDIA_QUERY);

    const syncMobileCardLayout = () => {
      setIsMobileCardLayout(mediaQuery.matches);
    };

    syncMobileCardLayout();
    mediaQuery.addEventListener('change', syncMobileCardLayout);

    return () => {
      mediaQuery.removeEventListener('change', syncMobileCardLayout);
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    fetchConsultants({ sort: 'publishedAt' })
      .then((items) => {
        if (!ignore) {
          setConsultants(Array.isArray(items) ? items : []);
        }
      })
      .catch(() => {
        if (!ignore) {
          setConsultants([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const popularProfiles = pickPopularProfiles(consultants);
  const [firstRowProfiles, secondRowProfiles] = splitProfilesIntoRows(popularProfiles);

  useEffect(() => {
    if (popularProfiles.length === 0) {
      return;
    }

    const centerRows = () => {
      rowRefs.current.forEach((rowNode) => {
        if (!rowNode) {
          return;
        }

        const maxScrollLeft = rowNode.scrollWidth - rowNode.clientWidth;
        rowNode.scrollLeft = maxScrollLeft > 0 ? maxScrollLeft / 2 : 0;
      });
    };

    const animationFrameId = window.requestAnimationFrame(centerRows);
    window.addEventListener('resize', centerRows);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', centerRows);
    };
  }, [popularProfiles.length]);

  useEffect(() => {
    if (popularProfiles.length === 0) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let animationFrameId = 0;
    let previousTimestamp = 0;
    let baseDirection = INITIAL_SCROLL_DIRECTION;

    const animateRows = (timestamp: number) => {
      if (!previousTimestamp) {
        previousTimestamp = timestamp;
      }

      const deltaSeconds = (timestamp - previousTimestamp) / 1000;
      previousTimestamp = timestamp;
      const autoScrollSpeed = window.matchMedia(MOBILE_AUTO_SCROLL_MEDIA_QUERY).matches
        ? MOBILE_AUTO_SCROLL_SPEED_PX_PER_SECOND
        : DESKTOP_AUTO_SCROLL_SPEED_PX_PER_SECOND;

      const rowDirections = [baseDirection, -baseDirection];
      const shouldReverseDirection = rowRefs.current.some((rowNode, rowIndex) => {
        if (!rowNode) {
          return false;
        }

        const maxScrollLeft = rowNode.scrollWidth - rowNode.clientWidth;
        if (maxScrollLeft <= 0) {
          return false;
        }

        const nextScrollLeft = rowNode.scrollLeft + autoScrollSpeed * deltaSeconds * rowDirections[rowIndex];
        return nextScrollLeft <= 0 || nextScrollLeft >= maxScrollLeft;
      });

      if (shouldReverseDirection) {
        baseDirection *= -1;
      }

      const effectiveDirections = [baseDirection, -baseDirection];

      rowRefs.current.forEach((rowNode, rowIndex) => {
        if (!rowNode) {
          return;
        }

        const maxScrollLeft = rowNode.scrollWidth - rowNode.clientWidth;
        if (maxScrollLeft <= 0) {
          rowNode.scrollLeft = 0;
          return;
        }

        const nextScrollLeft = rowNode.scrollLeft + autoScrollSpeed * deltaSeconds * effectiveDirections[rowIndex];
        rowNode.scrollLeft = Math.min(Math.max(nextScrollLeft, 0), maxScrollLeft);
      });

      animationFrameId = window.requestAnimationFrame(animateRows);
    };

    animationFrameId = window.requestAnimationFrame(animateRows);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [popularProfiles.length]);

  return (
    <section id="popular-profiles" className="popular-profiles" aria-labelledby="popular-profiles-title">
      <div className="popular-profiles__safe-area">
        <h2 className="popular-profiles__title" id="popular-profiles-title">
          PERFILES POPULARES
        </h2>

        <div className="popular-profiles__rows">
          <div className="popular-profiles__row-block">
            <div
              ref={(node) => {
                rowRefs.current[ROW_INDEX.FIRST] = node;
              }}
              className={`popular-profiles__cards-row popular-profiles__cards-row--first${isMobileCardLayout ? ' popular-profiles__cards-row--mobile-cards' : ''}`}
            >
              {firstRowProfiles.map((profile) => (
                isMobileCardLayout ? <ProfileCard key={profile.id} profile={profile} /> : <PopularProfileWideCard key={profile.id} profile={profile} />
              ))}
            </div>
          </div>

          <div className="popular-profiles__row-block">
            <div
              ref={(node) => {
                rowRefs.current[ROW_INDEX.SECOND] = node;
              }}
              className={`popular-profiles__cards-row popular-profiles__cards-row--second${isMobileCardLayout ? ' popular-profiles__cards-row--mobile-cards' : ''}`}
            >
              {secondRowProfiles.map((profile) => (
                isMobileCardLayout ? <ProfileCard key={profile.id} profile={profile} /> : <PopularProfileWideCard key={profile.id} profile={profile} />
              ))}
            </div>
          </div>
        </div>

        <div className="popular-profiles__cta-row">
          <PrimaryButton className="popular-profiles__cta-button" onClick={goToConsultants}>
            Buscar consultor
          </PrimaryButton>
        </div>

        <p className="popular-profiles__description">
          Conecta con los estrategas, encuestadores y arquitectos de campanas que definen el rumbo de la politica.
        </p>
      </div>
    </section>
  );
}

export default PopularProfiles;
