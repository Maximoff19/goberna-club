import PrimaryButton from '../../../../shared/ui/PrimaryButton';
import VerifiedIcon from '../../../../shared/ui/VerifiedIcon';
import GlareHover from '../../../../components/GlareHover.jsx';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  before: string;
  featured: boolean;
  paymentUrl: string;
  benefits: string[];
  requirements: string;
}

interface PriceParts {
  sign: string;
  amount: string;
  decimals: string;
}

interface PricingCardProps {
  plan: PricingPlan;
  onSelectPlan?: (plan: PricingPlan) => void;
}

function splitPrice(price: string): PriceParts {
  const match = /^\$(\d+)(\.\d+)?$/.exec(price);

  if (!match) {
    return { sign: '$', amount: price.replace('$', ''), decimals: '' };
  }

  return {
    sign: '$',
    amount: match[1],
    decimals: match[2] || '',
  };
}

function PricingCard({ plan, onSelectPlan }: PricingCardProps) {

  const handleClick = () => {
    if (onSelectPlan) {
      onSelectPlan(plan);
    }
  };
  const priceParts = splitPrice(plan.price);

  return (
    <article className={`pricing-card ${plan.featured ? 'pricing-card--featured' : ''}`}>
      <h3 className="pricing-card__name">{plan.name}</h3>

      <p className="pricing-card__price">
        <span className="pricing-card__price-sign">{priceParts.sign}</span>
        <span className="pricing-card__price-amount">{priceParts.amount}</span>
        <span className="pricing-card__price-decimals">{priceParts.decimals}</span>
      </p>
      <p className="pricing-card__period">Anual</p>
      <p className="pricing-card__before">
        Antes <span className="pricing-card__before-strike">{plan.before}</span>
      </p>

      <ul className="pricing-card__benefits">
        {plan.benefits.map((benefit) => (
          <li key={`${plan.id}-${benefit}`} className="pricing-card__benefit-item">
            <VerifiedIcon size={16} />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <p className="pricing-card__requirements">{plan.requirements}</p>

      <div className="pricing-card__action">
        {plan.featured ? (
          <GlareHover
            width="auto"
            height="auto"
            background="transparent"
            borderColor="transparent"
            borderRadius="999px"
            glareColor="#FFFFFF"
            glareOpacity={0.45}
            glareAngle={-30}
            glareSize={210}
            transitionDuration={900}
            alwaysActive
            className="pricing-card__button-glare"
          >
            <PrimaryButton className="pricing-card__button" onClick={handleClick}>PAGAR AHORA</PrimaryButton>
          </GlareHover>
        ) : (
          <PrimaryButton className="pricing-card__button" onClick={handleClick}>PAGAR AHORA</PrimaryButton>
        )}
      </div>
    </article>
  );
}

export default PricingCard;
