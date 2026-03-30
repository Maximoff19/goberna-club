import MethodologyItem from './MethodologyItem';
import './methodology.css';

const METHODOLOGIES = [
  {
    id: 'war-room',
    iconSrc: '/CuartelesWarRoom.webp',
    iconAlt: 'Icono Cuarteles War Room',
    title: 'Cuarteles War Room',
    description: 'Expertos en Dirección de Campaña',
  },
  {
    id: 'mkt-4g',
    iconSrc: '/MKTpoliticode4taGeneracion.webp',
    iconAlt: 'Icono MKT político de 4ta Generación',
    title: 'MKT político de 4ta Generación',
    description: 'Expertos en Estrategia de campaña',
  },
];

function Methodology() {
  return (
    <section id="metodologia" className="methodology" aria-labelledby="methodology-heading">
      <div className="methodology__safe-area">
        <p id="methodology-heading" className="methodology__lead">
          Nuestra Escuela de Gobierno y Estrategia Política ha capacitado en Latinoamerica y acreditado
          Consultores con la siguientes Metodologías:
        </p>

        <div className="methodology__content">
          <MethodologyItem
            iconSrc={METHODOLOGIES[0].iconSrc}
            iconAlt={METHODOLOGIES[0].iconAlt}
            title={METHODOLOGIES[0].title}
            description={METHODOLOGIES[0].description}
          />

          <span className="methodology__divider" aria-hidden="true" />

          <MethodologyItem
            iconSrc={METHODOLOGIES[1].iconSrc}
            iconAlt={METHODOLOGIES[1].iconAlt}
            title={METHODOLOGIES[1].title}
            description={METHODOLOGIES[1].description}
          />
        </div>
      </div>
    </section>
  );
}

export default Methodology;
