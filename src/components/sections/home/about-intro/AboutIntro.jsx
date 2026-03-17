import {
  BrainCircuit,
  Building2,
  Cpu,
  Landmark,
  Megaphone,
  ShieldCheck,
  Vote,
} from 'lucide-react';
import AboutSpecialtyItem from './AboutSpecialtyItem';
import PrimaryButton from '../../../ui/PrimaryButton';
import { openProfileSearchOverlay } from '../../../../utils/profileSearchNavigation';
import './aboutIntro.css';

const SPECIALTIES = [
  { id: 'electoral', text: 'Estrategia Politica Electoral', icon: Vote },
  { id: 'parliamentary', text: 'Estrategia Politica Parlamentaria', icon: Landmark },
  { id: 'technopolitics', text: 'Tecnopolitica', icon: Cpu },
  { id: 'government', text: 'Estrategia Politica Gubernamental', icon: Building2 },
  { id: 'intelligence', text: 'Inteligencia y Contrainteligencia', icon: ShieldCheck },
  { id: 'oratory', text: 'Oratoria Politica', icon: Megaphone },
  { id: 'psychological-ops', text: 'Operaciones Psicologicas y Psicosociales', icon: BrainCircuit },
];

function AboutIntro() {
  return (
    <section className="about-intro" aria-labelledby="about-intro-heading">
      <div className="about-intro__safe-area">
        <div className="about-intro__media-wrap">
          <img
            className="about-intro__media"
            src="/about1.webp"
            alt="Consultores politicos en sesion estrategica"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="about-intro__panel">
          <p id="about-intro-heading" className="about-intro__lead">
            La primera Red de Consultores Politicos acreditados con conocimientos de especializacion en las
            siguientes areas:
          </p>

          <ul className="about-intro__specialties">
            {SPECIALTIES.map((specialty) => (
              <AboutSpecialtyItem key={specialty.id} icon={specialty.icon} text={specialty.text} />
            ))}
          </ul>

          <div className="about-intro__cta-row">
            <button type="button" className="about-intro__cta-ghost" onClick={openProfileSearchOverlay}>
              Buscar consultor
            </button>
            <PrimaryButton className="about-intro__cta-primary">Ser consultor</PrimaryButton>
          </div>

          <span className="about-intro__accent" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

export default AboutIntro;
