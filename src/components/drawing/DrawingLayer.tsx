import { useCallback, useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import type { DrawTool } from '../../types';
import { useCanvasDrawing } from '../../hooks/useCanvasDrawing';
import { ToolMenu } from './ToolMenu';

interface MenuPosition {
  x: number;
  y: number;
}

/** Pencil is the tool selected by default. */
const DEFAULT_TOOL: DrawTool = 'pencil';
const DEFAULT_COLOR = '#000000';

/**
 * A full-page doodle overlay. Right-click anywhere opens the tool menu beside
 * the cursor; choosing a tool turns drawing on and the whole viewport becomes a
 * canvas. While drawing is off the overlay never blocks the page underneath.
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
  const { mainCanvasRef, previewCanvasRef, clear } = useCanvasDrawing({
    tool,
    color,
    active,
  });

  // Right-click anywhere opens the tool menu instead of the native menu.
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent): void => {
      event.preventDefault();
      setMenu({ x: event.clientX, y: event.clientY });
      setMenuDiscovered(true);
    };
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Escape closes the menu, then exits drawing mode.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;
      if (menu !== null) {
        setMenu(null);
      } else if (drawingMode) {
        setDrawingMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menu, drawingMode]);

  const handleSelectTool = useCallback((next: DrawTool): void => {
    setTool(next);
    setDrawingMode(true);
    setMenu(null);
  }, []);

  const handleSelectColor = useCallback((next: string): void => {
    setColor(next);
  }, []);

  const handleClear = useCallback((): void => {
    clear();
    setMenu(null);
  }, [clear]);

  const handleStop = useCallback((): void => {
    setDrawingMode(false);
    setMenu(null);
  }, []);

  const handleCloseMenu = useCallback((): void => {
    setMenu(null);
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ pointerEvents: active ? 'auto' : 'none' }}
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
          onClear={handleClear}
          onStop={handleStop}
          onClose={handleCloseMenu}
        />
      )}
    </>
  );
}
