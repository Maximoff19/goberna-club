import { useState } from 'react';
import { Camera } from 'lucide-react';

function ProfileAvatar({ src, name, countryFlag = '', countryCode = '', countryLabel = '', editable = false, profileId = '' }) {
  const [imageFailed, setImageFailed] = useState(false);
  const inputId = 'profile-avatar-input';

  const onSelectAvatar = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent('app:upload-profile-avatar', {
        detail: { file: selectedFile, profileId },
      })
    );

    event.target.value = '';
  };

  // Obtener iniciales del nombre
  const getInitials = (nameStr) => {
    if (!nameStr) return '?';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (parts[0][0] || '?').toUpperCase();
  };

  const initials = getInitials(name);
  const hasImage = src && src.trim() !== '' && !imageFailed;

  return (
    <div className={`profile-hero__avatar-wrap ${editable ? 'is-editable' : ''}`}>
      {hasImage ? (
        <img className="profile-hero__avatar" src={src} alt="Fotografia del consultor" loading="eager" decoding="async" onError={() => setImageFailed(true)} />
      ) : (
        <div className="profile-hero__avatar profile-hero__avatar--placeholder" aria-label="Sin foto de perfil" role="img">
          {initials}
        </div>
      )}

      {countryCode ? (
        <span className="profile-hero__avatar-flag" role="img" aria-label={countryLabel ? `Pais: ${countryLabel}` : 'Pais del consultor'}>
          <img
            className="profile-hero__avatar-flag-image"
            src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
            alt={countryLabel ? `Bandera de ${countryLabel}` : 'Bandera del pais'}
            loading="lazy"
            decoding="async"
          />
        </span>
      ) : countryFlag ? (
        <span className="profile-hero__avatar-flag" role="img" aria-label={countryLabel ? `Pais: ${countryLabel}` : 'Pais del consultor'}>
          {countryFlag}
        </span>
      ) : null}

      {editable && (
        <>
          <label
            htmlFor={inputId}
            className="profile-hero__avatar-edit"
            aria-label="Cambiar foto de perfil"
          >
            <Camera size={16} aria-hidden="true" />
            <span>Cambiar foto</span>
          </label>
          <input id={inputId} type="file" accept="image/*" className="profile-hero__avatar-input" onChange={onSelectAvatar} />
        </>
      )}
    </div>
  );
}

export default ProfileAvatar;
