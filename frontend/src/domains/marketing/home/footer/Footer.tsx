import type { IconType } from 'react-icons';
import { useEffect, useRef } from 'react';
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import CountryBlock from './CountryBlock';
import PrimaryButton from '../../../../shared/ui/PrimaryButton';

import { openConsultantJourney } from '../../../../app/navigation/consultantJourney';
import './footer.css';

interface Country {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  web: string;
  address: string;
}

interface SocialLink {
  id: string;
  href: string;
  label: string;
  icon: IconType;
}

const COUNTRIES: readonly Country[] = [
  {
    id: 'us',
    code: 'us',
    name: 'Estados Unidos',
    phone: '(+1) 786 4141971',
    email: 'informes@goberna.us',
    web: 'goberna.us',
    address: '1900 N Bayshore Dr\nSuite 1A #136-2023\nMiami, Florida, 33132\nUnited States',
  },
  {
    id: 'mx',
    code: 'mx',
    name: 'Mexico',
    phone: '(+52) 156 1056 6612',
    email: 'mexico@grupogoberna.com',
    web: 'grupo goberna.com',
    address: 'Rio Tiber 100 col. Cuauhtemoc\nPiso 6 - Ciudad de Mexico',
  },
  {
    id: 'pe',
    code: 'pe',
    name: 'Peru',
    phone: '(+51) 961753189',
    email: 'informes@goberna.pe',
    web: 'grupogoberna.com',
    address: 'Jr. Cruz del Sur 140 Of. 1712\nSurco Edif. Time Surco |\nMarcan - Lima',
  },
  {
    id: 'ec',
    code: 'ec',
    name: 'Ecuador',
    phone: '(+593) 99 207 3457',
    email: 'infoecuador@goberna.pe',
    web: 'grupogoberna.com',
    address: 'Edificio The Point, Of. 2307,\nCiudad del Rio, Puerto Santa\nAna - Guayaquil',
  },
  {
    id: 'bo',
    code: 'bo',
    name: 'Bolivia',
    phone: '(+591) 78814740',
    email: 'mfernandez@grupogoberna.com',
    web: 'grupogoberna.com',
    address: 'Av. Beni Edificio Top Center,\nPiso 7 Of. 7C - Santa Cruz',
  },
  {
    id: 'br',
    code: 'br',
    name: 'Brasil',
    phone: '55 21 98126-9882',
    email: 'brasil@grupogoberna.com',
    web: 'grupogoberna.com',
    address: 'Praia de Botafogo, 360 - 520 c -\nBotafogo, Rio de Janeiro',
  },
];

const SOCIALS: readonly SocialLink[] = [
  { id: 'facebook', href: 'https://facebook.com', label: 'Facebook', icon: FaFacebookF },
  { id: 'instagram', href: 'https://instagram.com', label: 'Instagram', icon: FaInstagram },
  { id: 'tiktok', href: 'https://tiktok.com', label: 'TikTok', icon: FaTiktok },
  { id: 'x', href: 'https://x.com', label: 'X', icon: FaXTwitter },
  { id: 'whatsapp', href: 'https://wa.me', label: 'WhatsApp', icon: FaWhatsapp },
];

interface FooterProps {
  enableReveal?: boolean;
}

function Footer({ enableReveal = true }: FooterProps) {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footerNode = footerRef.current;
    if (!footerNode) {
      return undefined;
    }

    const isMobile = window.matchMedia('(max-width: 1120px)').matches || 'ontouchstart' in window;
    if (!enableReveal || window.matchMedia('(prefers-reduced-motion: reduce)').matches || isMobile) {
      footerNode.style.setProperty('--footer-reveal-progress', '1');
      return undefined;
    }

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
    let isActive = false;
    let rafId = 0;

    const updateRevealProgress = () => {
      const rect = footerNode.getBoundingClientRect();
      const start = window.innerHeight * 0.95;
      const end = window.innerHeight * 0.1;
      const range = Math.max(1, start - end);
      const progress = clamp((start - rect.top) / range, 0, 1);
      footerNode.style.setProperty('--footer-reveal-progress', progress.toFixed(3));
    };

    const scheduleUpdate = () => {
      if (!isActive || rafId) {
        return;
      }

      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateRevealProgress();
      });
    };

    const enableUpdates = () => {
      isActive = true;
      updateRevealProgress();
      window.addEventListener('scroll', scheduleUpdate, { passive: true });
      window.addEventListener('resize', scheduleUpdate);
    };

    const disableUpdates = () => {
      isActive = false;
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry) {
          return;
        }

        if (entry.isIntersecting) {
          enableUpdates();
          return;
        }

        disableUpdates();
      },
      {
        threshold: 0.01,
        rootMargin: '180px 0px',
      }
    );

    observer.observe(footerNode);

    return () => {
      observer.disconnect();
      disableUpdates();
    };
  }, [enableReveal]);

  return (
    <footer ref={footerRef} className={`footer-main ${enableReveal ? '' : 'footer-main--static'}`.trim()}>
      <div className="footer-main__safe-area">
        <section className="footer-main__top">
          <div className="footer-main__brand-column">
            <img
              className="footer-main__logo"
              src="/logoescuela.webp"
              alt="Goberna Escuela de Gobierno"
              loading="lazy"
              decoding="async"
            />

            <p className="footer-main__cta-text">Estudia en Goberna y lleva tu carrera politica al siguiente nivel.</p>

            <div className="footer-main__cta-row">
              <button type="button" className="footer-main__cta-ghost" onClick={() => { window.location.hash = '#explorar-consultores'; window.scrollTo(0, 0); }}>
                Buscar consultor
              </button>
              <PrimaryButton className="footer-main__cta-primary" onClick={openConsultantJourney}>Ser consultor</PrimaryButton>
            </div>
          </div>

          <div className="footer-main__countries" id="footer-title">
            {COUNTRIES.map((country) => (
              <CountryBlock key={country.id} country={country} />
            ))}
          </div>
        </section>

        <section className="footer-main__bottom">
          <p className="footer-main__background-word" aria-hidden="true">
            GOBERNA
          </p>

          <div className="footer-main__bottom-row">
            <p className="footer-main__legal-text">
              Pagado por "Grupo Goberna" - Todos los derechos reservados
              <br />
              Mexico | Peru | Ecuador | Bolivia | Colombia | Republica Dominicana | Chile | Panama | Costa Rica |
              Guatemala | Honduras | El Salvador | Uruguay
            </p>

            <div className="footer-main__right-block">
              <nav className="footer-main__legal-links" aria-label="Enlaces legales">
                <a href="/politica-de-privacidad">Politica de Privacidad</a>
                <a href="/terminos-y-condiciones">Terminos y condiciones</a>
              </nav>

              <nav className="footer-main__socials" aria-label="Redes sociales">
                {SOCIALS.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a key={social.id} href={social.href} aria-label={social.label} className="footer-main__social-link">
                      <Icon size={19} />
                    </a>
                  );
                })}
              </nav>
            </div>
          </div>
        </section>
      </div>
    </footer>
  );
}

export default Footer;
