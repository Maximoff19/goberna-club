import { Search } from 'lucide-react';

interface ExploreSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

function ExploreSearchBar({ value, onChange }: ExploreSearchBarProps) {
  return (
    <search className="explore-searchbar">
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="explore-searchbar__input"
        placeholder="Busca a tu consultor ideal"
        autoComplete="off"
      />
      <Search size={18} color="#0F1923" aria-hidden="true" />
    </search>
  );
}

export default ExploreSearchBar;
