import { BadgeCheck, Check } from 'lucide-react';
import './verifiedIcon.css';

interface VerifiedIconProps {
  size?: number;
}

function VerifiedIcon({ size = 16 }: VerifiedIconProps) {
  return (
    <span className="verified-icon" aria-hidden="true" style={{ width: `${size}px`, height: `${size}px` }}>
      <BadgeCheck size={size} color="#FFC502" fill="#FFC502" strokeWidth={1.8} />
      <Check size={Math.max(8, Math.round(size * 0.62))} color="#FFFFFF" strokeWidth={3} />
    </span>
  );
}

export default VerifiedIcon;
