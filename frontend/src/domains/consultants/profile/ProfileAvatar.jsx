import { Camera } from 'lucide-react';

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No pudimos leer la imagen seleccionada.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No pudimos procesar la imagen seleccionada.'));
    image.src = dataUrl;
  });
}

async function optimizeAvatarFile(file) {
  const dataUrl = await readImageAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    return dataUrl;
  }

  const maxSize = 320;
  const cropSize = Math.min(image.width, image.height);
  const sourceX = Math.max(0, Math.round((image.width - cropSize) / 2));
  const sourceY = Math.max(0, Math.round((image.height - cropSize) / 2));
  canvas.width = maxSize;
  canvas.height = maxSize;
  context.drawImage(image, sourceX, sourceY, cropSize, cropSize, 0, 0, maxSize, maxSize);

  return canvas.toDataURL('image/jpeg', 0.82);
}

function ProfileAvatar({ src, name, countryFlag = '', countryCode = '', countryLabel = '', editable = false }) {
  const inputId = 'profile-avatar-input';

  const onSelectAvatar = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    const nextAvatar = await optimizeAvatarFile(selectedFile);

    window.dispatchEvent(
      new CustomEvent('app:update-profile-photo', {
        detail: { avatarSrc: nextAvatar },
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
  const hasImage = src && src.trim() !== '';

  return (
    <div className={`profile-hero__avatar-wrap ${editable ? 'is-editable' : ''}`}>
      {hasImage ? (
        <img className="profile-hero__avatar" src={src} alt="Fotografia del consultor" loading="eager" decoding="async" />
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
