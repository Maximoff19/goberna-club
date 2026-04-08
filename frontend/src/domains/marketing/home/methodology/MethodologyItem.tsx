interface MethodologyItemProps {
  iconSrc: string;
  iconAlt: string;
  title: string;
  description: string;
}

function MethodologyItem({ iconSrc, iconAlt, title, description }: MethodologyItemProps) {
  return (
    <article className="methodology__item">
      <img className="methodology__icon" src={iconSrc} alt={iconAlt} loading="lazy" decoding="async" />
      <h3 className="methodology__item-title">{title}</h3>
      <p className="methodology__item-description">{description}</p>
    </article>
  );
}

export default MethodologyItem;
