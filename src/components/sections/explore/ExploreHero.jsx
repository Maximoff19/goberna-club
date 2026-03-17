import { ArrowLeft } from 'lucide-react';
import HeroBrand from '../home/hero/HeroBrand';
import HeroNetworkBackground from '../home/hero/HeroNetworkBackground';

function ExploreHero() {
  const goHome = () => {
    window.location.hash = '';
    window.scrollTo(0, 0);
  };

  return (
    <section
      className="explore-hero"
      style={{
        backgroundImage: "url('/imagenhero.webp')",
      }}
    >
      <HeroNetworkBackground className="explore-hero__particles" particleId="explore-hero-tsparticles" />

      <div className="explore-hero__safe-area">
        <div className="explore-hero__top-row">
          <HeroBrand />

          <button type="button" className="explore-hero__back-button" onClick={goHome}>
            <ArrowLeft size={16} aria-hidden="true" />
            Regresar a la pantalla principal
          </button>
        </div>

        <div className="explore-hero__content">
          <h1 className="explore-hero__title">Explorador de consultores</h1>
          <p className="explore-hero__subtitle">Encuentra estrategas, analistas y especialistas para potenciar tu campana.</p>
        </div>
      </div>
    </section>
  );
}

export default ExploreHero;
