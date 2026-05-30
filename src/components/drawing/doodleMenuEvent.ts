/**
 * A tiny typed event contract so anything on the page (e.g. the nav's "Doodle"
 * item) can ask the {@link DrawingLayer} to open its tool menu beside a point,
 * without prop-drilling state through the app root.
 */

/** Where the doodle tool menu should open. */
export interface DoodleMenuEventDetail {
  x: number;
  y: number;
}

export const DOODLE_MENU_EVENT = 'doodle:open-menu';

declare global {
  interface WindowEventMap {
    [DOODLE_MENU_EVENT]: CustomEvent<DoodleMenuEventDetail>;
  }
}

/** Ask the drawing layer to open its tool menu at the given viewport point. */
export function openDoodleMenu(x: number, y: number): void {
  window.dispatchEvent(
    new CustomEvent(DOODLE_MENU_EVENT, { detail: { x, y } }),
  );
}
