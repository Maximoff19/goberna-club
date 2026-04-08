import './ShinyText.css';

interface ShinyTextProps {
  text: string;
  className?: string;
}

function ShinyText({ text, className = '' }: ShinyTextProps) {
  return <span className={`shiny-text ${className}`.trim()}>{text}</span>;
}

export default ShinyText;
