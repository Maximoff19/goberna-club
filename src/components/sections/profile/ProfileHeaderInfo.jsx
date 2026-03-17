import { Star } from 'lucide-react';
import VerifiedIcon from '../../ui/VerifiedIcon';

function ProfileHeaderInfo({ variant = 'full', summary }) {
  const isCompact = variant === 'compact';

  return (
    <div className="profile-header-info">
      {isCompact ? (
        <>
          <div className="profile-header-info__title-row">
            <h1 id="profile-name" className="profile-header-info__name">
              Rodrigo Beltran
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

          <p className="profile-header-info__short">Analista de datos y especialista en ciberdefensa política</p>
        </>
      ) : (
        <p className="profile-header-info__summary">
          {summary ||
            'Consultor político con más de 12 años de experiencia en campañas presidenciales, parlamentarias y municipales en América Latina. Especializado en estrategia electoral, lectura de datos de opinión pública y diseño de comunicación de alto impacto para escenarios de crisis. Ha liderado equipos multidisciplinarios en entornos de alta presión, combinando análisis técnico, narrativa política y toma de decisiones orientada a resultados.'}
        </p>
      )}
    </div>
  );
}

export default ProfileHeaderInfo;
