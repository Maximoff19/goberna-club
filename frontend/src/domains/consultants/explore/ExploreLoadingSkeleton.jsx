function ExploreLoadingSkeleton({ cards = 3 }) {
  const skeletonKeys = Array.from({ length: cards }, (_, index) => `explore-loading-card-${cards}-${index + 1}`);

  return (
    <div className="explore-loading-skeleton" aria-hidden="true">
      {skeletonKeys.map((key) => (
        <div key={key} className="explore-loading-card">
          <div className="explore-loading-skeleton__avatar" />
          <div className="explore-loading-skeleton__body">
            <div className="explore-loading-skeleton__line explore-loading-skeleton__line--title" />
            <div className="explore-loading-skeleton__line explore-loading-skeleton__line--text" />
            <div className="explore-loading-skeleton__line explore-loading-skeleton__line--text-short" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ExploreLoadingSkeleton;
