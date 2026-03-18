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
import { addProfileSectionItem, openProfileSectionEditor, removeProfileSectionItem } from '../../../app/navigation/profileSearchNavigation';
import './profilePage.css';

const PROFILE_STORAGE_KEY = 'goberna.profileDirectory';

function ProfilePage({ initialProfile }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = () => {
      try {
        const lastCreatedId = localStorage.getItem('goberna.lastCreatedProfileId');
        const storedProfiles = window.localStorage.getItem(PROFILE_STORAGE_KEY);
        
        if (storedProfiles) {
          const parsedProfiles = JSON.parse(storedProfiles);
          if (Array.isArray(parsedProfiles) && parsedProfiles.length > 0) {
            // Prioridad: perfil por lastCreatedId > último perfil creado
            let profileToLoad;
            if (lastCreatedId) {
              profileToLoad = parsedProfiles.find(p => p.id === lastCreatedId);
            }
            if (!profileToLoad) {
              profileToLoad = parsedProfiles[parsedProfiles.length - 1];
            }
            setCurrentProfile(profileToLoad);
            setIsLoading(false);
            return;
          }
        }
        
        // Si no hay perfiles guardados, usar initialProfile o null
        setCurrentProfile(initialProfile || null);
        setIsLoading(false);
      } catch (e) {
        console.error('Error loading profile:', e);
        setCurrentProfile(initialProfile || null);
        setIsLoading(false);
      }
    };
    
    loadProfile();

    const syncProfileFromController = (event) => {
      const nextProfile = event.detail?.profile;
      if (nextProfile) {
        setCurrentProfile(nextProfile);
        return;
      }
      loadProfile();
    };

    const onEditModeToggle = () => {
      setIsEditMode((current) => {
        const nextValue = !current;
        window.dispatchEvent(new CustomEvent('app:profile-edit-mode-changed', { detail: { isEditMode: nextValue } }));
        return nextValue;
      });
    };

    window.addEventListener('app:profile-data-updated', syncProfileFromController);
    window.addEventListener('app:profile-edit-mode-toggle', onEditModeToggle);

    return () => {
      window.removeEventListener('app:profile-data-updated', syncProfileFromController);
      window.removeEventListener('app:profile-edit-mode-toggle', onEditModeToggle);
    };
  }, [initialProfile]);

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
            <h2>No has creado tu perfil todavía</h2>
            <p>Crea tu perfil para comenzar a mostrar tu información.</p>
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
        <ProfileHero profile={currentProfile} isEditMode={isEditMode} />

        <div className="profile-page__layout">
          <aside className="profile-page__column profile-page__column--left">
            <ProfileIdentitySection profile={currentProfile} />
            <LanguagesSection showEdit={isEditMode} onEdit={() => openProfileSectionEditor('languages')} languages={currentProfile.languages} />
            <EducationSection
              showEdit={isEditMode}
              onAddItem={() => addProfileSectionItem('education')}
              onEditItem={(itemIndex) => openProfileSectionEditor('education', itemIndex)}
              onRemoveItem={(itemIndex) => removeProfileSectionItem('education', itemIndex)}
              educations={currentProfile.educations}
            />
            <MedalsSection medals={currentProfile.medals} />
          </aside>

          <div className="profile-page__column profile-page__column--center">
            <ProfessionalSummarySection showEdit={isEditMode} onEdit={() => openProfileSectionEditor('summary')} profile={currentProfile} />
            <ExperienceSection
              showEdit={isEditMode}
              onAddItem={() => addProfileSectionItem('experience')}
              onEditItem={(itemIndex) => openProfileSectionEditor('experience', itemIndex)}
              onRemoveItem={(itemIndex) => removeProfileSectionItem('experience', itemIndex)}
              experiences={currentProfile.experiences}
            />
            <CertificatesSection />
            <GallerySection showEdit={isEditMode} gallery={currentProfile.gallery} />
          </div>

          <aside className="profile-page__column profile-page__column--right">
            <SkillsSection showEdit={isEditMode} onEdit={() => openProfileSectionEditor('skills')} skills={currentProfile.skills} />
            <ContactSection showEdit={isEditMode} onEdit={() => openProfileSectionEditor('contact')} profile={currentProfile} />
          </aside>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
