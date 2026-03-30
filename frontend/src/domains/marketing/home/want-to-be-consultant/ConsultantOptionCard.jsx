function splitTitleInTwoLines(title) {
  const words = title.trim().split(/\s+/);

  if (words.length <= 1) {
    return [title];
  }

  const splitIndex = Math.ceil(words.length / 2);
  return [words.slice(0, splitIndex).join(' '), words.slice(splitIndex).join(' ')];
}

function ConsultantOptionCard({ option, index }) {
  const titleLines = splitTitleInTwoLines(option.title);

  return (
    <a className="want-consultant__option-card" href={option.href}>
      <div className="want-consultant__option-media-wrap">
        <img
          className={`want-consultant__option-media ${index === 0 ? 'want-consultant__option-media--trim' : ''}`}
          src={option.imageSrc}
          alt={option.title}
        />
      </div>

      <h3 className="want-consultant__option-title">
        {titleLines.map((line) => (
          <span key={`${option.id}-${line}`} className="want-consultant__option-title-line">
            {line}
          </span>
        ))}
      </h3>
    </a>
  );
}

export default ConsultantOptionCard;
