import { Minus, Pencil, Plus } from 'lucide-react';
import ExperienceItem from './ExperienceItem';

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
  const currentExperience = Array.isArray(experiences) && experiences.length > 0
    ? experiences.map(mapExperienceForCard)
    : [];

  // Si no hay experiencias y no está en modo edición, mostrar mensaje vacío
  if (currentExperience.length === 0 && !showEdit) {
    return (
      <section className="profile-section-card" aria-labelledby="profile-experience-title">
        <div className="profile-section-heading">
          <h3 id="profile-experience-title" className="profile-section-title">
            Experiencia Profesional
          </h3>
        </div>
        <p className="profile-section-empty">No hay experiencias profesionales registradas.</p>
      </section>
    );
  }

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

      {currentExperience.length === 0 ? (
        <p className="profile-section-empty">Agrega tu primera experiencia profesional.</p>
      ) : (
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
      )}
    </section>
  );
}

export default ExperienceSection;
