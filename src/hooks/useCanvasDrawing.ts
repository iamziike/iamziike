import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { DrawTool } from '../types';

interface UseCanvasDrawingOptions {
  tool: DrawTool;
  color: string;
  /** Whether pointer input should produce drawing right now. */
  active: boolean;
}

interface UseCanvasDrawingResult {
  /** Holds the committed artwork. */
  mainCanvasRef: RefObject<HTMLCanvasElement | null>;
  /** Holds the transient line/rectangle rubber-band preview. */
  previewCanvasRef: RefObject<HTMLCanvasElement | null>;
  clear: () => void;
}

interface Point {
  x: number;
  y: number;
}

const BRUSH_WIDTH = 3;
/** Per-channel tolerance when deciding which pixels a fill should flood. */
const FILL_TOLERANCE = 48;

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
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

/**
 * Wires pointer input on a pair of viewport-sized canvases into freehand,
 * line, rectangle, and flood-fill drawing.
 */
export function useCanvasDrawing({
  tool,
  color,
  active,
}: UseCanvasDrawingOptions): UseCanvasDrawingResult {
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mirror the latest props into refs so the pointer listeners, attached
  // once, always read current values without re-binding.
  const toolRef = useRef<DrawTool>(tool);
  const colorRef = useRef<string>(color);
  const activeRef = useRef<boolean>(active);
  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);
  useEffect(() => {
    colorRef.current = color;
  }, [color]);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Keep both canvases sized to the viewport; preserve artwork across resizes.
  useEffect(() => {
    const main = mainCanvasRef.current;
    const preview = previewCanvasRef.current;
    if (main === null || preview === null) return;

    const resize = (): void => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const snapshot = document.createElement('canvas');
      snapshot.width = main.width;
      snapshot.height = main.height;
      const snapshotCtx = snapshot.getContext('2d');
      if (snapshotCtx !== null && main.width > 0 && main.height > 0) {
        snapshotCtx.drawImage(main, 0, 0);
      }

      main.width = width;
      main.height = height;
      preview.width = width;
      preview.height = height;

      const mainCtx = main.getContext('2d');
      if (mainCtx !== null && snapshot.width > 0 && snapshot.height > 0) {
        mainCtx.drawImage(snapshot, 0, 0);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Pointer-driven drawing.
  useEffect(() => {
    const main = mainCanvasRef.current;
    const preview = previewCanvasRef.current;
    if (main === null || preview === null) return;
    const mainCtx = main.getContext('2d');
    const previewCtx = preview.getContext('2d');
    if (mainCtx === null || previewCtx === null) return;

    let isDrawing = false;
    let start: Point = { x: 0, y: 0 };
    let previous: Point = { x: 0, y: 0 };

    const toPoint = (event: PointerEvent): Point => {
      const rect = preview.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const applyBrush = (ctx: CanvasRenderingContext2D): void => {
      ctx.strokeStyle = colorRef.current;
      ctx.fillStyle = colorRef.current;
      ctx.lineWidth = BRUSH_WIDTH;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    const handleDown = (event: PointerEvent): void => {
      if (!activeRef.current || event.button !== 0) return;
      const point = toPoint(event);
      const current = toolRef.current;

      if (current === 'fill') {
        floodFill(mainCtx, main.width, main.height, point.x, point.y, colorRef.current);
        return;
      }

      isDrawing = true;
      start = point;
      previous = point;
      preview.setPointerCapture(event.pointerId);

      if (current === 'pencil') {
        applyBrush(mainCtx);
        mainCtx.beginPath();
        mainCtx.arc(point.x, point.y, BRUSH_WIDTH / 2, 0, Math.PI * 2);
        mainCtx.fill();
      }
    };

    const handleMove = (event: PointerEvent): void => {
      if (!isDrawing) return;
      const point = toPoint(event);
      const current = toolRef.current;

      if (current === 'pencil') {
        applyBrush(mainCtx);
        mainCtx.beginPath();
        mainCtx.moveTo(previous.x, previous.y);
        mainCtx.lineTo(point.x, point.y);
        mainCtx.stroke();
        previous = point;
        return;
      }

      previewCtx.clearRect(0, 0, preview.width, preview.height);
      applyBrush(previewCtx);
      if (current === 'line') {
        previewCtx.beginPath();
        previewCtx.moveTo(start.x, start.y);
        previewCtx.lineTo(point.x, point.y);
        previewCtx.stroke();
      } else if (current === 'rectangle') {
        previewCtx.strokeRect(start.x, start.y, point.x - start.x, point.y - start.y);
      }
    };

    const handleUp = (event: PointerEvent): void => {
      if (!isDrawing) return;
      isDrawing = false;
      const point = toPoint(event);
      const current = toolRef.current;

      if (current === 'line' || current === 'rectangle') {
        previewCtx.clearRect(0, 0, preview.width, preview.height);
        applyBrush(mainCtx);
        if (current === 'line') {
          mainCtx.beginPath();
          mainCtx.moveTo(start.x, start.y);
          mainCtx.lineTo(point.x, point.y);
          mainCtx.stroke();
        } else {
          mainCtx.strokeRect(start.x, start.y, point.x - start.x, point.y - start.y);
        }
      }

      if (preview.hasPointerCapture(event.pointerId)) {
        preview.releasePointerCapture(event.pointerId);
      }
    };

    preview.addEventListener('pointerdown', handleDown);
    preview.addEventListener('pointermove', handleMove);
    preview.addEventListener('pointerup', handleUp);
    preview.addEventListener('pointercancel', handleUp);
    return () => {
      preview.removeEventListener('pointerdown', handleDown);
      preview.removeEventListener('pointermove', handleMove);
      preview.removeEventListener('pointerup', handleUp);
      preview.removeEventListener('pointercancel', handleUp);
    };
  }, []);

  const clear = useCallback((): void => {
    const main = mainCanvasRef.current;
    const preview = previewCanvasRef.current;
    if (main !== null) {
      const ctx = main.getContext('2d');
      if (ctx !== null) ctx.clearRect(0, 0, main.width, main.height);
    }
    if (preview !== null) {
      const ctx = preview.getContext('2d');
      if (ctx !== null) ctx.clearRect(0, 0, preview.width, preview.height);
    }
  }, []);

  return { mainCanvasRef, previewCanvasRef, clear };
}
