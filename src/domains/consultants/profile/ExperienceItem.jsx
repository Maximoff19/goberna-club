import { Building2, MapPin } from 'lucide-react';

function ExperienceItem({ item }) {
  return (
    <article className="profile-exp-item">
      <img className="profile-exp-item__logo" src={item.logoSrc} alt={item.company} loading="lazy" decoding="async" />

      <div className="profile-exp-item__content">
        <h4>{item.role}</h4>
        <p className="profile-exp-item__company">{item.company}</p>

        <div className="profile-exp-item__meta">
          <span>
            <Building2 size={14} />
            {item.mode}
          </span>
          <span>{item.period}</span>
          <span>
            <MapPin size={14} />
            {item.location}
          </span>
        </div>

        <p className="profile-exp-item__description">{item.description}</p>
      </div>
    </article>
  );
}

export default ExperienceItem;
