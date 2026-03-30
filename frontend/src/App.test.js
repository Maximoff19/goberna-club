import { render, screen } from '@testing-library/react';
import Hero from './domains/marketing/home/hero/Hero';

test('renders hero title', () => {
  render(<Hero />);
  const titleElement = screen.getByRole('heading', {
    name: /RED\s*INTERNACIONAL\s*DE\s*CONSULTORES/i,
  });
  expect(titleElement).toBeInTheDocument();
});
