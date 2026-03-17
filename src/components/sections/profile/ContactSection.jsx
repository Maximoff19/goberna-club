import { useState } from 'react';
import { Facebook, Globe, Instagram, Linkedin, Mail, Pencil, Phone, Plus, Youtube } from 'lucide-react';
import ContactSocialsModal from './ContactSocialsModal';

function ContactSection({ showEdit, onEdit, profile }) {
  const [isSocialsModalOpen, setIsSocialsModalOpen] = useState(false);

  const socials = Array.isArray(profile?.socials) && profile.socials.length > 0 ? profile.socials : [{ network: 'instagram', url: 'https://instagram.com' }, { network: 'facebook', url: 'https://facebook.com' }];

  const iconByNetwork = {
    instagram: Instagram,
    facebook: Facebook,
    linkedin: Linkedin,
    youtube: Youtube,
    whatsapp: Globe,
    website: Globe,
  };

  const saveSocials = (nextSocials) => {
    window.dispatchEvent(
      new CustomEvent('app:update-profile-socials', {
        detail: { socials: nextSocials },
      })
    );
  };

  return (
    <section className="profile-section-card" aria-labelledby="profile-contact-title">
      <div className="profile-section-heading">
        <h3 id="profile-contact-title" className="profile-section-title">
          Contactame
        </h3>
        {showEdit && (
          <button type="button" className="profile-section-edit" onClick={onEdit} aria-label="Editar contacto">
            <Pencil size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      <ul className="profile-contact-list">
        <li>
          <Phone size={16} />
          <span>{profile?.phone || '(+51) 999 221 784'}</span>
        </li>
        <li>
          <Mail size={16} />
          <span>{profile?.email || 'rodrigo.beltran@goberna.com'}</span>
        </li>
        <li>
          <Globe size={16} />
          <span>{profile?.website || 'grupogoberna.com'}</span>
        </li>
      </ul>

      <div className="profile-contact-socials">
        {socials.map((social) => {
          const network = typeof social === 'string' ? (social.includes('facebook') ? 'facebook' : 'instagram') : social.network;
          const url = typeof social === 'string' ? social : social.url;
          const label = network || 'Red social';
          const Icon = iconByNetwork[network] || Globe;

          return (
            <a key={`${url}-${label}`} href={url} aria-label={label}>
              <Icon size={17} />
            </a>
          );
        })}

        {showEdit && (
          <button type="button" className="profile-contact-socials__add" aria-label="Agregar red social" onClick={() => setIsSocialsModalOpen(true)}>
            <Plus size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <ContactSocialsModal
        isOpen={isSocialsModalOpen}
        socials={socials}
        onClose={() => setIsSocialsModalOpen(false)}
        onSave={saveSocials}
      />
    </section>
  );
}

export default ContactSection;
