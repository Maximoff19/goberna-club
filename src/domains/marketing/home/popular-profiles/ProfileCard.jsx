import { ArrowUpRight, MousePointer2, Users } from 'lucide-react';
import VerifiedIcon from '../../../../shared/ui/VerifiedIcon';

function ProfileCard({ profile }) {
  const goToProfile = () => {
    window.location.hash = 'perfil';
    window.scrollTo(0, 0);
  };

  return (
    <article className="profile-card">
      <div className="profile-card__image-wrap">
        {profile.imageSrc ? (
          <img className="profile-card__image" src={profile.imageSrc} alt={profile.name} loading="lazy" decoding="async" />
        ) : (
          <div className="profile-card__image profile-card__image--empty" aria-hidden="true" />
        )}
      </div>

      <div className="profile-card__content">
        <div className="profile-card__name-row">
          <h3 className="profile-card__name">{profile.name}</h3>
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

          <button type="button" className="profile-card__connect-button" onClick={goToProfile}>
            Conectar
            <ArrowUpRight size={13} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProfileCard;
