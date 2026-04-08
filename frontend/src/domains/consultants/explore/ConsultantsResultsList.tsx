import ConsultantResultCard from './ConsultantResultCard';
import ExploreLoadingSkeleton from './ExploreLoadingSkeleton';

interface ConsultantItem {
  id: string;
  slug?: string;
  name: string;
  imageSrc?: string;
  specialization?: string;
  countryFlag?: string;
  countryLabel?: string;
  followers?: number;
  clicks?: number;
  skills?: string[] | string;
}

interface ConsultantsResultsListProps {
  consultants: ConsultantItem[];
  isLoading?: boolean;
}

function ConsultantsResultsList({ consultants, isLoading = false }: ConsultantsResultsListProps) {
  if (isLoading) {
    return <ExploreLoadingSkeleton cards={3} />;
  }

  if (consultants.length === 0) {
    return <p className="consultants-results__empty">No encontramos consultores con los filtros actuales.</p>;
  }

  return (
    <div className="consultants-results-list">
      {consultants.map((consultant) => (
        <ConsultantResultCard key={consultant.id} consultant={consultant} />
      ))}
    </div>
  );
}

export default ConsultantsResultsList;
