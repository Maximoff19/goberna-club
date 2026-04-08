import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface NavItem {
  label: string;
  selector: string;
}

interface BubbleStyle {
  width: number;
  x: number;
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Consultores', selector: '#popular-profiles' },
  { label: 'Nosotros', selector: '#nosotros' },
  { label: 'Precios', selector: '#precios' },
  { label: 'Contacto', selector: '#contacto' },
];
const ACTIVE_INDEX = 0;
const MOBILE_NAV_BREAKPOINT = 1120;

function HeroTopNav() {
  const [highlightedIndex, setHighlightedIndex] = useState(ACTIVE_INDEX);
  const [bubbleStyle, setBubbleStyle] = useState<BubbleStyle>({ width: 0, x: 0 });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const updateBubble = (index: number) => {
      const navNode = navRef.current;
      const itemNode = itemRefs.current[index];

      if (!navNode || !itemNode) {
        return;
      }

      setBubbleStyle({
        width: itemNode.offsetWidth,
        x: itemNode.offsetLeft,
      });
    };

    updateBubble(highlightedIndex);

    const onResize = () => updateBubble(highlightedIndex);
    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, [highlightedIndex]);

  useEffect(() => {
    const closeMenuOnDesktop = () => {
      if (window.innerWidth > MOBILE_NAV_BREAKPOINT) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', closeMenuOnDesktop);

    return () => window.removeEventListener('resize', closeMenuOnDesktop);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen || window.innerWidth > MOBILE_NAV_BREAKPOINT) {
      return undefined;
    }

    const scrollY = window.scrollY;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;
    const previousOverflow = document.body.style.overflow;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      document.body.style.overflow = previousOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [isMobileMenuOpen]);

  const mobileMenuPanel = (
    <div className="hero-top-nav__panel" role="dialog" aria-modal="true" aria-label="Menu de navegacion">
      {NAV_ITEMS.map((item, index) => (
        <button
          key={item.label}
          ref={(node) => {
            itemRefs.current[index] = node;
          }}
          type="button"
          className={`hero-top-nav__item ${index === highlightedIndex ? 'hero-top-nav__item--highlighted' : ''} ${index === ACTIVE_INDEX ? 'hero-top-nav__item--active' : ''}`}
          onMouseEnter={() => setHighlightedIndex(index)}
          onFocus={() => setHighlightedIndex(index)}
          onClick={() => {
            setHighlightedIndex(index);
            setIsMobileMenuOpen(false);
            window.dispatchEvent(new CustomEvent('app:smooth-scroll-to', { detail: { selector: item.selector } }));
          }}
        >
          {item.label}
        </button>
      ))}

      <div className="hero-top-nav__panel-header">
        <button
          type="button"
          className="hero-top-nav__close"
          aria-label="Cerrar menu de navegacion"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X size={22} aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  return (
    <nav
      ref={navRef}
      className={`hero-top-nav ${isMobileMenuOpen ? 'hero-top-nav--open' : ''}`}
      aria-label="Accesos institucionales"
      onMouseLeave={() => setHighlightedIndex(ACTIVE_INDEX)}
    >
      <button
        type="button"
        className="hero-top-nav__toggle"
        aria-expanded={isMobileMenuOpen}
        aria-label={isMobileMenuOpen ? 'Cerrar menu de navegacion' : 'Abrir menu de navegacion'}
        onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
      >
        {isMobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      <div className="hero-top-nav__panel hero-top-nav__panel--desktop">
        <span
          className="hero-top-nav__bubble"
          style={{ width: `${bubbleStyle.width}px`, transform: `translateX(${bubbleStyle.x}px)` }}
          aria-hidden="true"
        />

        {NAV_ITEMS.map((item, index) => (
          <button
            key={item.label}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            type="button"
            className={`hero-top-nav__item ${index === highlightedIndex ? 'hero-top-nav__item--highlighted' : ''} ${index === ACTIVE_INDEX ? 'hero-top-nav__item--active' : ''}`}
            onMouseEnter={() => setHighlightedIndex(index)}
            onFocus={() => setHighlightedIndex(index)}
            onClick={() => {
              setHighlightedIndex(index);
              setIsMobileMenuOpen(false);
              window.dispatchEvent(new CustomEvent('app:smooth-scroll-to', { detail: { selector: item.selector } }));
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isMobileMenuOpen && window.innerWidth <= MOBILE_NAV_BREAKPOINT && createPortal(mobileMenuPanel, document.body)}
    </nav>
  );
}

export default HeroTopNav;
