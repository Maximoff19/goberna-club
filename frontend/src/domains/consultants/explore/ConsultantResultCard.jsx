import { useState } from 'react';
import { MousePointer2, Star, Users } from 'lucide-react';
import VerifiedIcon from '../../../shared/ui/VerifiedIcon';
import PrimaryButton from '../../../shared/ui/PrimaryButton';

function getInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return (parts[0][0] || '?').toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ConsultantResultCard({ consultant }) {
  const [imageFailed, setImageFailed] = useState(false);

  const goToProfile = () => {
    window.location.hash = consultant.slug ? `#perfil/${consultant.slug}` : '#explorar-consultores';
    window.scrollTo(0, 0);
  };

  const visibleSkills = Array.isArray(consultant.skills)
    ? consultant.skills
    : String(consultant.skills || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

  const showImage = consultant.imageSrc && !imageFailed;

  return (
    <article className="consultant-result-card">
      {showImage ? (
        <img
          className="consultant-result-card__photo"
          src={consultant.imageSrc}
          alt={consultant.name}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="consultant-result-card__photo consultant-result-card__photo--initials" role="img" aria-label={consultant.name}>
          {getInitials(consultant.name)}
        </div>
      )}

      <div className="consultant-result-card__main">
        <div className="consultant-result-card__name-row">
          <h3 className="consultant-result-card__name">{consultant.name}</h3>
          <span className="consultant-result-card__verified">
            <VerifiedIcon size={20} />
          </span>
        </div>

        <div className="consultant-result-card__rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={`${consultant.id}-star-${star}`} size={14} color="#FFC502" fill="#FFC502" />
          ))}
        </div>

        <p className="consultant-result-card__description">{consultant.specialization}</p>

        <p className="consultant-result-card__country">
          <span className="consultant-result-card__country-flag" aria-hidden="true">
            {consultant.countryFlag || '  '}
          </span>
          {consultant.countryLabel}
        </p>

        <div className="consultant-result-card__metrics">
          <span className="consultant-result-card__metric-item">
            <Users size={13} strokeWidth={2.2} aria-hidden="true" />
            {consultant.followers}
          </span>
          <span className="consultant-result-card__metric-item">
            <MousePointer2 size={13} strokeWidth={2.2} aria-hidden="true" />
            {consultant.clicks}
          </span>
        </div>
      </div>

      <div className="consultant-result-card__aside">
        <div className="consultant-result-card__skills-block">
          <p className="consultant-result-card__skills-title">Habilidades</p>
          <div className="consultant-result-card__skills-list">
            {visibleSkills.slice(0, 3).map((skill) => (
              <span key={`${consultant.id}-${skill}`} className="consultant-result-card__skill-pill">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <PrimaryButton className="consultant-result-card__connect" onClick={goToProfile}>
          Conectar
        </PrimaryButton>
      </div>
    </article>
  );
}

export default ConsultantResultCard;
