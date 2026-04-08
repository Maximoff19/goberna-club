interface GalleryImage {
  src: string;
  alt: string;
}

interface GalleryImageItemProps {
  image: GalleryImage;
  onOpen: () => void;
  showEdit?: boolean;
  onRemove: () => void;
}

function GalleryImageItem({ image, onOpen, showEdit = false, onRemove }: GalleryImageItemProps) {
  return (
    <figure className={`profile-gallery-item ${showEdit ? 'profile-gallery-item--editable' : ''}`}>
      <button type="button" className="profile-gallery-item__trigger" onClick={onOpen} aria-label={showEdit ? `Reemplazar imagen: ${image.alt}` : `Abrir imagen: ${image.alt}`}>
        <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
        {showEdit && <span className="profile-gallery-item__overlay">Cambiar imagen</span>}
      </button>

      {showEdit && (
        <button type="button" className="profile-gallery-item__remove" aria-label="Quitar imagen" onClick={onRemove}>
          -
        </button>
      )}
    </figure>
  );
}

export default GalleryImageItem;
