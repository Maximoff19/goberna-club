import { Funnel } from 'lucide-react';
import FilterGroup from './FilterGroup';

function FiltersSidebar({ filterGroups, selectedFilters, onToggleFilter, isMobileCollapsed, onToggleMobileCollapse }) {
  return (
    <>
      <button
        type="button"
        className="explore-filters__mobile-toggle"
        onClick={onToggleMobileCollapse}
        aria-expanded={!isMobileCollapsed}
        aria-controls="explore-filters-panel"
      >
        <span>{isMobileCollapsed ? 'Mostrar filtros' : 'Ocultar filtros'}</span>
        <Funnel size={16} color="#0F1923" aria-hidden="true" />
      </button>

      <aside
        id="explore-filters-panel"
        className={`explore-filters ${isMobileCollapsed ? 'explore-filters--mobile-collapsed' : ''}`.trim()}
        aria-label="Panel de filtros"
      >
        <header className="explore-filters__header">
          <h2 className="explore-filters__title">Filtros</h2>
          <Funnel size={22} color="#0F1923" aria-hidden="true" />
        </header>

        <div className="explore-filters__groups">
          {filterGroups.map((group) => (
            <FilterGroup
              key={group.key}
              title={group.title}
              options={group.options}
              selectedValues={selectedFilters[group.key]}
              onToggle={(value) => onToggleFilter(group.key, value)}
            />
          ))}
        </div>
      </aside>
    </>
  );
}

export default FiltersSidebar;
