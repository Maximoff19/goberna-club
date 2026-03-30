import { useEffect, useMemo, useState } from 'react';
import CertificateAccordionItem from './CertificateAccordionItem';

function CertificatesSection({ certificates = [] }) {
  const items = useMemo(() => {
    if (Array.isArray(certificates) && certificates.length > 0) {
      return certificates;
    }

    return [];
  }, [certificates]);

  const [openId, setOpenId] = useState(items[0]?.id || '');

  useEffect(() => {
    if (items.length === 0) {
      setOpenId('');
      return;
    }

    setOpenId((current) => {
      if (current && items.some((item) => item.id === current)) {
        return current;
      }

      return items[0].id;
    });
  }, [items]);

  if (items.length === 0) {
    return (
      <section className="profile-section-card profile-section-card--plain" aria-labelledby="profile-certs-title">
        <h3 id="profile-certs-title" className="profile-section-title">
          Certificados
        </h3>
        <p className="profile-section-empty">Este consultor todavia no publico certificados.</p>
      </section>
    );
  }

  return (
    <section className="profile-section-card profile-section-card--plain" aria-labelledby="profile-certs-title">
      <h3 id="profile-certs-title" className="profile-section-title">
        Certificados
      </h3>

        <div className="profile-stack-list profile-stack-list--tight">
          {items.map((certificate) => (
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
