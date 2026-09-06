import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopNavBar } from '../../components/ui/TopNavBar';
import { analysesService } from '../../services/analyses.service';
import type { Analysis } from '../../types/analysis';
import { ImageComparisonSlider } from './components/ImageComparisonSlider';
import { PdfViewerPanel } from './components/PdfViewerPanel';

export const AnalysisDetailScreen: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadDetail() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const item = await analysesService.getAnalysisBySlug(slug);
        if (!ignore) {
          setAnalysis(item);
        }
      } catch {
        if (!ignore) {
          setAnalysis(null);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadDetail();
    return () => {
      ignore = true;
    };
  }, [slug]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Extraer imágenes antes/después del análisis
  const beforeAsset = analysis?.assets?.find(
    (a) => a.asset_type === 'image_before'
  );
  const afterAsset = analysis?.assets?.find(
    (a) => a.asset_type === 'image_after'
  );

  const beforeUrl =
    beforeAsset?.storage_path ||
    analysis?.thumbnail_url ||
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80';

  const afterUrl =
    afterAsset?.storage_path ||
    analysis?.thumbnail_url ||
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80';

  const beforeLabel =
    (beforeAsset?.metadata?.label as string) || 'Histórico (2020)';
  const afterLabel =
    (afterAsset?.metadata?.label as string) || 'Actual (2023)';

  return (
    <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex flex-col font-['Inter'] antialiased overflow-x-hidden">
      {/* Top Navbar con botón de retorno al proyecto o portafolio */}
      <TopNavBar
        search=""
        onSearchChange={() => {}}
        isDetailView={true}
        backLabel={
          analysis?.project_slug ? 'Volver al Proyecto' : 'Volver a Proyectos'
        }
        onBackClick={() => {
          if (analysis?.project_slug) {
            navigate(`/proyectos/${analysis.project_slug}`);
          } else {
            navigate('/');
          }
        }}
        onBrandClick={() => navigate('/')}
      />

      {/* Toast de confirmación para acciones */}
      {toastMessage && (
        <div className="bg-[#122131] border-b border-[#7bd0ff]/30 text-[#7bd0ff] px-4 py-2.5 text-xs sm:text-sm font-['Inter'] flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 max-w-[1600px] mx-auto w-full">
            <span className="material-symbols-outlined text-[#7bd0ff] text-[18px]">
              check_circle
            </span>
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[#909097] hover:text-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {isLoading ? (
          // Skeleton de carga para la vista de detalle
          <div className="flex flex-col gap-6 animate-pulse flex-1">
            <div className="glass-panel p-6 rounded-xl flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-7 w-72 bg-[#1c2b3c] rounded" />
                <div className="h-4 w-48 bg-[#122131] rounded" />
              </div>
              <div className="h-10 w-32 bg-[#1c2b3c] rounded-lg" />
            </div>
            <div className="flex-1 flex flex-col xl:flex-row gap-6 min-h-[500px]">
              <div className="flex-1 glass-panel rounded-xl bg-[#010f1f]/50 min-h-[450px]" />
              <div className="w-full xl:w-[400px] glass-panel rounded-xl bg-[#122131]/50 min-h-[450px]" />
            </div>
          </div>
        ) : !analysis ? (
          // Estado de no encontrado
          <div className="glass-panel rounded-2xl p-12 text-center my-12 max-w-lg mx-auto flex flex-col items-center">
            <span className="material-symbols-outlined text-[#ffb4ab] text-5xl mb-4">
              error_outline
            </span>
            <h2 className="font-['Montserrat'] font-bold text-xl text-[#d4e4fa] mb-2">
              Estudio no encontrado
            </h2>
            <p className="font-['Inter'] text-sm text-[#c6c6cd] mb-6">
              El análisis con identificador "{slug}" no existe en la base de datos o fue removido.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-[#7bd0ff] hover:bg-[#c4e7ff] text-[#001e2c] font-semibold text-xs py-2 px-4 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                arrow_back
              </span>
              Volver a la Galería
            </button>
          </div>
        ) : (
          <>
            {/* Header del Estudio / Análisis */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 glass-panel p-5 rounded-xl border border-white/10 shrink-0">
              <div>
                <h1 className="font-['Montserrat'] font-bold text-2xl sm:text-3xl text-[#d4e4fa] mb-1.5 tracking-tight">
                  {analysis.title}
                </h1>
                <p className="font-['Inter'] text-xs sm:text-sm text-[#c6c6cd] flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#909097]">
                      calendar_today
                    </span>
                    <span>{analysis.relative_time || '24 Oct 2023'}</span>
                  </span>
                  <span className="text-[#45464d] mx-1">|</span>
                  <span className="flex items-center gap-1 text-[#7bd0ff]">
                    <span className="material-symbols-outlined text-[15px]">
                      location_on
                    </span>
                    <span>
                      {analysis.city} {analysis.quadrant ? `• ${analysis.quadrant}` : ''}
                    </span>
                  </span>
                  <span className="text-[#45464d] mx-1">|</span>
                  <span className="uppercase text-[11px] font-semibold tracking-wider text-[#ffb690]">
                    {analysis.category.replace('_', ' ')}
                  </span>
                </p>
              </div>

              {/* Botones de acción superior */}
              <div className="flex items-center gap-2.5 self-end md:self-auto">
                <button
                  type="button"
                  onClick={() => showToast('Enlace permanente copiado al portapapeles')}
                  className="glass-panel p-2 rounded-lg text-[#d4e4fa] hover:text-[#7bd0ff] hover:bg-white/5 transition-colors flex items-center gap-2 cursor-pointer"
                  title="Compartir análisis"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    share
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Estado del visor guardado en la sesión')}
                  className="glass-panel px-3.5 py-2 rounded-lg text-[#bec6e0] hover:text-[#d4e4fa] hover:bg-[#bec6e0]/10 border border-[#bec6e0]/30 transition-colors flex items-center gap-2 font-['Inter'] text-xs font-semibold cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    save
                  </span>
                  <span>Guardar Estado</span>
                </button>
              </div>
            </header>

            {/* Cuadrícula en dos columnas: Comparador a la izquierda, Panel PDF a la derecha */}
            <div className="flex-1 flex flex-col xl:flex-row gap-6 min-h-[520px]">
              {/* Columna Izquierda: Slider comparador antes/después */}
              <ImageComparisonSlider
                beforeImage={beforeUrl}
                afterImage={afterUrl}
                beforeLabel={beforeLabel}
                afterLabel={afterLabel}
              />

              {/* Columna Derecha: Visor de reporte PDF y métricas */}
              <PdfViewerPanel
                technicalSummary={analysis.technical_summary}
                studyTitle={analysis.title}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};
