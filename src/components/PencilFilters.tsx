import type { ReactElement } from 'react';

/**
 * SVG filter definitions for the pencil design system.
 *
 * Rendered once near the app root. The `pencil-edge` Tailwind utility
 * references `#pencil-border` to give elements hand-drawn, wobbly edges.
 */
export function PencilFilters(): ReactElement {
  return (
    <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
      <defs>
        {/* Subtle pencil wobble — cards, buttons, tags. */}
        <filter id="pencil-border" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2.5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Stronger sketch outline — emphasis circles, highlights. */}
        <filter id="sketch-border" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="4" result="noise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="4"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
