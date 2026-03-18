function EducationItem({ item }) {
  return (
    <article className="profile-edu-item">
      <img className="profile-edu-item__logo" src={item.logoSrc} alt={item.institution} loading="lazy" decoding="async" />
      <div className="profile-edu-item__content">
        <h4>{item.institution}</h4>
        <p>{item.program}</p>
        <span>{item.period}</span>
      </div>
    </article>
  );
}

export default EducationItem;
