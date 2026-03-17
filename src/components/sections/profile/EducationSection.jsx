import { Minus, Pencil, Plus } from 'lucide-react';
import EducationItem from './EducationItem';

const EDUCATION = [
  {
    id: 'ed-1',
    logoSrc: '/logoescuela.webp',
    institution: 'Escuela de Gobierno Goberna',
    program: 'Especialización en Estrategia Política Electoral',
    period: '2018 - 2019',
  },
  {
    id: 'ed-2',
    logoSrc: '/logo.webp',
    institution: 'Instituto Internacional de Comunicación Política',
    program: 'Diplomado en Comunicación de Crisis y Narrativa Pública',
    period: '2016 - 2017',
  },
];

function mapEducationForCard(item, index) {
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

function EducationSection({ showEdit, onAddItem, onEditItem, onRemoveItem, educations }) {
  const currentEducation = Array.isArray(educations)
    ? educations.length > 0
      ? educations.map(mapEducationForCard)
      : showEdit
        ? []
        : EDUCATION
    : showEdit
      ? []
      : EDUCATION;

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
    </section>
  );
}

export default EducationSection;
