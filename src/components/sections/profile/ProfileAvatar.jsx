import { useRef } from 'react';
import { Camera } from 'lucide-react';

function ProfileAvatar({ src = '/fotoperfil.png', editable = false }) {
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

  return (
    <div className={`profile-hero__avatar-wrap ${editable ? 'is-editable' : ''}`}>
      <img className="profile-hero__avatar" src={src} alt="Fotografia del consultor" loading="eager" decoding="async" />

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
