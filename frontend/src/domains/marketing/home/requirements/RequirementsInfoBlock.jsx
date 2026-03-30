import { CircleAlert } from 'lucide-react';
import './requirementsInfoBlock.css';

const REQUIREMENTS_TEXTS = [
  'Certificación en los Cursos de Consultoría Goberna.',
  'Comprometerse a cumplir en su país el código del consultor, son 10 principios normativos para poder acreditar o anular las buenas prácticas de los consultores en el mundo.',
  'Pagar una membresía anual',
  'Facilitar todos sus datos para ser contratado en su país con el Respaldo de la Red Internacional.',
  'Comprometerse en actualizar su información al menos una vez al mes con actividades nuevas.',
];

function RequirementsInfoBlock() {
  return (
    <section className="requirements-info" aria-labelledby="requirements-info-title">
      <div className="requirements-info__safe-area">
        <h2 id="requirements-info-title" className="requirements-info__title">
          Todos nuestros consultores tendrán que cumplir los siguientes requisitos:
        </h2>

        <div className="requirements-info__divider" aria-hidden="true">
          <span className="requirements-info__divider-line" />
          <span className="requirements-info__divider-icon-wrap">
            <CircleAlert className="requirements-info__divider-icon" size={24} strokeWidth={2.1} />
          </span>
          <span className="requirements-info__divider-line" />
        </div>

        <div className="requirements-info__content">
          {REQUIREMENTS_TEXTS.map((text) => (
            <p key={text} className="requirements-info__text">
              {text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RequirementsInfoBlock;
