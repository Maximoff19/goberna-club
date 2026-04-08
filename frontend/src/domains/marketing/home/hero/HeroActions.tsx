import PrimaryButton from '../../../../shared/ui/PrimaryButton';
import { openConsultantJourney } from '../../../../app/navigation/consultantJourney';

function openConsultantsExplore() {
  window.location.hash = '#explorar-consultores';
  window.scrollTo(0, 0);
}

function HeroActions() {
  return (
    <div className="hero-actions">
      <button type="button" className="hero-actions__button hero-actions__button--ghost" onClick={openConsultantsExplore}>
        Buscar consultor
      </button>
      <PrimaryButton className="hero-actions__button hero-actions__button--primary" onClick={openConsultantJourney}>Ser consultor</PrimaryButton>
    </div>
  );
}

export default HeroActions;
