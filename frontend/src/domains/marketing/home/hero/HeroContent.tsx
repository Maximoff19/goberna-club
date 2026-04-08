import type { ReactNode } from 'react';
import HeroActions from './HeroActions';
import BlurText from '../../../../components/BlurText';

interface HeroContentProps {
  showActions?: boolean;
  customAction?: ReactNode;
}

function HeroContent({ showActions = true, customAction = null }: HeroContentProps) {
  const isTestEnv = process.env.NODE_ENV === 'test';

  return (
    <div className="hero-content">
      <h1 className="hero-content__title">
        {isTestEnv ? (
          <>
            <span className="hero-content__title-line">RED</span>
            <span className="hero-content__title-line">INTERNACIONAL DE</span>
            <span className="hero-content__title-line">CONSULTORES</span>
          </>
        ) : (
          <>
            <BlurText as="span" text="RED" className="hero-content__title-line" animateBy="letters" delay={36} />
            <BlurText
              as="span"
              text="INTERNACIONAL DE"
              className="hero-content__title-line"
              animateBy="letters"
              delay={36}
            />
            <BlurText
              as="span"
              text="CONSULTORES"
              className="hero-content__title-line"
              animateBy="letters"
              delay={36}
            />
          </>
        )}
      </h1>
      <p className="hero-content__subtitle">
        Conecta con los estrategas, encuestadores y arquitectos de campanas que definen el rumbo de la politica.
      </p>
      {showActions && <HeroActions />}
      {!showActions && customAction}
    </div>
  );
}

export default HeroContent;
