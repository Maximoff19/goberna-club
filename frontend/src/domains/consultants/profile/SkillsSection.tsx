import { Plus } from 'lucide-react';
import SkillTag from './SkillTag';

interface SkillsSectionProps {
  showEdit: boolean;
  onEdit: () => void;
  skills: string | undefined;
}

function SkillsSection({ showEdit, onEdit, skills }: SkillsSectionProps) {
  const currentSkills = (skills || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <section className="profile-section-card" aria-labelledby="profile-skills-title">
      <div className="profile-section-heading">
        <h3 id="profile-skills-title" className="profile-section-title">
          Habilidades
        </h3>
        {showEdit && (
          <button type="button" className="profile-section-edit" onClick={onEdit} aria-label="Editar habilidades">
            <Plus size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {currentSkills.length > 0 ? (
        <div className="profile-pill-list">
          {currentSkills.map((skill) => (
            <SkillTag key={skill} label={skill} />
          ))}
        </div>
      ) : !showEdit && (
        <p className="profile-section-empty">No hay habilidades registradas.</p>
      )}
    </section>
  );
}

export default SkillsSection;
