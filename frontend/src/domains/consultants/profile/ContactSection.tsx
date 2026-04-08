import { useState } from 'react';
import { Facebook, Globe, Instagram, Linkedin, Mail, Pencil, Phone, Plus, Youtube } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ContactSocialsModal from './ContactSocialsModal';

interface SocialItem {
  network: string;
  url: string;
}

interface ProfileData {
  phone?: string;
  email?: string;
  website?: string;
  socials?: (SocialItem | string)[];
}

interface ContactSectionProps {
  showEdit: boolean;
  onEdit: () => void;
  profile: ProfileData;
}

function ContactSection({ showEdit, onEdit, profile }: ContactSectionProps) {
  const [isSocialsModalOpen, setIsSocialsModalOpen] = useState(false);

  const socials: (SocialItem | string)[] = Array.isArray(profile?.socials) && profile.socials.length > 0 
    ? profile.socials 
    : [];

  const hasContactInfo = profile?.phone || profile?.email || profile?.website;

  const iconByNetwork: Record<string, LucideIcon> = {
    instagram: Instagram,
    facebook: Facebook,
    linkedin: Linkedin,
    youtube: Youtube,
    whatsapp: Globe,
    website: Globe,
  };

  const saveSocials = (nextSocials: SocialItem[]) => {
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

      {hasContactInfo ? (
        <ul className="profile-contact-list">
          {profile?.phone && (
            <li>
              <Phone size={16} />
              <span>{profile.phone}</span>
            </li>
          )}
          {profile?.email && (
            <li>
              <Mail size={16} />
              <span>{profile.email}</span>
            </li>
          )}
          {profile?.website && (
            <li>
              <Globe size={16} />
              <span>{profile.website}</span>
            </li>
          )}
        </ul>
      ) : !showEdit && (
        <p className="profile-section-empty">No hay informacion de contacto.</p>
      )}

      {socials.length > 0 && (
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
      )}

      {showEdit && socials.length === 0 && (
        <button type="button" className="profile-contact-socials__add" aria-label="Agregar red social" onClick={() => setIsSocialsModalOpen(true)}>
          <Plus size={16} aria-hidden="true" />
        </button>
      )}

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
