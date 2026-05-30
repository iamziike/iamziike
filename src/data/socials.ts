import type { NavLink, SocialLink } from '../types';
import { profile } from './profile';

/** External profile links shown in the Contact section and footer. */
export const socials: readonly SocialLink[] = [
  { label: 'GitHub', url: 'https://github.com/iamziike' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/iamziike' },
  { label: 'Email', url: `mailto:${profile.email}` },
] as const;

/** In-page navigation links for the top bar. */
export const navLinks: readonly NavLink[] = [
  {
    label: 'Work',
    href: '#work',
    title: 'The things I shipped — and the ghosts I left half-built',
  },
  {
    label: 'About',
    href: '#about',
    title: 'Who I am, who I pretend to be, and who I might become',
  },
  {
    label: 'Contact',
    href: '#contact',
    title: 'Whisper into the void — I echo back, eventually',
  },
] as const;
