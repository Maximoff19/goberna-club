import ConsultantResultCard from './ConsultantResultCard';
import ExploreLoadingSkeleton from './ExploreLoadingSkeleton';

function ConsultantsResultsList({ consultants, isLoading = false }) {
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
