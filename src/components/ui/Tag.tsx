import type { ReactElement, ReactNode } from 'react';

type TagTone = 'neutral' | 'sage';

interface TagProps {
  children: ReactNode;
  /** `sage` for category labels, `neutral` for skill/stack chips. */
  tone?: TagTone;
}

const BASE_CLASSES =
  'inline-block rounded-sketch border px-2 py-0.5 font-sketch text-sm ' +
  'leading-[1.4] whitespace-nowrap pencil-edge';

const TONE_CLASSES: Record<TagTone, string> = {
  neutral: 'border-pencil-light text-pencil-dark',
  sage: 'border-accent-sage text-accent-sage',
};

/** Small sketch-style chip for categories, skills, and stack items. */
export function Tag({ children, tone = 'neutral' }: TagProps): ReactElement {
  return <span className={`${BASE_CLASSES} ${TONE_CLASSES[tone]}`}>{children}</span>;
}
