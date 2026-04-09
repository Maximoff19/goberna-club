import { Star } from 'lucide-react';
import { useState } from 'react';
import VerifiedIcon from '../../../../shared/ui/VerifiedIcon';

interface PopularProfileWideCardData {
  id: string;
  slug?: string;
  name?: string;
  description: string;
  imageSrc?: string;
}

interface PopularProfileWideCardProps {
  profile: PopularProfileWideCardData;
}

interface NameParts {
  leading: string;
  trailing: string;
}

function getInitials(name: string | undefined): string {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return (parts[0][0] || '?').toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function splitNameParts(name: string | undefined): NameParts {
  const normalizedName = String(name || 'Consultor acreditado').trim().replace(/\s+/g, ' ');
  const parts = normalizedName.split(' ').filter(Boolean);

  if (parts.length <= 1) {
    return {
      leading: '',
      trailing: normalizedName,
    };
  }

  return {
    leading: parts.slice(0, -1).join(' '),
    trailing: parts[parts.length - 1],
  };
}

function PopularProfileWideCard({ profile }: PopularProfileWideCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = profile.imageSrc && !imageFailed;
  const { leading, trailing } = splitNameParts(profile.name);

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
          <h3 className="popular-profile-wide-card__name-row">
            {leading ? <span className="popular-profile-wide-card__name">{leading}&nbsp;</span> : null}
            <span className="popular-profile-wide-card__name-tail">
              <span className="popular-profile-wide-card__name">{trailing}</span>
              <span className="popular-profile-wide-card__verified">
                <VerifiedIcon size={18} />
              </span>
            </span>
          </h3>

          <p className="popular-profile-wide-card__specialization">{profile.description}</p>

          <div className="popular-profile-wide-card__stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={`${profile.id}-star-${star}`} size={12} fill="#FFC502" color="#FFC502" strokeWidth={1.8} />
            ))}
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
