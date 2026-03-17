import { useEffect, useRef, useState } from 'react';
import Footer from '../home/footer/Footer';
import ExploreHero from './ExploreHero';
import FiltersSidebar from './FiltersSidebar';
import ExploreSearchBar from './ExploreSearchBar';
import ConsultantsResultsList from './ConsultantsResultsList';
import './explore.css';

const FILTER_GROUPS = [
  {
    key: 'specialties',
    title: 'Especialidades',
    options: [
      { label: 'Estrategia Electoral', value: 'estrategia-electoral' },
      { label: 'Ciberdefensa Politica', value: 'ciberdefensa-politica' },
      { label: 'Comunicacion de Crisis', value: 'comunicacion-crisis' },
      { label: 'Opinion Publica', value: 'opinion-publica' },
    ],
  },
  {
    key: 'languages',
    title: 'Idioma',
    options: [
      { label: 'Espanol', value: 'espanol' },
      { label: 'Ingles', value: 'ingles' },
      { label: 'Portugues', value: 'portugues' },
    ],
  },
  {
    key: 'countries',
    title: 'Pais',
    options: [
      { label: 'Peru', value: 'peru' },
      { label: 'Mexico', value: 'mexico' },
      { label: 'Ecuador', value: 'ecuador' },
      { label: 'Bolivia', value: 'bolivia' },
      { label: 'Brasil', value: 'brasil' },
    ],
  },
  {
    key: 'skills',
    title: 'Habilidades',
    options: [
      { label: 'Analisis de datos', value: 'analisis-datos' },
      { label: 'Narrativa politica', value: 'narrativa-politica' },
      { label: 'War Room', value: 'war-room' },
      { label: 'Territorial', value: 'territorial' },
    ],
  },
];

const COUNTRY_CYCLE = [
  { key: 'peru', label: 'Peru' },
  { key: 'mexico', label: 'Mexico' },
  { key: 'ecuador', label: 'Ecuador' },
  { key: 'bolivia', label: 'Bolivia' },
  { key: 'brasil', label: 'Brasil' },
];

const BASE_CONSULTANTS = [
  {
    id: 'explore-1',
    name: 'Rodrigo Beltran',
    specialization: 'Analista de datos y especialista en ciberdefensa politica',
    imageSrc: '/perfiles/1.png',
    rating: 5,
    specialties: ['estrategia-electoral', 'ciberdefensa-politica'],
    languages: ['espanol', 'ingles'],
    skills: ['analisis-datos', 'war-room', 'narrativa-politica'],
  },
  {
    id: 'explore-2',
    name: 'Lucia Ibarra',
    specialization: 'Estratega en comunicacion politica digital',
    imageSrc: '/perfiles/2.png',
    rating: 5,
    specialties: ['comunicacion-crisis', 'estrategia-electoral'],
    languages: ['espanol', 'ingles'],
    skills: ['narrativa-politica', 'analisis-datos', 'territorial'],
  },
  {
    id: 'explore-3',
    name: 'Matias Mendez',
    specialization: 'Consultor en opinion publica y territorio',
    imageSrc: '/perfiles/3.png',
    rating: 5,
    specialties: ['opinion-publica', 'estrategia-electoral'],
    languages: ['espanol'],
    skills: ['territorial', 'war-room', 'analisis-datos'],
  },
  {
    id: 'explore-4',
    name: 'Carolina Lopez',
    specialization: 'Especialista en branding y narrativa electoral',
    imageSrc: '/perfiles/4.png',
    rating: 5,
    specialties: ['comunicacion-crisis', 'estrategia-electoral'],
    languages: ['espanol', 'ingles', 'portugues'],
    skills: ['narrativa-politica', 'war-room', 'territorial'],
  },
  {
    id: 'explore-5',
    name: 'Federico Quiroga',
    specialization: 'Director de campanas y gestion de crisis',
    imageSrc: '/perfiles/5.jpg',
    rating: 5,
    specialties: ['estrategia-electoral', 'comunicacion-crisis'],
    languages: ['espanol'],
    skills: ['war-room', 'analisis-datos', 'territorial'],
  },
  {
    id: 'explore-6',
    name: 'Julieta Sosa',
    specialization: 'Consultora en reputacion y liderazgo politico',
    imageSrc: '/perfiles/6.jpg',
    rating: 5,
    specialties: ['comunicacion-crisis', 'opinion-publica'],
    languages: ['espanol', 'ingles'],
    skills: ['narrativa-politica', 'territorial', 'analisis-datos'],
  },
  {
    id: 'explore-7',
    name: 'Santiago Romero',
    specialization: 'Arquitecto de estrategia electoral avanzada',
    imageSrc: '/perfiles/7.jpg',
    rating: 5,
    specialties: ['estrategia-electoral', 'opinion-publica'],
    languages: ['espanol', 'portugues'],
    skills: ['war-room', 'territorial', 'narrativa-politica'],
  },
  {
    id: 'explore-8',
    name: 'Mariana Paredes',
    specialization: 'Especialista en data storytelling para campanas',
    imageSrc: '/perfiles/1.png',
    rating: 5,
    specialties: ['ciberdefensa-politica', 'comunicacion-crisis'],
    languages: ['espanol', 'ingles'],
    skills: ['analisis-datos', 'narrativa-politica', 'war-room'],
  },
  {
    id: 'explore-9',
    name: 'Diego Arce',
    specialization: 'Consultor en segmentacion territorial y movilizacion',
    imageSrc: '/perfiles/2.png',
    rating: 5,
    specialties: ['estrategia-electoral', 'opinion-publica'],
    languages: ['espanol'],
    skills: ['territorial', 'war-room', 'analisis-datos'],
  },
  {
    id: 'explore-10',
    name: 'Valentina Ruiz',
    specialization: 'Directora de comunicacion politica digital',
    imageSrc: '/perfiles/3.png',
    rating: 5,
    specialties: ['comunicacion-crisis', 'estrategia-electoral'],
    languages: ['espanol', 'ingles'],
    skills: ['narrativa-politica', 'analisis-datos', 'territorial'],
  },
  {
    id: 'explore-11',
    name: 'Nicolas Ferrer',
    specialization: 'Especialista en ciberinteligencia electoral',
    imageSrc: '/perfiles/4.png',
    rating: 5,
    specialties: ['ciberdefensa-politica', 'estrategia-electoral'],
    languages: ['espanol', 'ingles'],
    skills: ['analisis-datos', 'war-room', 'narrativa-politica'],
  },
  {
    id: 'explore-12',
    name: 'Camila Torres',
    specialization: 'Consultora en opinion publica y tracking electoral',
    imageSrc: '/perfiles/5.jpg',
    rating: 5,
    specialties: ['opinion-publica', 'estrategia-electoral'],
    languages: ['espanol', 'portugues'],
    skills: ['analisis-datos', 'territorial', 'war-room'],
  },
];

const EXTRA_CONSULTANTS = [
  {
    id: 'explore-13',
    name: 'Paula Navarro',
    specialization: 'Especialista en segmentacion electoral avanzada',
    imageSrc: '/perfiles/6.jpg',
    rating: 5,
    specialties: ['estrategia-electoral', 'opinion-publica'],
    languages: ['espanol', 'ingles'],
    skills: ['territorial', 'analisis-datos', 'war-room'],
  },
  {
    id: 'explore-14',
    name: 'Andres Serrano',
    specialization: 'Consultor en comunicacion de crisis institucional',
    imageSrc: '/perfiles/7.jpg',
    rating: 5,
    specialties: ['comunicacion-crisis', 'estrategia-electoral'],
    languages: ['espanol'],
    skills: ['narrativa-politica', 'war-room', 'analisis-datos'],
  },
  {
    id: 'explore-15',
    name: 'Gabriela Nieto',
    specialization: 'Directora de opinion publica y tracking',
    imageSrc: '/perfiles/1.png',
    rating: 5,
    specialties: ['opinion-publica', 'estrategia-electoral'],
    languages: ['espanol', 'portugues'],
    skills: ['analisis-datos', 'territorial', 'war-room'],
  },
  {
    id: 'explore-16',
    name: 'Emilio Vargas',
    specialization: 'Analista en ciberdefensa y monitoreo politico',
    imageSrc: '/perfiles/2.png',
    rating: 5,
    specialties: ['ciberdefensa-politica', 'comunicacion-crisis'],
    languages: ['espanol', 'ingles'],
    skills: ['analisis-datos', 'narrativa-politica', 'war-room'],
  },
  {
    id: 'explore-17',
    name: 'Renata Ocampo',
    specialization: 'Consultora senior en narrativas de campana',
    imageSrc: '/perfiles/3.png',
    rating: 5,
    specialties: ['estrategia-electoral', 'comunicacion-crisis'],
    languages: ['espanol', 'ingles'],
    skills: ['narrativa-politica', 'territorial', 'war-room'],
  },
  {
    id: 'explore-18',
    name: 'Martin Zuniga',
    specialization: 'Estratega territorial para elecciones subnacionales',
    imageSrc: '/perfiles/4.png',
    rating: 5,
    specialties: ['estrategia-electoral', 'opinion-publica'],
    languages: ['espanol'],
    skills: ['territorial', 'war-room', 'analisis-datos'],
  },
  {
    id: 'explore-19',
    name: 'Elena Caceres',
    specialization: 'Especialista en reputacion politica digital',
    imageSrc: '/perfiles/5.jpg',
    rating: 5,
    specialties: ['comunicacion-crisis', 'ciberdefensa-politica'],
    languages: ['espanol', 'ingles'],
    skills: ['narrativa-politica', 'analisis-datos', 'territorial'],
  },
  {
    id: 'explore-20',
    name: 'Bruno Ibanez',
    specialization: 'Consultor en analisis electoral y war room',
    imageSrc: '/perfiles/6.jpg',
    rating: 5,
    specialties: ['estrategia-electoral', 'opinion-publica'],
    languages: ['espanol', 'ingles'],
    skills: ['war-room', 'analisis-datos', 'territorial'],
  },
  {
    id: 'explore-21',
    name: 'Nadia Fuentes',
    specialization: 'Arquitecta de comunicacion politica de alto impacto',
    imageSrc: '/perfiles/7.jpg',
    rating: 5,
    specialties: ['comunicacion-crisis', 'estrategia-electoral'],
    languages: ['espanol', 'portugues'],
    skills: ['narrativa-politica', 'war-room', 'analisis-datos'],
  },
  {
    id: 'explore-22',
    name: 'Leandro Ponce',
    specialization: 'Consultor en opinion publica para presidenciales',
    imageSrc: '/perfiles/1.png',
    rating: 5,
    specialties: ['opinion-publica', 'estrategia-electoral'],
    languages: ['espanol'],
    skills: ['analisis-datos', 'territorial', 'war-room'],
  },
  {
    id: 'explore-23',
    name: 'Ariadna Solis',
    specialization: 'Especialista en defensa de narrativa digital',
    imageSrc: '/perfiles/2.png',
    rating: 5,
    specialties: ['ciberdefensa-politica', 'comunicacion-crisis'],
    languages: ['espanol', 'ingles'],
    skills: ['narrativa-politica', 'analisis-datos', 'territorial'],
  },
  {
    id: 'explore-24',
    name: 'Carlos Iturri',
    specialization: 'Director de estrategia electoral y movilizacion',
    imageSrc: '/perfiles/3.png',
    rating: 5,
    specialties: ['estrategia-electoral', 'opinion-publica'],
    languages: ['espanol', 'ingles'],
    skills: ['territorial', 'war-room', 'analisis-datos'],
  },
  {
    id: 'explore-25',
    name: 'Silvia Reinoso',
    specialization: 'Consultora en liderazgo y reputacion publica',
    imageSrc: '/perfiles/4.png',
    rating: 5,
    specialties: ['comunicacion-crisis', 'opinion-publica'],
    languages: ['espanol'],
    skills: ['narrativa-politica', 'war-room', 'territorial'],
  },
  {
    id: 'explore-26',
    name: 'Joaquin Barrera',
    specialization: 'Especialista en inteligencia electoral territorial',
    imageSrc: '/perfiles/5.jpg',
    rating: 5,
    specialties: ['estrategia-electoral', 'ciberdefensa-politica'],
    languages: ['espanol', 'portugues'],
    skills: ['analisis-datos', 'territorial', 'war-room'],
  },
  {
    id: 'explore-27',
    name: 'Micaela Nunez',
    specialization: 'Consultora en comunicacion politica para crisis',
    imageSrc: '/perfiles/6.jpg',
    rating: 5,
    specialties: ['comunicacion-crisis', 'estrategia-electoral'],
    languages: ['espanol', 'ingles'],
    skills: ['narrativa-politica', 'analisis-datos', 'war-room'],
  },
  {
    id: 'explore-28',
    name: 'Tomas Ledesma',
    specialization: 'Analista de opinion publica y tendencias sociales',
    imageSrc: '/perfiles/7.jpg',
    rating: 5,
    specialties: ['opinion-publica', 'estrategia-electoral'],
    languages: ['espanol'],
    skills: ['analisis-datos', 'territorial', 'narrativa-politica'],
  },
  {
    id: 'explore-29',
    name: 'Daniela Prat',
    specialization: 'Consultora de posicionamiento en campanas digitales',
    imageSrc: '/perfiles/1.png',
    rating: 5,
    specialties: ['comunicacion-crisis', 'ciberdefensa-politica'],
    languages: ['espanol', 'ingles'],
    skills: ['narrativa-politica', 'war-room', 'analisis-datos'],
  },
  {
    id: 'explore-30',
    name: 'Rafael Cifuentes',
    specialization: 'Director de arquitectura electoral avanzada',
    imageSrc: '/perfiles/2.png',
    rating: 5,
    specialties: ['estrategia-electoral', 'opinion-publica'],
    languages: ['espanol', 'portugues'],
    skills: ['territorial', 'war-room', 'analisis-datos'],
  },
];

const CONSULTANTS = [...BASE_CONSULTANTS, ...EXTRA_CONSULTANTS].map((consultant, index) => ({
  ...consultant,
  followers: `${18 + ((index * 7) % 37)}k`,
  clicks: `${34 + ((index * 9) % 58)}k`,
  countryKey: COUNTRY_CYCLE[index % COUNTRY_CYCLE.length].key,
  countryLabel: COUNTRY_CYCLE[index % COUNTRY_CYCLE.length].label,
}));

const INITIAL_RENDER_COUNT = 10;
const MAX_SCROLL_RENDER_COUNT = 25;
const PAGE_SIZE = 25;

function getNextVisibleCount(currentCount, maxCount) {
  if (currentCount < 20) {
    return Math.min(maxCount, currentCount + 10);
  }

  return Math.min(maxCount, currentCount + 5);
}

const EMPTY_FILTERS = {
  specialties: [],
  languages: [],
  countries: [],
  skills: [],
};

function matchesGroupFilter(consultantValues, selectedValues) {
  if (selectedValues.length === 0) {
    return true;
  }

  return selectedValues.some((selectedValue) => consultantValues.includes(selectedValue));
}

function ConsultantsExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState(EMPTY_FILTERS);
  const [isFiltersCollapsedMobile, setIsFiltersCollapsedMobile] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCount, setVisibleCount] = useState(INITIAL_RENDER_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef(null);
  const isLoadingMoreRef = useRef(false);
  const loadMoreTimeoutRef = useRef(0);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;

    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
    };
  }, []);

  const toggleFilter = (groupKey, value) => {
    setCurrentPage(1);
    setVisibleCount(INITIAL_RENDER_COUNT);
    setIsLoadingMore(false);
    isLoadingMoreRef.current = false;
    window.clearTimeout(loadMoreTimeoutRef.current);

    setSelectedFilters((currentFilters) => {
      const currentValues = currentFilters[groupKey];
      const valueExists = currentValues.includes(value);

      return {
        ...currentFilters,
        [groupKey]: valueExists
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredConsultants = CONSULTANTS.filter((consultant) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      consultant.name.toLowerCase().includes(normalizedQuery) ||
      consultant.specialization.toLowerCase().includes(normalizedQuery);

    if (!matchesSearch) {
      return false;
    }

    const matchesSpecialties = matchesGroupFilter(consultant.specialties, selectedFilters.specialties);
    const matchesLanguages = matchesGroupFilter(consultant.languages, selectedFilters.languages);
    const matchesCountries = matchesGroupFilter([consultant.countryKey], selectedFilters.countries);
    const matchesSkills = matchesGroupFilter(consultant.skills, selectedFilters.skills);

    return matchesSpecialties && matchesLanguages && matchesCountries && matchesSkills;
  });

  const totalPages = Math.max(1, Math.ceil(filteredConsultants.length / PAGE_SIZE));
  const normalizedPage = Math.min(currentPage, totalPages);
  const pageStart = (normalizedPage - 1) * PAGE_SIZE;
  const pageConsultants = filteredConsultants.slice(pageStart, pageStart + PAGE_SIZE);
  const maxVisibleOnPage = Math.min(MAX_SCROLL_RENDER_COUNT, pageConsultants.length);
  const renderedConsultants = pageConsultants.slice(0, Math.min(visibleCount, maxVisibleOnPage));
  const showPagination = filteredConsultants.length > MAX_SCROLL_RENDER_COUNT && visibleCount >= maxVisibleOnPage;

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || visibleCount >= maxVisibleOnPage) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting || isLoadingMoreRef.current) {
          return;
        }

        isLoadingMoreRef.current = true;
        setIsLoadingMore(true);

        loadMoreTimeoutRef.current = window.setTimeout(() => {
          setVisibleCount((currentCount) => getNextVisibleCount(currentCount, maxVisibleOnPage));
          setIsLoadingMore(false);
          isLoadingMoreRef.current = false;
        }, 320);
      },
      {
        root: null,
        threshold: 0.35,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      window.clearTimeout(loadMoreTimeoutRef.current);
    };
  }, [maxVisibleOnPage, visibleCount]);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    setVisibleCount(INITIAL_RENDER_COUNT);
    setIsLoadingMore(false);
    isLoadingMoreRef.current = false;
    window.clearTimeout(loadMoreTimeoutRef.current);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <ExploreHero />

      <main className="explore-page" aria-label="Exploracion de consultores">
        <div className="explore-page__safe-area">
          <div className="explore-page__layout">
            <FiltersSidebar
              filterGroups={FILTER_GROUPS}
              selectedFilters={selectedFilters}
              onToggleFilter={toggleFilter}
              isMobileCollapsed={isFiltersCollapsedMobile}
              onToggleMobileCollapse={() => setIsFiltersCollapsedMobile((current) => !current)}
            />

            <section className="explore-results" aria-label="Listado de consultores">
              <ExploreSearchBar
                value={searchQuery}
                onChange={(nextValue) => {
                  setSearchQuery(nextValue);
                  setCurrentPage(1);
                  setVisibleCount(INITIAL_RENDER_COUNT);
                  setIsLoadingMore(false);
                  isLoadingMoreRef.current = false;
                  window.clearTimeout(loadMoreTimeoutRef.current);
                }}
              />
              <ConsultantsResultsList consultants={renderedConsultants} />

              {isLoadingMore && (
                <div className="explore-loading-skeleton" aria-hidden="true">
                  {[1, 2].map((item) => (
                    <article key={`explore-skeleton-${item}`} className="explore-loading-card">
                      <div className="explore-loading-skeleton__avatar" />
                      <div className="explore-loading-skeleton__body">
                        <div className="explore-loading-skeleton__line explore-loading-skeleton__line--title" />
                        <div className="explore-loading-skeleton__line explore-loading-skeleton__line--text" />
                        <div className="explore-loading-skeleton__line explore-loading-skeleton__line--text-short" />
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {visibleCount < maxVisibleOnPage && <div ref={loadMoreRef} className="explore-loading-sentinel" aria-hidden="true" />}
            </section>
          </div>

          {showPagination && (
            <div className="explore-page__pagination-layout">
              <nav className="explore-pagination" aria-label="Paginacion de consultores">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={`explore-page-${pageNumber}`}
                    type="button"
                    className={`explore-pagination__button ${normalizedPage === pageNumber ? 'explore-pagination__button--active' : ''}`.trim()}
                    onClick={() => goToPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </main>

      <Footer enableReveal={false} />
    </>
  );
}

export default ConsultantsExplorePage;
