import { Award } from 'lucide-react';

const MEDALS = [
  'Top estratega electoral 2023',
  'Reconocimiento en comunicacion politica regional',
  'Premio a innovacion en analisis de opinion publica',
];

function MedalsSection({ medals }) {
  const currentMedals = Array.isArray(medals) && medals.length > 0 ? medals : MEDALS;

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
