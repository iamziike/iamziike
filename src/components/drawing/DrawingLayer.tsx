import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import type { DrawTool } from "../../types";
import { useCanvasDrawing } from "../../hooks/useCanvasDrawing";
import { ToolMenu } from "./ToolMenu";
import { DOODLE_MENU_EVENT } from "./doodleMenuEvent";

interface MenuPosition {
  x: number;
  y: number;
}

/** Cursor (no drawing) is the default state. */
const DEFAULT_TOOL: DrawTool = "cursor";
const DEFAULT_COLOR = "#000000";

/** The cursor shown over the canvas for each tool. */
const TOOL_CURSORS: Record<DrawTool, string> = {
  cursor: "url('/arrow-cursor.svg') 3 2, default",
  pencil: "url('/pencil-cursor.svg') 10 29, crosshair",
  eraser: "cell",
  line: "crosshair",
  arrow: "crosshair",
  rectangle: "crosshair",
  circle: "crosshair",
  triangle: "crosshair",
  fill: "url('/bucket-cursor.svg') 15 30, crosshair",
};

/**
 * A full-page doodle overlay. Right-click anywhere opens the tool menu to pick
 * a drawing tool, change colour, or return to the default cursor.
 */
export function DrawingLayer(): ReactElement {
  const [tool, setTool] = useState<DrawTool>(DEFAULT_TOOL);
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [drawingMode, setDrawingMode] = useState<boolean>(false);
  const [menu, setMenu] = useState<MenuPosition | null>(null);
  // Once the menu has been opened, the user knows about right-click — drop the hint.
  const [menuDiscovered, setMenuDiscovered] = useState<boolean>(false);

  // Input only draws while a tool is on and the menu is closed.
  const active = drawingMode && menu === null;
  const {
    containerRef,
    mainCanvasRef,
    previewCanvasRef,
    clear,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCanvasDrawing({
    tool,
    color,
    active,
  });

  // Restore normal OS cursors when not in drawing mode; pencil cursor otherwise.
  useEffect(() => {
    document.body.classList.toggle("cursor-default", !drawingMode);
    return () => {
      document.body.classList.remove("cursor-default");
    };
  }, [drawingMode]);

  // Right-click anywhere opens the tool menu instead of the native menu.
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent): void => {
      event.preventDefault();
      setMenu({ x: event.clientX, y: event.clientY });
      setMenuDiscovered(true);
    };
    window.addEventListener("contextmenu", handleContextMenu);
    return () => window.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  // The nav's "Doodle" item (or anything else) can open the menu via this event.
  useEffect(() => {
    const handleOpenMenu = (
      event: WindowEventMap[typeof DOODLE_MENU_EVENT],
    ): void => {
      setMenu({ x: event.detail.x, y: event.detail.y });
      setMenuDiscovered(true);
    };
    window.addEventListener(DOODLE_MENU_EVENT, handleOpenMenu);
    return () => window.removeEventListener(DOODLE_MENU_EVENT, handleOpenMenu);
  }, []);

  // Escape closes the menu, then exits drawing mode.
  // Ctrl+Z = undo, Ctrl+Y / Ctrl+Shift+Z = redo (always available if there is history).
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        if (menu !== null) {
          setMenu(null);
        } else if (drawingMode) {
          setDrawingMode(false);
        }
        return;
      }
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "z" && !event.shiftKey) {
          event.preventDefault();
          undo();
        } else if (event.key === "y" || (event.key === "z" && event.shiftKey)) {
          event.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menu, drawingMode, undo, redo]);

  const handleSelectTool = useCallback(
    (next: DrawTool): void => {
      if (next === "cursor" || (next === tool && drawingMode)) {
        setTool("cursor");
        setDrawingMode(false);
        setMenu(null);
        return;
      }
      setTool(next);
      setDrawingMode(true);
      setMenu(null);
    },
    [tool, drawingMode],
  );

  const handleUndo = useCallback((): void => {
    undo();
  }, [undo]);

  const handleRedo = useCallback((): void => {
    redo();
  }, [redo]);

  const handleSelectColor = useCallback((next: string): void => {
    setColor(next);
  }, []);

  const handleClear = useCallback((): void => {
    clear();
    setMenu(null);
  }, [clear]);

  const handleStop = useCallback((): void => {
    setTool("cursor");
    setDrawingMode(false);
    setMenu(null);
  }, []);

  const handleCloseMenu = useCallback((): void => {
    setMenu(null);
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="absolute top-0 left-0 z-40"
        style={{
          pointerEvents: active ? "auto" : "none",
          cursor: TOOL_CURSORS[tool],
        }}
        aria-hidden="true"
      >
        <canvas ref={mainCanvasRef} className="absolute inset-0" />
        <canvas ref={previewCanvasRef} className="absolute inset-0" />
      </div>

      {drawingMode && menu === null && (
        <button
          type="button"
          onClick={handleStop}
          title="Click to stop drawing"
          className="fixed right-6 bottom-6 z-50 rounded-sketch border-[1.5px]
            border-accent-rust bg-paper px-4 py-2 font-sketch text-sm whitespace-nowrap
            text-accent-rust pencil-edge shadow-[2px_3px_0_var(--color-paper-shadow)]"
        >
          ✎ Doodling · right-click for tools
        </button>
      )}

      {!drawingMode && menu === null && !menuDiscovered && (
        <p
          className="pointer-events-none fixed bottom-6 left-6 z-50 rounded-sketch
            border-[1.5px] border-pencil-light bg-paper px-4 py-2 font-sketch text-sm
            whitespace-nowrap text-pencil-dark pencil-edge animate-hint-pulse
            shadow-[2px_3px_0_var(--color-paper-shadow)]"
        >
          ✎ Right-click anywhere to doodle
        </p>
      )}

      {menu !== null && (
        <ToolMenu
          x={menu.x}
          y={menu.y}
          tool={tool}
          color={color}
          drawingMode={drawingMode}
          onSelectTool={handleSelectTool}
          onSelectColor={handleSelectColor}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onClear={handleClear}
          onStop={handleStop}
          onClose={handleCloseMenu}
        />
      )}
    </>
  );
}

