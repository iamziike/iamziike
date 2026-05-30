import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { DrawTool } from "../types";

interface UseCanvasDrawingOptions {
  tool: DrawTool;
  color: string;
  /** Whether pointer input should produce drawing right now. */
  active: boolean;
}

interface UseCanvasDrawingResult {
  /** Wraps the canvases; sized to the full page so artwork scrolls with it. */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Holds the committed artwork. */
  mainCanvasRef: RefObject<HTMLCanvasElement | null>;
  /** Holds the transient line/rectangle rubber-band preview. */
  previewCanvasRef: RefObject<HTMLCanvasElement | null>;
  clear: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface Point {
  x: number;
  y: number;
}

const BRUSH_WIDTH = 3;
const ERASER_SIZE = 20;
/** Per-channel tolerance when deciding which pixels a fill should flood. */
const FILL_TOLERANCE = 48;
const MAX_HISTORY = 50;

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

/** Stack-based flood fill of the contiguous region under (startX, startY). */
function floodFill(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  startX: number,
  startY: number,
  hex: string,
): void {
  const sx = Math.floor(startX);
  const sy = Math.floor(startY);
  if (sx < 0 || sy < 0 || sx >= width || sy >= height) return;

  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  const startOffset = (sy * width + sx) * 4;
  const targetR = data[startOffset];
  const targetG = data[startOffset + 1];
  const targetB = data[startOffset + 2];
  const targetA = data[startOffset + 3];

  const [fillR, fillG, fillB] = hexToRgb(hex);
  const fillA = 255;
  if (
    Math.abs(targetR - fillR) <= 1 &&
    Math.abs(targetG - fillG) <= 1 &&
    Math.abs(targetB - fillB) <= 1 &&
    Math.abs(targetA - fillA) <= 1
  ) {
    return;
  }

  const matches = (offset: number): boolean =>
    Math.abs(data[offset] - targetR) <= FILL_TOLERANCE &&
    Math.abs(data[offset + 1] - targetG) <= FILL_TOLERANCE &&
    Math.abs(data[offset + 2] - targetB) <= FILL_TOLERANCE &&
    Math.abs(data[offset + 3] - targetA) <= FILL_TOLERANCE;

  const seen = new Uint8Array(width * height);
  const stack: number[] = [sy * width + sx];

  while (stack.length > 0) {
    const pixel = stack.pop();
    if (pixel === undefined || seen[pixel] === 1) continue;
    seen[pixel] = 1;

    const offset = pixel * 4;
    if (!matches(offset)) continue;

    data[offset] = fillR;
    data[offset + 1] = fillG;
    data[offset + 2] = fillB;
    data[offset + 3] = fillA;

    const px = pixel % width;
    const py = (pixel - px) / width;
    if (px > 0) stack.push(pixel - 1);
    if (px < width - 1) stack.push(pixel + 1);
    if (py > 0) stack.push(pixel - width);
    if (py < height - 1) stack.push(pixel + width);
  }

  ctx.putImageData(image, 0, 0);
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
): void {
  const HEAD = 12;
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(
    to.x - HEAD * Math.cos(angle - Math.PI / 6),
    to.y - HEAD * Math.sin(angle - Math.PI / 6),
  );
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(
    to.x - HEAD * Math.cos(angle + Math.PI / 6),
    to.y - HEAD * Math.sin(angle + Math.PI / 6),
  );
  ctx.stroke();
}

/**
 * Wires pointer input on a pair of full-page canvases into freehand, line,
 * rectangle, and flood-fill drawing.
 */
export function useCanvasDrawing({
  tool,
  color,
  active,
}: UseCanvasDrawingOptions): UseCanvasDrawingResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // ── History ────────────────────────────────────────────────────────────────
  const historyRef = useRef<ImageData[]>([]);
  const historyIdxRef = useRef<number>(-1);
  // Bumped after every history mutation so React can re-render canUndo/canRedo.
  const [, setHistoryVersion] = useState(0);

  /** Snapshot the main canvas and push it onto the undo stack. */
  const pushHistory = useCallback((): void => {
    const main = mainCanvasRef.current;
    if (main === null || main.width === 0 || main.height === 0) return;
    const ctx = main.getContext("2d");
    if (ctx === null) return;
    // Truncate any redo tail.
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    historyRef.current.push(ctx.getImageData(0, 0, main.width, main.height));
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    } else {
      historyIdxRef.current++;
    }
    setHistoryVersion((v) => v + 1);
  }, []);

  const undo = useCallback((): void => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current--;
    const snapshot = historyRef.current[historyIdxRef.current];
    const main = mainCanvasRef.current;
    if (main === null || snapshot === undefined) return;
    const ctx = main.getContext("2d");
    if (ctx === null) return;
    ctx.clearRect(0, 0, main.width, main.height);
    ctx.putImageData(snapshot, 0, 0);
    setHistoryVersion((v) => v + 1);
  }, []);

  const redo = useCallback((): void => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current++;
    const snapshot = historyRef.current[historyIdxRef.current];
    const main = mainCanvasRef.current;
    if (main === null || snapshot === undefined) return;
    const ctx = main.getContext("2d");
    if (ctx === null) return;
    ctx.clearRect(0, 0, main.width, main.height);
    ctx.putImageData(snapshot, 0, 0);
    setHistoryVersion((v) => v + 1);
  }, []);

  // Derive reactive flags from the refs (valid after every historyVersion bump).
  const canUndo = historyIdxRef.current > 0;
  const canRedo = historyIdxRef.current < historyRef.current.length - 1;

  // Size both canvases to the full page (width × document scroll height) so
  // artwork scrolls with the document; preserve artwork across resizes.
  useEffect(() => {
    const main = mainCanvasRef.current;
    const preview = previewCanvasRef.current;
    const container = containerRef.current;
    if (main === null || preview === null || container === null) return;

    let lastWidth = 0;
    let lastHeight = 0;

    const resize = (): void => {
      // Collapse the overlay first so it cannot inflate the measured page size.
      container.style.height = "0px";
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.scrollHeight;

      if (width === lastWidth && height === lastHeight) {
        container.style.height = `${height}px`;
        return;
      }
      lastWidth = width;
      lastHeight = height;

      const snapshot = document.createElement("canvas");
      snapshot.width = main.width;
      snapshot.height = main.height;
      const snapshotCtx = snapshot.getContext("2d");
      if (snapshotCtx !== null && main.width > 0 && main.height > 0) {
        snapshotCtx.drawImage(main, 0, 0);
      }

      main.width = width;
      main.height = height;
      preview.width = width;
      preview.height = height;
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;

      const mainCtx = main.getContext("2d");
      if (mainCtx !== null && snapshot.width > 0 && snapshot.height > 0) {
        mainCtx.drawImage(snapshot, 0, 0);
      }

      // Canvas dimensions changed — clear history to avoid dimension mismatches
      // and record the current (restored) artwork as the new baseline.
      historyRef.current = [];
      historyIdxRef.current = -1;
      pushHistory();
    };

    resize();
    window.addEventListener("resize", resize);
    // Re-measure when the page's own height changes (fonts, reflow, ...).
    const observer = new ResizeObserver(() => resize());
    observer.observe(document.body);
    return () => {
      window.removeEventListener("resize", resize);
      observer.disconnect();
    };
  }, [pushHistory]);

  // Pointer-driven drawing. The listeners are re-bound whenever the tool,
  // colour, or active state changes, so a handler always acts on the current
  // selection — no stale tool.
  useEffect(() => {
    if (!active) return;
    const main = mainCanvasRef.current;
    const preview = previewCanvasRef.current;
    if (main === null || preview === null) return;
    const mainCtx = main.getContext("2d");
    const previewCtx = preview.getContext("2d");
    if (mainCtx === null || previewCtx === null) return;

    let isDrawing = false;
    let start: Point = { x: 0, y: 0 };
    let previous: Point = { x: 0, y: 0 };

    const toPoint = (event: PointerEvent): Point => {
      const rect = preview.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const applyBrush = (ctx: CanvasRenderingContext2D): void => {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = BRUSH_WIDTH;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    };

    const handleDown = (event: PointerEvent): void => {
      if (event.button !== 0) return;
      const point = toPoint(event);

      if (tool === "fill") {
        floodFill(mainCtx, main.width, main.height, point.x, point.y, color);
        pushHistory();
        return;
      }

      isDrawing = true;
      start = point;
      previous = point;
      preview.setPointerCapture(event.pointerId);

      if (tool === "pencil") {
        applyBrush(mainCtx);
        mainCtx.beginPath();
        mainCtx.arc(point.x, point.y, BRUSH_WIDTH / 2, 0, Math.PI * 2);
        mainCtx.fill();
      } else if (tool === "eraser") {
        mainCtx.save();
        mainCtx.globalCompositeOperation = "destination-out";
        mainCtx.beginPath();
        mainCtx.arc(point.x, point.y, ERASER_SIZE / 2, 0, Math.PI * 2);
        mainCtx.fill();
        mainCtx.restore();
      }
    };

    const handleMove = (event: PointerEvent): void => {
      if (!isDrawing) return;
      const point = toPoint(event);

      if (tool === "pencil") {
        applyBrush(mainCtx);
        mainCtx.beginPath();
        mainCtx.moveTo(previous.x, previous.y);
        mainCtx.lineTo(point.x, point.y);
        mainCtx.stroke();
        previous = point;
        return;
      }

      if (tool === "eraser") {
        mainCtx.save();
        mainCtx.globalCompositeOperation = "destination-out";
        mainCtx.beginPath();
        mainCtx.arc(point.x, point.y, ERASER_SIZE / 2, 0, Math.PI * 2);
        mainCtx.fill();
        mainCtx.restore();
        previous = point;
        return;
      }

      previewCtx.clearRect(0, 0, preview.width, preview.height);
      applyBrush(previewCtx);
      if (tool === "line") {
        previewCtx.beginPath();
        previewCtx.moveTo(start.x, start.y);
        previewCtx.lineTo(point.x, point.y);
        previewCtx.stroke();
      } else if (tool === "rectangle") {
        previewCtx.strokeRect(
          start.x,
          start.y,
          point.x - start.x,
          point.y - start.y,
        );
      } else if (tool === "circle") {
        const cx = (start.x + point.x) / 2;
        const cy = (start.y + point.y) / 2;
        const rx = Math.max(Math.abs(point.x - start.x) / 2, 0.5);
        const ry = Math.max(Math.abs(point.y - start.y) / 2, 0.5);
        previewCtx.beginPath();
        previewCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        previewCtx.stroke();
      } else if (tool === "arrow") {
        drawArrow(previewCtx, start, point);
      } else if (tool === "triangle") {
        const mx = (start.x + point.x) / 2;
        previewCtx.beginPath();
        previewCtx.moveTo(mx, start.y);
        previewCtx.lineTo(point.x, point.y);
        previewCtx.lineTo(start.x, point.y);
        previewCtx.closePath();
        previewCtx.stroke();
      }
    };

    const handleUp = (event: PointerEvent): void => {
      if (!isDrawing) return;
      isDrawing = false;
      const point = toPoint(event);

      if (
        tool === "line" ||
        tool === "rectangle" ||
        tool === "circle" ||
        tool === "arrow" ||
        tool === "triangle"
      ) {
        previewCtx.clearRect(0, 0, preview.width, preview.height);
        applyBrush(mainCtx);
        if (tool === "line") {
          mainCtx.beginPath();
          mainCtx.moveTo(start.x, start.y);
          mainCtx.lineTo(point.x, point.y);
          mainCtx.stroke();
        } else if (tool === "rectangle") {
          mainCtx.strokeRect(
            start.x,
            start.y,
            point.x - start.x,
            point.y - start.y,
          );
        } else if (tool === "circle") {
          const cx = (start.x + point.x) / 2;
          const cy = (start.y + point.y) / 2;
          const rx = Math.max(Math.abs(point.x - start.x) / 2, 0.5);
          const ry = Math.max(Math.abs(point.y - start.y) / 2, 0.5);
          mainCtx.beginPath();
          mainCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          mainCtx.stroke();
        } else if (tool === "arrow") {
          drawArrow(mainCtx, start, point);
        } else if (tool === "triangle") {
          const mx = (start.x + point.x) / 2;
          mainCtx.beginPath();
          mainCtx.moveTo(mx, start.y);
          mainCtx.lineTo(point.x, point.y);
          mainCtx.lineTo(start.x, point.y);
          mainCtx.closePath();
          mainCtx.stroke();
        }
      }

      if (preview.hasPointerCapture(event.pointerId)) {
        preview.releasePointerCapture(event.pointerId);
      }

      // Commit: push canvas state so this stroke is undoable.
      pushHistory();
    };

    preview.addEventListener("pointerdown", handleDown);
    preview.addEventListener("pointermove", handleMove);
    preview.addEventListener("pointerup", handleUp);
    preview.addEventListener("pointercancel", handleUp);
    return () => {
      preview.removeEventListener("pointerdown", handleDown);
      preview.removeEventListener("pointermove", handleMove);
      preview.removeEventListener("pointerup", handleUp);
      preview.removeEventListener("pointercancel", handleUp);
    };
  }, [tool, color, active, pushHistory]);

  const clear = useCallback((): void => {
    const main = mainCanvasRef.current;
    const preview = previewCanvasRef.current;
    if (main !== null) {
      const ctx = main.getContext("2d");
      if (ctx !== null) ctx.clearRect(0, 0, main.width, main.height);
    }
    if (preview !== null) {
      const ctx = preview.getContext("2d");
      if (ctx !== null) ctx.clearRect(0, 0, preview.width, preview.height);
    }
    pushHistory();
  }, [pushHistory]);

  return {
    containerRef,
    mainCanvasRef,
    previewCanvasRef,
    clear,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

