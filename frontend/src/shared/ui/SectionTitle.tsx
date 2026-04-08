import type { HTMLAttributes, ReactNode, CSSProperties } from 'react';
import './sectionTitle.css';

interface SectionTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  text?: string;
  color?: string;
  className?: string;
  children?: ReactNode;
}

function SectionTitle({ text, color = '#FFC502', className = '', children, ...rest }: SectionTitleProps) {
  return (
    <h2
      className={`section-title ${className}`.trim()}
      style={{ '--section-title-color': color } as CSSProperties}
      {...rest}
    >
      {children || text}
    </h2>
  );
}

export default SectionTitle;
