import React, { useState } from 'react';
import type { TechnicalSummary } from '../../../types/analysis';

interface PdfViewerPanelProps {
  technicalSummary?: TechnicalSummary;
  studyTitle: string;
}

export const PdfViewerPanel: React.FC<PdfViewerPanelProps> = ({
  technicalSummary,
  studyTitle,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [downloadToast, setDownloadToast] = useState(false);

  const filename = technicalSummary?.pdf_filename || 'Reporte_Tecnico.pdf';
  const totalPages = technicalSummary?.pdf_total_pages || 12;
  const pagesData = technicalSummary?.pages || [];

  const activePageData =
    pagesData.find((p) => p.pageNumber === currentPage) || {
      pageNumber: currentPage,
      title: 'Análisis de Elevación y Desplazamiento',
      content:
        technicalSummary?.executive_summary ||
        'Las discrepancias observadas entre los conjuntos de datos multitemporales indican una alteración topográfica significativa. El volumen estimado de desplazamiento de material supera los parámetros operativos estándar.',
      tags: technicalSummary?.tags || ['Alta Prioridad', 'Sector Noroeste'],
      metrics: technicalSummary?.metrics || [
        { label: 'Variación media', value: '-1.2m' },
        { label: 'Área afectada', value: '4.5 hectáreas' },
        { label: 'Riesgo estructural', value: 'Moderado' },
      ],
    };

  const handleDownload = () => {
    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 4000);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(130, prev + 10));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(80, prev - 10));
  };

  return (
    <aside
      aria-label="Visor de Reporte PDF y Panel Lateral"
      className="w-full xl:w-[400px] shrink-0 glass-panel rounded-xl flex flex-col overflow-hidden shadow-2xl relative"
    >
      {/* Toast de descarga */}
      {downloadToast && (
        <div className="absolute top-14 left-4 right-4 z-30 bg-[#051424]/95 text-[#7bd0ff] border border-[#7bd0ff]/40 px-3 py-2 rounded-lg text-xs font-['Inter'] flex items-center gap-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-[18px]">
            file_download_done
          </span>
          <span>Descargando documento técnico: {filename}...</span>
        </div>
      )}

      {/* PDF Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1c2b3c]/50">
        <h2 className="font-['Montserrat'] font-semibold text-sm sm:text-base text-[#d4e4fa] flex items-center gap-2 truncate pr-2">
          <span className="material-symbols-outlined text-[#bec6e0] text-[18px]">
            description
          </span>
          <span className="truncate" title={filename}>
            {filename}
          </span>
        </h2>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 80}
            className="p-1.5 rounded hover:bg-white/10 text-[#c6c6cd] hover:text-[#d4e4fa] disabled:opacity-40 transition-colors cursor-pointer"
            title="Reducir zoom"
          >
            <span className="material-symbols-outlined text-[16px]">
              zoom_out
            </span>
          </button>
          <span className="text-[11px] font-mono text-[#909097] min-w-[36px] text-center">
            {zoomLevel}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 130}
            className="p-1.5 rounded hover:bg-white/10 text-[#c6c6cd] hover:text-[#d4e4fa] disabled:opacity-40 transition-colors cursor-pointer"
            title="Aumentar zoom"
          >
            <span className="material-symbols-outlined text-[16px]">
              zoom_in
            </span>
          </button>
        </div>
      </div>

      {/* Document Content (Scrollable PDF Mock Page) */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#010f1f]/40 relative">
        <div
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="bg-[#122131] text-[#d4e4fa] p-6 rounded-lg shadow-lg border border-white/5 min-h-[440px] flex flex-col transition-transform duration-150"
        >
          {/* Document Header Accent Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-1.5 bg-[#bec6e0]/30 rounded-full" />
            <span className="text-[10px] font-mono text-[#909097] uppercase tracking-wider">
              DOC-ID: {studyTitle.slice(0, 12)}
            </span>
          </div>

          <h3 className="font-['Montserrat'] font-bold text-base sm:text-lg mb-3 text-[#d4e4fa] leading-snug">
            {activePageData.title}
          </h3>

          <p className="font-['Inter'] text-xs sm:text-sm text-[#c6c6cd] mb-4 leading-relaxed">
            {activePageData.content}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {activePageData.tags.map((tag, i) => (
              <span
                key={i}
                className={
                  i === 0
                    ? 'px-2 py-0.5 bg-[#001a27] text-[#7bd0ff] text-[11px] font-medium rounded border border-[#7bd0ff]/30'
                    : 'px-2 py-0.5 bg-[#273647] text-[#c6c6cd] text-[11px] font-medium rounded border border-white/5'
                }
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Chart / Profile visualization box */}
          <div className="h-28 bg-[#1c2b3c]/40 rounded border border-white/5 flex flex-col items-center justify-center mb-4 p-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#7bd0ff]/5 to-transparent pointer-events-none" />
            <div className="w-full h-12 flex items-end justify-between gap-1 px-4 mb-2">
              <div className="w-full bg-[#1c2b3c] h-[30%] rounded-t" />
              <div className="w-full bg-[#7bd0ff]/60 h-[70%] rounded-t" />
              <div className="w-full bg-[#ec6a06]/80 h-[90%] rounded-t" />
              <div className="w-full bg-[#7bd0ff]/80 h-[60%] rounded-t" />
              <div className="w-full bg-[#1c2b3c] h-[45%] rounded-t" />
              <div className="w-full bg-[#bec6e0]/70 h-[35%] rounded-t" />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#909097] font-['Inter']">
              <span className="material-symbols-outlined text-[14px] text-[#7bd0ff]">
                area_chart
              </span>
              <span>Histograma de Dispersión Altimétrica</span>
            </div>
          </div>

          {/* Key Metrics Bullet List */}
          <div className="mt-auto pt-2">
            <h4 className="text-[11px] font-['Inter'] uppercase tracking-wider text-[#909097] font-semibold mb-2">
              Métricas Principales
            </h4>
            <ul className="font-['Inter'] text-xs text-[#c6c6cd] space-y-1.5 list-disc pl-4">
              {activePageData.metrics.map((metric, idx) => (
                <li key={idx}>
                  <strong className="text-[#d4e4fa]">{metric.label}:</strong>{' '}
                  <span className="font-mono text-[#7bd0ff]">{metric.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* PDF Footer Actions */}
      <div className="p-4 border-t border-white/10 bg-[#122131]/90 flex justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded bg-[#1c2b3c] hover:bg-[#273647] text-[#d4e4fa] disabled:opacity-30 transition-colors cursor-pointer"
            title="Página anterior"
          >
            <span className="material-symbols-outlined text-[14px]">
              chevron_left
            </span>
          </button>
          <span className="text-xs text-[#c6c6cd] font-mono whitespace-nowrap">
            Pág. <strong className="text-[#d4e4fa]">{currentPage}</strong> de{' '}
            {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded bg-[#1c2b3c] hover:bg-[#273647] text-[#d4e4fa] disabled:opacity-30 transition-colors cursor-pointer"
            title="Página siguiente"
          >
            <span className="material-symbols-outlined text-[14px]">
              chevron_right
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="bg-[#bec6e0] hover:bg-[#dae2fd] text-[#131b2e] font-['Inter'] font-semibold text-xs px-3.5 py-2 rounded shadow-md transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          <span>Descargar</span>
        </button>
      </div>
    </aside>
  );
};
