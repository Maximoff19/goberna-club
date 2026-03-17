import { Plus } from 'lucide-react';
import SkillTag from './SkillTag';

const SKILLS = ['Empatía', 'Gestión del tiempo', 'Habilidades técnicas diseño', 'Trabajo en equipo'];

function SkillsSection({ showEdit, onEdit, skills }) {
  const currentSkills = (skills || SKILLS.join(', '))
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

      <div className="profile-pill-list">
        {currentSkills.map((skill) => (
          <SkillTag key={skill} label={skill} />
        ))}
      </div>
    </section>
  );
}

export default SkillsSection;
