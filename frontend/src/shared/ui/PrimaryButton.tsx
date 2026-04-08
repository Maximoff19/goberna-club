import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './primaryButton.css';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

function PrimaryButton({ children, className = '', type = 'button', ...props }: PrimaryButtonProps) {
  return (
    <button type={type} className={`primary-button ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export default PrimaryButton;
