import { useState } from 'react';
import { ArrowRight, Star } from 'lucide-react';

interface ProfileSearchData {
  id: string;
  name: string;
  imageSrc?: string;
  specialization?: string;
  slug?: string;
}

interface ProfileSearchCardProps {
  profile: ProfileSearchData;
  onOpenProfile: (profile: ProfileSearchData) => void;
}

function getInitials(name: string): string {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return (parts[0][0] || '?').toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ProfileSearchCard({ profile, onOpenProfile }: ProfileSearchCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = profile.imageSrc && !imageFailed;

  return (
    <article className="profile-search-card">
      {showImage ? (
        <img className="profile-search-card__image" src={profile.imageSrc} alt={profile.name} loading="lazy" decoding="async" onError={() => setImageFailed(true)} />
      ) : (
        <div className="profile-search-card__image profile-search-card__image--initials" role="img" aria-label={profile.name}>
          {getInitials(profile.name)}
        </div>
      )}
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
