import { Plus } from 'lucide-react';

const LANGUAGES = ['Inglés', 'Español'];

function LanguagesSection({ showEdit, onEdit, languages }) {
  const currentLanguages = (languages || LANGUAGES.join(', '))
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
      <div className="profile-pill-list">
        {currentLanguages.map((language) => (
          <span key={language} className="profile-pill">
            {language}
          </span>
        ))}
      </div>
    </section>
  );
}

export default LanguagesSection;
