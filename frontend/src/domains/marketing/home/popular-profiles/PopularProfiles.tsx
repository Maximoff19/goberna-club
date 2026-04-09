import { useEffect, useState } from 'react';
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
  featured?: boolean;
  hasUploadedPhoto?: boolean;
}

interface PopularProfile {
  id: string;
  slug?: string;
  name?: string;
  description: string;
  imageSrc?: string;
}

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

  return (
    <section id="popular-profiles" className="popular-profiles" aria-labelledby="popular-profiles-title">
      <div className="popular-profiles__safe-area">
        <h2 className="popular-profiles__title" id="popular-profiles-title">
          PERFILES POPULARES
        </h2>

        <div className="popular-profiles__rows">
          <div className="popular-profiles__row-block">
            <div className="popular-profiles__cards-row popular-profiles__cards-row--first">
              {firstRowProfiles.map((profile) => (
                <PopularProfileWideCard key={profile.id} profile={profile} />
              ))}
            </div>
          </div>

          <div className="popular-profiles__row-block">
            <div className="popular-profiles__cards-row popular-profiles__cards-row--second">
              {secondRowProfiles.map((profile) => (
                <PopularProfileWideCard key={profile.id} profile={profile} />
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
