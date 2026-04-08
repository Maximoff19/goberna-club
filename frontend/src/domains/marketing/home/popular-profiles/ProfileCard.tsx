import { useState } from 'react';
import { ArrowUpRight, MousePointer2, Users } from 'lucide-react';
import VerifiedIcon from '../../../../shared/ui/VerifiedIcon';

interface Profile {
  id: string;
  slug?: string;
  name?: string;
  description: string;
  followers?: number | string;
  clicks?: number | string;
  imageSrc?: string;
}

interface ProfileCardProps {
  profile: Profile;
}

function compactProfileName(name: string | undefined): string {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 3) {
    return parts.join(' ');
  }

  return parts.slice(0, -1).join(' ');
}

function getInitials(name: string | undefined): string {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return (parts[0][0] || '?').toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ProfileCard({ profile }: ProfileCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const goToProfile = () => {
    window.location.hash = profile.slug ? `#perfil/${profile.slug}` : '#explorar-consultores';
    window.scrollTo(0, 0);
  };

  const displayName = compactProfileName(profile.name);
  const showImage = profile.imageSrc && !imageFailed;

  return (
    <article className="profile-card" onClick={goToProfile} onKeyDown={(event) => event.key === 'Enter' && goToProfile()}>
      <div className="profile-card__image-wrap">
        {showImage ? (
          <img className="profile-card__image" src={profile.imageSrc} alt={profile.name} loading="lazy" decoding="async" onError={() => setImageFailed(true)} />
        ) : (
          <div className="profile-card__image profile-card__image--initials" role="img" aria-label={profile.name}>
            {getInitials(profile.name)}
          </div>
        )}
      </div>

      <div className="profile-card__content">
        <div className="profile-card__name-row">
          <h3 className="profile-card__name">{displayName}</h3>
          <VerifiedIcon size={16} />
        </div>

        <p className="profile-card__description">{profile.description}</p>

        <div className="profile-card__bottom-row">
          <div className="profile-card__metrics">
            <div className="profile-card__metric-item">
              <Users size={14} strokeWidth={2.2} aria-hidden="true" />
              <span>{profile.followers}</span>
            </div>
            <div className="profile-card__metric-item">
              <MousePointer2 size={14} strokeWidth={2.2} aria-hidden="true" />
              <span>{profile.clicks}</span>
            </div>
          </div>

          <button type="button" className="profile-card__connect-button" onClick={(event) => { event.stopPropagation(); goToProfile(); }}>
            Conectar
            <ArrowUpRight size={13} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProfileCard;
