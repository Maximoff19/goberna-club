import { useEffect, useState } from 'react';
import ProfileSearchOverlay from './ProfileSearchOverlay';
import ProfileSectionEditorModal from './ProfileSectionEditorModal';

const PROFILE_STORAGE_KEY = 'goberna.profileDirectory';

function ConsultantSearchController() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSectionKey, setActiveSectionKey] = useState('');
  const [activeSectionItemIndex, setActiveSectionItemIndex] = useState(null);
  const [query, setQuery] = useState('');
  const [profiles, setProfiles] = useState([]);

  // Obtener el ID del último perfil creado
  const getLastCreatedProfileId = () => {
    return localStorage.getItem('goberna.lastCreatedProfileId');
  };

  // Obtener el perfil activo (el último creado o el primero disponible)
  const getActiveProfile = () => {
    const lastId = getLastCreatedProfileId();
    if (lastId) {
      const found = profiles.find(p => p.id === lastId);
      if (found) return found;
    }
    return profiles.length > 0 ? profiles[profiles.length - 1] : null;
  };

  useEffect(() => {
    try {
      const storedProfiles = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!storedProfiles) {
        setProfiles([]);
        return;
      }

      const parsedProfiles = JSON.parse(storedProfiles);
      if (!Array.isArray(parsedProfiles) || parsedProfiles.length === 0) {
        setProfiles([]);
        return;
      }

      setProfiles(parsedProfiles);
    } catch {
      setProfiles([]);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
    } catch {
      // Ignore write failures.
    }

    const currentProfile = getActiveProfile();
    if (currentProfile) {
      window.dispatchEvent(
        new CustomEvent('app:profile-data-updated', {
          detail: { profile: currentProfile },
        })
      );
    }
  }, [profiles]);

  // Obtener el ID del perfil activo
  const getActiveProfileId = () => {
    const lastId = getLastCreatedProfileId();
    if (lastId && profiles.some(p => p.id === lastId)) {
      return lastId;
    }
    return profiles.length > 0 ? profiles[profiles.length - 1].id : null;
  };

  useEffect(() => {
    const openOverlay = () => {
      setQuery('');
      setIsOpen(true);
    };

    const openEditor = () => {
      window.dispatchEvent(
        new CustomEvent('app:profile-edit-mode-toggle')
      );
    };

    const syncEditMode = (event) => {
      const isEditMode = event.detail?.isEditMode;
      if (!isEditMode) {
        setActiveSectionKey('');
        setActiveSectionItemIndex(null);
      }
    };

    window.addEventListener('app:profile-edit-mode-changed', syncEditMode);

    const openSectionEditor = (event) => {
      const sectionKey = event.detail?.sectionKey;
      const itemIndex = event.detail?.itemIndex;
      if (!sectionKey) {
        return;
      }

      setActiveSectionKey(sectionKey);
      setActiveSectionItemIndex(Number.isInteger(itemIndex) ? itemIndex : null);
    };

    const activeProfileId = getActiveProfileId();
    
    const addSectionItem = (event) => {
      const sectionKey = event.detail?.sectionKey;
      if (sectionKey !== 'education' && sectionKey !== 'experience') {
        return;
      }
      
      if (!activeProfileId) {
        return;
      }

      let nextIndex = null;

      setProfiles((currentProfiles) =>
        currentProfiles.map((profile) => {
          if (profile.id !== activeProfileId) {
            return profile;
          }

          const sourceItems = sectionKey === 'education' ? profile.educations : profile.experiences;
          const currentItems = Array.isArray(sourceItems) ? sourceItems : [];
          nextIndex = currentItems.length;

          if (sectionKey === 'education') {
            return {
              ...profile,
              educations: [...currentItems, { institution: '', program: '', period: '' }],
            };
          }

          return {
            ...profile,
            experiences: [
              ...currentItems,
              { company: '', role: '', mode: '', period: '', country: '', summary: '' },
            ],
          };
        })
      );

      if (!Number.isInteger(nextIndex)) {
        return;
      }

      setActiveSectionKey(sectionKey);
      setActiveSectionItemIndex(nextIndex);
    };

    const removeSectionItem = (event) => {
      const sectionKey = event.detail?.sectionKey;
      const itemIndex = event.detail?.itemIndex;
      if (!sectionKey) {
        return;
      }

      if (!activeProfileId) {
        return;
      }

      if (sectionKey === 'education') {
        setProfiles((currentProfiles) =>
          currentProfiles.map((profile) => {
            if (profile.id !== activeProfileId) {
              return profile;
            }

            const currentItems = Array.isArray(profile.educations) ? profile.educations : [];
            if (currentItems.length === 0) {
              return profile;
            }

            if (Number.isInteger(itemIndex)) {
              return {
                ...profile,
                educations: currentItems.filter((_, index) => index !== itemIndex),
              };
            }

            return {
              ...profile,
              educations: currentItems.slice(0, -1),
            };
          })
        );
        return;
      }

      if (sectionKey === 'experience') {
        setProfiles((currentProfiles) =>
          currentProfiles.map((profile) => {
            if (profile.id !== activeProfileId) {
              return profile;
            }

            const currentItems = Array.isArray(profile.experiences) ? profile.experiences : [];
            if (currentItems.length <= 1) {
              return profile;
            }

            if (Number.isInteger(itemIndex)) {
              return {
                ...profile,
                experiences: currentItems.filter((_, index) => index !== itemIndex),
              };
            }

            return {
              ...profile,
              experiences: currentItems.slice(0, -1),
            };
          })
        );
      }
    };

    const updateProfilePhoto = (event) => {
      const avatarSrc = event.detail?.avatarSrc;
      if (!avatarSrc) {
        return;
      }

      if (!activeProfileId) {
        return;
      }

      setProfiles((currentProfiles) =>
        currentProfiles.map((profile) => {
          if (profile.id !== activeProfileId) {
            return profile;
          }

          return {
            ...profile,
            avatarSrc,
            imageSrc: avatarSrc,
          };
        })
      );
    };

    const updateGallery = (event) => {
      const gallery = event.detail?.gallery;
      if (!Array.isArray(gallery)) {
        return;
      }

      if (!activeProfileId) {
        return;
      }

      setProfiles((currentProfiles) =>
        currentProfiles.map((profile) => {
          if (profile.id !== activeProfileId) {
            return profile;
          }

          return {
            ...profile,
            gallery,
          };
        })
      );
    };

    const updateSocials = (event) => {
      const socials = event.detail?.socials;
      if (!Array.isArray(socials)) {
        return;
      }

      if (!activeProfileId) {
        return;
      }

      setProfiles((currentProfiles) =>
        currentProfiles.map((profile) => {
          if (profile.id !== activeProfileId) {
            return profile;
          }

          return {
            ...profile,
            socials,
          };
        })
      );
    };

    window.addEventListener('app:open-profile-search', openOverlay);
    window.addEventListener('app:toggle-profile-edit-mode', openEditor);
    window.addEventListener('app:open-profile-section-editor', openSectionEditor);
    window.addEventListener('app:add-profile-section-item', addSectionItem);
    window.addEventListener('app:remove-profile-section-item', removeSectionItem);
    window.addEventListener('app:update-profile-photo', updateProfilePhoto);
    window.addEventListener('app:update-profile-gallery', updateGallery);
    window.addEventListener('app:update-profile-socials', updateSocials);

    return () => {
      window.removeEventListener('app:open-profile-search', openOverlay);
      window.removeEventListener('app:toggle-profile-edit-mode', openEditor);
      window.removeEventListener('app:open-profile-section-editor', openSectionEditor);
      window.removeEventListener('app:add-profile-section-item', addSectionItem);
      window.removeEventListener('app:remove-profile-section-item', removeSectionItem);
      window.removeEventListener('app:profile-edit-mode-changed', syncEditMode);
      window.removeEventListener('app:update-profile-photo', updateProfilePhoto);
      window.removeEventListener('app:update-profile-gallery', updateGallery);
      window.removeEventListener('app:update-profile-socials', updateSocials);
    };
  }, []);

  const mergeProfileDetails = (nextProfileDetails) => {
    const activeId = getActiveProfileId();
    if (!activeId) {
      return;
    }

    setProfiles((currentProfiles) =>
      currentProfiles.map((profile) => {
        if (profile.id !== activeId) {
          return profile;
        }

        const pick = (key) => {
          return Object.prototype.hasOwnProperty.call(nextProfileDetails, key) ? nextProfileDetails[key] : profile[key];
        };

        return {
          ...profile,
          summary: pick('summary'),
          languages: pick('languages'),
          skills: pick('skills'),
          phone: pick('phone'),
          email: pick('email'),
          website: pick('website'),
          socials: pick('socials'),
          experiences: pick('experiences'),
          educations: pick('educations'),
          gallery: pick('gallery'),
        };
      })
    );

  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const openProfileFromSearch = () => {
    setIsOpen(false);
    window.location.hash = 'perfil';
    window.scrollTo(0, 0);
  };

  const saveSection = (sectionKey, payload) => {
    if (sectionKey === 'summary') {
      mergeProfileDetails({ summary: payload.summary });
      return;
    }

    if (sectionKey === 'languages') {
      mergeProfileDetails({ languages: payload.languages });
      return;
    }

    if (sectionKey === 'skills') {
      mergeProfileDetails({ skills: payload.skills });
      return;
    }

    if (sectionKey === 'contact') {
      mergeProfileDetails({
        phone: payload.phone,
        email: payload.email,
        website: payload.website,
        socials: payload.socials,
      });
      return;
    }

    if (sectionKey === 'experience') {
      if (Number.isInteger(payload.itemIndex)) {
        const activeId = getActiveProfileId();
        if (!activeId) return;

        setProfiles((currentProfiles) =>
          currentProfiles.map((profile) => {
            if (profile.id !== activeId) {
              return profile;
            }

            const currentItems = Array.isArray(profile.experiences) ? profile.experiences : [];

            return {
              ...profile,
              experiences: currentItems.map((item, index) => (index === payload.itemIndex ? payload.experience : item)),
            };
          })
        );
        return;
      }

      mergeProfileDetails({ experiences: payload.experiences });
      return;
    }

    if (sectionKey === 'education') {
      if (Number.isInteger(payload.itemIndex)) {
        const activeId = getActiveProfileId();
        if (!activeId) return;

        setProfiles((currentProfiles) =>
          currentProfiles.map((profile) => {
            if (profile.id !== activeId) {
              return profile;
            }

            const currentItems = Array.isArray(profile.educations) ? profile.educations : [];

            return {
              ...profile,
              educations: currentItems.map((item, index) => (index === payload.itemIndex ? payload.education : item)),
            };
          })
        );
        return;
      }

      mergeProfileDetails({ educations: payload.educations });
      return;
    }

    if (sectionKey === 'gallery') {
      mergeProfileDetails({ gallery: payload.gallery });
    }
  };

  const resetProfiles = () => {
    setProfiles([]);
  };

  return (
    <>
      <ProfileSearchOverlay
        isOpen={isOpen}
        query={query}
        onQueryChange={setQuery}
        profiles={profiles}
        onClose={() => setIsOpen(false)}
        onOpenProfile={openProfileFromSearch}
      />

      <ProfileSectionEditorModal
        isOpen={Boolean(activeSectionKey)}
        sectionKey={activeSectionKey}
        itemIndex={activeSectionItemIndex}
        profile={getActiveProfile() || {}}
        onClose={() => {
          setActiveSectionKey('');
          setActiveSectionItemIndex(null);
        }}
        onSave={saveSection}
        onReset={resetProfiles}
      />
    </>
  );
}

export default ConsultantSearchController;
