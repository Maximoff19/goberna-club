import { Plus } from 'lucide-react';
import ProfileHeaderInfo from './ProfileHeaderInfo';

function ProfileIdentitySection({ profile, showEdit, onEdit }) {
  return (
    <section className="profile-identity" aria-labelledby="profile-name">
      {showEdit && (
        <div className="profile-section-heading">
          <h3 className="profile-section-title">Identidad profesional</h3>
          <button type="button" className="profile-section-edit" onClick={onEdit} aria-label="Editar identidad profesional">
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>
      )}
      <ProfileHeaderInfo variant="compact" profile={profile} />
    </section>
  );
}

export default ProfileIdentitySection;
