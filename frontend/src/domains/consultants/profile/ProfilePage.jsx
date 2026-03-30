import { useEffect, useState } from 'react';
import ProfileHero from './ProfileHero';
import ProfileIdentitySection from './ProfileIdentitySection';
import LanguagesSection from './LanguagesSection';
import EducationSection from './EducationSection';
import MedalsSection from './MedalsSection';
import ExperienceSection from './ExperienceSection';
import ProfessionalSummarySection from './ProfessionalSummarySection';
import SkillsSection from './SkillsSection';
import ContactSection from './ContactSection';
import CertificatesSection from './CertificatesSection';
import GallerySection from './GallerySection';
import ProfileSectionEditorModal from './ProfileSectionEditorModal';
import { deleteProfilePermanently, fetchConsultantBySlug, fetchOwnProfileById, fetchOwnProfiles, fetchProfileCatalogs, getCurrentSession, isAdminSession, updateMyAvatar, updateOwnProfile, uploadProfileAvatar, uploadProfileGalleryImage, deleteProfileAsset } from '../../../shared/api/gobernaApi';
import './profilePage.css';

function ProfilePage({ initialProfile, selectedProfileSlug, selectedProfileId }) {
  const [currentProfile, setCurrentProfile] = useState(initialProfile || null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editorState, setEditorState] = useState({ isOpen: false, sectionKey: '', itemIndex: null });
  const [catalogs, setCatalogs] = useState({ countries: [], specialties: [], skills: [] });
  const session = getCurrentSession();
  const isAdmin = isAdminSession(session);
  const privateProfileId = selectedProfileId || (window.location.hash.startsWith('#mi-perfil/') ? window.location.hash.replace('#mi-perfil/', '') : '');

  useEffect(() => {
    let ignore = false;

    fetchProfileCatalogs()
      .then((payload) => {
        if (!ignore) {
          setCatalogs(payload);
        }
      })
      .catch(() => {
        if (!ignore) {
          setCatalogs({ countries: [], specialties: [], skills: [] });
        }
      });

    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        if (privateProfileId) {
          const privateProfile = await fetchOwnProfileById(privateProfileId);
          if (!ignore) {
            setCurrentProfile(privateProfile || null);
          }
          return;
        }

        if (selectedProfileSlug) {
          const publicProfile = await fetchConsultantBySlug(selectedProfileSlug);
          if (!ignore) {
            setCurrentProfile(publicProfile || null);
          }
          return;
        }

        const ownProfiles = await fetchOwnProfiles();
        if (ignore) {
          return;
        }

        if (initialProfile?.id) {
          const matchingProfile = ownProfiles.find((profile) => profile.id === initialProfile.id);
          setCurrentProfile(matchingProfile || ownProfiles[0] || initialProfile);
          return;
        }

        setCurrentProfile(ownProfiles[0] || initialProfile || null);
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error instanceof Error ? error.message : 'No pudimos cargar el perfil.');
          setCurrentProfile(initialProfile || null);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, [initialProfile, privateProfileId, selectedProfileSlug]);

  const canEdit = Boolean(isAdmin || (session?.user?.email && currentProfile?.ownerEmail && session.user.email === currentProfile.ownerEmail));
  const canDelete = Boolean(isAdmin && currentProfile?.id);
  const showEditControls = canEdit && isEditing;
  const editableProfileId = privateProfileId || currentProfile?.id || '';

  useEffect(() => {
    if (!canEdit) {
      setIsEditing(false);
      setEditorState({ isOpen: false, sectionKey: '', itemIndex: null });
    }
  }, [canEdit]);

  useEffect(() => {
    const openEditor = (sectionKey, itemIndex = null) => {
      if (!canEdit) {
        return;
      }

      setIsEditing(true);
      setEditorState({ isOpen: true, sectionKey, itemIndex });
    };

    const persistProfile = async (nextProfile, skipRemote = false) => {
      setCurrentProfile(nextProfile);

      if (skipRemote || !editableProfileId) {
        return;
      }

      try {
        const savedProfile = await updateOwnProfile(editableProfileId, nextProfile);
        setCurrentProfile(savedProfile || nextProfile);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'No pudimos guardar los cambios del perfil.');
      }
    };

    const updateProfile = (updater, skipRemote = false) => {
      setCurrentProfile((current) => {
        if (!current) {
          return current;
        }

        const nextProfile = updater(current);
        void persistProfile(nextProfile, skipRemote);
        return nextProfile;
      });
    };

    const onToggleEditMode = () => {
      if (!canEdit) {
        return;
      }

      setIsEditing((current) => {
        const next = !current;
        if (!next) {
          setEditorState({ isOpen: false, sectionKey: '', itemIndex: null });
        }
        return next;
      });
    };

    const onOpenProfileSectionEditor = (event) => {
      openEditor(event.detail?.sectionKey || '', Number.isInteger(event.detail?.itemIndex) ? event.detail.itemIndex : null);
    };

    const onAddProfileSectionItem = (event) => {
      openEditor(event.detail?.sectionKey || '');
    };

    const onRemoveProfileSectionItem = (event) => {
      const sectionKey = event.detail?.sectionKey;
      const itemIndex = event.detail?.itemIndex;
      if (!Number.isInteger(itemIndex)) {
        return;
      }

      if (sectionKey === 'experience') {
        updateProfile((current) => ({
          ...current,
          experiences: current.experiences.filter((_, index) => index !== itemIndex),
        }));
      }

      if (sectionKey === 'education') {
        updateProfile((current) => ({
          ...current,
          educations: current.educations.filter((_, index) => index !== itemIndex),
        }));
      }
    };

    const onUploadProfileAvatar = async (event) => {
      const file = event.detail?.file;
      const targetProfileId = event.detail?.profileId || editableProfileId;
      if (!file || !targetProfileId) {
        return;
      }

      // Show local preview immediately
      const previewUrl = URL.createObjectURL(file);
      setCurrentProfile((current) => {
        if (!current) return current;
        return { ...current, avatarSrc: previewUrl, imageSrc: previewUrl };
      });

      try {
        const asset = await uploadProfileAvatar(targetProfileId, file);
        const serverUrl = asset.publicUrl;
        setCurrentProfile((current) => {
          if (!current) return current;
          return { ...current, avatarSrc: serverUrl, imageSrc: serverUrl };
        });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'No pudimos guardar la foto de perfil.');
      } finally {
        URL.revokeObjectURL(previewUrl);
      }
    };

    const onUpdateProfileSocials = (event) => {
      updateProfile((current) => ({
        ...current,
        socials: Array.isArray(event.detail?.socials) ? event.detail.socials : current.socials,
      }));
    };

    const onUploadProfileGalleryImages = async (event) => {
      const files = event.detail?.files;
      const targetProfileId = event.detail?.profileId || editableProfileId;
      if (!Array.isArray(files) || files.length === 0 || !targetProfileId) {
        return;
      }

      try {
        const uploadedUrls = [];
        for (const file of files) {
          const asset = await uploadProfileGalleryImage(targetProfileId, file);
          uploadedUrls.push(asset.publicUrl);
        }

        setCurrentProfile((current) => {
          if (!current) return current;
          return { ...current, gallery: [...(current.gallery || []), ...uploadedUrls] };
        });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'No pudimos subir las imagenes.');
      }
    };

    const onRemoveProfileGalleryImage = async (event) => {
      const assetId = event.detail?.assetId;
      const imageUrl = event.detail?.imageUrl;
      const targetProfileId = event.detail?.profileId || editableProfileId;

      if (imageUrl) {
        setCurrentProfile((current) => {
          if (!current) return current;
          return { ...current, gallery: (current.gallery || []).filter((url) => url !== imageUrl) };
        });
      }

      if (assetId && targetProfileId) {
        try {
          await deleteProfileAsset(targetProfileId, assetId);
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : 'No pudimos eliminar la imagen.');
        }
      }
    };

    window.addEventListener('app:toggle-profile-edit-mode', onToggleEditMode);
    window.addEventListener('app:open-profile-section-editor', onOpenProfileSectionEditor);
    window.addEventListener('app:add-profile-section-item', onAddProfileSectionItem);
    window.addEventListener('app:remove-profile-section-item', onRemoveProfileSectionItem);
    window.addEventListener('app:upload-profile-avatar', onUploadProfileAvatar);
    window.addEventListener('app:update-profile-socials', onUpdateProfileSocials);
    window.addEventListener('app:upload-profile-gallery', onUploadProfileGalleryImages);
    window.addEventListener('app:remove-profile-gallery-image', onRemoveProfileGalleryImage);

    return () => {
      window.removeEventListener('app:toggle-profile-edit-mode', onToggleEditMode);
      window.removeEventListener('app:open-profile-section-editor', onOpenProfileSectionEditor);
      window.removeEventListener('app:add-profile-section-item', onAddProfileSectionItem);
      window.removeEventListener('app:remove-profile-section-item', onRemoveProfileSectionItem);
      window.removeEventListener('app:upload-profile-avatar', onUploadProfileAvatar);
      window.removeEventListener('app:update-profile-socials', onUpdateProfileSocials);
      window.removeEventListener('app:upload-profile-gallery', onUploadProfileGalleryImages);
      window.removeEventListener('app:remove-profile-gallery-image', onRemoveProfileGalleryImage);
    };
  }, [canEdit, editableProfileId]);

  const openSectionEditor = (sectionKey, itemIndex = null) => {
    if (!canEdit) {
      return;
    }

    setIsEditing(true);
    setEditorState({ isOpen: true, sectionKey, itemIndex });
  };

  const handleSaveSection = async (sectionKey, payload) => {
    if (!currentProfile) {
      return;
    }

    let nextProfile = currentProfile;
    let skipRemote = false;

    if (sectionKey === 'identity') {
      const nextSpecialty = catalogs.specialties.find((specialty) => specialty.id === payload.specialtyId);
      const nextCountry = catalogs.countries.find((country) => country.id === payload.countryId);
      nextProfile = {
        ...currentProfile,
        specialtyId: payload.specialtyId || '',
        specialization: nextSpecialty?.label || currentProfile.specialization,
        countryId: payload.countryId || '',
        country: nextCountry?.label || currentProfile.country,
        countryLabel: nextCountry?.label || currentProfile.countryLabel,
        countryKey: (nextCountry?.code || nextCountry?.slug || currentProfile.countryKey || '').toLowerCase(),
      };
    }

    if (sectionKey === 'summary') {
      nextProfile = { ...currentProfile, summary: payload.summary || '' };
    }

    if (sectionKey === 'languages') {
      const languages = payload.languages || '';
      nextProfile = {
        ...currentProfile,
        languages,
        languagesList: languages.split(',').map((item) => item.trim()).filter(Boolean),
      };
    }

    if (sectionKey === 'skills') {
      const skills = (payload.skillIds || [])
        .map((skillId) => catalogs.skills.find((skill) => skill.id === skillId)?.label)
        .filter(Boolean);
      nextProfile = {
        ...currentProfile,
        skills: skills.join(', '),
        skillsList: skills,
        skillIds: payload.skillIds || [],
      };
    }

    if (sectionKey === 'contact') {
      nextProfile = {
        ...currentProfile,
        phone: payload.phone || '',
        email: payload.email || '',
        website: payload.website || '',
      };
    }

    if (sectionKey === 'experience') {
      nextProfile = Number.isInteger(payload.itemIndex)
        ? {
            ...currentProfile,
            experiences: currentProfile.experiences.map((item, index) => (index === payload.itemIndex ? payload.experience : item)),
          }
        : {
            ...currentProfile,
            experiences: payload.experiences || [],
          };
    }

    if (sectionKey === 'education') {
      nextProfile = Number.isInteger(payload.itemIndex)
        ? {
            ...currentProfile,
            educations: currentProfile.educations.map((item, index) => (index === payload.itemIndex ? payload.education : item)),
          }
        : {
            ...currentProfile,
            educations: payload.educations || [],
          };
    }

    if (sectionKey === 'gallery') {
      nextProfile = { ...currentProfile, gallery: payload.gallery || [] };
      skipRemote = true;
    }

    setCurrentProfile(nextProfile);
    if (!skipRemote && editableProfileId) {
      try {
        const savedProfile = await updateOwnProfile(editableProfileId, nextProfile);
        setCurrentProfile(savedProfile || nextProfile);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'No pudimos guardar los cambios del perfil.');
      }
    }
  };

  const handleResetEditor = async () => {
    if (!editableProfileId) {
      return;
    }

    try {
      const restoredProfile = await fetchOwnProfileById(editableProfileId);
      if (restoredProfile) {
        setCurrentProfile(restoredProfile);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No pudimos restaurar el perfil.');
    }
  };

  const handleDeleteProfile = async () => {
    if (!currentProfile?.id || !canDelete) {
      return;
    }

    const confirmed = window.confirm(`Vas a eliminar PERMANENTEMENTE el perfil de ${currentProfile.name || 'este consultor'}. Esta accion no se puede deshacer.`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteProfilePermanently(currentProfile.id);
      window.location.hash = '#explorar-consultores';
      window.scrollTo(0, 0);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No pudimos eliminar el perfil.');
    }
  };

  if (isLoading) {
    return (
      <section className="profile-page" aria-labelledby="profile-name">
        <div className="profile-page__safe-area">
          <div className="profile-page__loading">
            <div className="profile-page__loading-spinner"></div>
            <p>Cargando perfil...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!currentProfile) {
    return (
      <section className="profile-page" aria-labelledby="profile-name">
        <div className="profile-page__safe-area">
          <div className="profile-page__empty">
            <h2>No encontramos un perfil disponible</h2>
            <p>{errorMessage || 'Crea tu perfil para comenzar a mostrar tu información.'}</p>
            <a href="#crear-perfil" className="profile-page__empty-cta">
              Crear perfil
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page" aria-labelledby="profile-name">
      <div className="profile-page__safe-area">
        <ProfileHero profile={currentProfile} canEdit={canEdit} canDelete={canDelete} isEditing={isEditing} onDelete={() => void handleDeleteProfile()} />

        <div className="profile-page__layout">
          <aside className="profile-page__column profile-page__column--left">
            <ProfileIdentitySection profile={currentProfile} showEdit={showEditControls} onEdit={() => openSectionEditor('identity')} />
            <LanguagesSection showEdit={showEditControls} languages={currentProfile.languages} onEdit={() => openSectionEditor('languages')} />
            <EducationSection
              showEdit={showEditControls}
              educations={currentProfile.educations}
              onAddItem={() => openSectionEditor('education')}
              onEditItem={(itemIndex) => openSectionEditor('education', itemIndex)}
              onRemoveItem={(itemIndex) => {
                setCurrentProfile((current) => ({
                  ...current,
                  educations: current.educations.filter((_, index) => index !== itemIndex),
                }));
                void updateOwnProfile(editableProfileId, {
                  ...currentProfile,
                  educations: currentProfile.educations.filter((_, index) => index !== itemIndex),
                }).then((savedProfile) => setCurrentProfile(savedProfile || currentProfile));
              }}
            />
            <MedalsSection medals={currentProfile.medals} />
          </aside>

          <div className="profile-page__column profile-page__column--center">
            <ProfessionalSummarySection showEdit={showEditControls} profile={currentProfile} onEdit={() => openSectionEditor('summary')} />
            <ExperienceSection
              showEdit={showEditControls}
              experiences={currentProfile.experiences}
              onAddItem={() => openSectionEditor('experience')}
              onEditItem={(itemIndex) => openSectionEditor('experience', itemIndex)}
              onRemoveItem={(itemIndex) => {
                setCurrentProfile((current) => ({
                  ...current,
                  experiences: current.experiences.filter((_, index) => index !== itemIndex),
                }));
                void updateOwnProfile(editableProfileId, {
                  ...currentProfile,
                  experiences: currentProfile.experiences.filter((_, index) => index !== itemIndex),
                }).then((savedProfile) => setCurrentProfile(savedProfile || currentProfile));
              }}
            />
            <CertificatesSection certificates={currentProfile.certificates} />
            <GallerySection showEdit={showEditControls} gallery={currentProfile.gallery} profileId={currentProfile.id} />
          </div>

          <aside className="profile-page__column profile-page__column--right">
            <SkillsSection showEdit={showEditControls} skills={currentProfile.skills} onEdit={() => openSectionEditor('skills')} />
            <ContactSection showEdit={showEditControls} profile={currentProfile} onEdit={() => openSectionEditor('contact')} />
          </aside>
        </div>

        <ProfileSectionEditorModal
          isOpen={editorState.isOpen}
          sectionKey={editorState.sectionKey}
          itemIndex={editorState.itemIndex}
          profile={currentProfile}
          catalogs={catalogs}
          onClose={() => setEditorState({ isOpen: false, sectionKey: '', itemIndex: null })}
          onSave={handleSaveSection}
          onReset={() => void handleResetEditor()}
        />
      </div>
    </section>
  );
}

export default ProfilePage;
