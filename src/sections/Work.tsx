import type { ReactElement } from 'react';
import { projects } from '../data/projects';
import { ProjectCard } from '../components/ui/ProjectCard';

/** Work section — a grid of project cards. */
export function Work(): ReactElement {
  return (
    <section className="py-16" id="work" aria-labelledby="work-heading">
      <h2
        className="mb-2 font-sketch text-3xl font-bold text-pencil-dark"
        id="work-heading"
      >
        Selected work
      </h2>
      <p className="mb-8 font-body text-base text-pencil-dark">
        A few things I've built recently.
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
