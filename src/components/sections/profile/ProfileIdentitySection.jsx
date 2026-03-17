import ProfileHeaderInfo from './ProfileHeaderInfo';

function ProfileIdentitySection() {
  return (
    <section className="profile-identity" aria-labelledby="profile-name">
      <ProfileHeaderInfo variant="compact" />
    </section>
  );
}

export default ProfileIdentitySection;
