/** Shared domain types for the portfolio. */

/** A single project shown in the Work section. */
export interface Project {
  readonly id: string;
  readonly title: string;
  /** Short category label rendered as a tag, e.g. "Chrome Extension". */
  readonly tag: string;
  readonly description: string;
  readonly year: string;
  /** Outbound link to the live project, repo, or case study. */
  readonly url: string;
  readonly stack: readonly string[];
}

/** An external profile link (GitHub, LinkedIn, email, ...). */
export interface SocialLink {
  readonly label: string;
  readonly url: string;
}

/** The portfolio owner's identity and copy. */
export interface Profile {
  readonly name: string;
  readonly handle: string;
  readonly role: string;
  readonly tagline: string;
  /** Bio rendered as one paragraph per array entry. */
  readonly bio: readonly string[];
  readonly skills: readonly string[];
  readonly email: string;
}

/** An in-page navigation anchor. */
export interface NavLink {
  readonly label: string;
  /** Fragment target, e.g. "#work". */
  readonly href: string;
}

/** A drawing tool in the doodle layer. `pencil` is the default. */
export type DrawTool =
  | "cursor"
  | "pencil"
  | "eraser"
  | "line"
  | "arrow"
  | "rectangle"
  | "circle"
  | "triangle"
  | "fill";

