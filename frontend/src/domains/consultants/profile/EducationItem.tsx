interface EducationItemData {
  institution: string;
  program: string;
  period: string;
}

interface EducationItemProps {
  item: EducationItemData;
}

function EducationItem({ item }: EducationItemProps) {
  return (
    <article className="profile-edu-item">
      <span className="profile-edu-item__accent" aria-hidden="true" />
      <div className="profile-edu-item__content">
        <h4>{item.institution}</h4>
        <p>{item.program}</p>
        <span>{item.period}</span>
      </div>
    </article>
  );
}

export default EducationItem;
