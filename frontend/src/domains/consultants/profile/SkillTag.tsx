interface SkillTagProps {
  label: string;
}

function SkillTag({ label }: SkillTagProps) {
  return <span className="profile-pill">{label}</span>;
}

export default SkillTag;
