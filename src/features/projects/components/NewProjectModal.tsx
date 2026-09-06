import React, { useEffect, useState } from 'react';
import { categoriesService } from '../../../services/categories.service';
import type { Category } from '../../../types/category';
import type { CreateProjectDTO } from '../../../types/project';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateProjectDTO) => Promise<void>;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoadingCategories(true);

    categoriesService
      .getCategories('project')
      .then((cats) => {
        if (isMounted) {
          setCategories(cats);
          if (cats.length > 0) {
            setCategorySlug(cats[0].slug);
          }
        }
      })
      .catch((err) => {
        console.error('Error al cargar categorías de proyecto:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre del proyecto o terreno es obligatorio.');
      return;
    }

    if (!location.trim()) {
      setError('La ciudad o ubicación es obligatoria.');
      return;
    }

    if (!categorySlug) {
      setError('Debes seleccionar una categoría.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        location: location.trim(),
        category_slug: categorySlug,
        description: description.trim() || undefined,
      });
      // Resetear estado
      setName('');
      setLocation('');
      setDescription('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al registrar el proyecto'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051424]/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Contenedor del Modal Glassmorphism */}
      <div
        className="w-full max-w-lg bg-[#0c1c2e]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Encabezado del Modal */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#122131]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ec6a06]/15 border border-[#ec6a06]/30 flex items-center justify-center text-[#ec6a06]">
              <span className="material-symbols-outlined text-[20px]">
                add_location_alt
              </span>
            </div>
            <div>
              <h2
                id="modal-title"
                className="font-['Montserrat'] font-bold text-lg text-[#d4e4fa] leading-tight"
              >
                Nuevo Proyecto / Terreno
              </h2>
              <p className="font-['Inter'] text-xs text-[#909097] mt-0.5">
                Nivel 1: Registrar nuevo territorio en el portafolio
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
          {/* Mensaje de Error */}
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-lg text-red-200 text-xs font-['Inter'] flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400 text-[18px]">
                error
              </span>
              <span>{error}</span>
            </div>
          )}

          {/* 1. Nombre del Proyecto / Terreno (Obligatorio) */}
          <div className="space-y-1.5">
            <label className="block font-['Inter'] text-xs font-semibold text-[#bec6e0]">
              Nombre del Proyecto / Terreno <span className="text-[#ec6a06]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Evaluación de Terreno B-42, Polígono Norte..."
              className="w-full bg-[#1c2b3c]/80 border border-white/10 focus:border-[#7bd0ff] rounded-lg px-3.5 py-2 text-sm text-[#d4e4fa] placeholder-[#909097] font-['Inter'] outline-none transition-colors"
            />
          </div>

          {/* 2. Ciudad / Ubicación (Obligatorio) */}
          <div className="space-y-1.5">
            <label className="block font-['Inter'] text-xs font-semibold text-[#bec6e0]">
              Ciudad / Ubicación <span className="text-[#ec6a06]">*</span>
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#909097] text-[18px] pointer-events-none">
                pin_drop
              </span>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Santiago, Chile / Medellín, Colombia..."
                className="w-full bg-[#1c2b3c]/80 border border-white/10 focus:border-[#7bd0ff] rounded-lg pl-9 pr-3.5 py-2 text-sm text-[#d4e4fa] placeholder-[#909097] font-['Inter'] outline-none transition-colors"
              />
            </div>
          </div>

          {/* 3. Categoría Principal (Selector Dinámico) */}
          <div className="space-y-1.5">
            <label className="block font-['Inter'] text-xs font-semibold text-[#bec6e0]">
              Categoría Principal <span className="text-[#ec6a06]">*</span>
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

          {/* 4. Descripción General (Opcional) */}
          <div className="space-y-1.5">
            <label className="block font-['Inter'] text-xs font-semibold text-[#bec6e0]">
              Descripción General <span className="text-[#909097] font-normal">(opcional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve reseña sobre el objetivo de análisis territorial, área de interés o antecedentes..."
              className="w-full bg-[#1c2b3c]/80 border border-white/10 focus:border-[#7bd0ff] rounded-lg px-3.5 py-2 text-sm text-[#d4e4fa] placeholder-[#909097] font-['Inter'] outline-none transition-colors resize-none"
            />
          </div>

          {/* Botones de Acción */}
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
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    check
                  </span>
                  <span>Crear Proyecto</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
