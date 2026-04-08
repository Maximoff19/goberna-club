import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterGroupProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}

function FilterGroup({ title, options, selectedValues, onToggle }: FilterGroupProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <section className="explore-filter-group" aria-labelledby={`explore-filter-group-${title}`}>
      <button
        type="button"
        className="explore-filter-group__toggle"
        onClick={() => setIsCollapsed((current) => !current)}
        aria-expanded={!isCollapsed}
        aria-controls={`explore-filter-group-panel-${title}`}
      >
        <h3 id={`explore-filter-group-${title}`} className="explore-filter-group__title">
          {title}
        </h3>
        <ChevronDown size={16} className={`explore-filter-group__chevron ${isCollapsed ? 'is-collapsed' : ''}`} aria-hidden="true" />
      </button>

      <div
        id={`explore-filter-group-panel-${title}`}
        className={`explore-filter-group__options ${isCollapsed ? 'explore-filter-group__options--collapsed' : ''}`}
      >
        {options.map((option) => {
          const isChecked = selectedValues.includes(option.value);

          return (
            <label key={option.value} className="explore-filter-option">
              <span className="explore-filter-option__label">{option.label}</span>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggle(option.value)}
                className="explore-filter-option__checkbox"
              />
            </label>
          );
        })}
      </div>
    </section>
  );
}

export default FilterGroup;
