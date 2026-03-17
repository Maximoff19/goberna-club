import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import GalleryImageItem from './GalleryImageItem';

const GALLERY = [
  { id: 'gl-1', src: '/galeria/1c0ca2ea0f7ad3da8f9a68ae161cc016.jpg', alt: 'Consultores en mesa de estrategia' },
  { id: 'gl-2', src: '/galeria/333abe6e88c2beb8786d1cda08813aaf.jpg', alt: 'Consultora en sesión de análisis político' },
  { id: 'gl-3', src: '/galeria/c1784dd2a85d12fec367250aa4aeeb04.jpg', alt: 'Ponencia en evento de consultoría política' },
  { id: 'gl-4', src: '/galeria/f115905a7713cb696e78db53b258c952.jpg', alt: 'Retrato de consultor político' },
  { id: 'gl-5', src: '/galeria/9f4c9cd0b18de367d05e2edde51b6b79.jpg', alt: 'Sesión de análisis con equipo de campaña' },
  { id: 'gl-6', src: '/galeria/d857395d717c4d9b6813f0f9a040864d.jpg', alt: 'Encuentro de trabajo en consultoría política' },
];

function GallerySection({ showEdit, gallery }) {
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const [replaceImageIndex, setReplaceImageIndex] = useState(null);
  const replaceImageInputRef = useRef(null);
  const addImageInputRef = useRef(null);
  const currentGallery =
    Array.isArray(gallery) && gallery.length > 0
      ? gallery.map((src, index) => ({ id: `gl-dynamic-${index + 1}`, src, alt: `Imagen de galeria ${index + 1}` }))
      : GALLERY;

  const isLightboxOpen = activeImageIndex !== null;
  const activeImage = isLightboxOpen ? currentGallery[activeImageIndex] : null;

  const closeLightbox = () => {
    setActiveImageIndex(null);
  };

  const updateGallery = (nextGalleryItems) => {
    window.dispatchEvent(
      new CustomEvent('app:update-profile-gallery', {
        detail: { gallery: nextGalleryItems },
      })
    );
  };

  const onSelectReplacementImage = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile || replaceImageIndex === null) {
      return;
    }

    const nextImage = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(selectedFile);
    });

    const nextGallery = currentGallery.map((item) => item.src);
    nextGallery[replaceImageIndex] = nextImage;
    updateGallery(nextGallery);

    setReplaceImageIndex(null);
    event.target.value = '';
  };

  const onSelectAddImages = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) {
      return;
    }

    const nextImages = await Promise.all(
      selectedFiles.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          })
      )
    );

    updateGallery([...currentGallery.map((item) => item.src), ...nextImages]);
    event.target.value = '';
  };

  const removeImage = (imageIndex) => {
    const nextGallery = currentGallery.map((item) => item.src).filter((_, index) => index !== imageIndex);
    updateGallery(nextGallery);
  };

  const goToNextImage = () => {
    setActiveImageIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex;
      }

      return (currentIndex + 1) % currentGallery.length;
    });
  };

  const goToPreviousImage = () => {
    setActiveImageIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex;
      }

      return (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    });
  };

  useEffect(() => {
    if (!isLightboxOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveImageIndex(null);
      }

      if (event.key === 'ArrowRight') {
        setActiveImageIndex((currentIndex) => {
          if (currentIndex === null) {
            return currentIndex;
          }

          return (currentIndex + 1) % currentGallery.length;
        });
      }

      if (event.key === 'ArrowLeft') {
        setActiveImageIndex((currentIndex) => {
          if (currentIndex === null) {
            return currentIndex;
          }

          return (currentIndex - 1 + currentGallery.length) % currentGallery.length;
        });
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isLightboxOpen, currentGallery.length]);

  const lightbox =
    isLightboxOpen && activeImage ? (
      <div className="profile-gallery-lightbox" role="dialog" aria-modal="true" aria-label="Galeria ampliada">
        <div className="profile-gallery-lightbox__overlay" aria-hidden="true" />
        <button type="button" className="profile-gallery-lightbox__dismiss" aria-label="Cerrar galeria" onClick={closeLightbox} />

        <button
          type="button"
          className="profile-gallery-lightbox__close"
          aria-label="Cerrar galeria"
          onClick={closeLightbox}
        >
          <X size={22} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="profile-gallery-lightbox__nav profile-gallery-lightbox__nav--left"
          aria-label="Imagen anterior"
          onClick={goToPreviousImage}
        >
          <ChevronLeft size={24} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="profile-gallery-lightbox__nav profile-gallery-lightbox__nav--right"
          aria-label="Imagen siguiente"
          onClick={goToNextImage}
        >
          <ChevronRight size={24} aria-hidden="true" />
        </button>

        <div className="profile-gallery-lightbox__content">
          <img
            key={activeImage.id}
            className="profile-gallery-lightbox__image"
            src={activeImage.src}
            alt={activeImage.alt}
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
    ) : null;

  return (
    <section className="profile-section-card profile-section-card--plain" aria-labelledby="profile-gallery-title">
      <div className="profile-section-heading">
        <h3 id="profile-gallery-title" className="profile-section-title">
          Galeria de fotos
        </h3>

        {showEdit && (
          <button type="button" className="profile-section-edit" onClick={() => addImageInputRef.current?.click()} aria-label="Agregar imagen a galeria">
            <Plus size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="profile-gallery-grid">
        {currentGallery.map((image, index) => (
          <GalleryImageItem
            key={image.id}
            image={image}
            showEdit={showEdit}
            onOpen={() => {
              if (!showEdit) {
                setActiveImageIndex(index);
                return;
              }

              setReplaceImageIndex(index);
              replaceImageInputRef.current?.click();
            }}
            onRemove={() => removeImage(index)}
          />
        ))}
      </div>

      {showEdit && <input ref={replaceImageInputRef} type="file" accept="image/*" className="profile-gallery-edit-input" onChange={onSelectReplacementImage} />}
      {showEdit && <input ref={addImageInputRef} type="file" accept="image/*" multiple className="profile-gallery-edit-input" onChange={onSelectAddImages} />}

      {lightbox && createPortal(lightbox, document.body)}
    </section>
  );
}

export default GallerySection;
