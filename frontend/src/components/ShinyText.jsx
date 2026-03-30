import './ShinyText.css';

function ShinyText({ text, className = '' }) {
  return <span className={`shiny-text ${className}`.trim()}>{text}</span>;
}

export default ShinyText;
