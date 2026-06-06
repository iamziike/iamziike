import type { ReactElement, MouseEvent } from "react";
import { profile } from "../data/profile";
import { navLinks } from "../data/socials";
import { openDoodleMenu } from "../components/drawing/doodleMenuEvent";
import { SketchTooltip } from "../components/ui/SketchTooltip";

/** Tooltip shown beside the doodle action. */
const DOODLE_TITLE =
  "Click here (or right-click anywhere) — the whole page is your blackboard";

/** Sketchy top navigation bar. */
export function Nav(): ReactElement {
  const handleDoodle = (event: MouseEvent<HTMLButtonElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    openDoodleMenu(rect.left, rect.bottom + 8);
  };

  return (
    <nav
      className="flex items-center justify-between gap-6 border-b border-pencil-light
        py-6 font-sketch max-[540px]:flex-col max-[540px]:gap-3"
      aria-label="Primary"
    >
      <a
        className="text-2xl font-bold tracking-[-0.02em] text-pencil-dark no-underline"
        href="#top"
      >
        {profile.handle}.
      </a>
      <ul className="flex gap-8 max-[540px]:gap-6">
        {navLinks.map((link) => (
          <li key={link.href}>
            <SketchTooltip label={link.title} placement="bottom">
              <a
                className="relative text-lg text-pencil-dark no-underline
                  after:absolute after:-bottom-1 after:left-0 after:h-[1.5px] after:w-0
                  after:rounded-[1px] after:bg-accent-rust after:transition-[width]
                  after:duration-200 after:content-[''] after:pencil-edge
                  hover:after:w-full"
                href={link.href}
              >
                {link.label}
              </a>
            </SketchTooltip>
          </li>
        ))}
        <li>
          <SketchTooltip label={DOODLE_TITLE} placement="bottom">
            <button
              type="button"
              onClick={handleDoodle}
              aria-label="Open the doodle tools"
              className="relative cursor-pointer border-0 bg-transparent p-0 font-sketch
                text-lg text-accent-rust no-underline
                after:absolute after:-bottom-1 after:left-0 after:h-[1.5px] after:w-0
                after:rounded-[1px] after:bg-accent-rust after:transition-[width]
                after:duration-200 after:content-[''] after:pencil-edge
                hover:after:w-full"
            >
              ✎ Doodle
            </button>
          </SketchTooltip>
        </li>
      </ul>
    </nav>
  );
}
