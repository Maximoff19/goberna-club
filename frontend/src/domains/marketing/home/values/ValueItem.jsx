function ValueItem({ iconSrc, iconAlt, title, description }) {
  return (
    <article className="values__item">
      <img className="values__item-icon" src={iconSrc} alt={iconAlt} loading="lazy" decoding="async" />

      <div className="values__item-content">
        <h3 className="values__item-title">{title}</h3>
        <p className="values__item-description">{description}</p>
      </div>
    </article>
  );
}

export default ValueItem;
