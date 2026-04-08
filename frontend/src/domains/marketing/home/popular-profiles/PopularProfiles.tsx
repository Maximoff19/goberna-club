import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
  followers?: number | string;
  clicks?: number | string;
  imageSrc?: string;
  featured?: boolean;
  hasUploadedPhoto?: boolean;
}

interface PopularProfile {
  id: string;
  slug?: string;
  name?: string;
  description: string;
  followers?: number | string;
  clicks?: number | string;
  imageSrc?: string;
}

const ROW_INDEX = {
  FIRST: 0,
  SECOND: 1,
} as const;

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

  const sorted = [...unique].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    return String(left.name || '').localeCompare(String(right.name || ''));
  });

  return sorted.slice(0, 10).map((consultant) => ({
    id: consultant.id,
    slug: consultant.slug,
    name: consultant.name,
    description: consultant.specialization || consultant.summary || 'Consultor politico acreditado en Goberna Club.',
    followers: consultant.followers,
    clicks: consultant.clicks,
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
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const goToConsultants = () => {
    window.location.hash = '#explorar-consultores';
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    let ignore = false;

    fetchConsultants()
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

  const scrollRow = (rowIndex: number, direction: 'left' | 'right') => {
    const rowNode = rowRefs.current[rowIndex];

    if (!rowNode) {
      return;
    }

    const offset = Math.max(260, Math.round(rowNode.clientWidth * 0.82));
    rowNode.scrollBy({
      left: direction === 'left' ? -offset : offset,
      behavior: 'smooth',
    });
  };

  return (
    <section id="popular-profiles" className="popular-profiles" aria-labelledby="popular-profiles-title">
      <div className="popular-profiles__safe-area">
        <h2 className="popular-profiles__title" id="popular-profiles-title">
          PERFILES POPULARES
        </h2>

        <div className="popular-profiles__rows">
          <div className="popular-profiles__row-block">
            <button
              type="button"
              className="popular-profiles__row-arrow popular-profiles__row-arrow--left"
              aria-label="Desplazar fila superior hacia la izquierda"
              onClick={() => scrollRow(ROW_INDEX.FIRST, 'left')}
            >
              <ChevronLeft size={22} aria-hidden="true" />
            </button>

            <div
              ref={(node) => {
                rowRefs.current[ROW_INDEX.FIRST] = node;
              }}
              className="popular-profiles__cards-row popular-profiles__cards-row--first"
            >
              {firstRowProfiles.map((profile) => (
                <PopularProfileWideCard key={profile.id} profile={profile} />
              ))}
            </div>

            <button
              type="button"
              className="popular-profiles__row-arrow popular-profiles__row-arrow--right"
              aria-label="Desplazar fila superior hacia la derecha"
              onClick={() => scrollRow(ROW_INDEX.FIRST, 'right')}
            >
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          </div>

          <div className="popular-profiles__row-block">
            <button
              type="button"
              className="popular-profiles__row-arrow popular-profiles__row-arrow--left"
              aria-label="Desplazar fila inferior hacia la izquierda"
              onClick={() => scrollRow(ROW_INDEX.SECOND, 'left')}
            >
              <ChevronLeft size={22} aria-hidden="true" />
            </button>

            <div
              ref={(node) => {
                rowRefs.current[ROW_INDEX.SECOND] = node;
              }}
              className="popular-profiles__cards-row popular-profiles__cards-row--second"
            >
              {secondRowProfiles.map((profile) => (
                <PopularProfileWideCard key={profile.id} profile={profile} />
              ))}
            </div>

            <button
              type="button"
              className="popular-profiles__row-arrow popular-profiles__row-arrow--right"
              aria-label="Desplazar fila inferior hacia la derecha"
              onClick={() => scrollRow(ROW_INDEX.SECOND, 'right')}
            >
              <ChevronRight size={22} aria-hidden="true" />
            </button>
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
