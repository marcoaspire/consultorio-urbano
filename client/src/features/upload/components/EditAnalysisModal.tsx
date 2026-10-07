import React, { useEffect, useState } from 'react';
import { categoriesService } from '../../../services/categories.service';
import type { Analysis } from '../../../types/analysis';
import type { Category } from '../../../types/category';

interface EditAnalysisModalProps {
  isOpen: boolean;
  analysis: Analysis | null;
  onClose: () => void;
  onSubmit: (dto: {
    title: string;
    city: string;
    category_slug: string;
    description: string;
    videoUrl?: string;
  }) => Promise<void>;
}

export const EditAnalysisModal: React.FC<EditAnalysisModalProps> = ({
  isOpen,
  analysis,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !analysis) return;

    setTitle(analysis.title);
    setCity(analysis.city);
    setCategorySlug(analysis.category_slug);
    setDescription(analysis.description);
    setVideoUrl(analysis.video_url || '');

    let isMounted = true;
    setLoadingCategories(true);

    categoriesService
      .getCategories('analysis')
      .then((cats) => {
        if (isMounted) {
          setCategories(cats);
        }
      })
      .catch((err) => {
        console.error('Error al cargar categorías de análisis:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, analysis]);

  if (!isOpen || !analysis) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('El título del análisis es obligatorio.');
      return;
    }

    if (!city.trim()) {
      setError('La ciudad o región es obligatoria.');
      return;
    }

    if (!categorySlug) {
      setError('Debes seleccionar una categoría.');
      return;
    }

    if (!description.trim()) {
      setError('La descripción técnica es obligatoria.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        city: city.trim(),
        category_slug: categorySlug,
        description: description.trim(),
        videoUrl: videoUrl.trim() || undefined,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al actualizar el análisis'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051424]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#0c1c2e]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Encabezado */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#122131]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7bd0ff]/15 border border-[#7bd0ff]/30 flex items-center justify-center text-[#7bd0ff]">
              <span className="material-symbols-outlined text-[20px]">
                edit_note
              </span>
            </div>
            <div>
              <h2
                id="modal-title"
                className="font-['Montserrat'] font-bold text-lg text-[#d4e4fa] leading-tight"
              >
                Editar Análisis Geoespacial
              </h2>
              <p className="font-['Inter'] text-xs text-[#909097] mt-0.5">
                Modificar la información descriptiva del estudio
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-lg text-[#909097] hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-lg text-red-200 text-xs font-['Inter'] flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400 text-[18px]">
                error
              </span>
              <span>{error}</span>
            </div>
          )}

          {/* Título */}
          <div className="space-y-1.5">
            <label className="block font-['Inter'] text-xs font-semibold text-[#bec6e0]">
              Título del Análisis <span className="text-[#ec6a06]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Mapa Topográfico Q3 2023"
              className="w-full bg-[#1c2b3c]/80 border border-white/10 focus:border-[#7bd0ff] rounded-lg px-3.5 py-2 text-sm text-[#d4e4fa] placeholder-[#909097] font-['Inter'] outline-none transition-colors"
            />
          </div>

          {/* Ciudad */}
          <div className="space-y-1.5">
            <label className="block font-['Inter'] text-xs font-semibold text-[#bec6e0]">
              Ciudad / Región <span className="text-[#ec6a06]">*</span>
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ej: Santiago, Madrid"
              className="w-full bg-[#1c2b3c]/80 border border-white/10 focus:border-[#7bd0ff] rounded-lg px-3.5 py-2 text-sm text-[#d4e4fa] placeholder-[#909097] font-['Inter'] outline-none transition-colors"
            />
          </div>

          {/* Categoría */}
          <div className="space-y-1.5">
            <label className="block font-['Inter'] text-xs font-semibold text-[#bec6e0]">
              Categoría Geoespacial <span className="text-[#ec6a06]">*</span>
            </label>
            {loadingCategories ? (
              <div className="w-full bg-[#1c2b3c] border border-white/10 rounded-lg px-3.5 py-2 text-xs text-[#909097] font-['Inter'] flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 border-2 border-[#7bd0ff]/40 border-t-[#7bd0ff] rounded-full animate-spin" />
                Cargando categorías...
              </div>
            ) : (
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full bg-[#1c2b3c] border border-white/10 focus:border-[#7bd0ff] rounded-lg px-3.5 py-2 text-sm text-[#d4e4fa] font-['Inter'] outline-none transition-colors cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Video URL */}
          <div className="space-y-1.5">
            <label className="block font-['Inter'] text-xs font-semibold text-[#bec6e0]">
              URL de Video (YouTube / Vimeo / MP4) <span className="text-[#909097] font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtu.be/... o URL de archivo de video"
              className="w-full bg-[#1c2b3c]/80 border border-white/10 focus:border-[#7bd0ff] rounded-lg px-3.5 py-2 text-sm text-[#d4e4fa] placeholder-[#909097] font-['Inter'] outline-none transition-colors"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="block font-['Inter'] text-xs font-semibold text-[#bec6e0]">
              Descripción Técnica <span className="text-[#ec6a06]">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción detallada de la metodología o hallazgos..."
              className="w-full bg-[#1c2b3c]/80 border border-white/10 focus:border-[#7bd0ff] rounded-lg px-3.5 py-2 text-sm text-[#d4e4fa] placeholder-[#909097] font-['Inter'] outline-none transition-colors resize-none"
            />
          </div>

          {/* Acciones */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-['Inter'] font-medium text-[#bec6e0] hover:text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || loadingCategories}
              className="flex items-center gap-2 bg-[#ec6a06] hover:bg-[#ffb690] hover:text-[#552100] text-white font-['Inter'] font-semibold text-xs py-2 px-4 rounded-lg shadow-md shadow-[#ec6a06]/25 transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    check
                  </span>
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
