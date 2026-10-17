import React, { useState } from 'react';
import {
  TransformWrapper,
  TransformComponent,
} from 'react-zoom-pan-pinch';

export interface SingleImageViewerProps {
  src: string;
  alt?: string;
  label?: string;
  className?: string;
}

export const SingleImageViewer: React.FC<SingleImageViewerProps> = ({
  src,
  alt = 'Imagen satelital',
  label,
  className = '',
}) => {
  const [scale, setScale] = useState<number>(1);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  return (
    <div
      className={`flex-1 glass-panel rounded-xl flex flex-col overflow-hidden relative group min-h-[420px] lg:min-h-[500px] bg-[#010f1f] select-none ${className}`}
    >
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={8}
        centerOnInit={true}
        centerZoomedOut={true}
        limitToBounds={false}
        wheel={{ step: 0.15 }}
        pinch={{ step: 5 }}
        doubleClick={{ disabled: false, mode: 'toggle', step: 2 }}
        onTransform={(_ref, state) => {
          setScale(state.scale);
        }}
        onInit={(ref) => {
          setScale(ref.state.scale);
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Badge superior izquierdo opcional */}
            {label && (
              <div className="absolute top-4 left-4 z-20 flex gap-2 pointer-events-none">
                <div className="bg-[#1c2b3c]/90 text-[#d4e4fa] px-3 py-1 rounded text-xs font-semibold backdrop-blur border border-white/10 shadow-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#7bd0ff]" />
                  <span>{label}</span>
                </div>
              </div>
            )}

            {/* Controles flotantes de zoom en la esquina superior derecha */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-[#051424]/85 backdrop-blur-md px-2 py-1.5 rounded-xl border border-white/10 shadow-xl transition-opacity">
              {/* Botón Alejar [-] */}
              <button
                type="button"
                onClick={() => zoomOut(0.3)}
                aria-label="Alejar imagen"
                title="Alejar (-)"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#bec6e0] hover:text-[#7bd0ff] hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>

              {/* Indicador de Escala / Porcentaje */}
              <div
                className="px-2 py-0.5 text-[11px] font-mono font-medium text-[#7bd0ff] bg-[#122131]/80 rounded border border-white/5 select-none min-w-[48px] text-center"
                title="Nivel de zoom actual"
              >
                {Math.round(scale * 100)}%
              </div>

              {/* Botón Acercar [+] */}
              <button
                type="button"
                onClick={() => zoomIn(0.3)}
                aria-label="Acercar imagen"
                title="Acercar (+)"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#bec6e0] hover:text-[#7bd0ff] hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>

              <div className="w-px h-4 bg-white/10 mx-0.5" />

              {/* Botón Restablecer / Fit to container [⟲] */}
              <button
                type="button"
                onClick={() => {
                  resetTransform();
                  setScale(1);
                }}
                aria-label="Restablecer tamaño original"
                title="Restablecer escala original (Reset)"
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#bec6e0] hover:text-[#ffb690] hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  restart_alt
                </span>
              </button>
            </div>

            {/* Contenedor interactivo con Paneo y Zoom acelerado por hardware */}
            <div className="relative w-full h-full flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing">
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
                }}
              >
                {hasError ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-[#ffb4ab]">
                    <span className="material-symbols-outlined text-4xl mb-2">
                      broken_image
                    </span>
                    <p className="text-xs text-[#c6c6cd]">
                      No se pudo cargar la imagen satelital.
                    </p>
                  </div>
                ) : (
                  <img
                    src={src}
                    alt={alt}
                    loading="eager"
                    decoding="async"
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasError(true)}
                    className={`max-w-full max-h-full object-contain pointer-events-none select-none transition-opacity duration-300 ${
                      isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                )}
              </TransformComponent>
            </div>

            {/* Barra inferior de ayuda y atajos para GIS */}
            <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2 bg-[#051424]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-[#bec6e0] pointer-events-none select-none">
              <span className="material-symbols-outlined text-[15px] text-[#7bd0ff]">
                pan_tool
              </span>
              <span className="text-[11px] text-[#909097] hidden sm:inline">
                Rueda del ratón para zoom • Arrastrar para desplazarse • Doble clic para alternar
              </span>
              <span className="text-[11px] text-[#909097] sm:hidden">
                Pinch / Scroll: zoom • Arrastrar: mover
              </span>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};
