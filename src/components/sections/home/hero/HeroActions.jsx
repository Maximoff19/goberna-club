import PrimaryButton from '../../../ui/PrimaryButton';

function openConsultantsExplore() {
  window.location.hash = '#explorar-consultores';
  window.scrollTo(0, 0);
}

function goToPricing() {
  const pricingSection = document.getElementById('precios');
  if (pricingSection) {
    pricingSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function HeroActions() {
  return (
    <div className="hero-actions">
      <button type="button" className="hero-actions__button hero-actions__button--ghost" onClick={openConsultantsExplore}>
        Buscar consultor
      </button>
      <PrimaryButton className="hero-actions__button hero-actions__button--primary" onClick={goToPricing}>Ser consultor</PrimaryButton>
    </div>
  );
}

export default HeroActions;
