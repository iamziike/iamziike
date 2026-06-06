import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactElement } from "react";

interface ColorPickerProps {
  color: string;
  onChange: (hex: string) => void;
}

// ── helpers ───────────────────────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const v = hex.replace("#", "");
  const r = parseInt(v.slice(0, 2), 16) / 255;
  const g = parseInt(v.slice(2, 4), 16) / 255;
  const b = parseInt(v.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number): string => {
    const k = (n + h / 30) % 12;
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function isValidHex(v: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(v);
}

/** Draw the HSL wheel: angle = hue, radius fraction = saturation, lightness fixed at 50%. */
function drawWheel(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (ctx === null) return;
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > r) continue;
      const hue = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
      const sat = (dist / r) * 100;
      const hex = hslToHex(hue, sat, 50);
      const i = (y * size + x) * 4;
      image.data[i] = parseInt(hex.slice(1, 3), 16);
      image.data[i + 1] = parseInt(hex.slice(3, 5), 16);
      image.data[i + 2] = parseInt(hex.slice(5, 7), 16);
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

/** Convert hue+sat to (x,y) position on the wheel canvas. */
function wheelPos(
  h: number,
  s: number,
  size: number,
): { x: number; y: number } {
  const r = size / 2;
  const angle = (h * Math.PI) / 180;
  const dist = (s / 100) * r;
  return {
    x: r + Math.cos(angle) * dist,
    y: r + Math.sin(angle) * dist,
  };
}

// ── component ─────────────────────────────────────────────────────────────────

const WHEEL_SIZE = 160;

export function ColorPicker({
  color,
  onChange,
}: ColorPickerProps): ReactElement {
  const wheelRef = useRef<HTMLCanvasElement | null>(null);
  const [hsl, setHsl] = useState<[number, number, number]>(() =>
    hexToHsl(isValidHex(color) ? color : "#000000"),
  );
  const [hexInput, setHexInput] = useState<string>(
    isValidHex(color) ? color : "#000000",
  );

  // Sync incoming color prop → internal state (e.g. when parent resets) by
  // adjusting state during render when the prop changes, rather than in an
  // effect. https://react.dev/learn/you-might-not-need-an-effect
  const [prevColor, setPrevColor] = useState(color);
  if (color !== prevColor && isValidHex(color)) {
    setPrevColor(color);
    setHsl(hexToHsl(color));
    setHexInput(color);
  }

  // Draw wheel once on mount.
  useEffect(() => {
    const canvas = wheelRef.current;
    if (canvas !== null) drawWheel(canvas);
  }, []);

  const emit = useCallback(
    (h: number, s: number, l: number): void => {
      const hex = hslToHex(h, s, l);
      setHexInput(hex);
      onChange(hex);
    },
    [onChange],
  );

  // ── wheel interaction ──────────────────────────────────────────────────────
  const handleWheelPointer = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>): void => {
      if (event.buttons === 0 && event.type === "pointermove") return;
      const canvas = wheelRef.current;
      if (canvas === null) return;
      const rect = canvas.getBoundingClientRect();
      const dx = event.clientX - rect.left - WHEEL_SIZE / 2;
      const dy = event.clientY - rect.top - WHEEL_SIZE / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const r = WHEEL_SIZE / 2;
      const hue = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
      const sat = Math.min((dist / r) * 100, 100);
      const next: [number, number, number] = [
        Math.round(hue),
        Math.round(sat),
        hsl[2],
      ];
      setHsl(next);
      emit(next[0], next[1], next[2]);
    },
    [hsl, emit],
  );

  // ── lightness slider ───────────────────────────────────────────────────────
  const handleLightness = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const l = Number(event.target.value);
      const next: [number, number, number] = [hsl[0], hsl[1], l];
      setHsl(next);
      emit(next[0], next[1], next[2]);
    },
    [hsl, emit],
  );

  // ── hex input ──────────────────────────────────────────────────────────────
  const handleHexChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const raw = event.target.value;
      setHexInput(raw);
      const normalised = raw.startsWith("#") ? raw : `#${raw}`;
      if (isValidHex(normalised)) {
        const next = hexToHsl(normalised);
        setHsl(next);
        onChange(normalised);
      }
    },
    [onChange],
  );

  const handleHexBlur = useCallback((): void => {
    const normalised = hexInput.startsWith("#") ? hexInput : `#${hexInput}`;
    if (!isValidHex(normalised)) {
      // Reset to last valid color.
      setHexInput(hslToHex(hsl[0], hsl[1], hsl[2]));
    }
  }, [hexInput, hsl]);

  const { x: dotX, y: dotY } = wheelPos(hsl[0], hsl[1], WHEEL_SIZE);
  const currentHex = hslToHex(hsl[0], hsl[1], hsl[2]);
  const lightnessGrad = `linear-gradient(to right, ${hslToHex(hsl[0], hsl[1], 0)}, ${hslToHex(hsl[0], hsl[1], 50)}, ${hslToHex(hsl[0], hsl[1], 100)})`;

  return (
    <div className="flex flex-col items-center gap-2.5">
      {/* Wheel — pencil-edge on the wrapper, not the canvas, so pointer events
          on the canvas are never affected by the SVG filter's hit-test. */}
      <div
        className="relative rounded-full border border-pencil-light pencil-edge"
        style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
      >
        <canvas
          ref={wheelRef}
          width={WHEEL_SIZE}
          height={WHEEL_SIZE}
          className="block rounded-full"
          style={{ cursor: "crosshair", pointerEvents: "auto" }}
          onPointerDown={handleWheelPointer}
          onPointerMove={handleWheelPointer}
        />
        {/* Selection dot */}
        <div
          className="pointer-events-none absolute rounded-full border-2 border-paper shadow-[0_0_0_1px_#1A1714]"
          style={{
            width: 12,
            height: 12,
            left: dotX - 6,
            top: dotY - 6,
            backgroundColor: currentHex,
          }}
        />
      </div>

      {/* Lightness slider */}
      <div className="w-full">
        <p className="mb-1 font-sketch text-[10px] tracking-wider text-pencil-light">
          Lightness
        </p>
        {/* Track + thumb share the same relative container so the thumb
            sits vertically centred on the 12px (h-3) track. */}
        <div className="relative" style={{ height: 20 }}>
          {/* Gradient track — top-offset centres it on the 20px container */}
          <div
            className="absolute inset-x-0 top-1 h-3 rounded-sketch border border-pencil-light pencil-edge overflow-hidden"
            style={{ background: lightnessGrad }}
          >
            <input
              type="range"
              min={0}
              max={100}
              value={hsl[2]}
              onChange={handleLightness}
              className="block h-full w-full cursor-pointer opacity-0"
              aria-label="Lightness"
            />
          </div>
          {/* Thumb — absolutely centred vertically on the container */}
          <div
            className="pointer-events-none absolute top-0 h-5 w-2 -translate-x-1/2 rounded-[2px] border border-pencil-light bg-paper shadow-[1px_1px_0_var(--color-paper-shadow)]"
            style={{ left: `${hsl[2]}%` }}
          />
        </div>
      </div>

      {/* Hex input */}
      <div className="mt-1 flex w-full items-center gap-2">
        <div
          className="h-6 w-6 shrink-0 rounded-sketch border border-pencil-light pencil-edge"
          style={{ backgroundColor: currentHex }}
        />
        <input
          type="text"
          value={hexInput}
          onChange={handleHexChange}
          onBlur={handleHexBlur}
          maxLength={7}
          spellCheck={false}
          className="min-w-0 flex-1 rounded-sketch border border-pencil-light bg-paper
            px-2 py-1 font-sketch text-xs text-pencil-dark pencil-edge
            focus:border-pencil focus:outline-none"
          aria-label="Hex colour code"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
