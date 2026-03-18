import './sectionTitle.css';

function SectionTitle({ text, color = '#FFC502', className = '', children, ...rest }) {
  return (
    <h2 className={`section-title ${className}`.trim()} style={{ '--section-title-color': color }} {...rest}>
      {children || text}
    </h2>
  );
}

export default SectionTitle;
