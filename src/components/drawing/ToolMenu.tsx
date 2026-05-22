import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import type { DrawTool } from '../../types';

interface ToolMenuProps {
  /** Cursor position the menu should open beside. */
  x: number;
  y: number;
  tool: DrawTool;
  color: string;
  drawingMode: boolean;
  onSelectTool: (tool: DrawTool) => void;
  onSelectColor: (color: string) => void;
  onClear: () => void;
  onStop: () => void;
  onClose: () => void;
}

interface ToolOption {
  id: DrawTool;
  label: string;
}

const TOOLS: readonly ToolOption[] = [
  { id: 'pencil', label: 'Pencil' },
  { id: 'line', label: 'Line' },
  { id: 'rectangle', label: 'Rect' },
  { id: 'fill', label: 'Fill' },
];

const COLORS: readonly string[] = [
  '#000000',
  '#c47b5a',
  '#7ba7bc',
  '#8ba888',
  '#c9a84c',
  '#f7f4ee',
];

/** Gap kept between the menu and the viewport edges. */
const MENU_MARGIN = 8;

/** Small line-art glyph for a tool button. */
function ToolGlyph({ tool }: { tool: DrawTool }): ReactElement {
  const shared = {
    width: 18,
    height: 18,
    viewBox: '0 0 18 18',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  if (tool === 'line') {
    return (
      <svg {...shared}>
        <line x1="3" y1="15" x2="15" y2="3" />
      </svg>
    );
  }
  if (tool === 'rectangle') {
    return (
      <svg {...shared}>
        <rect x="3.5" y="4.5" width="11" height="9" rx="1" />
      </svg>
    );
  }
  if (tool === 'fill') {
    return (
      <svg {...shared}>
        <path d="M5 3.5 13 3.5 12 14 6 14 Z" />
        <path d="M5 3.5 Q9 1 13 3.5" />
        <path d="M15.5 9 Q17 11 17 13.5" />
      </svg>
    );
  }
  return (
    <svg {...shared}>
      <path d="M3 15 3 12 11 4 14 7 6 15 Z" />
      <path d="M10 5 13 8" />
    </svg>
  );
}

/** Sketch-styled context menu for picking a drawing tool and colour. */
export function ToolMenu(props: ToolMenuProps): ReactElement {
  const { x, y, tool, color, drawingMode } = props;
  const { onSelectTool, onSelectColor, onClear, onStop, onClose } = props;

  const panelRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ left: number; top: number }>({
    left: x,
    top: y,
  });

  // Clamp the panel so it never spills off-screen.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (panel === null) return;
    const left = Math.max(
      MENU_MARGIN,
      Math.min(x, window.innerWidth - panel.offsetWidth - MENU_MARGIN),
    );
    const top = Math.max(
      MENU_MARGIN,
      Math.min(y, window.innerHeight - panel.offsetHeight - MENU_MARGIN),
    );
    setPosition({ left, top });
  }, [x, y]);

  return (
    <>
      <div className="fixed inset-0 z-[55]" onClick={onClose} />
      <div
        ref={panelRef}
        role="menu"
        aria-label="Drawing tools"
        className="fixed z-[56] w-[210px] rounded-loose border-[1.5px] border-pencil-light
          bg-paper-dark p-3 pencil-edge shadow-[3px_5px_0_var(--color-paper-shadow)]"
        style={{ left: position.left, top: position.top }}
      >
        <p className="mb-2 font-sketch text-xs tracking-[0.12em] text-pencil-light">
          Doodle
        </p>

        <div className="grid grid-cols-2 gap-1.5">
          {TOOLS.map((option) => {
            // A tool only reads as "selected" once drawing is actually on.
            const isActive = drawingMode && option.id === tool;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelectTool(option.id)}
                className={`flex items-center gap-1.5 rounded-sketch border px-2 py-1.5
                  font-sketch text-sm pencil-edge transition ${
                    isActive
                      ? 'border-accent-rust bg-paper text-accent-rust'
                      : 'border-pencil-light text-pencil-dark'
                  }`}
              >
                <ToolGlyph tool={option.id} />
                {option.label}
              </button>
            );
          })}
        </div>

        <p className="mt-3 mb-2 font-sketch text-xs tracking-[0.12em] text-pencil-light">
          Colour
        </p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={`Colour ${swatch}`}
              onClick={() => onSelectColor(swatch)}
              style={{ backgroundColor: swatch }}
              className={`h-6 w-6 rounded-full border-2 pencil-edge transition ${
                swatch === color ? 'border-accent-rust' : 'border-pencil-light'
              }`}
            />
          ))}
        </div>

        <div className="mt-3 flex gap-1.5">
          <button
            type="button"
            onClick={onClear}
            className="flex-1 rounded-sketch border border-pencil-light px-2 py-1.5
              font-sketch text-sm text-pencil-dark pencil-edge transition hover:bg-paper"
          >
            Clear
          </button>
          {drawingMode && (
            <button
              type="button"
              onClick={onStop}
              className="flex-1 rounded-sketch border border-accent-rust px-2 py-1.5
                font-sketch text-sm text-accent-rust pencil-edge transition
                hover:bg-accent-rust hover:text-paper"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </>
  );
}
