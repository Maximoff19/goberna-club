import { Pencil } from 'lucide-react';
import ProfileHeaderInfo from './ProfileHeaderInfo';

function ProfessionalSummarySection({ showEdit, onEdit, summary }) {
  return (
    <section className="profile-section-card" aria-labelledby="profile-summary-title">
      <div className="profile-section-heading">
        <h3 id="profile-summary-title" className="profile-section-title">
          Resumen profesional
        </h3>
        {showEdit && (
          <button type="button" className="profile-section-edit" onClick={onEdit} aria-label="Editar resumen profesional">
            <Pencil size={14} aria-hidden="true" />
          </button>
        )}
      </div>
      <ProfileHeaderInfo variant="summary" summary={summary} />
    </section>
  );
}

export default ProfessionalSummarySection;
