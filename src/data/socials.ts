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
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
] as const;
