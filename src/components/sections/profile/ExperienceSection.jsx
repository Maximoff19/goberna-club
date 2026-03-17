import { Minus, Pencil, Plus } from 'lucide-react';
import ExperienceItem from './ExperienceItem';

const EXPERIENCE = [
  {
    id: 'exp-1',
    logoSrc: '/logo.webp',
    role: 'Director de Estrategia Electoral',
    company: 'Grupo Goberna',
    mode: 'Tiempo completo',
    period: '2020 - Actualidad',
    location: 'Lima, Perú',
    description:
      'Diseño de estrategia integral para candidatos presidenciales y subnacionales. Coordinación de war room, análisis territorial y construcción de arquitectura de mensajes.',
  },
  {
    id: 'exp-2',
    logoSrc: '/logoescuela.webp',
    role: 'Consultor Senior en Comunicación Política',
    company: 'Red Internacional de Consultores',
    mode: 'Consultoría',
    period: '2016 - 2020',
    location: 'Ciudad de México, México',
    description:
      'Acompañamiento en campañas legislativas y municipales. Implementación de modelos de reputación digital, vocería de crisis y posicionamiento de narrativa pública.',
  },
];

function mapExperienceForCard(item, index) {
  return {
    id: `exp-dynamic-${index + 1}`,
    logoSrc: '/logo.webp',
    role: item.role || 'Rol no definido',
    company: item.company || 'Empresa no definida',
    mode: item.mode || 'Modalidad no definida',
    period: item.period || 'Periodo no definido',
    location: item.country || 'Pais no definido',
    description: item.summary || 'Sin resumen.',
  };
}

function ExperienceSection({ showEdit, onAddItem, onEditItem, onRemoveItem, experiences }) {
  const currentExperience = Array.isArray(experiences)
    ? experiences.length > 0
      ? experiences.map(mapExperienceForCard)
      : showEdit
        ? []
        : EXPERIENCE
    : showEdit
      ? []
      : EXPERIENCE;

  return (
    <section className="profile-section-card" aria-labelledby="profile-experience-title">
      <div className="profile-section-heading">
        <h3 id="profile-experience-title" className="profile-section-title">
          Experiencia Profesional
        </h3>
        {showEdit && (
          <div className="profile-section-actions">
            <button type="button" className="profile-section-edit" onClick={onAddItem} aria-label="Agregar item de experiencia profesional">
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <div className="profile-stack-list">
        {currentExperience.map((item, index) => (
          <div key={item.id} className="profile-exp-item-wrap">
            <ExperienceItem item={item} />

            {showEdit && (
              <div className="profile-exp-item__actions">
                <button type="button" className="profile-section-edit profile-section-edit--danger" onClick={() => onRemoveItem(index)} aria-label="Quitar item de experiencia profesional">
                  <Minus size={14} aria-hidden="true" />
                </button>
                <button type="button" className="profile-section-edit" onClick={() => onEditItem(index)} aria-label="Editar item de experiencia profesional">
                  <Pencil size={14} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default ExperienceSection;
