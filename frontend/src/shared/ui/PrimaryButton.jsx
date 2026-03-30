import './primaryButton.css';

function PrimaryButton({ children, className = '', type = 'button', ...props }) {
  return (
    <button type={type} className={`primary-button ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export default PrimaryButton;
