import type { ReactElement } from 'react';
import { profile } from '../data/profile';
import { socials } from '../data/socials';
import { Button } from '../components/ui/Button';

/** Contact section — a closing call to action and profile links. */
export function Contact(): ReactElement {
  return (
    <section className="py-16 text-center" id="contact" aria-labelledby="contact-heading">
      <h2
        className="mb-3 font-sketch text-3xl font-bold text-pencil-dark"
        id="contact-heading"
      >
        Let's make something
      </h2>
      <p className="mx-auto mb-8 max-w-[440px] font-body text-lg leading-normal text-pencil-dark">
        Got a project, a question, or just want to say hi? My inbox is open.
      </p>

      <div className="mb-8">
        <Button href={`mailto:${profile.email}`} variant="cta">
          Say hello →
        </Button>
      </div>

      <ul className="flex justify-center gap-8">
        {socials.map((social) => (
          <li key={social.label}>
            <a
              className="font-sketch text-lg text-pencil-dark no-underline transition-colors
                duration-150 hover:text-accent-rust"
              href={social.url}
              target="_blank"
              rel="noreferrer"
            >
              {social.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
