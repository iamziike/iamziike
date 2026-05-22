import type { ReactElement } from 'react';

type StickPose = 'wave' | 'desk';

interface StickFigureProps {
  /** `wave` is a single greeting figure; `desk` is a developer-at-desk scene. */
  pose?: StickPose;
}

/** Hand-drawn stick figure illustration for the hero and empty states. */
export function StickFigure({ pose = 'wave' }: StickFigureProps): ReactElement {
  if (pose === 'desk') {
    return (
      <figure className="leading-[0]" role="img" aria-label="A developer typing at a desk">
        <svg
          className="pencil-edge"
          width="200"
          height="130"
          viewBox="0 0 200 130"
          fill="none"
          stroke="var(--color-pencil-dark)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Desk */}
          <line x1="20" y1="100" x2="180" y2="100" stroke="var(--color-pencil)" strokeWidth="1.5" />
          <line x1="40" y1="100" x2="40" y2="120" stroke="var(--color-pencil)" strokeWidth="1.2" />
          <line x1="160" y1="100" x2="160" y2="120" stroke="var(--color-pencil)" strokeWidth="1.2" />

          {/* Monitor */}
          <rect x="70" y="60" width="60" height="38" rx="2" stroke="var(--color-pencil)" strokeWidth="1.5" />
          <line x1="100" y1="98" x2="100" y2="100" stroke="var(--color-pencil)" strokeWidth="1.5" />
          <line x1="88" y1="100" x2="112" y2="100" stroke="var(--color-pencil)" strokeWidth="1.5" />
          <line x1="78" y1="72" x2="118" y2="72" stroke="var(--color-accent-sage)" strokeWidth="1" />
          <line x1="78" y1="78" x2="105" y2="78" stroke="var(--color-pencil-light)" strokeWidth="1" />
          <line x1="78" y1="84" x2="110" y2="84" stroke="var(--color-pencil-light)" strokeWidth="1" />

          {/* Seated figure */}
          <g className="origin-top animate-stick-type">
            <circle cx="52" cy="62" r="10" />
            <line x1="52" y1="72" x2="52" y2="90" />
            <line x1="52" y1="78" x2="68" y2="93" />
            <line x1="52" y1="78" x2="36" y2="88" />
            <line x1="52" y1="90" x2="40" y2="98" />
            <line x1="52" y1="90" x2="64" y2="98" />
          </g>

          {/* Chair back */}
          <line x1="30" y1="72" x2="30" y2="98" stroke="var(--color-pencil)" strokeWidth="1.2" />
          <line x1="30" y1="72" x2="50" y2="72" stroke="var(--color-pencil)" strokeWidth="1.2" />
        </svg>
      </figure>
    );
  }

  return (
    <figure className="leading-[0]" role="img" aria-label="A stick figure waving hello">
      <svg
        className="pencil-edge"
        width="80"
        height="130"
        viewBox="0 0 60 100"
        fill="none"
        stroke="var(--color-pencil-dark)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="30" cy="18" r="11" />
        {/* Face */}
        <circle cx="26" cy="16" r="1.5" fill="var(--color-pencil-dark)" stroke="none" />
        <circle cx="34" cy="16" r="1.5" fill="var(--color-pencil-dark)" stroke="none" />
        <path d="M25 22 C28 25, 32 25, 35 22" strokeWidth="1.5" />
        {/* Body */}
        <line x1="30" y1="29" x2="30" y2="65" />
        {/* Static arm */}
        <line x1="30" y1="40" x2="12" y2="55" />
        {/* Waving arm */}
        <g>
          <line x1="30" y1="40" x2="48" y2="25" />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 30 40; -35 30 40; 10 30 40; -35 30 40; 0 30 40"
            dur="1.4s"
            repeatCount="indefinite"
          />
        </g>
        {/* Legs */}
        <line x1="30" y1="65" x2="14" y2="90" />
        <line x1="30" y1="65" x2="46" y2="90" />
      </svg>
    </figure>
  );
}
