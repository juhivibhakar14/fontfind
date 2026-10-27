"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Check, X, Crop as CropIcon } from "lucide-react";

interface CropRect {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  w: number; // percentage 0-100
  h: number; // percentage 0-100
}

interface ImageCropperProps {
  imageBlob: Blob;
  onCrop: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageBlob, onCrop, onCancel }: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgUrl, setImgUrl] = useState<string>("");
  const [crop, setCrop] = useState<CropRect>({ x: 10, y: 30, w: 80, h: 40 });
  const [dragMode, setDragMode] = useState<"draw" | "move" | "handle" | null>(null);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; crop: CropRect }>({
    clientX: 0,
    clientY: 0,
    crop: { x: 10, y: 30, w: 80, h: 40 },
  });

  useEffect(() => {
    const url = URL.createObjectURL(imageBlob);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageBlob]);

  const getContainerCoords = useCallback((e: React.PointerEvent) => {
    const container = containerRef.current;
    if (!container) return { px: 0, py: 0 };
    const rect = container.getBoundingClientRect();
    const px = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const py = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    return { px, py };
  }, []);

  const handlePointerDownContainer = (e: React.PointerEvent) => {
    if (dragMode) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const { px, py } = getContainerCoords(e);
    setDragMode("draw");
    dragStartRef.current = {
      clientX: px,
      clientY: py,
      crop: { x: px, y: py, w: 0, h: 0 },
    };
    setCrop({ x: px, y: py, w: 0, h: 0 });
  };

  const handlePointerDownBox = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragMode("move");
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      crop: { ...crop },
    };
  };

  const handlePointerDownHandle = (handle: string, e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragMode("handle");
    setActiveHandle(handle);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      crop: { ...crop },
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragMode) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    if (dragMode === "draw") {
      const { px, py } = getContainerCoords(e);
      const startX = dragStartRef.current.clientX;
      const startY = dragStartRef.current.clientY;
      const x = Math.min(startX, px);
      const y = Math.min(startY, py);
      const w = Math.abs(px - startX);
      const h = Math.abs(py - startY);
      setCrop({ x, y, w, h });
    } else if (dragMode === "move") {
      const dxPct = ((e.clientX - dragStartRef.current.clientX) / rect.width) * 100;
      const dyPct = ((e.clientY - dragStartRef.current.clientY) / rect.height) * 100;
      const initial = dragStartRef.current.crop;
      const x = Math.max(0, Math.min(100 - initial.w, initial.x + dxPct));
      const y = Math.max(0, Math.min(100 - initial.h, initial.y + dyPct));
      setCrop({ x, y, w: initial.w, h: initial.h });
    } else if (dragMode === "handle" && activeHandle) {
      const dxPct = ((e.clientX - dragStartRef.current.clientX) / rect.width) * 100;
      const dyPct = ((e.clientY - dragStartRef.current.clientY) / rect.height) * 100;
      const initial = dragStartRef.current.crop;

      let { x, y, w, h } = initial;

      if (activeHandle.includes("w")) {
        const newX = Math.min(initial.x + initial.w - 5, initial.x + dxPct);
        w = initial.w + (initial.x - newX);
        x = Math.max(0, newX);
      }
      if (activeHandle.includes("e")) {
        w = Math.max(5, Math.min(100 - initial.x, initial.w + dxPct));
      }
      if (activeHandle.includes("n")) {
        const newY = Math.min(initial.y + initial.h - 5, initial.y + dyPct);
        h = initial.h + (initial.y - newY);
        y = Math.max(0, newY);
      }
      if (activeHandle.includes("s")) {
        h = Math.max(5, Math.min(100 - initial.y, initial.h + dyPct));
      }

      setCrop({ x, y, w, h });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragMode) {
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
      setDragMode(null);
      setActiveHandle(null);
      // Ensure minimum 5% width and height so crop is valid
      setCrop((c) => ({
        x: Math.max(0, Math.min(95, c.x)),
        y: Math.max(0, Math.min(95, c.y)),
        w: Math.max(5, Math.min(100 - c.x, c.w)),
        h: Math.max(5, Math.min(100 - c.y, c.h)),
      }));
    }
  };

  const applyCrop = async () => {
    const img = imgRef.current;
    if (!img) return;

    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    if (!naturalW || !naturalH) return;

    const sx = Math.round((crop.x / 100) * naturalW);
    const sy = Math.round((crop.y / 100) * naturalH);
    const sw = Math.max(10, Math.round((crop.w / 100) * naturalW));
    const sh = Math.max(10, Math.round((crop.h / 100) * naturalH));

    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    canvas.toBlob((blob) => {
      canvas.width = 0;
      canvas.height = 0;
      if (blob) {
        onCrop(blob);
      }
    }, "image/png");
  };

  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-line text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 font-medium text-ink">
          <CropIcon className="h-4 w-4 text-accent" />
          <span>Drag to select the word/letters to match</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs text-mute hover:text-ink hover:border-ink transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
          <button
            type="button"
            onClick={applyCrop}
            className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1 text-xs font-medium text-white hover:opacity-90 transition-opacity"
          >
            <Check className="h-3.5 w-3.5" />
            Apply Selection
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        onPointerDown={handlePointerDownContainer}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative mt-3 flex items-center justify-center overflow-hidden rounded-xl border border-line bg-neutral-900 select-none cursor-crosshair touch-none"
        style={{ minHeight: "260px", maxHeight: "420px" }}
      >
        {/* Source image */}
        {imgUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            ref={imgRef}
            src={imgUrl}
            alt="Crop sample"
            draggable={false}
            className="max-h-[400px] w-auto max-w-full object-contain pointer-events-none"
          />
        )}

        {/* Dimmed overlay backdrop */}
        <div className="absolute inset-0 bg-black/50 pointer-events-none" />

        {/* Highlighted crop box */}
        <div
          onPointerDown={handlePointerDownBox}
          className="absolute border-2 border-accent bg-transparent cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
          style={{
            left: `${crop.x}%`,
            top: `${crop.y}%`,
            width: `${crop.w}%`,
            height: `${crop.h}%`,
          }}
        >
          {/* Rule of thirds grid lines */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
            <div className="border-r border-b border-accent/40" />
            <div className="border-r border-b border-accent/40" />
            <div className="border-b border-accent/40" />
            <div className="border-r border-b border-accent/40" />
            <div className="border-r border-b border-accent/40" />
            <div className="border-b border-accent/40" />
            <div className="border-r border-accent/40" />
            <div className="border-r border-accent/40" />
            <div />
          </div>

          {/* Corner resizing handles */}
          <div
            onPointerDown={(e) => handlePointerDownHandle("nw", e)}
            className="absolute -top-1.5 -left-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-accent cursor-nwse-resize"
          />
          <div
            onPointerDown={(e) => handlePointerDownHandle("ne", e)}
            className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-accent cursor-nesw-resize"
          />
          <div
            onPointerDown={(e) => handlePointerDownHandle("sw", e)}
            className="absolute -bottom-1.5 -left-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-accent cursor-nesw-resize"
          />
          <div
            onPointerDown={(e) => handlePointerDownHandle("se", e)}
            className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-accent cursor-nwse-resize"
          />
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-mute">
        Tip: Highlight only 1–3 clear letters or a single word without logos or icons for the best
        match.
      </p>
    </div>
  );
}
