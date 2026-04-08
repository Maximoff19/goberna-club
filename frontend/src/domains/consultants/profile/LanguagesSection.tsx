import { Plus } from 'lucide-react';

interface LanguagesSectionProps {
  showEdit: boolean;
  onEdit: () => void;
  languages: string | undefined;
}

function LanguagesSection({ showEdit, onEdit, languages }: LanguagesSectionProps) {
  const currentLanguages = (languages || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <section className="profile-section-card" aria-labelledby="profile-languages-title">
      <div className="profile-section-heading">
        <h3 id="profile-languages-title" className="profile-section-title">
          Idiomas
        </h3>
        {showEdit && (
          <button type="button" className="profile-section-edit" onClick={onEdit} aria-label="Editar idiomas">
            <Plus size={14} aria-hidden="true" />
          </button>
        )}
      </div>
      {currentLanguages.length > 0 ? (
        <div className="profile-pill-list">
          {currentLanguages.map((language) => (
            <span key={language} className="profile-pill">
              {language}
            </span>
          ))}
        </div>
      ) : !showEdit && (
        <p className="profile-section-empty">No hay idiomas registrados.</p>
      )}
    </section>
  );
}

export default LanguagesSection;
