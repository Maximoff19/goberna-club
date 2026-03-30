import { useEffect, useRef, useState } from 'react';
import ScrollReveal from '../../../../components/ScrollReveal.jsx';
import SectionTitle from '../../../../shared/ui/SectionTitle';
import BenefitCard from './BenefitCard';
import './benefits.css';

const BENEFIT_CARDS = [
  {
    id: 'cajas1',
    imageSrc: '/cajas1.webp',
    alt: 'Sistema de validación para consultores',
    text: 'Sistema que valida y da confianza como Consultor',
    featured: false,
  },
  {
    id: 'roberto',
    imageSrc: '/roberto.webp',
    alt: 'Perfil profesional verificado',
    text: 'Creación de un perfil profesional verificado',
    featured: true,
  },
  {
    id: 'qr',
    imageSrc: '/qr.webp',
    alt: 'Código QR para consultor',
    text: 'Generación de un código de Consultor (código QR)',
    featured: false,
  },
];

const BENEFITS_CAROUSEL_BREAKPOINT = 1120;

function BenefitsSection() {
  const cardsRowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const cardsRowNode = cardsRowRef.current;
    if (!cardsRowNode) {
      return undefined;
    }

    const updateScrollIndicators = () => {
      const maxScrollLeft = cardsRowNode.scrollWidth - cardsRowNode.clientWidth;
      const scrollLeft = cardsRowNode.scrollLeft;

      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(maxScrollLeft - scrollLeft > 6);
    };

    const centerFeaturedCardOnCompactScreens = () => {
      if (window.innerWidth > BENEFITS_CAROUSEL_BREAKPOINT) {
        updateScrollIndicators();
        return;
      }

      const featuredCardNode = cardsRowNode.querySelector('.benefits__card--featured');
      if (!featuredCardNode) {
        updateScrollIndicators();
        return;
      }

      const maxScrollLeft = cardsRowNode.scrollWidth - cardsRowNode.clientWidth;
      const targetScrollLeft = featuredCardNode.offsetLeft - (cardsRowNode.clientWidth - featuredCardNode.clientWidth) / 2;
      const clampedScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));

      cardsRowNode.scrollTo({ left: clampedScrollLeft, behavior: 'auto' });
      updateScrollIndicators();
    };

    const onResize = () => {
      centerFeaturedCardOnCompactScreens();
    };

    centerFeaturedCardOnCompactScreens();
    cardsRowNode.addEventListener('scroll', updateScrollIndicators, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      cardsRowNode.removeEventListener('scroll', updateScrollIndicators);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section className="benefits" aria-labelledby="benefits-title">
      <div className="benefits__safe-area">
        <SectionTitle id="benefits-title" className="benefits__title" color="#FFC502">
          <ScrollReveal
            text="BENEFICIOS"
            className="benefits__title-reveal benefits__title-reveal--desktop"
            animateBy="letters"
            baseOpacity={0.03}
            baseRotation={5}
            blurStrength={10}
            rotationStart="top bottom+=22%"
            wordAnimationStart="top bottom+=18%"
            wordAnimationEnd="+=520"
          />
          <ScrollReveal
            text="BENEFICIOS"
            className="benefits__title-reveal benefits__title-reveal--mobile"
            animateBy="words"
            baseOpacity={0.03}
            baseRotation={5}
            blurStrength={10}
            rotationStart="top bottom+=22%"
            wordAnimationStart="top bottom+=18%"
            wordAnimationEnd="+=520"
          />
        </SectionTitle>

        <div className="benefits__carousel">
          <div ref={cardsRowRef} className="benefits__cards-row">
            {BENEFIT_CARDS.map((card) => (
              <BenefitCard key={card.id} card={card} />
            ))}
          </div>

          <span
            className={`benefits__scroll-indicator benefits__scroll-indicator--left ${canScrollLeft ? '' : 'benefits__scroll-indicator--hidden'}`}
            aria-hidden="true"
          >
            {'\u2039'}
          </span>
          <span
            className={`benefits__scroll-indicator benefits__scroll-indicator--right ${canScrollRight ? '' : 'benefits__scroll-indicator--hidden'}`}
            aria-hidden="true"
          >
            {'\u203A'}
          </span>
        </div>
      </div>
    </section>
  );
}

export default BenefitsSection;
