import { useEffect, useMemo, useRef, useState } from 'react';
import Footer from '../../marketing/home/footer/Footer';
import ExploreHero from './ExploreHero';
import FiltersSidebar from './FiltersSidebar';
import ExplorePagination from './ExplorePagination';
import ExploreSearchBar from './ExploreSearchBar';
import ConsultantsResultsList from './ConsultantsResultsList';
import { fetchConsultantsPage, fetchProfileCatalogs } from '../../../shared/api/gobernaApi';
import './explore.css';

interface CatalogItem {
  id: string;
  label: string;
  code?: string;
  slug?: string;
}

interface Catalogs {
  countries: CatalogItem[];
  specialties: CatalogItem[];
  skills: CatalogItem[];
}

interface ConsultantListItem {
  id: string;
  slug?: string;
  name: string;
  imageSrc?: string;
  specialization?: string;
  countryFlag?: string;
  countryLabel?: string;
  countryCode?: string;
  followers?: number;
  clicks?: number;
  skills?: string[];
  languages?: string[];
}

interface FilterOption {
  label: string;
  value: string;
}

interface FilterGroupData {
  key: string;
  title: string;
  options: FilterOption[];
}

interface SelectedFilters {
  [key: string]: string[];
  specialties: string[];
  languages: string[];
  countries: string[];
  skills: string[];
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

// Default empty state for all filter categories
const EMPTY_FILTERS: SelectedFilters = {
  specialties: [],
  languages: [],
  countries: [],
  skills: [],
};

function buildFilterGroups(catalogs: Catalogs, consultants: ConsultantListItem[]): FilterGroupData[] {
  const usedSpecialties = new Set(consultants.map((consultant) => consultant.specialization).filter(Boolean));
  const usedCountries = new Set(consultants.map((consultant) => consultant.countryLabel).filter(Boolean));
  const usedSkills = new Set(consultants.flatMap((consultant) => consultant.skills || []).filter(Boolean));
  const languageOptions = Array.from(new Set(consultants.flatMap((consultant) => consultant.languages || [])))
    .filter(Boolean)
    .map((label) => ({ label, value: label }));

  return [
    {
      key: 'specialties',
      title: 'Especialidades',
      options: catalogs.specialties
        .filter((specialty) => usedSpecialties.has(specialty.label))
        .map((specialty) => ({ label: specialty.label, value: specialty.label })),
    },
    {
      key: 'languages',
      title: 'Idioma',
      options: languageOptions,
    },
    {
      key: 'countries',
      title: 'Pais',
      options: catalogs.countries
        .filter((country) => usedCountries.has(country.label))
        .map((country) => ({ label: country.label, value: country.label })),
    },
    {
      key: 'skills',
      title: 'Habilidades',
      options: catalogs.skills
        .filter((skill) => usedSkills.has(skill.label))
        .map((skill) => ({ label: skill.label, value: skill.label })),
    },
  ].filter((group) => group.options.length > 0);
}

function ConsultantsExplorePage() {
  const [loadedConsultants, setLoadedConsultants] = useState<ConsultantListItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(EMPTY_FILTERS);
  const [isFiltersCollapsedMobile, setIsFiltersCollapsedMobile] = useState(true);
  const [catalogs, setCatalogs] = useState<Catalogs>({ countries: [], specialties: [], skills: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 25, total: 0, totalPages: 1, hasMore: false });
  const revealMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const requestParams = useMemo(() => ({
    page,
    limit: 25,
    q: debouncedQuery.trim() || undefined,
    countries: selectedFilters.countries,
    languages: selectedFilters.languages,
    specialties: selectedFilters.specialties,
    skills: selectedFilters.skills,
  }), [page, debouncedQuery, selectedFilters]);

  useEffect(() => {
    let ignore = false;

    setIsLoading(true);

    Promise.all([fetchConsultantsPage(requestParams), fetchProfileCatalogs()])
      .then(([consultantsPage, nextCatalogs]: [any, any]) => {
        if (!ignore) {
          setLoadedConsultants(consultantsPage.items);
          setVisibleCount(Math.min(10, consultantsPage.items.length));
          setPagination(consultantsPage.pagination);
          setCatalogs(nextCatalogs);
        }
      })
      .catch(() => {
        if (!ignore) {
          setLoadedConsultants([]);
          setVisibleCount(10);
          setPagination({ page: 1, limit: 25, total: 0, totalPages: 1, hasMore: false });
          setCatalogs({ countries: [], specialties: [], skills: [] });
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [requestParams]);

  const filteredConsultants = loadedConsultants;

  useEffect(() => {
    const node = revealMoreRef.current;
    if (!node || isLoading || visibleCount >= filteredConsultants.length) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting) {
        return;
      }

      setVisibleCount((current) => Math.min(current + 5, filteredConsultants.length));
    }, { rootMargin: '220px 0px' });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [isLoading, filteredConsultants.length, visibleCount]);

  const filterGroups = useMemo(() => buildFilterGroups(catalogs, loadedConsultants), [catalogs, loadedConsultants]);

  const toggleFilter = (groupKey: string, value: string) => {
    setPage(1);
    setSelectedFilters((currentFilters) => {
      const currentValues = currentFilters[groupKey as keyof SelectedFilters];
      const valueExists = currentValues.includes(value);

      return {
        ...currentFilters,
        [groupKey]: valueExists ? currentValues.filter((item) => item !== value) : [...currentValues, value],
      };
    });
  };

  return (
    <>
      <ExploreHero />

      <main className="explore-page" aria-label="Exploracion de consultores">
        <div className="explore-page__safe-area">
          <div className="explore-page__layout">
            <FiltersSidebar
              filterGroups={filterGroups}
              selectedFilters={selectedFilters}
              onToggleFilter={toggleFilter}
              isMobileCollapsed={isFiltersCollapsedMobile}
              onToggleMobileCollapse={() => setIsFiltersCollapsedMobile((current) => !current)}
            />

            <section className="explore-results" aria-label="Listado de consultores">
              <ExploreSearchBar value={searchQuery} onChange={(value) => {
                setVisibleCount(10);
                setPage(1);
                setSearchQuery(value);
              }} />
              <ConsultantsResultsList consultants={filteredConsultants.slice(0, visibleCount)} isLoading={isLoading} />
              {!isLoading && visibleCount < filteredConsultants.length ? <div ref={revealMoreRef} className="explore-loading-sentinel" aria-hidden="true" /> : null}
              <ExplorePagination page={pagination.page} totalPages={pagination.totalPages} totalItems={pagination.total} onChange={setPage} />
            </section>
          </div>
        </div>
      </main>

      <Footer enableReveal={false} />
    </>
  );
}

export default ConsultantsExplorePage;
