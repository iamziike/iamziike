import type { ReactElement } from 'react';
import { profile } from '../data/profile';
import { navLinks } from '../data/socials';

/** Sketchy top navigation bar. */
export function Nav(): ReactElement {
  return (
    <nav
      className="flex items-center justify-between gap-6 border-b border-pencil-light
        py-6 font-sketch max-[540px]:flex-col max-[540px]:gap-3"
      aria-label="Primary"
    >
      <a
        className="text-2xl font-bold tracking-[-0.02em] text-pencil-dark no-underline"
        href="#top"
      >
        {profile.handle}.
      </a>
      <ul className="flex gap-8 max-[540px]:gap-6">
        {navLinks.map((link) => (
          <li key={link.href}>
            <a
              className="relative text-lg text-pencil-dark no-underline
                after:absolute after:-bottom-1 after:left-0 after:h-[1.5px] after:w-0
                after:rounded-[1px] after:bg-accent-rust after:transition-[width]
                after:duration-200 after:content-[''] after:pencil-edge
                hover:after:w-full"
              href={link.href}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
