import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import ProfileSearchCard from './ProfileSearchCard';

const MIN_SEARCH_CHARS = 3;

function ProfileSearchOverlay({ isOpen, query, onQueryChange, profiles, onClose, onOpenProfile }) {
  const [isSearching, setIsSearching] = useState(false);
  const [visibleProfiles, setVisibleProfiles] = useState([]);

  useEffect(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.length < MIN_SEARCH_CHARS) {
      setIsSearching(false);
      setVisibleProfiles([]);
      return undefined;
    }

    setIsSearching(true);

    const timeoutId = window.setTimeout(() => {
      const nextProfiles = profiles.filter((profile) => {
        return profile.name.toLowerCase().includes(normalizedQuery) || profile.specialization.toLowerCase().includes(normalizedQuery);
      });

      setVisibleProfiles(nextProfiles);
      setIsSearching(false);
    }, 340);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query, profiles]);

  if (!isOpen) {
    return null;
  }

  const hasMinQueryLength = query.trim().length >= MIN_SEARCH_CHARS;

  return createPortal(
    <div className="profile-search-overlay" role="dialog" aria-modal="true" aria-label="Buscar perfiles">
      <button type="button" className="profile-search-overlay__backdrop" aria-label="Cerrar buscador" onClick={onClose} />

      <section className="profile-search-panel">
        <header className="profile-search-panel__header">
          <h3 className="profile-search-panel__title">Buscar perfiles</h3>
          <button type="button" className="profile-search-panel__close" aria-label="Cerrar buscador" onClick={onClose}>
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="profile-search-panel__input-wrap">
          <Search size={18} aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="profile-search-panel__input"
            placeholder="Buscar por nombre o especializacion"
            autoComplete="off"
          />
        </div>

        <div className="profile-search-results" aria-live="polite">
          {!hasMinQueryLength && (
            <p className="profile-search-results__hint">Escribi al menos 3 letras para comenzar la busqueda.</p>
          )}

          {hasMinQueryLength && isSearching &&
            [1, 2, 3].map((item) => (
              <article key={`search-skeleton-${item}`} className="profile-search-card profile-search-card--skeleton" aria-hidden="true">
                <div className="profile-search-skeleton profile-search-skeleton--avatar" />
                <div className="profile-search-card__content">
                  <div className="profile-search-skeleton profile-search-skeleton--title" />
                  <div className="profile-search-skeleton profile-search-skeleton--text" />
                  <div className="profile-search-skeleton profile-search-skeleton--text-short" />
                </div>
                <div className="profile-search-skeleton profile-search-skeleton--action" />
              </article>
            ))}

          {hasMinQueryLength && !isSearching &&
            visibleProfiles.map((profile) => <ProfileSearchCard key={profile.id} profile={profile} onOpenProfile={onOpenProfile} />)}

          {hasMinQueryLength && !isSearching && visibleProfiles.length === 0 && (
            <p className="profile-search-results__empty">No encontramos perfiles con ese criterio.</p>
          )}
        </div>
      </section>
    </div>,
    document.body
  );
}

export default ProfileSearchOverlay;
