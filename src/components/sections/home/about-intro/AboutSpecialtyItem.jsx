function AboutSpecialtyItem({ icon: Icon, text }) {
  return (
    <li className="about-intro__specialty-item">
      <Icon className="about-intro__specialty-icon" size={24} strokeWidth={2.1} aria-hidden="true" />
      <span className="about-intro__specialty-text">{text}</span>
    </li>
  );
}

export default AboutSpecialtyItem;
