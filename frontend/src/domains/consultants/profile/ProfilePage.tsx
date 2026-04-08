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
// GallerySection intentionally removed from view -- component preserved for future use
// import GallerySection from './GallerySection';
import ProfileSectionEditorModal from './ProfileSectionEditorModal';
import { deleteProfilePermanently, fetchConsultantBySlug, fetchOwnProfileById, fetchOwnProfiles, fetchProfileCatalogs, getCurrentSession, isAdminSession, updateMyAvatar, updateOwnProfile, uploadProfileAvatar } from '../../../shared/api/gobernaApi';
import './profilePage.css';

interface CatalogItem {
  id: string;
  label: string;
  code?: string;
  slug?: string;
}

interface Catalogs {
  countries: CatalogItem[];
  specialties: CatalogItem[];
  skills: CatalogItem[];
}

interface EditorState {
  isOpen: boolean;
  sectionKey: string;
  itemIndex: number | null;
}

interface ProfilePageProps {
  initialProfile?: any;
  selectedProfileSlug?: string;
  selectedProfileId?: string;
}

function ProfilePage({ initialProfile, selectedProfileSlug, selectedProfileId }: ProfilePageProps) {
  const [currentProfile, setCurrentProfile] = useState<any>(initialProfile || null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editorState, setEditorState] = useState<EditorState>({ isOpen: false, sectionKey: '', itemIndex: null });
  const [catalogs, setCatalogs] = useState<Catalogs>({ countries: [], specialties: [], skills: [] });
  const session = getCurrentSession();
  const isAdmin = isAdminSession(session);
  const privateProfileId = selectedProfileId || (window.location.hash.startsWith('#mi-perfil/') ? window.location.hash.replace('#mi-perfil/', '') : '');

  useEffect(() => {
    let ignore = false;

    fetchProfileCatalogs()
      .then((payload: any) => {
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
          const matchingProfile = ownProfiles.find((profile: any) => profile.id === initialProfile.id);
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
    const openEditor = (sectionKey: string, itemIndex: number | null = null) => {
      if (!canEdit) {
        return;
      }

      setIsEditing(true);
      setEditorState({ isOpen: true, sectionKey, itemIndex });
    };

    const persistProfile = async (nextProfile: any, skipRemote = false) => {
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

    const updateProfile = (updater: (current: any) => any, skipRemote = false) => {
      setCurrentProfile((current: any) => {
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

    const onOpenProfileSectionEditor = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      openEditor(detail?.sectionKey || '', Number.isInteger(detail?.itemIndex) ? detail.itemIndex : null);
    };

    const onAddProfileSectionItem = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      openEditor(detail?.sectionKey || '');
    };

    const onRemoveProfileSectionItem = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      const sectionKey = detail?.sectionKey;
      const itemIndex = detail?.itemIndex;
      if (!Number.isInteger(itemIndex)) {
        return;
      }

      if (sectionKey === 'experience') {
        updateProfile((current: any) => ({
          ...current,
          experiences: current.experiences.filter((_: any, index: number) => index !== itemIndex),
        }));
      }

      if (sectionKey === 'education') {
        updateProfile((current: any) => ({
          ...current,
          educations: current.educations.filter((_: any, index: number) => index !== itemIndex),
        }));
      }
    };

    const onUploadProfileAvatar = async (event: Event) => {
      const detail = (event as CustomEvent).detail;
      const file = detail?.file;
      const targetProfileId = detail?.profileId || editableProfileId;
      if (!file || !targetProfileId) {
        return;
      }

      // Show local preview immediately
      const previewUrl = URL.createObjectURL(file);
      setCurrentProfile((current: any) => {
        if (!current) return current;
        return { ...current, avatarSrc: previewUrl, imageSrc: previewUrl };
      });

      try {
        const asset = await uploadProfileAvatar(targetProfileId, file);
        const serverUrl = (asset as any).publicUrl;
        setCurrentProfile((current: any) => {
          if (!current) return current;
          return { ...current, avatarSrc: serverUrl, imageSrc: serverUrl };
        });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'No pudimos guardar la foto de perfil.');
      } finally {
        URL.revokeObjectURL(previewUrl);
      }
    };

    const onUpdateProfileSocials = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      updateProfile((current: any) => ({
        ...current,
        socials: Array.isArray(detail?.socials) ? detail.socials : current.socials,
      }));
    };

    window.addEventListener('app:toggle-profile-edit-mode', onToggleEditMode);
    window.addEventListener('app:open-profile-section-editor', onOpenProfileSectionEditor);
    window.addEventListener('app:add-profile-section-item', onAddProfileSectionItem);
    window.addEventListener('app:remove-profile-section-item', onRemoveProfileSectionItem);
    window.addEventListener('app:upload-profile-avatar', onUploadProfileAvatar);
    window.addEventListener('app:update-profile-socials', onUpdateProfileSocials);

    return () => {
      window.removeEventListener('app:toggle-profile-edit-mode', onToggleEditMode);
      window.removeEventListener('app:open-profile-section-editor', onOpenProfileSectionEditor);
      window.removeEventListener('app:add-profile-section-item', onAddProfileSectionItem);
      window.removeEventListener('app:remove-profile-section-item', onRemoveProfileSectionItem);
      window.removeEventListener('app:upload-profile-avatar', onUploadProfileAvatar);
      window.removeEventListener('app:update-profile-socials', onUpdateProfileSocials);
    };
  }, [canEdit, editableProfileId]);

  const openSectionEditor = (sectionKey: string, itemIndex: number | null = null) => {
    if (!canEdit) {
      return;
    }

    setIsEditing(true);
    setEditorState({ isOpen: true, sectionKey, itemIndex });
  };

  const handleSaveSection = async (sectionKey: string, payload: any) => {
    if (!currentProfile) {
      return;
    }

    let nextProfile = currentProfile;
    const skipRemote = false;

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
        languagesList: languages.split(',').map((item: string) => item.trim()).filter(Boolean),
      };
    }

    if (sectionKey === 'skills') {
      const skills = (payload.skillIds || [])
        .map((skillId: string) => catalogs.skills.find((skill) => skill.id === skillId)?.label)
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
            experiences: currentProfile.experiences.map((item: any, index: number) => (index === payload.itemIndex ? payload.experience : item)),
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
            educations: currentProfile.educations.map((item: any, index: number) => (index === payload.itemIndex ? payload.education : item)),
          }
        : {
            ...currentProfile,
            educations: payload.educations || [],
          };
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
            <p>{errorMessage || 'Crea tu perfil para comenzar a mostrar tu informacion.'}</p>
            <a href="#acceso-consultor" className="profile-page__empty-cta">
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
                setCurrentProfile((current: any) => ({
                  ...current,
                  educations: current.educations.filter((_: any, index: number) => index !== itemIndex),
                }));
                void updateOwnProfile(editableProfileId, {
                  ...currentProfile,
                  educations: currentProfile.educations.filter((_: any, index: number) => index !== itemIndex),
                }).then((savedProfile: any) => setCurrentProfile(savedProfile || currentProfile));
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
                setCurrentProfile((current: any) => ({
                  ...current,
                  experiences: current.experiences.filter((_: any, index: number) => index !== itemIndex),
                }));
                void updateOwnProfile(editableProfileId, {
                  ...currentProfile,
                  experiences: currentProfile.experiences.filter((_: any, index: number) => index !== itemIndex),
                }).then((savedProfile: any) => setCurrentProfile(savedProfile || currentProfile));
              }}
            />
            <CertificatesSection certificates={currentProfile.certificates} />
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
