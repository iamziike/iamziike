import type { Project } from '../types';

/** Edit this file to add, remove, or reorder portfolio projects. */
export const projects: readonly Project[] = [
  {
    id: 'git-frames',
    title: 'Git Frames',
    tag: 'VS Code Extension',
    description:
      'A VS Code extension that breaks a messy pile of staged changes into clean, self-contained commits — letting you ship your work one logical frame at a time.',
    year: '2026',
    url: 'https://github.com/iamziike/git-frames',
    stack: ['TypeScript', 'VS Code API', 'Git'],
  },
  {
    id: 'code-flow-visualizer',
    title: 'Code Flow Visualizer',
    tag: 'Web App',
    description:
      'A React + TypeScript app for mapping software architecture as connected blocks — sketch how a system flows, then turn that diagram into code.',
    year: '2026',
    url: 'https://github.com/iamziike/code-flow-visualizer',
    stack: ['React', 'TypeScript'],
  },
  {
    id: 'pencil-portfolio',
    title: 'This Portfolio',
    tag: 'Web App',
    description:
      'The site you are looking at — a hand-drawn, sketchbook-style portfolio built on a pencil design system. Minimal content, expressive skin.',
    year: '2026',
    url: 'https://github.com/iamziike',
    stack: ['React', 'TypeScript', 'Vite'],
  },
] as const;
