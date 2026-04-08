import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface SocialItem {
  network: string;
  url: string;
}

interface DraftSocialItem {
  id: string;
  network: string;
  url: string;
}

const NETWORK_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'website', label: 'Sitio web' },
] as const;

function toDraftItems(socials: (SocialItem | string)[]): DraftSocialItem[] {
  if (!Array.isArray(socials) || socials.length === 0) {
    return [{ id: `social-${Date.now()}`, network: 'instagram', url: 'https://instagram.com/' }];
  }

  return socials.map((item) => {
    if (typeof item === 'string') {
      return {
        id: `social-${Date.now()}-${Math.round(Math.random() * 10000)}`,
        network: item.includes('facebook') ? 'facebook' : 'instagram',
        url: item,
      };
    }

    return {
      id: `social-${Date.now()}-${Math.round(Math.random() * 10000)}`,
      network: item.network || 'instagram',
      url: item.url || '',
    };
  });
}

interface ContactSocialsModalProps {
  isOpen: boolean;
  socials: (SocialItem | string)[];
  onClose: () => void;
  onSave: (socials: SocialItem[]) => void;
}

function ContactSocialsModal({ isOpen, socials, onClose, onSave }: ContactSocialsModalProps) {
  const [draftItems, setDraftItems] = useState<DraftSocialItem[]>([]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraftItems(toDraftItems(socials));
  }, [isOpen, socials]);

  if (!isOpen) {
    return null;
  }

  const updateItem = (id: string, field: keyof Omit<DraftSocialItem, 'id'>, value: string) => {
    setDraftItems((currentItems) => currentItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const addItem = () => {
    setDraftItems((currentItems) => [
      ...currentItems,
      { id: `social-${Date.now()}-${Math.round(Math.random() * 10000)}`, network: 'instagram', url: '' },
    ]);
  };

  const removeItem = (id: string) => {
    setDraftItems((currentItems) => {
      if (currentItems.length <= 1) {
        return currentItems;
      }

      return currentItems.filter((item) => item.id !== id);
    });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(
      draftItems
        .map((item) => ({ network: item.network, url: item.url.trim() }))
        .filter((item) => item.url.length > 0)
    );
    onClose();
  };

  return createPortal(
    <div className="profile-socials-overlay" role="dialog" aria-modal="true" aria-label="Editar redes sociales">
      <button type="button" className="profile-socials-overlay__backdrop" aria-label="Cerrar editor de redes" onClick={onClose} />

      <section className="profile-socials-panel">
        <header className="profile-socials-panel__header">
          <h4 className="profile-socials-panel__title">Editar redes sociales</h4>
          <button type="button" className="profile-socials-panel__close" onClick={onClose} aria-label="Cerrar editor de redes">
            <X size={17} aria-hidden="true" />
          </button>
        </header>

        <form className="profile-socials-form" onSubmit={submit}>
          {draftItems.map((item) => (
            <div key={item.id} className="profile-socials-form__row">
              <select className="profile-socials-form__select" value={item.network} onChange={(event) => updateItem(item.id, 'network', event.target.value)}>
                {NETWORK_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <input
                className="profile-socials-form__input"
                value={item.url}
                onChange={(event) => updateItem(item.id, 'url', event.target.value)}
                placeholder="https://"
              />

              <button type="button" className="profile-socials-form__remove" onClick={() => removeItem(item.id)} aria-label="Quitar red social">
                <Minus size={14} aria-hidden="true" />
              </button>
            </div>
          ))}

          <div className="profile-socials-form__actions">
            <button type="button" className="profile-socials-form__add" onClick={addItem}>
              <Plus size={14} aria-hidden="true" /> Agregar red social
            </button>
            <button type="submit" className="profile-socials-form__save">
              Guardar
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
}

export default ContactSocialsModal;
