import MethodologyItem from './MethodologyItem';
import './methodology.css';

interface MethodologyData {
  id: string;
  iconSrc: string;
  iconAlt: string;
  title: string;
  description: string;
}

const METHODOLOGIES: readonly MethodologyData[] = [
  {
    id: 'war-room',
    iconSrc: '/CuartelesWarRoom.webp',
    iconAlt: 'Icono Cuarteles War Room',
    title: 'Cuarteles War Room',
    description: 'Expertos en Direccion de Campana',
  },
  {
    id: 'mkt-4g',
    iconSrc: '/MKTpoliticode4taGeneracion.webp',
    iconAlt: 'Icono MKT politico de 4ta Generacion',
    title: 'MKT politico de 4ta Generacion',
    description: 'Expertos en Estrategia de campana',
  },
];

function Methodology() {
  return (
    <section id="metodologia" className="methodology" aria-labelledby="methodology-heading">
      <div className="methodology__safe-area">
        <p id="methodology-heading" className="methodology__lead">
          Nuestra Escuela de Gobierno y Estrategia Politica ha capacitado en Latinoamerica y acreditado
          Consultores con la siguientes Metodologias:
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
