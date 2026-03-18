import { useState } from 'react';
import CertificateAccordionItem from './CertificateAccordionItem';

const CERTIFICATES = [
  {
    id: 'cert-1',
    title: 'Estrategia Política Electoral Avanzada',
    imageSrc: '/certificados/076c983401e057354495a1d5ae1aeaf2.jpg',
    description: 'Certificación internacional en diseño de estrategia para campañas presidenciales y legislativas.',
  },
  {
    id: 'cert-2',
    title: 'Comunicación de Gobierno y Gestión de Crisis',
    imageSrc: '/certificados/342212640eb22e29ebc4fac593003eae.jpg',
    description: 'Programa especializado en gestión reputacional, vocería institucional y respuesta de crisis.',
  },
  {
    id: 'cert-3',
    title: 'Inteligencia y Contrainteligencia Política',
    imageSrc: '/certificados/917e15d55bd5b1f49296bf0070cb228e.jpg',
    description: 'Formación aplicada en análisis de riesgo político, prevención de ataques y arquitectura de defensa.',
  },
];

function CertificatesSection() {
  const [openId, setOpenId] = useState(CERTIFICATES[0].id);

  return (
    <section className="profile-section-card profile-section-card--plain" aria-labelledby="profile-certs-title">
      <h3 id="profile-certs-title" className="profile-section-title">
        Certificados
      </h3>

      <div className="profile-stack-list profile-stack-list--tight">
        {CERTIFICATES.map((certificate) => (
          <CertificateAccordionItem
            key={certificate.id}
            certificate={certificate}
            isOpen={openId === certificate.id}
            onToggle={() => setOpenId((current) => (current === certificate.id ? '' : certificate.id))}
          />
        ))}
      </div>
    </section>
  );
}

export default CertificatesSection;
