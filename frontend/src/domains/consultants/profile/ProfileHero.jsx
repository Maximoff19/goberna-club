import { ArrowLeft, Check, Pencil, Search, Trash2 } from 'lucide-react';
import HeroNetworkBackground from '../../marketing/home/hero/HeroNetworkBackground';
import ProfileAvatar from './ProfileAvatar';
import { openProfileSearchOverlay, toggleProfileEditMode } from '../../../app/navigation/profileSearchNavigation';

function ProfileHero({ profile, canEdit = false, canDelete = false, isEditing = false, onDelete }) {
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.hash = '';
    window.scrollTo(0, 0);
  };

  return (
    <section className="profile-hero" aria-labelledby="profile-name">
      <div className="profile-hero__banner-wrap">
        <HeroNetworkBackground className="profile-hero__particles" particleId="profile-hero-tsparticles" />
        <img className="profile-hero__banner" src="/headerperfil.webp" alt="Portada del consultor" loading="eager" decoding="async" />

        <div className="profile-hero__brand-wrap">
          <img className="profile-hero__brand" src="/logo.webp" alt="" loading="eager" decoding="async" aria-hidden="true" />
          <strong className="profile-hero__brand-text">GOBERNA</strong>
        </div>
      </div>

      <div className="profile-hero__actions">
        <button type="button" className="profile-hero__icon-action profile-hero__icon-action--back" aria-label="Regresar" onClick={goBack}>
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        {canEdit && (
          <button
            type="button"
            className="profile-hero__icon-action profile-hero__icon-action--edit"
            aria-label={isEditing ? 'Salir del modo edicion' : 'Editar perfil'}
            onClick={toggleProfileEditMode}
          >
            {isEditing ? <Check size={18} aria-hidden="true" /> : <Pencil size={18} aria-hidden="true" />}
          </button>
        )}
        {canDelete && isEditing && typeof onDelete === 'function' ? (
          <button
            type="button"
            className="profile-hero__icon-action profile-hero__icon-action--delete"
            aria-label="Eliminar perfil por completo"
            onClick={onDelete}
          >
            <Trash2 size={18} aria-hidden="true" />
          </button>
        ) : null}
        <button
          type="button"
          className="profile-hero__icon-action profile-hero__icon-action--search"
          aria-label="Buscar perfiles"
          onClick={openProfileSearchOverlay}
        >
          <Search size={18} aria-hidden="true" />
        </button>
      </div>

      <ProfileAvatar
        src={profile?.avatarSrc || profile?.imageSrc}
        name={profile?.name}
        countryFlag={profile?.countryFlag}
        countryCode={profile?.countryCode}
        countryLabel={profile?.countryLabel}
        editable={canEdit && isEditing}
        profileId={profile?.id}
      />
    </section>
  );
}

export default ProfileHero;
