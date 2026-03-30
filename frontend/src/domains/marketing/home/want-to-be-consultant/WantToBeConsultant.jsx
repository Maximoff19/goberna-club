import ConsultantOptionCard from './ConsultantOptionCard';
import './wantToBeConsultant.css';

const CONSULTANT_OPTIONS = [
  {
    id: 'marketing-politico-electoral',
    title: 'Marketing Politico Electoral',
    imageSrc: '/Marketing Politico Electoral.webp',
    href: 'https://goberna.pe/curso-virtual-mkt-politico/?doing_wp_cron=1774278131.0368580818176269531250',
  },
  {
    id: 'marketing-parlamentario',
    title: 'Marketing Parlamentario',
    imageSrc: '/Marketing Parlamentario.webp',
    href: 'https://goberna.pe/curso-virtual-mkt-politico/',
  },
  {
    id: 'marketing-gubernamental',
    title: 'Marketing Gubernamental',
    imageSrc: '/Marketing Gubernamental.webp',
    href: 'https://goberna.pe/online-marketing-gubernamental/',
  },
  {
    id: 'inteligencia-contrainteligencia',
    title: 'Inteligencia y Contrainteligencia',
    imageSrc: '/Inteligencia y Contrainteligencia.webp',
    href: 'https://grupogoberna.com/diploma-de-especializacion-en-inteligencia-y-contrainteligencia/',
  },
];

function WantToBeConsultant() {
  return (
    <section className="want-consultant" aria-labelledby="want-consultant-title">
      <div className="want-consultant__safe-area">
        <h2 id="want-consultant-title" className="want-consultant__title">
          ¿Quieres ser un Consultor Político?
        </h2>

        <p className="want-consultant__description">
          Selecciona el area en la que deseas formarte para iniciar tu acreditacion profesional.
        </p>

        <div className="want-consultant__options-grid">
          {CONSULTANT_OPTIONS.map((option, index) => (
            <ConsultantOptionCard key={option.id} option={option} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default WantToBeConsultant;
