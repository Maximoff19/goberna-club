import ReferralForm from './ReferralForm';
import './referralSection.css';

function ReferralSection() {
  return (
    <section id="contacto" className="referral-section" aria-labelledby="referral-title">
      <div className="referral-section__safe-area">
        <div className="referral-section__media-col">
          <div className="referral-section__media-wrap">
            <img
              className="referral-section__media"
              src="/fag.webp"
              alt="Consultora recomendando la red"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div className="referral-section__panel">
          <h2 id="referral-title" className="referral-section__title">
            Has llevado nuestros cursos de especializacion y no has sido acreditado en nuestra red de Consultores?
          </h2>

          <p className="referral-section__subtitle">
            <span>Recomiendanos y obten la </span>
            <strong>suscripcion </strong>
            <strong className="referral-section__highlight">100%</strong>
            <strong> gratis.</strong>
          </p>

          <ReferralForm />

          <span className="referral-section__panel-accent" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

export default ReferralSection;
