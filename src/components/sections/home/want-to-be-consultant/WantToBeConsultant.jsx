import ConsultantOptionCard from './ConsultantOptionCard';
import './wantToBeConsultant.css';

const CONSULTANT_OPTIONS = [
  {
    id: 'marketing-politico-electoral',
    title: 'Marketing Politico Electoral',
    imageSrc: '/Marketing Politico Electoral.webp',
  },
  {
    id: 'marketing-parlamentario',
    title: 'Marketing Parlamentario',
    imageSrc: '/Marketing Parlamentario.webp',
  },
  {
    id: 'marketing-gubernamental',
    title: 'Marketing Gubernamental',
    imageSrc: '/Marketing Gubernamental.webp',
  },
  {
    id: 'inteligencia-contrainteligencia',
    title: 'Inteligencia y Contrainteligencia',
    imageSrc: '/Inteligencia y Contrainteligencia.webp',
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
