import { ChevronDown } from 'lucide-react';

function HeroScrollIndicator() {
  const handleScrollToProfiles = () => {
    window.dispatchEvent(
      new CustomEvent('app:smooth-scroll-to', {
        detail: {
          selector: '#popular-profiles',
        },
      })
    );
  };

  return (
    <button
      type="button"
      className="hero-scroll-indicator"
      aria-label="Ir a perfiles populares"
      onClick={handleScrollToProfiles}
    >
      <ChevronDown size={24} strokeWidth={2.5} />
    </button>
  );
}

export default HeroScrollIndicator;
