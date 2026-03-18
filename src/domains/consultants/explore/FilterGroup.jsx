function FilterGroup({ title, options, selectedValues, onToggle }) {
  return (
    <section className="explore-filter-group" aria-labelledby={`explore-filter-group-${title}`}>
      <h3 id={`explore-filter-group-${title}`} className="explore-filter-group__title">
        {title}
      </h3>

      <div className="explore-filter-group__options">
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
