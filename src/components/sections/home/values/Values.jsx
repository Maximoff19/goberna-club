import ValueItem from './ValueItem';
import './values.css';

const VALUE_ITEMS = [
  {
    id: 'confidencialidad',
    iconSrc: '/Confidencialidad.webp',
    iconAlt: 'Icono de Confidencialidad',
    title: 'Confidencialidad',
    description:
      'El código de ética del Consultor exige el secreto de confidencia del Consultor – Candidato por encima de cualquier circunstancia social, legal o comercial.',
  },
  {
    id: 'etica',
    iconSrc: '/Etica.webp',
    iconAlt: 'Icono de Ética',
    title: 'Ética',
    description:
      'Un Consultor político profesional no usa información privilegiada para dañar o perjudicar a un cliente.',
  },
  {
    id: 'exclusividad',
    iconSrc: '/Exclusividad.webp',
    iconAlt: 'Icono de Exclusividad',
    title: 'Exclusividad',
    description: 'Un Consultor político profesional no asesora a dos candidatos competidores.',
  },
];

function Values() {
  return (
    <section className="values" aria-labelledby="values-heading">
      <div className="values__safe-area">
        <div className="values__panel">
          <span className="values__accent" aria-hidden="true" />

          <p id="values-heading" className="values__lead">
            Todos nuestros Consultores acreditados se adscriben al respeto del Código de ética del Consultor
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
