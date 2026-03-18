import { ChevronDown } from 'lucide-react';

function CertificateAccordionItem({ certificate, isOpen, onToggle }) {
  return (
    <article className={`profile-cert-item ${isOpen ? 'is-open' : ''}`}>
      <button type="button" className="profile-cert-item__trigger" onClick={onToggle} aria-expanded={isOpen}>
        <span>{certificate.title}</span>
        <ChevronDown size={18} />
      </button>

      <div className="profile-cert-item__content-wrap" aria-hidden={!isOpen}>
        <div className="profile-cert-item__content">
          <img src={certificate.imageSrc} alt={certificate.title} loading="lazy" decoding="async" />
          <p>{certificate.description}</p>
        </div>
      </div>
    </article>
  );
}

export default CertificateAccordionItem;
