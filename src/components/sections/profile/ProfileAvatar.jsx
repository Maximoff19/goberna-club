import { useRef } from 'react';
import { Camera } from 'lucide-react';

function ProfileAvatar({ src, name, editable = false }) {
  const fileInputRef = useRef(null);

  const onSelectAvatar = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    const nextAvatar = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(selectedFile);
    });

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
        <div className="profile-hero__avatar profile-hero__avatar--placeholder" aria-label="Sin foto de perfil">
          {initials}
        </div>
      )}

      {editable && (
        <>
          <button
            type="button"
            className="profile-hero__avatar-edit"
            aria-label="Cambiar foto de perfil"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera size={16} aria-hidden="true" />
            <span>Cambiar foto</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="profile-hero__avatar-input" onChange={onSelectAvatar} />
        </>
      )}
    </div>
  );
}

export default ProfileAvatar;
