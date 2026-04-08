import { Minus, Pencil, Plus } from 'lucide-react';
import EducationItem from './EducationItem';

interface EducationRawItem {
  institution?: string;
  program?: string;
  period?: string;
}

interface EducationCardItem {
  id: string;
  logoSrc: string;
  institution: string;
  program: string;
  period: string;
}

function mapEducationForCard(item: EducationRawItem | string, index: number): EducationCardItem {
  if (typeof item === 'string') {
    return {
      id: `ed-dynamic-${index + 1}`,
      logoSrc: '/logoescuela.webp',
      institution: 'Formacion Profesional',
      program: item,
      period: 'Periodo a definir',
    };
  }

  return {
    id: `ed-dynamic-${index + 1}`,
    logoSrc: '/logoescuela.webp',
    institution: item.institution || 'Institucion no definida',
    program: item.program || 'Programa no definido',
    period: item.period || 'Periodo no definido',
  };
}

interface EducationSectionProps {
  showEdit: boolean;
  onAddItem: () => void;
  onEditItem: (itemIndex: number) => void;
  onRemoveItem: (itemIndex: number) => void;
  educations: (EducationRawItem | string)[] | undefined;
}

function EducationSection({ showEdit, onAddItem, onEditItem, onRemoveItem, educations }: EducationSectionProps) {
  const currentEducation = Array.isArray(educations) && educations.length > 0
    ? educations.map(mapEducationForCard)
    : [];

  // Si no hay educaciones y no esta en modo edicion, mostrar mensaje vacio
  if (currentEducation.length === 0 && !showEdit) {
    return (
      <section className="profile-section-card" aria-labelledby="profile-education-title">
        <div className="profile-section-heading">
          <h3 id="profile-education-title" className="profile-section-title">
            Formacion Profesional
          </h3>
        </div>
        <p className="profile-section-empty">No hay formacion profesional registrada.</p>
      </section>
    );
  }

  return (
    <section className="profile-section-card" aria-labelledby="profile-education-title">
      <div className="profile-section-heading">
        <h3 id="profile-education-title" className="profile-section-title">
          Formacion Profesional
        </h3>
        {showEdit && (
          <div className="profile-section-actions">
            <button type="button" className="profile-section-edit" onClick={onAddItem} aria-label="Agregar item de formacion profesional">
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      {currentEducation.length === 0 ? (
        <p className="profile-section-empty">Agrega tu primera formacion profesional.</p>
      ) : (
        <div className="profile-stack-list">
          {currentEducation.map((item, index) => (
            <article key={item.id} className="profile-edu-item-wrap">
              <EducationItem item={item} />

              {showEdit && (
                <div className="profile-edu-item__actions">
                  <button type="button" className="profile-section-edit profile-section-edit--danger" onClick={() => onRemoveItem(index)} aria-label="Quitar item de formacion profesional">
                    <Minus size={14} aria-hidden="true" />
                  </button>
                  <button type="button" className="profile-section-edit" onClick={() => onEditItem(index)} aria-label="Editar item de formacion profesional">
                    <Pencil size={14} aria-hidden="true" />
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default EducationSection;
