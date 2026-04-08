import { MousePointer2, Star, Users } from 'lucide-react';
import { useState } from 'react';
import VerifiedIcon from '../../../../shared/ui/VerifiedIcon';

interface PopularProfileWideCardData {
  id: string;
  slug?: string;
  name?: string;
  description: string;
  followers?: number | string;
  clicks?: number | string;
  imageSrc?: string;
}

interface PopularProfileWideCardProps {
  profile: PopularProfileWideCardData;
}

function getInitials(name: string | undefined): string {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return (parts[0][0] || '?').toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatMetric(value: number | string | undefined): string {
  if (value === undefined || value === null || value === '') {
    return '0';
  }

  return String(value);
}

function PopularProfileWideCard({ profile }: PopularProfileWideCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = profile.imageSrc && !imageFailed;

  const goToProfile = () => {
    window.location.hash = profile.slug ? `#perfil/${profile.slug}` : '#explorar-consultores';
    window.scrollTo(0, 0);
  };

  return (
    <article className="popular-profile-wide-card">
      <div className="popular-profile-wide-card__avatar-shell">
        <div className="popular-profile-wide-card__avatar-border">
          {showImage ? (
            <img
              className="popular-profile-wide-card__avatar"
              src={profile.imageSrc}
              alt={profile.name}
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="popular-profile-wide-card__avatar popular-profile-wide-card__avatar--initials" role="img" aria-label={profile.name}>
              {getInitials(profile.name)}
            </div>
          )}
        </div>
      </div>

      <div className="popular-profile-wide-card__content">
        <div className="popular-profile-wide-card__identity">
          <div className="popular-profile-wide-card__name-row">
            <h3 className="popular-profile-wide-card__name">{profile.name || 'Consultor acreditado'}</h3>
            <VerifiedIcon size={18} />
          </div>

          <p className="popular-profile-wide-card__specialization">{profile.description}</p>

          <div className="popular-profile-wide-card__stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={`${profile.id}-star-${star}`} size={12} fill="#FFC502" color="#FFC502" strokeWidth={1.8} />
            ))}
          </div>
        </div>

        <div className="popular-profile-wide-card__metrics">
          <div className="popular-profile-wide-card__metric-item">
            <MousePointer2 size={15} strokeWidth={2.2} aria-hidden="true" />
            <span className="popular-profile-wide-card__metric-value">{formatMetric(profile.clicks)}</span>
            <span className="popular-profile-wide-card__metric-label">clicks</span>
          </div>

          <div className="popular-profile-wide-card__metric-item">
            <Users size={15} strokeWidth={2.2} aria-hidden="true" />
            <span className="popular-profile-wide-card__metric-value">{formatMetric(profile.followers)}</span>
            <span className="popular-profile-wide-card__metric-label">contactos</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="popular-profile-wide-card__hitarea"
        aria-label={`Abrir perfil de ${profile.name || 'consultor acreditado'}`}
        onClick={goToProfile}
      />
    </article>
  );
}

export default PopularProfileWideCard;
