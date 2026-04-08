import { Award } from 'lucide-react';

interface MedalsSectionProps {
  medals: string[] | undefined;
}

function MedalsSection({ medals }: MedalsSectionProps) {
  const currentMedals = Array.isArray(medals) && medals.length > 0 ? medals : [];

  if (currentMedals.length === 0) {
    return null; // No mostrar seccion si no hay medallas
  }

  return (
    <section className="profile-section-card" aria-labelledby="profile-medals-title">
      <div className="profile-section-heading">
        <h3 id="profile-medals-title" className="profile-section-title">
          Medallas
        </h3>
      </div>

      <ul className="profile-medal-list">
        {currentMedals.map((medal) => (
          <li key={medal} className="profile-medal-item">
            <Award size={14} aria-hidden="true" />
            <span>{medal}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default MedalsSection;
