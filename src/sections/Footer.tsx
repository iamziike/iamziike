import type { ReactElement } from 'react';
import { profile } from '../data/profile';

/** Page footer. */
export function Footer(): ReactElement {
  const year = new Date().getFullYear();

  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-pencil-light py-12">
      <p className="font-sketch text-sm text-pencil-light">Drawn with care · {year}</p>
      <p className="font-sketch text-lg font-bold text-pencil">{profile.handle}.</p>
    </footer>
  );
}
