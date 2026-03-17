import { ArrowRight, Star } from 'lucide-react';

function ProfileSearchCard({ profile, onOpenProfile }) {
  return (
    <article className="profile-search-card">
      <img className="profile-search-card__image" src={profile.imageSrc} alt={profile.name} loading="lazy" decoding="async" />
      <div className="profile-search-card__content">
        <h4 className="profile-search-card__name">{profile.name}</h4>
        <p className="profile-search-card__specialization">{profile.specialization}</p>
        <div className="profile-search-card__rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={`${profile.id}-star-${star}`} size={13} fill="currentColor" />
          ))}
        </div>
      </div>

      <button type="button" className="profile-search-card__enter" aria-label={`Entrar al perfil de ${profile.name}`} onClick={() => onOpenProfile(profile)}>
        <ArrowRight size={16} aria-hidden="true" />
      </button>
    </article>
  );
}

export default ProfileSearchCard;
