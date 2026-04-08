import ValueItem from './ValueItem';
import './values.css';

interface ValueData {
  id: string;
  iconSrc: string;
  iconAlt: string;
  title: string;
  description: string;
}

const VALUE_ITEMS: readonly ValueData[] = [
  {
    id: 'confidencialidad',
    iconSrc: '/Confidencialidad.webp',
    iconAlt: 'Icono de Confidencialidad',
    title: 'Confidencialidad',
    description:
      'El codigo de etica del Consultor exige el secreto de confidencia del Consultor - Candidato por encima de cualquier circunstancia social, legal o comercial.',
  },
  {
    id: 'etica',
    iconSrc: '/Etica.webp',
    iconAlt: 'Icono de Etica',
    title: 'Etica',
    description:
      'Un Consultor politico profesional no usa informacion privilegiada para danar o perjudicar a un cliente.',
  },
  {
    id: 'exclusividad',
    iconSrc: '/Exclusividad.webp',
    iconAlt: 'Icono de Exclusividad',
    title: 'Exclusividad',
    description: 'Un Consultor politico profesional no asesora a dos candidatos competidores.',
  },
];

function Values() {
  return (
    <section className="values" aria-labelledby="values-heading">
      <div className="values__safe-area">
        <div className="values__panel">
          <span className="values__accent" aria-hidden="true" />

          <p id="values-heading" className="values__lead">
            Todos nuestros Consultores acreditados se adscriben al respeto del Codigo de etica del Consultor
            Internacional que regula las actividades de nuestros profesionales en las siguientes actividades:
          </p>

          <div className="values__items">
            {VALUE_ITEMS.map((item) => (
              <ValueItem
                key={item.id}
                iconSrc={item.iconSrc}
                iconAlt={item.iconAlt}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </div>

        <div className="values__media-wrap">
          <img
            className="values__media"
            src="/about3.webp"
            alt="Consultora y candidato revisando estrategia"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}

export default Values;
