import ShinyText from '../../../../components/ShinyText.jsx';
import VerifiedIcon from '../../../../shared/ui/VerifiedIcon';

interface BenefitCardData {
  id: string;
  imageSrc: string;
  alt: string;
  text: string;
  featured: boolean;
}

interface BenefitCardProps {
  card: BenefitCardData;
}

function BenefitCard({ card }: BenefitCardProps) {
  const textLineOne = 'Creacion de un perfil profesional';
  const cardVariantClass = card.id ? `benefits__card--${card.id}` : '';

  return (
    <article className={`benefits__card ${card.featured ? 'benefits__card--featured' : ''} ${cardVariantClass}`.trim()}>
      <div className="benefits__media-wrap">
        <img className="benefits__media" src={card.imageSrc} alt={card.alt} loading="lazy" decoding="async" />
      </div>

      <p className={`benefits__card-text ${card.featured ? 'benefits__card-text--featured' : ''}`}>
        {card.featured ? (
          <span className="benefits__featured-text-wrap">
            <span className="benefits__featured-line">{textLineOne}</span>
            <span className="benefits__featured-verified-wrap">
              <ShinyText text="verificado" className="benefits__shiny-word" />
              <VerifiedIcon size={18} />
            </span>
          </span>
        ) : (
          card.text
        )}
      </p>
    </article>
  );
}

export default BenefitCard;
