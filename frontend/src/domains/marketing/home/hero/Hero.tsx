import type { ReactNode } from 'react';
import HeroBrand from './HeroBrand';
import HeroTopNav from './HeroTopNav';
import HeroContent from './HeroContent';
import HeroScrollIndicator from './HeroScrollIndicator';
import HeroNetworkBackground from './HeroNetworkBackground';
import './hero.css';

interface HeroProps {
  showActions?: boolean;
  customAction?: ReactNode;
}

function Hero({ showActions = true, customAction = null }: HeroProps) {
  return (
    <section
      className="hero"
      style={{
        backgroundImage: "url('/imagenhero.webp')",
      }}
    >
      <HeroNetworkBackground />

      <div className="hero__safe-area">
        <div className="hero__top-row">
          <HeroBrand />
          <HeroTopNav />
        </div>

        <div className="hero__main-row">
          <HeroContent showActions={showActions} customAction={customAction} />
          <div className="hero__image-wrap">
            <img className="hero__image" src="/imagenhero2.webp" alt="Consultor destacado" />
          </div>
        </div>

        <HeroScrollIndicator />
      </div>
    </section>
  );
}

export default Hero;
