import { Star } from 'lucide-react';
import VerifiedIcon from '../../ui/VerifiedIcon';

function ProfileHeaderInfo({ variant = 'full', profile, summary }) {
  const isCompact = variant === 'compact';

  return (
    <div className="profile-header-info">
      {isCompact ? (
        <>
          <div className="profile-header-info__title-row">
            <h1 id="profile-name" className="profile-header-info__name">
              {profile?.name || 'Nombre no definido'}
            </h1>
            <span aria-label="Perfil verificado" role="img" className="profile-header-info__verified">
              <VerifiedIcon size={22} />
            </span>
          </div>

          <div className="profile-header-info__rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={`star-${star}`} size={14} fill="currentColor" />
            ))}
          </div>

          <p className="profile-header-info__short">
            {profile?.specialization || 'Especialización no definida'}
          </p>
        </>
      ) : (
        <p className="profile-header-info__summary">
          {summary || profile?.summary || 'Sin resumen profesional.'}
        </p>
      )}
    </div>
  );
}

export default ProfileHeaderInfo;
