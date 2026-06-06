import { useLayoutEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import type { DrawTool } from "../../types";
import { ColorPicker } from "./ColorPicker";

interface ToolMenuProps {
  /** Cursor position the menu should open beside. */
  x: number;
  y: number;
  tool: DrawTool;
  color: string;
  drawingMode: boolean;
  onSelectTool: (tool: DrawTool) => void;
  onSelectColor: (color: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClear: () => void;
  onStop: () => void;
  onClose: () => void;
}

interface ToolOption {
  id: DrawTool;
  label: string;
}

const TOOLS: readonly ToolOption[] = [
  { id: "cursor", label: "Cursor" },
  { id: "pencil", label: "Pencil" },
  { id: "eraser", label: "Eraser" },
  { id: "line", label: "Line" },
  { id: "arrow", label: "Arrow" },
  { id: "fill", label: "Fill" },
  { id: "rectangle", label: "Rect" },
  { id: "circle", label: "Circle" },
  { id: "triangle", label: "Triangle" },
];

/** Gap kept between the menu and the viewport edges. */
const MENU_MARGIN = 8;

/** Small line-art glyph for a tool button. */
function ToolGlyph({ tool }: { tool: DrawTool }): ReactElement {
  const shared = {
    width: 18,
    height: 18,
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (tool === "cursor") {
    // Hand-drawn arrow cursor: wobbly bezier outline + a pencil over-stroke at the tip
    return (
      <svg {...shared}>
        <path d="M3 2 Q2.5 7.5 3.5 13.5 Q5 11.5 7 10.5 Q8.5 13.5 9.5 15.5 Q10.5 15 10.5 14 Q9 11 8 9.5 Q11 7 13.5 5.5 Q8.5 3 3 2 Z" />
        <path d="M3 2 Q4 3.2 5.5 5.5" strokeWidth="1" />
      </svg>
    );
  }
  if (tool === "eraser") {
    return (
      <svg {...shared}>
        <rect x="3" y="10" width="12" height="5" rx="0.5" />
        <path d="M5 10 L8 5 L13 10" />
      </svg>
    );
  }
  if (tool === "line") {
    return (
      <svg {...shared}>
        <line x1="3" y1="15" x2="15" y2="3" />
      </svg>
    );
  }
  if (tool === "arrow") {
    return (
      <svg {...shared}>
        <line x1="4" y1="14" x2="14" y2="4" />
        <path d="M14 4 L14 8 M14 4 L10 4" />
      </svg>
    );
  }
  if (tool === "rectangle") {
    return (
      <svg {...shared}>
        <rect x="3.5" y="4.5" width="11" height="9" rx="1" />
      </svg>
    );
  }
  if (tool === "circle") {
    return (
      <svg {...shared}>
        <ellipse cx="9" cy="9" rx="6" ry="5" />
      </svg>
    );
  }
  if (tool === "triangle") {
    return (
      <svg {...shared}>
        <path d="M9 3 L15 15 L3 15 Z" />
      </svg>
    );
  }
  if (tool === "fill") {
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
  const {
    onSelectTool,
    onSelectColor,
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    onClear,
    onStop,
    onClose,
  } = props;

  const panelRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ left: number; top: number }>({
    left: x,
    top: y,
  });
  const [hoveredTool, setHoveredTool] = useState<string>("");

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
        className="fixed z-[56] w-[280px] rounded-loose border-[1.5px] border-pencil-light
          bg-paper-dark p-3 pencil-edge shadow-[3px_5px_0_var(--color-paper-shadow)]"
        style={{ left: position.left, top: position.top }}
      >
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <p className="font-sketch text-sm tracking-[0.12em] text-pencil-dark">
            Doodle
          </p>
          <p
            className="font-sketch text-xs text-pencil-dark transition-opacity duration-150"
            style={{ opacity: hoveredTool ? 1 : 0 }}
          >
            {hoveredTool || "\u00a0"}
          </p>
        </div>

        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-px">
          {TOOLS.map((option) => {
            const isActive = option.id === tool;
            return (
              <div key={option.id} className="shrink-0">
                <button
                  type="button"
                  autoFocus={isActive}
                  onClick={() => onSelectTool(option.id)}
                  onMouseEnter={() => setHoveredTool(option.label)}
                  onMouseLeave={() => setHoveredTool("")}
                  className={`flex h-8 w-8 items-center justify-center rounded-sketch border
                    pencil-edge transition-[transform,border-color,background-color]
                    duration-150 hover:scale-110 hover:-rotate-1 active:scale-95 ${
                      isActive
                        ? "border-accent-rust bg-accent-rust text-paper"
                        : "border-pencil-light text-pencil-dark hover:border-pencil"
                    }`}
                >
                  <ToolGlyph tool={option.id} />
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-3 mb-2 font-sketch text-sm tracking-[0.12em] text-pencil-light">
          Colour
        </p>
        <ColorPicker color={color} onChange={onSelectColor} />

        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center justify-center gap-1 rounded-sketch border
              border-pencil-light px-2 py-1.5 font-sketch text-sm text-pencil-dark
              pencil-edge transition hover:bg-paper
              disabled:cursor-not-allowed disabled:opacity-35"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 7 Q2 3 7 3 Q11 3 11 7 Q11 11 7 11" />
              <path d="M2 4 L2 7 L5 7" />
            </svg>
            Undo
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="flex items-center justify-center gap-1 rounded-sketch border
              border-pencil-light px-2 py-1.5 font-sketch text-sm text-pencil-dark
              pencil-edge transition hover:bg-paper
              disabled:cursor-not-allowed disabled:opacity-35"
          >
            Redo
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 7 Q12 3 7 3 Q3 3 3 7 Q3 11 7 11" />
              <path d="M12 4 L12 7 L9 7" />
            </svg>
          </button>
        </div>

        <div className="mt-2 flex gap-1.5">
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
