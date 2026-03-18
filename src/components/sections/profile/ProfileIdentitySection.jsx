import ProfileHeaderInfo from './ProfileHeaderInfo';

function ProfileIdentitySection({ profile }) {
  return (
    <section className="profile-identity" aria-labelledby="profile-name">
      <ProfileHeaderInfo variant="compact" profile={profile} />
    </section>
  );
}

export default ProfileIdentitySection;
