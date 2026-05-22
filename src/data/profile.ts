import type { Profile } from '../types';

/** Edit this file to update the portfolio's identity and copy. */
export const profile: Profile = {
  name: 'Ziike',
  handle: 'iamziike',
  role: 'Developer & Builder',
  tagline:
    'I build things for the web — with care, craft, and a few too many tabs open.',
  bio: [
    "I'm a developer who likes interfaces that feel considered: small, sturdy, and a little bit human. I care about the seams — the empty states, the error copy, the way a thing feels when you actually use it.",
    "When I'm not writing code you'll find me sketching, tinkering with side projects, or overengineering my note-taking system. Currently open to interesting work.",
  ],
  skills: ['TypeScript', 'React', 'Node.js', 'Vite', 'CSS', 'UI Design'],
  email: 'domchuks75@gmail.com',
} as const;
