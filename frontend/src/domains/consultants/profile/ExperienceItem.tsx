import { Building2, MapPin } from 'lucide-react';

interface ExperienceItemData {
  role: string;
  company: string;
  mode: string;
  period: string;
  location: string;
  description: string;
}

interface ExperienceItemProps {
  item: ExperienceItemData;
}

function ExperienceItem({ item }: ExperienceItemProps) {
  return (
    <article className="profile-exp-item">
      <span className="profile-exp-item__accent" aria-hidden="true" />

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
