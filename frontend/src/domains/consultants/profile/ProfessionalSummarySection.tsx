import { Pencil } from 'lucide-react';
import ProfileHeaderInfo from './ProfileHeaderInfo';

interface ProfileData {
  name?: string;
  specialization?: string;
  summary?: string;
}

interface ProfessionalSummarySectionProps {
  showEdit: boolean;
  onEdit: () => void;
  profile: ProfileData;
}

function ProfessionalSummarySection({ showEdit, onEdit, profile }: ProfessionalSummarySectionProps) {
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
      {profile?.summary ? (
        <ProfileHeaderInfo variant="summary" profile={profile} />
      ) : !showEdit && (
        <p className="profile-section-empty">No hay resumen profesional.</p>
      )}
    </section>
  );
}

export default ProfessionalSummarySection;
