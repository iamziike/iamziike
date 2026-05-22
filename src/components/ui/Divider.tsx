import type { ReactElement } from 'react';

/** Full-width hand-drawn wavy line, used to separate page sections. */
export function Divider(): ReactElement {
  return (
    <div className="w-full leading-[0]" aria-hidden="true">
      <svg
        width="100%"
        height="14"
        viewBox="0 0 900 14"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0 7 C75 4, 150 10, 225 7 C300 4, 375 10, 450 7 C525 4, 600 10, 675 7 C750 4, 825 10, 900 7"
          stroke="var(--color-pencil-light)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
