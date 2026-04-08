import SectionTitle from '../../../../shared/ui/SectionTitle';
import ScrollReveal from '../../../../components/ScrollReveal.jsx';
import PricingCard from './PricingCard';
import './pricing.css';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  before: string;
  featured: boolean;
  paymentUrl: string;
  benefits: string[];
  requirements: string;
}

const PRICING_PLANS: readonly PricingPlan[] = [
  {
    id: 'consultor-politico',
    name: 'Consultor Politico',
    price: '$99.00',
    before: '$199.00',
    featured: false,
    paymentUrl: 'https://grupogoberna.com/checkout/?add-to-cart=89500',
    benefits: [
      'Certificado de Consultor Politico',
      'Validacion de su experiencia y hoja de vida',
      'Descuento del 25% en la libreria Goberna',
      'Acceso como columnista especializado (publicar notas, articulos, analisis en nuestra web)',
    ],
    requirements: 'Requisitos: Haber aprobado el Curso del Consultor Politico Goberna.',
  },
  {
    id: 'consultor-politico-senior',
    name: 'Consultor Politico Senior',
    price: '$199.00',
    before: '$299.00',
    featured: true,
    paymentUrl: 'https://grupogoberna.com/checkout/?add-to-cart=89634',
    benefits: [
      'Todos los beneficios del plan del consultor politico',
      'Publicar libros en nuestra libreria Goberna',
      '1 asesoria especializada en su imagen digital',
      '1 promocion de su marca personal en nuestras redes sociales',
      'Descuento del 30% en cursos de la escuela Goberna',
    ],
    requirements: 'Requisitos: Haber aprobado 2 cursos de la escuela Goberna.',
  },
  {
    id: 'consultor-politico-master',
    name: 'Consultor Politico Master',
    price: '$299.00',
    before: '$599.00',
    featured: false,
    paymentUrl: 'https://grupogoberna.com/checkout/?add-to-cart=89637',
    benefits: [
      'Todos los beneficios del plan del consultor politico senior',
      'Asesoria especializada en su imagen digital cada 6 meses',
      'Promocion de su marca personal en nuestras redes sociales cada 6 meses',
      'Descuento del 40% en cursos de la escuela Goberna',
    ],
    requirements: 'Requisitos: Haber aprobado 5 cursos de la escuela Goberna.',
  },
  {
    id: 'consultor-politico-internacional',
    name: 'Consultor Politico Internacional',
    price: '$599.00',
    before: '$899.00',
    featured: false,
    paymentUrl: 'https://grupogoberna.com/checkout/?add-to-cart=89635',
    benefits: [
      'Todos los beneficios del plan del consultor politico master',
      'Asesoria especializada en su imagen digital cada 3 meses',
      'Promocion de su marca personal en nuestras redes sociales cada 3 meses',
      'Acceso total a los cursos de la Escuela Goberna durante un ano',
      'Aparecer en el Top busqueda de Consultores',
    ],
    requirements: 'Requisitos: Haber aprobado 5 cursos de la escuela Goberna.',
  },
];

function PricingSection() {
  return (
    <section id="precios" className="pricing" aria-labelledby="pricing-title">
      <div className="pricing__safe-area">
        <SectionTitle id="pricing-title" className="pricing__title" color="#FFC502">
          <ScrollReveal
            text="NUESTROS PRECIOS"
            className="pricing__title-reveal pricing__title-reveal--desktop"
            animateBy="letters"
            baseOpacity={0.03}
            baseRotation={5}
            blurStrength={10}
            rotationStart="top bottom+=22%"
            wordAnimationStart="top bottom+=18%"
            wordAnimationEnd="+=520"
          />
          <ScrollReveal
            text="NUESTROS PRECIOS"
            className="pricing__title-reveal pricing__title-reveal--mobile"
            animateBy="words"
            baseOpacity={0.03}
            baseRotation={5}
            blurStrength={10}
            rotationStart="top bottom+=22%"
            wordAnimationStart="top bottom+=18%"
            wordAnimationEnd="+=520"
          />
        </SectionTitle>

        <div className="pricing__cards-row">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.id} plan={plan} onSelectPlan={() => { window.open(plan.paymentUrl, '_blank', 'noopener,noreferrer'); }} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
