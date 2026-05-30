import type { ReactElement, ReactNode } from "react";

interface SketchTooltipProps {
  /** Tooltip copy shown on hover/focus. */
  label: string;
  /** Which side of the trigger the bubble sits on. */
  placement?: "top" | "bottom";
  /** Extra classes for the wrapper (e.g. layout sizing). */
  className?: string;
  /** The element the tooltip describes. */
  children: ReactNode;
}

/**
 * A sketch-styled tooltip: a pencil-edged paper bubble that fades in on hover or
 * keyboard focus. Wrap any trigger; the wrapper owns the `group` so the bubble
 * reacts to the trigger's state.
 */
export function SketchTooltip({
  label,
  placement = "top",
  className = "",
  children,
}: SketchTooltipProps): ReactElement {
  const placementClasses =
    placement === "top" ? "bottom-[calc(100%+0.5rem)]" : "top-[calc(100%+0.5rem)]";
  return (
    <span className={`group relative inline-flex ${className}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute ${placementClasses} left-1/2 z-60
          -translate-x-1/2 whitespace-nowrap
          rounded-sketch border border-pencil-light bg-paper px-2 py-1 font-sketch
          text-xs leading-none text-pencil-dark pencil-edge opacity-0
          shadow-[1px_2px_0_var(--color-paper-shadow)] transition-opacity
          duration-150 group-hover:opacity-100 group-focus-within:opacity-100`}
      >
        {label}
      </span>
    </span>
  );
}
