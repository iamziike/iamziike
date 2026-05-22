import type { ReactElement } from 'react';
import { profile } from '../data/profile';
import { Tag } from '../components/ui/Tag';

/** About section — short bio and a column of skill tags. */
export function About(): ReactElement {
  return (
    <section className="py-16" id="about" aria-labelledby="about-heading">
      <h2
        className="mb-8 font-sketch text-3xl font-bold text-pencil-dark"
        id="about-heading"
      >
        About me
      </h2>

      <div className="grid grid-cols-[1fr_auto] items-start gap-12 max-[640px]:grid-cols-1 max-[640px]:gap-8">
        <div className="flex flex-col gap-4">
          {profile.bio.map((paragraph) => (
            <p
              key={paragraph.slice(0, 24)}
              className="font-body text-base leading-loose text-pencil"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex flex-col items-start gap-2 max-[640px]:flex-row max-[640px]:flex-wrap max-[640px]:items-center">
          <span className="mb-1 font-sketch text-sm tracking-[0.08em] text-pencil-light">
            Toolbox
          </span>
          {profile.skills.map((skill) => (
            <Tag key={skill}>{skill}</Tag>
          ))}
        </div>
      </div>
    </section>
  );
}
