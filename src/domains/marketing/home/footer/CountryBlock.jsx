import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import { CircleFlag } from 'react-circle-flags';

function CountryBlock({ country }) {
  return (
    <article className="footer-country">
      <header className="footer-country__header">
        <span className="footer-country__icon-slot footer-country__icon-slot--flag" aria-hidden="true">
          <CircleFlag countryCode={country.code} height={14} />
        </span>
        <h3 className="footer-country__name">{country.name}</h3>
      </header>

      <ul className="footer-country__list">
        <li className="footer-country__item">
          <Phone size={14} strokeWidth={2.2} aria-hidden="true" />
          <span>{country.phone}</span>
        </li>
        <li className="footer-country__item">
          <Mail size={14} strokeWidth={2.2} aria-hidden="true" />
          <span>{country.email}</span>
        </li>
        <li className="footer-country__item">
          <Globe size={14} strokeWidth={2.2} aria-hidden="true" />
          <span>{country.web}</span>
        </li>
        <li className="footer-country__item footer-country__item--address">
          <MapPin size={14} strokeWidth={2.2} aria-hidden="true" />
          <span>{country.address}</span>
        </li>
      </ul>
    </article>
  );
}

export default CountryBlock;
