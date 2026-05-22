import type { AnchorHTMLAttributes, ReactElement, ReactNode } from 'react';

type ButtonVariant = 'default' | 'cta';

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** `cta` uses the rust accent; `default` uses neutral graphite. */
  variant?: ButtonVariant;
  children: ReactNode;
}

const BASE_CLASSES =
  'inline-block cursor-pointer rounded-sketch border-[1.5px] px-6 py-2 ' +
  'font-sketch text-lg font-semibold tracking-[0.02em] no-underline ' +
  'pencil-edge transition duration-150 ease-out hover:-rotate-[0.4deg]';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  default: 'border-pencil text-pencil-dark hover:bg-pencil-dark hover:text-paper',
  cta: 'border-accent-rust text-accent-rust hover:bg-accent-rust hover:text-paper',
};

/**
 * Sketch-style action button. Always renders as an anchor — every action in
 * this portfolio navigates somewhere (a section, a repo, a mailto link).
 */
export function Button({
  variant = 'default',
  children,
  className,
  ...anchorProps
}: ButtonProps): ReactElement {
  const classes = [BASE_CLASSES, VARIANT_CLASSES[variant], className]
    .filter((value): value is string => Boolean(value))
    .join(' ');

  return (
    <a className={classes} {...anchorProps}>
      {children}
    </a>
  );
}
