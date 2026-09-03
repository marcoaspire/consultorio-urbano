import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Histórico (2020)',
  afterLabel = 'Actual (2023)',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updatePosition(e.clientX);
    // Capture pointer to track smoothly outside the element
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Fallback for edge cases
      }
    }
  };

  // Keyboard navigation for accessibility (Left / Right arrow keys)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  // Safety cleanup if mouse leaves window during drag
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="flex-1 glass-panel rounded-xl flex flex-col overflow-hidden relative group min-h-[420px] lg:min-h-[500px]">
      {/* Dynamic Badges */}
      <div className="absolute top-4 left-4 z-20 flex gap-2 pointer-events-none">
        <div className="bg-[#1c2b3c]/90 text-[#d4e4fa] px-3 py-1 rounded text-xs font-semibold backdrop-blur border border-white/10 shadow-lg flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#ffb690]" />
          <span>{beforeLabel}</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 flex gap-2 pointer-events-none">
        <div className="bg-[#bec6e0]/95 text-[#283044] px-3 py-1 rounded text-xs font-bold backdrop-blur shadow-lg flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#7bd0ff] animate-pulse" />
          <span>{afterLabel}</span>
        </div>
      </div>

      {/* Interactive Slider Area */}
      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-label="Deslizador de comparación de imágenes antes y después"
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        className="relative flex-1 bg-[#010f1f] w-full h-full overflow-hidden cursor-ew-resize select-none touch-none focus:outline-none focus:ring-1 focus:ring-[#7bd0ff]"
      >
        {/* Layer 1: Current / Actual (Right/Base layer) */}
        <img
          src={afterImage}
          alt={afterLabel}
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        />

        {/* Layer 2: Historic / Before (Left overlay clipped to slider position) */}
        <img
          src={beforeImage}
          alt={beforeLabel}
          loading="eager"
          decoding="async"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        />

        {/* Slider Divider Bar & Handle */}
        <div
          style={{ left: `${sliderPosition}%` }}
          className="absolute top-0 bottom-0 w-0.5 bg-[#ffb690] flex items-center justify-center -translate-x-1/2 z-20 shadow-[0_0_12px_rgba(255,182,144,0.6)] pointer-events-none"
        >
          <div
            className={`w-8 h-8 rounded-full bg-[#ffb690] text-[#552100] flex items-center justify-center shadow-xl border-2 border-[#010f1f] transition-transform duration-100 ${
              isDragging ? 'scale-115 ring-4 ring-[#ffb690]/30' : 'group-hover:scale-105'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              swap_horiz
            </span>
          </div>
        </div>

        {/* Quick percentage tooltip on drag */}
        {isDragging && (
          <div
            style={{ left: `${sliderPosition}%` }}
            className="absolute bottom-4 -translate-x-1/2 z-20 bg-[#051424]/90 backdrop-blur text-xs font-mono text-[#ffb690] px-2 py-0.5 rounded border border-[#ffb690]/40 pointer-events-none"
          >
            {Math.round(sliderPosition)}%
          </div>
        )}
      </div>

      {/* Floating Bottom Quick Presets */}
      <div className="absolute bottom-3 left-4 z-20 flex items-center gap-1.5 bg-[#051424]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-xs text-[#c6c6cd]">
        <span className="text-[11px] font-['Inter'] text-[#909097] mr-1 hidden sm:inline">
          Vista:
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSliderPosition(100);
          }}
          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
            sliderPosition === 100
              ? 'bg-[#ffb690] text-[#552100] font-bold'
              : 'hover:bg-white/10'
          }`}
        >
          Solo Antes
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSliderPosition(50);
          }}
          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
            sliderPosition === 50
              ? 'bg-[#7bd0ff] text-[#001e2c] font-bold'
              : 'hover:bg-white/10'
          }`}
        >
          50 / 50
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSliderPosition(0);
          }}
          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
            sliderPosition === 0
              ? 'bg-[#bec6e0] text-[#131b2e] font-bold'
              : 'hover:bg-white/10'
          }`}
        >
          Solo Después
        </button>
      </div>
    </div>
  );
};
