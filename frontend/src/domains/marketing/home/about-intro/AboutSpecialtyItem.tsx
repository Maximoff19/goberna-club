import type { ComponentType } from 'react';

interface AboutSpecialtyItemProps {
  icon: ComponentType<{ className?: string; size?: number; strokeWidth?: number; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  text: string;
}

function AboutSpecialtyItem({ icon: Icon, text }: AboutSpecialtyItemProps) {
  return (
    <li className="about-intro__specialty-item">
      <Icon className="about-intro__specialty-icon" size={24} strokeWidth={2.1} aria-hidden="true" />
      <span className="about-intro__specialty-text">{text}</span>
    </li>
  );
}

export default AboutSpecialtyItem;
