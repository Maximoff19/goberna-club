function buildPageWindow(currentPage: number, totalPages: number): number[] {
  const windowSize = 25;
  const groupIndex = Math.floor((currentPage - 1) / windowSize);
  const startPage = groupIndex * windowSize + 1;
  const endPage = Math.min(totalPages, startPage + windowSize - 1);

  return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
}

interface ExplorePaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onChange: (page: number) => void;
}

function ExplorePagination({ page, totalPages, totalItems, onChange }: ExplorePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = buildPageWindow(page, totalPages);

  return (
    <nav className="explore-pagination" aria-label="Paginacion del explorador">
      <span className="explore-pagination__summary">Pagina {page} de {totalPages} · {totalItems} perfiles</span>
      <div className="explore-pagination__controls">
        <button type="button" className="explore-pagination__button" disabled={page === 1} onClick={() => onChange(page - 1)}>
          Anterior
        </button>
        <div className="explore-pagination__pages">
          {visiblePages.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={`explore-pagination__button ${pageNumber === page ? 'explore-pagination__button--active' : ''}`.trim()}
              onClick={() => onChange(pageNumber)}
              aria-current={pageNumber === page ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          ))}
        </div>
        <button type="button" className="explore-pagination__button" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
          Siguiente
        </button>
      </div>
    </nav>
  );
}

export default ExplorePagination;
