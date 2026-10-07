import React, { useEffect, useState } from 'react';
import type { TechnicalSummary } from '../../../types/analysis';

interface PdfViewerPanelProps {
  pdfUrl?: string;
  technicalSummary?: TechnicalSummary;
  studyTitle: string;
}

export const PdfViewerPanel: React.FC<PdfViewerPanelProps> = ({
  pdfUrl,
  technicalSummary,
  studyTitle,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [downloadToast, setDownloadToast] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'pdf' | 'summary'>(pdfUrl ? 'pdf' : 'summary');

  // Cerrar modal al presionar la tecla Escape
  useEffect(() => {
    if (!isExpanded) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        setIsExpanded(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isExpanded]);

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
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 4000);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(150, prev + 10));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(70, prev - 10));
  };

  const openInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <aside
        aria-label="Visor de Reporte PDF y Panel Lateral"
        className="w-full xl:w-[460px] shrink-0 glass-panel rounded-xl flex flex-col overflow-hidden shadow-2xl relative border border-white/10"
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
        <div className="p-3.5 border-b border-white/10 flex justify-between items-center bg-[#1c2b3c]/60">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="material-symbols-outlined text-[#bec6e0] text-[20px] shrink-0">
              picture_as_pdf
            </span>
            <div className="min-w-0">
              <h2 className="font-['Montserrat'] font-semibold text-xs sm:text-sm text-[#d4e4fa] truncate" title={filename}>
                {filename}
              </h2>
              {pdfUrl && (
                <div className="flex items-center gap-2 mt-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('pdf')}
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      viewMode === 'pdf'
                        ? 'bg-[#7bd0ff]/20 text-[#7bd0ff] font-semibold'
                        : 'text-[#909097] hover:text-[#d4e4fa]'
                    }`}
                  >
                    Visor PDF
                  </button>
                  <span className="text-[#45464d] text-[10px]">|</span>
                  <button
                    type="button"
                    onClick={() => setViewMode('summary')}
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                      viewMode === 'summary'
                        ? 'bg-[#7bd0ff]/20 text-[#7bd0ff] font-semibold'
                        : 'text-[#909097] hover:text-[#d4e4fa]'
                    }`}
                  >
                    Resumen Técnico
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Botón de Expandir a Pantalla Completa */}
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="p-1.5 rounded-lg bg-[#273647]/80 hover:bg-[#7bd0ff]/20 text-[#7bd0ff] border border-[#7bd0ff]/30 transition-all flex items-center gap-1 text-xs font-semibold px-2 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              title="Expandir PDF a pantalla completa"
            >
              <span className="material-symbols-outlined text-[16px]">
                fullscreen
              </span>
              <span className="hidden sm:inline">Expandir</span>
            </button>

            {viewMode === 'summary' && (
              <div className="flex items-center gap-0.5 ml-1">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 70}
                  className="p-1.5 rounded hover:bg-white/10 text-[#c6c6cd] hover:text-[#d4e4fa] disabled:opacity-40 transition-colors cursor-pointer"
                  title="Reducir zoom"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    zoom_out
                  </span>
                </button>
                <span className="text-[11px] font-mono text-[#909097] min-w-[32px] text-center">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 150}
                  className="p-1.5 rounded hover:bg-white/10 text-[#c6c6cd] hover:text-[#d4e4fa] disabled:opacity-40 transition-colors cursor-pointer"
                  title="Aumentar zoom"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    zoom_in
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Document Content */}
        {viewMode === 'pdf' && pdfUrl ? (
          <div className="flex-1 bg-[#051424] min-h-[460px] h-full flex flex-col relative group">
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              title="Visor de Documento PDF"
              className="w-full flex-1 border-0 rounded-b-none min-h-[450px]"
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 bg-[#010f1f]/40 relative min-h-[420px]">
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="bg-[#122131] text-[#d4e4fa] p-5 rounded-lg shadow-lg border border-white/5 min-h-[400px] flex flex-col transition-transform duration-150"
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
        )}

        {/* PDF Footer Actions - Acciones sobre el archivo */}
        <div className="p-3.5 border-t border-white/10 bg-[#122131]/95 flex justify-between items-center gap-3">
          {/* Izquierda: Abrir en pestaña nueva */}
          {pdfUrl ? (
            <button
              type="button"
              onClick={openInNewTab}
              className="glass-panel px-3 py-1.5 rounded-lg text-[#bec6e0] hover:text-[#7bd0ff] hover:bg-[#7bd0ff]/10 border border-white/10 hover:border-[#7bd0ff]/30 transition-colors flex items-center gap-1.5 font-['Inter'] text-xs font-medium cursor-pointer"
              title="Abrir PDF en pestaña nueva del navegador"
            >
              <span className="material-symbols-outlined text-[16px]">
                open_in_new
              </span>
              <span>Abrir en pestaña</span>
            </button>
          ) : viewMode === 'summary' ? (
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
                Pág. <strong className="text-[#d4e4fa]">{currentPage}</strong> de {totalPages}
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
          ) : (
            <div />
          )}

          {/* Derecha: Botón primario de Descargar */}
          <button
            type="button"
            onClick={handleDownload}
            className="bg-[#bec6e0] hover:bg-[#dae2fd] text-[#131b2e] font-['Inter'] font-semibold text-xs px-3.5 py-2 rounded-lg shadow-md transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Descargar</span>
          </button>
        </div>
      </aside>

      {/* MODAL EXPANDIDO DE PANTALLA COMPLETA */}
      {isExpanded && (
        <div
          role="dialog"
          tabIndex={-1}
          ref={(el) => el?.focus()}
          aria-modal="true"
          aria-label="Visor PDF Pantalla Completa"
          className="fixed inset-0 z-50 bg-[#051424]/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-200 outline-none"
        >
          {/* Header del Modal */}
          <div className="h-16 px-6 bg-[#122131]/90 border-b border-white/10 flex items-center justify-between gap-4 shrink-0 shadow-lg">
            <div className="flex items-center gap-3 min-w-0">
              <span className="material-symbols-outlined text-[#7bd0ff] text-2xl">
                picture_as_pdf
              </span>
              <div className="min-w-0">
                <h2 className="font-['Montserrat'] font-bold text-base sm:text-lg text-[#d4e4fa] truncate">
                  {studyTitle}
                </h2>
                <p className="text-xs text-[#909097] font-mono truncate">
                  Archivo: {filename}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {pdfUrl && (
                <button
                  type="button"
                  onClick={openInNewTab}
                  className="glass-panel px-3.5 py-2 rounded-lg text-[#d4e4fa] hover:text-[#7bd0ff] hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                  title="Abrir en pestaña nueva del navegador"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    open_in_new
                  </span>
                  <span className="hidden sm:inline">Abrir en pestaña nueva</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDownload}
                className="bg-[#bec6e0] hover:bg-[#dae2fd] text-[#131b2e] px-4 py-2 rounded-lg text-xs font-semibold font-['Inter'] transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-[18px]">
                  download
                </span>
                <span>Descargar PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-lg bg-[#273647]/60 hover:bg-[#ffb4ab]/20 text-[#c6c6cd] hover:text-[#ffb4ab] border border-white/10 transition-colors cursor-pointer ml-2"
                title="Cerrar visor completo (ESC)"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
          </div>

          {/* Cuerpo del Modal con Visor Nativo Iframe */}
          <div className="flex-1 w-full h-full bg-[#020912] relative overflow-hidden flex flex-col">
            {pdfUrl ? (
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                title="Visor PDF Pantalla Completa"
                className="w-full h-full flex-1 border-0"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto">
                <span className="material-symbols-outlined text-[#7bd0ff] text-6xl mb-4">
                  description
                </span>
                <h3 className="font-['Montserrat'] font-bold text-2xl text-[#d4e4fa] mb-2">
                  {studyTitle}
                </h3>
                <p className="text-sm text-[#c6c6cd] mb-6 leading-relaxed">
                  {technicalSummary?.executive_summary ||
                    'Este análisis cuenta con un resumen técnico generado por el sistema geológico.'}
                </p>
                <div className="bg-[#122131] border border-white/10 p-6 rounded-xl w-full text-left">
                  <h4 className="text-xs uppercase font-mono text-[#7bd0ff] tracking-wider mb-3">
                    Métricas del Documento
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {activePageData.metrics.map((m, i) => (
                      <div key={i} className="bg-[#1c2b3c] p-3 rounded-lg">
                        <span className="text-xs text-[#909097] block">{m.label}</span>
                        <span className="font-bold text-[#d4e4fa] text-base">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
