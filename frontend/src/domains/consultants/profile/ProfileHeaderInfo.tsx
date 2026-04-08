import { Star } from 'lucide-react';
import VerifiedIcon from '../../../shared/ui/VerifiedIcon';

interface ProfileData {
  name?: string;
  specialization?: string;
  summary?: string;
}

interface ProfileHeaderInfoProps {
  variant?: string;
  profile: ProfileData;
  summary?: string;
}

function ProfileHeaderInfo({ variant = 'full', profile, summary }: ProfileHeaderInfoProps) {
  const isCompact = variant === 'compact';
  const nameParts = String(profile?.name || 'Nombre no definido').trim().split(/\s+/).filter(Boolean);
  const firstNames = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0] || 'Nombre';
  const lastName = nameParts.length > 1 ? nameParts.at(-1) : '';

  return (
    <div className="profile-header-info">
      {isCompact ? (
        <>
          <div className="profile-header-info__title-row">
            <h1 id="profile-name" className="profile-header-info__name">
              {firstNames}
              {lastName ? (
                <>
                  {' '}
                  <span className="profile-header-info__last-name-wrap">
                    <span>{lastName}</span>
                    <span aria-label="Perfil verificado" role="img" className="profile-header-info__verified profile-header-info__verified--inline">
                      <VerifiedIcon size={22} />
                    </span>
                  </span>
                </>
              ) : null}
            </h1>
          </div>

          <div className="profile-header-info__rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={`star-${star}`} size={14} fill="currentColor" />
            ))}
          </div>

          <p className="profile-header-info__short">
            {profile?.specialization || 'Especializacion no definida'}
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
