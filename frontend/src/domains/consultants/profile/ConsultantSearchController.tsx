import { useEffect, useState } from 'react';
import ProfileSearchOverlay from './ProfileSearchOverlay';
import { fetchConsultants } from '../../../shared/api/gobernaApi';

interface ProfileSearchData {
  id: string;
  name: string;
  imageSrc?: string;
  specialization?: string;
  slug?: string;
}

function ConsultantSearchController() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [profiles, setProfiles] = useState<ProfileSearchData[]>([]);

  useEffect(() => {
    let ignore = false;

    fetchConsultants()
      .then((items: ProfileSearchData[]) => {
        if (!ignore) {
          setProfiles(items);
        }
      })
      .catch(() => {
        if (!ignore) {
          setProfiles([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const openOverlay = () => {
      setQuery('');
      setIsOpen(true);
    };

    window.addEventListener('app:open-profile-search', openOverlay);

    return () => {
      window.removeEventListener('app:open-profile-search', openOverlay);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
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

  const openProfileFromSearch = (profile: ProfileSearchData) => {
    setIsOpen(false);
    window.location.hash = profile?.slug ? `#perfil/${profile.slug}` : '#explorar-consultores';
    window.scrollTo(0, 0);
  };

  return (
    <ProfileSearchOverlay
      isOpen={isOpen}
      query={query}
      onQueryChange={setQuery}
      profiles={profiles}
      onClose={() => setIsOpen(false)}
      onOpenProfile={openProfileFromSearch}
    />
  );
}

export default ConsultantSearchController;
