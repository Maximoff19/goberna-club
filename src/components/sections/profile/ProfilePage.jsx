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
import PROFILE_DIRECTORY from './profileDirectory';
import { addProfileSectionItem, openProfileSectionEditor, removeProfileSectionItem } from '../../../utils/profileSearchNavigation';
import './profilePage.css';

const PROFILE_STORAGE_KEY = 'goberna.profileDirectory';

function ProfilePage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(PROFILE_DIRECTORY[0]);

  useEffect(() => {
    const loadProfile = () => {
      try {
        const storedProfiles = window.localStorage.getItem(PROFILE_STORAGE_KEY);
        if (!storedProfiles) {
          setCurrentProfile(PROFILE_DIRECTORY[0]);
          return;
        }

        const parsedProfiles = JSON.parse(storedProfiles);
        if (!Array.isArray(parsedProfiles) || parsedProfiles.length === 0) {
          setCurrentProfile(PROFILE_DIRECTORY[0]);
          return;
        }

        setCurrentProfile(parsedProfiles.find((profile) => profile.id === 'pf-1') || parsedProfiles[0]);
      } catch {
        setCurrentProfile(PROFILE_DIRECTORY[0]);
      }
    };

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

    loadProfile();
    window.addEventListener('app:profile-data-updated', syncProfileFromController);
    window.addEventListener('app:profile-edit-mode-toggle', onEditModeToggle);

    return () => {
      window.removeEventListener('app:profile-data-updated', syncProfileFromController);
      window.removeEventListener('app:profile-edit-mode-toggle', onEditModeToggle);
    };
  }, []);

  return (
    <section className="profile-page" aria-labelledby="profile-name">
      <div className="profile-page__safe-area">
        <ProfileHero profile={currentProfile} isEditMode={isEditMode} />

        <div className="profile-page__layout">
          <aside className="profile-page__column profile-page__column--left">
            <ProfileIdentitySection />
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
            <ProfessionalSummarySection showEdit={isEditMode} onEdit={() => openProfileSectionEditor('summary')} summary={currentProfile.summary} />
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
