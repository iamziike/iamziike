import type { ReactElement } from 'react';
import { profile } from '../data/profile';
import { Button } from '../components/ui/Button';
import { StickFigure } from '../components/ui/StickFigure';

/** Landing hero — eyebrow, name, tagline, and primary actions. */
export function Hero(): ReactElement {
  return (
    <header
      className="grid grid-cols-[1fr_auto] items-center gap-12 pt-16 pb-12
        max-[720px]:grid-cols-1 max-[720px]:gap-6"
      id="top"
    >
      <div>
        <p className="mb-4 font-sketch text-sm tracking-[0.08em] text-pencil-dark">
          ✦ {profile.role}
        </p>
        <h1 className="mb-6 font-sketch text-4xl font-bold leading-[1.1] text-pencil-dark max-[720px]:text-3xl">
          Hi, I'm{' '}
          <span
            className="relative text-accent-rust
              before:absolute before:-left-1 before:-right-1 before:top-[60%]
              before:bottom-0.5 before:-z-10 before:rounded-sketch
              before:bg-accent-gold before:opacity-25 before:content-['']
              before:pencil-edge"
          >
            {profile.name}
          </span>
        </h1>
        <p className="mb-8 max-w-[460px] font-body text-lg leading-loose text-pencil-dark">
          {profile.tagline}
        </p>
        <div className="flex flex-wrap gap-4">
          <Button href="#work" variant="cta">
            See my work →
          </Button>
          <Button href="#contact">Get in touch</Button>
        </div>
      </div>

      <div className="justify-self-end max-[720px]:order-first max-[720px]:justify-self-start">
        <StickFigure pose="desk" />
      </div>
    </header>
  );
}
