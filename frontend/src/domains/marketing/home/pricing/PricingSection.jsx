import SectionTitle from '../../../../shared/ui/SectionTitle';
import ScrollReveal from '../../../../components/ScrollReveal.jsx';
import PricingCard from './PricingCard';
import './pricing.css';

const PRICING_PLANS = [
  {
    id: 'consultor-politico',
    name: 'Consultor Político',
    price: '$99.00',
    before: '$199.00',
    featured: false,
    benefits: [
      'Certificado de Consultor Político',
      'Validación de su experiencia y hoja de vida',
      'Descuento del 25% en la librería Goberna',
      'Acceso como columnista especializado (publicar notas, artículos, análisis en nuestra web)',
    ],
    requirements: 'Requisitos: Haber aprobado el Curso del Consultor Político Goberna.',
  },
  {
    id: 'consultor-politico-senior',
    name: 'Consultor Político Senior',
    price: '$199.00',
    before: '$299.00',
    featured: true,
    benefits: [
      'Todos los beneficios del plan del consultor político',
      'Publicar libros en nuestra librería Goberna',
      '1 asesoría especializada en su imagen digital',
      '1 promoción de su marca personal en nuestras redes sociales',
      'Descuento del 30% en cursos de la escuela Goberna',
    ],
    requirements: 'Requisitos: Haber aprobado 2 cursos de la escuela Goberna.',
  },
  {
    id: 'consultor-politico-master',
    name: 'Consultor Político Master',
    price: '$299.00',
    before: '$599.00',
    featured: false,
    benefits: [
      'Todos los beneficios del plan del consultor político senior',
      'Asesoría especializada en su imagen digital cada 6 meses',
      'Promoción de su marca personal en nuestras redes sociales cada 6 meses',
      'Descuento del 40% en cursos de la escuela Goberna',
    ],
    requirements: 'Requisitos: Haber aprobado 5 cursos de la escuela Goberna.',
  },
  {
    id: 'consultor-politico-internacional',
    name: 'Consultor Político Internacional',
    price: '$599.00',
    before: '$899.00',
    featured: false,
    benefits: [
      'Todos los beneficios del plan del consultor político master',
      'Asesoría especializada en su imagen digital cada 3 meses',
      'Promoción de su marca personal en nuestras redes sociales cada 3 meses',
      'Acceso total a los cursos de la Escuela Goberna durante un año',
      'Aparecer en el Top búsqueda de Consultores',
    ],
    requirements: 'Requisitos: Haber aprobado 5 cursos de la escuela Goberna.',
  },
];

function PricingSection() {
  return (
    <section id="precios" className="pricing" aria-labelledby="pricing-title">
      <div className="pricing__safe-area">
        <SectionTitle id="pricing-title" className="pricing__title" color="#0F1923">
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
            <PricingCard key={plan.id} plan={plan} onSelectPlan={() => { window.location.hash = '#crear-perfil'; }} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
