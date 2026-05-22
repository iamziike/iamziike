import type { ReactElement } from 'react';
import type { Project } from '../../types';
import { Tag } from './Tag';
import { Button } from './Button';

interface ProjectCardProps {
  project: Project;
}

/** Sketchbook card presenting a single project. */
export function ProjectCard({ project }: ProjectCardProps): ReactElement {
  const { title, tag, description, year, url, stack } = project;

  return (
    <article
      className="flex flex-col gap-3 rounded-loose border-[1.5px] border-pencil-light
        bg-paper-dark p-8 pencil-edge transition duration-200 ease-out
        hover:-translate-y-[3px] hover:rotate-[0.3deg]
        hover:shadow-[3px_5px_0_var(--color-paper-shadow)]"
    >
      <header className="flex items-center justify-between">
        <Tag tone="sage">{tag}</Tag>
        <span className="font-sketch text-sm text-pencil-light">{year}</span>
      </header>

      <h3 className="font-sketch text-xl font-bold leading-tight text-pencil-dark">
        {title}
      </h3>
      <p className="font-body text-base leading-normal text-pencil">{description}</p>

      <ul className="flex flex-wrap gap-2">
        {stack.map((item) => (
          <li key={item}>
            <Tag>{item}</Tag>
          </li>
        ))}
      </ul>

      <footer className="mt-auto pt-3">
        <Button
          href={url}
          target="_blank"
          rel="noreferrer"
          aria-label={`View ${title}`}
        >
          View →
        </Button>
      </footer>
    </article>
  );
}
