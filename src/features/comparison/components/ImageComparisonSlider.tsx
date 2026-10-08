import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  TransformWrapper,
  TransformComponent,
} from 'react-zoom-pan-pinch';
import { SingleImageViewer } from './SingleImageViewer';

export interface ImageComparisonSliderProps {
  beforeImage?: string | null;
  afterImage?: string | null;
  singleImage?: string | null;
  beforeLabel?: string;
  afterLabel?: string;
  singleLabel?: string;
  className?: string;
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  beforeImage,
  afterImage,
  singleImage,
  beforeLabel = 'Histórico (Previa)',
  afterLabel = 'Actual (Reciente)',
  singleLabel,
  className = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [transformState, setTransformState] = useState<{
    scale: number;
    positionX: number;
    positionY: number;
  }>({ scale: 1, positionX: 0, positionY: 0 });
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Validación estricta para determinar si disponemos de 2 imágenes distintas para comparación
  const hasValidBefore = Boolean(beforeImage && beforeImage.trim() !== '');
  const hasValidAfter = Boolean(afterImage && afterImage.trim() !== '');
  const hasTwoImages = Boolean(
    hasValidBefore &&
    hasValidAfter &&
    beforeImage !== afterImage
  );

  // Determinar la imagen a inspeccionar en caso de solo disponer de 1 imagen
  const solitaryImage =
    singleImage ||
    (hasValidBefore ? beforeImage : null) ||
    (hasValidAfter ? afterImage : null);

  // Medir ancho del contenedor para el cálculo del recorte geométrico en coordenadas de pantalla
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [hasTwoImages]);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleSliderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Detiene propagación para que el TransformWrapper no interprete esto como un pan/drag
    e.stopPropagation();
    setIsDraggingSlider(true);
    updatePosition(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleSliderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSlider) return;
    updatePosition(e.clientX);
  };

  const handleSliderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingSlider) {
      setIsDraggingSlider(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Fallback seguro
      }
    }
  };

  // Navegación por teclado para accesibilidad (flechas izquierda / derecha)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      setSliderPosition((prev) => Math.min(100, prev + 5));
    }
  };

  // Limpieza en caso de que el cursor salga de la ventana mientras arrastra
  useEffect(() => {
    if (!hasTwoImages) return;
    const handleGlobalMouseUp = () => setIsDraggingSlider(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [hasTwoImages]);

  // CASO 1 SOLA IMAGEN: Modo Inspección / Zoom (Sin slider, sin divisor, sin etiquetas comparativas)
  if (!hasTwoImages) {
    if (solitaryImage) {
      const derivedLabel =
        singleLabel ||
        (hasValidBefore ? beforeLabel : hasValidAfter ? afterLabel : undefined);

      return (
        <SingleImageViewer
          src={solitaryImage}
          label={derivedLabel}
          className={className}
        />
      );
    }

    // Estado vacío si no existe ninguna imagen disponible
    return (
      <div
        className={`flex-1 glass-panel rounded-xl flex flex-col justify-center items-center p-8 text-center min-h-[420px] lg:min-h-[500px] bg-[#010f1f] border border-white/10 ${className}`}
      >
        <span className="material-symbols-outlined text-[#7bd0ff]/60 text-5xl mb-3">
          satellite_alt
        </span>
        <h3 className="text-base font-semibold text-[#d4e4fa] mb-1 font-['Montserrat']">
          Sin imagen satelital disponible
        </h3>
        <p className="text-xs text-[#bec6e0] max-w-sm">
          Este estudio no cuenta con imágenes satelitales procesadas en este momento.
        </p>
      </div>
    );
  }

  // CÁLCULO DE RECORTE SINCRONIZADO:
  // Relaciona la posición del divisor en la pantalla (0-100%) con el espacio transformado (zoom y paneo)
  const currentWidth = containerWidth || containerRef.current?.clientWidth || 800;
  const screenDividerX = (sliderPosition / 100) * currentWidth;
  const currentScale = transformState.scale || 1;
  const currentPosX = transformState.positionX || 0;
  const contentDividerX = (screenDividerX - currentPosX) / currentScale;
  const contentDividerPct = (contentDividerX / currentWidth) * 100;
  const clipRight = Math.max(0, Math.min(100, 100 - contentDividerPct));

  // CASO 2 IMÁGENES: Slider Interactivo de Comparativa (Antes / Después) con Zoom y Paneo
  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Visor comparativo satelital interactivo con zoom y deslizador"
      className={`flex-1 glass-panel rounded-xl flex flex-col overflow-hidden relative group min-h-[420px] lg:min-h-[500px] bg-[#010f1f] select-none outline-none focus:ring-1 focus:ring-[#7bd0ff]/50 ${className}`}
    >
      <TransformWrapper
        initialScale={1}
        minScale={0.8}
        maxScale={8}
        centerOnInit={true}
        centerZoomedOut={true}
        limitToBounds={false}
        wheel={{ step: 0.15 }}
        pinch={{ step: 5 }}
        doubleClick={{ disabled: false, mode: 'toggle', step: 2 }}
        panning={{
          disabled: false,
          velocityDisabled: false,
        }}
        onTransform={(_ref, state) => {
          setTransformState({
            scale: state.scale,
            positionX: state.positionX,
            positionY: state.positionY,
          });
        }}
        onInit={(ref) => {
          setTransformState({
            scale: ref.state.scale,
            positionX: ref.state.positionX,
            positionY: ref.state.positionY,
          });
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Dynamic Badges */}
            <div className="absolute top-4 left-4 z-20 flex gap-2 pointer-events-none select-none">
              <div className="bg-[#1c2b3c]/90 text-[#d4e4fa] px-3 py-1 rounded text-xs font-semibold backdrop-blur border border-white/10 shadow-lg flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ffb690]" />
                <span>{beforeLabel}</span>
              </div>
            </div>

            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 select-none">
              <div className="bg-[#bec6e0]/95 text-[#283044] px-3 py-1 rounded text-xs font-bold backdrop-blur shadow-lg flex items-center gap-1.5 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-[#7bd0ff] animate-pulse" />
                <span>{afterLabel}</span>
              </div>

              {/* Controles de Zoom Flotantes */}
              <div className="flex items-center gap-1 bg-[#051424]/85 backdrop-blur-md px-2 py-1 rounded-xl border border-white/10 shadow-xl">
                <button
                  type="button"
                  onClick={() => zoomOut(0.3)}
                  aria-label="Alejar zoom"
                  title="Alejar (-)"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#bec6e0] hover:text-[#7bd0ff] hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>

                <div
                  className="px-2 py-0.5 text-[11px] font-mono font-medium text-[#7bd0ff] bg-[#122131]/80 rounded border border-white/5 min-w-[48px] text-center"
                  title="Nivel de zoom actual"
                >
                  {Math.round(transformState.scale * 100)}%
                </div>

                <button
                  type="button"
                  onClick={() => zoomIn(0.3)}
                  aria-label="Acercar zoom"
                  title="Acercar (+)"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#bec6e0] hover:text-[#7bd0ff] hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>

                <div className="w-px h-4 bg-white/10 mx-0.5" />

                <button
                  type="button"
                  onClick={() => {
                    resetTransform();
                    setTransformState({ scale: 1, positionX: 0, positionY: 0 });
                  }}
                  aria-label="Restablecer escala original"
                  title="Restablecer tamaño original (Reset)"
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#bec6e0] hover:text-[#ffb690] hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    restart_alt
                  </span>
                </button>
              </div>
            </div>

            {/* Transform Component Area con Zoom y Paneo Sincronizado */}
            <div
              className={`relative w-full h-full flex-1 flex items-center justify-center overflow-hidden ${
                transformState.scale > 1
                  ? 'cursor-grab active:cursor-grabbing'
                  : 'cursor-default'
              }`}
            >
              <TransformComponent
                wrapperStyle={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                contentStyle={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Layer 1: Current / Actual (Right/Base layer) */}
                  <img
                    src={afterImage!}
                    alt={afterLabel}
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                  />

                  {/* Layer 2: Historic / Before (Left overlay clipped to slider position in content space) */}
                  <img
                    src={beforeImage!}
                    alt={beforeLabel}
                    loading="eager"
                    decoding="async"
                    style={{
                      clipPath: `inset(0 ${clipRight}% 0 0)`,
                    }}
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                  />
                </div>
              </TransformComponent>

              {/* Slider Divider Bar & Handle (Viewport Level, interactuable a cualquier nivel de zoom) */}
              <div
                style={{ left: `${sliderPosition}%` }}
                onPointerDown={handleSliderPointerDown}
                onPointerMove={handleSliderPointerMove}
                onPointerUp={handleSliderPointerUp}
                className="absolute top-0 bottom-0 w-10 -translate-x-1/2 z-20 flex items-center justify-center cursor-ew-resize touch-none select-none group/divider"
                role="slider"
                aria-label="Línea divisoria de comparación"
                aria-valuenow={Math.round(sliderPosition)}
                aria-valuemin={0}
                aria-valuemax={100}
                tabIndex={-1}
              >
                {/* Línea luminosa vertical */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-[#ffb690] shadow-[0_0_12px_rgba(255,182,144,0.7)] pointer-events-none" />

                {/* Tirador circular central */}
                <div
                  className={`w-8 h-8 rounded-full bg-[#ffb690] text-[#552100] flex items-center justify-center shadow-xl border-2 border-[#010f1f] transition-transform duration-100 ${
                    isDraggingSlider
                      ? 'scale-120 ring-4 ring-[#ffb690]/40'
                      : 'group-hover/divider:scale-110'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    swap_horiz
                  </span>
                </div>

                {/* Porcentaje tooltip en arrastre */}
                {isDraggingSlider && (
                  <div className="absolute bottom-4 z-20 bg-[#051424]/90 backdrop-blur text-xs font-mono text-[#ffb690] px-2 py-0.5 rounded border border-[#ffb690]/40 pointer-events-none">
                    {Math.round(sliderPosition)}%
                  </div>
                )}
              </div>
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
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export { SingleImageViewer };
