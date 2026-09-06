import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TopNavBar } from '../../components/ui/TopNavBar';
import { analysesService } from '../../services/analyses.service';
import { categoriesService } from '../../services/categories.service';
import type { Category } from '../../types/category';
import { UploadDropzone } from './components/UploadDropzone';

export const UploadAnalysisScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectParam = searchParams.get('project') || undefined;

  // Estados del formulario
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [description, setDescription] = useState('');

  // Estados de archivos y multimedia
  const [imageBefore, setImageBefore] = useState<File | null>(null);
  const [imageAfter, setImageAfter] = useState<File | null>(null);
  const [pdfReport, setPdfReport] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Estados de carga y progreso
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoadingCategories(true);

    categoriesService
      .getCategories('analysis')
      .then((cats) => {
        if (isMounted) {
          setCategories(cats);
          if (cats.length > 0) {
            setCategorySlug(cats[0].slug);
          }
        }
      })
      .catch((err) => {
        console.error('Error al obtener categorías de análisis:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validación básica requerida
    if (!title.trim()) {
      setFormError('Por favor ingresa un título descriptivo para el análisis.');
      return;
    }
    if (!city.trim()) {
      setFormError('Por favor indica la ciudad o región del estudio geoespacial.');
      return;
    }
    if (!categorySlug) {
      setFormError('Por favor selecciona una categoría geoespacial.');
      return;
    }
    if (!description.trim()) {
      setFormError('Por favor redacta una breve descripción técnica o metodología.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      const created = await analysesService.createAnalysis(
        {
          title: title.trim(),
          description: description.trim(),
          city: city.trim(),
          category_slug: categorySlug,
          projectSlug: projectParam,
          videoUrl: videoUrl.trim() || undefined,
          videoFile: videoFile,
          imageBeforeFile: imageBefore,
          imageAfterFile: imageAfter,
          pdfReportFile: pdfReport,
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Limpieza de archivos locales para liberar memoria del navegador
      setImageBefore(null);
      setImageAfter(null);
      setPdfReport(null);
      setVideoFile(null);

      setSuccessMessage(
        `¡Análisis "${created.title}" publicado con éxito! Redirigiendo a su visualizador...`
      );

      // Redirigir a la vista de detalle por slug
      setTimeout(() => {
        navigate(`/analisis/${created.slug}`);
      }, 1200);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al publicar el análisis en el servidor.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex flex-col font-['Inter'] antialiased overflow-x-hidden">
      {/* TopNavBar con navegación de retorno */}
      <TopNavBar
        isDetailView={true}
        backLabel={projectParam ? 'Volver al Proyecto' : 'Volver a Proyectos'}
        onBackClick={() =>
          navigate(projectParam ? `/proyectos/${projectParam}` : '/')
        }
        onBrandClick={() => navigate('/')}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex flex-col justify-center">
        {/* Encabezado */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#ec6a06]" />
            <span className="text-[11px] font-semibold text-[#ffb690] uppercase tracking-wider">
              Gestión y Publicación de Contenido
            </span>
          </div>
          <h1 className="font-['Montserrat'] font-bold text-3xl sm:text-4xl text-[#d4e4fa] mb-2 tracking-tight">
            Subir Nuevo Análisis
          </h1>
          <p className="font-['Inter'] text-sm sm:text-base text-[#c6c6cd]">
            Completa la información, sube las imágenes para la comparación multitemporal y adjunta el reporte técnico en PDF.
          </p>
        </header>

        {/* Notificación de Éxito */}
        {successMessage && (
          <div className="mb-6 bg-[#001a27] border border-[#7bd0ff]/40 text-[#7bd0ff] px-4 py-3 rounded-xl text-sm flex items-center gap-2.5 shadow-lg animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-xl text-[#7bd0ff]">
              check_circle
            </span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Alerta de Error de Validación */}
        {formError && (
          <div className="mb-6 bg-[#93000a]/20 border border-[#ffb4ab]/40 text-[#ffdad6] px-4 py-3 rounded-xl text-sm flex items-center gap-2.5 shadow-lg animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-xl text-[#ffb4ab]">
              error
            </span>
            <span>{formError}</span>
          </div>
        )}

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="glass-panel rounded-2xl p-6 sm:p-10 shadow-2xl border border-white/10 w-full flex flex-col gap-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Columna Izquierda: Información Descriptiva */}
            <div className="space-y-5">
              {/* Título */}
              <div>
                <label
                  htmlFor="titulo"
                  className="block font-['Inter'] font-semibold text-xs text-[#d4e4fa] uppercase tracking-wider mb-2"
                >
                  Título del Análisis <span className="text-[#ec6a06]">*</span>
                </label>
                <input
                  id="titulo"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Mapa Topográfico Q3 2023"
                  className="w-full bg-[#1c2b3c]/80 focus:bg-[#122131] border border-white/10 focus:border-[#7bd0ff] rounded-lg px-4 py-3 text-[#d4e4fa] placeholder-[#909097] text-sm font-['Inter'] transition-colors outline-none shadow-inner"
                />
              </div>

              {/* Ciudad / Región */}
              <div>
                <label
                  htmlFor="ciudad"
                  className="block font-['Inter'] font-semibold text-xs text-[#d4e4fa] uppercase tracking-wider mb-2"
                >
                  Ciudad / Región <span className="text-[#ec6a06]">*</span>
                </label>
                <input
                  id="ciudad"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ej: Santiago, Madrid"
                  className="w-full bg-[#1c2b3c]/80 focus:bg-[#122131] border border-white/10 focus:border-[#7bd0ff] rounded-lg px-4 py-3 text-[#d4e4fa] placeholder-[#909097] text-sm font-['Inter'] transition-colors outline-none shadow-inner"
                />
              </div>

              {/* Categoría (Dinámica) */}
              <div>
                <label
                  htmlFor="categoria"
                  className="block font-['Inter'] font-semibold text-xs text-[#d4e4fa] uppercase tracking-wider mb-2"
                >
                  Categoría Geoespacial <span className="text-[#ec6a06]">*</span>
                </label>
                {loadingCategories ? (
                  <div className="w-full bg-[#1c2b3c]/80 border border-white/10 rounded-lg px-4 py-3 text-xs text-[#909097] flex items-center gap-2">
                    <span className="inline-block w-3.5 h-3.5 border-2 border-[#7bd0ff]/40 border-t-[#7bd0ff] rounded-full animate-spin" />
                    Cargando categorías...
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      id="categoria"
                      value={categorySlug}
                      onChange={(e) => setCategorySlug(e.target.value)}
                      className="w-full bg-[#1c2b3c]/80 focus:bg-[#122131] border border-white/10 focus:border-[#7bd0ff] rounded-lg px-4 py-3 text-[#d4e4fa] text-sm font-['Inter'] transition-colors outline-none appearance-none cursor-pointer pr-10"
                    >
                      {categories.map((cat) => (
                        <option key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#909097] pointer-events-none text-xl">
                      expand_more
                    </span>
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label
                  htmlFor="descripcion"
                  className="block font-['Inter'] font-semibold text-xs text-[#d4e4fa] uppercase tracking-wider mb-2"
                >
                  Descripción Técnica <span className="text-[#ec6a06]">*</span>
                </label>
                <textarea
                  id="descripcion"
                  rows={5}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descripción del origen de los datos satelitales, fechas de toma y metodología empleada..."
                  className="w-full bg-[#1c2b3c]/80 focus:bg-[#122131] border border-white/10 focus:border-[#7bd0ff] rounded-lg px-4 py-3 text-[#d4e4fa] placeholder-[#909097] text-sm font-['Inter'] transition-colors outline-none resize-none shadow-inner"
                />
              </div>
            </div>

            {/* Columna Derecha: Zonas de Carga Multimedia (Validación image/* y .pdf) */}
            <div className="space-y-4">
              {/* Imagen Histórica (Antes) */}
              <UploadDropzone
                label="Imagen Histórica (Antes)"
                fileType="image"
                file={imageBefore}
                onFileChange={setImageBefore}
                helperText="PNG, JPG, WEBP o TIFF hasta 25MB"
              />

              {/* Imagen Actual (Después) */}
              <UploadDropzone
                label="Imagen Actual (Después)"
                fileType="image"
                file={imageAfter}
                onFileChange={setImageAfter}
                helperText="PNG, JPG, WEBP o TIFF hasta 25MB"
              />

              {/* Documento Técnico PDF */}
              <UploadDropzone
                label="Subir PDF (Documentación Técnica)"
                fileType="pdf"
                file={pdfReport}
                onFileChange={setPdfReport}
                helperText="Documento PDF técnico hasta 25MB"
              />

              {/* Recorrido en Video (Opcional - Requerimiento de Cliente) */}
              <div className="space-y-3 p-4 rounded-xl bg-[#122131]/80 border border-white/10 shadow-inner">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#7bd0ff]">
                    videocam
                  </span>
                  <span className="text-xs font-['Inter'] font-semibold text-[#d4e4fa] uppercase tracking-wider">
                    Recorrido en Video (Dron / Vuelo Virtual)
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="videoUrl"
                    className="block text-[11px] font-['Inter'] font-medium text-[#bec6e0] mb-1"
                  >
                    URL de Video (YouTube, Vimeo o archivo MP4/WEBM)
                  </label>
                  <input
                    id="videoUrl"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://... (ej: https://youtu.be/... o archivo .mp4)"
                    className="w-full bg-[#1c2b3c]/80 focus:bg-[#122131] border border-white/10 focus:border-[#7bd0ff] rounded-lg px-3.5 py-2.5 text-[#d4e4fa] placeholder-[#909097] text-xs font-['Inter'] transition-colors outline-none"
                  />
                </div>

                <div className="text-center text-[10px] text-[#909097] font-['Inter'] uppercase tracking-widest my-1">
                  o cargar archivo de video directamente
                </div>

                <UploadDropzone
                  label="Archivo de Video"
                  fileType="video"
                  file={videoFile}
                  onFileChange={setVideoFile}
                  maxSizeMB={50}
                  helperText="MP4, WEBM o MOV hasta 50MB"
                />
              </div>
            </div>
          </div>

          {/* Barra de Progreso de Subida */}
          {isSubmitting && (
            <div className="pt-2">
              <div className="flex justify-between items-center text-xs font-['Inter'] mb-1.5">
                <span className="text-[#7bd0ff] font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#7bd0ff] animate-ping" />
                  Subiendo archivos pesados al almacenamiento de objetos...
                </span>
                <span className="font-mono text-[#bec6e0]">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#1c2b3c] rounded-full overflow-hidden">
                <div
                  style={{ width: `${uploadProgress}%` }}
                  className="h-full bg-gradient-to-r from-[#7bd0ff] to-[#ec6a06] transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-lg text-xs font-['Inter'] font-semibold text-[#c6c6cd] hover:text-[#d4e4fa] hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingCategories}
              className="px-6 py-2.5 rounded-lg font-['Inter'] font-semibold text-xs bg-[#ec6a06] hover:bg-[#ffb690] hover:text-[#552100] text-white transition-all shadow-md shadow-[#ec6a06]/20 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">
                upload
              </span>
              <span>{isSubmitting ? 'Publicando...' : 'Publicar Análisis'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
