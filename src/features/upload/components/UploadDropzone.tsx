import React, { useEffect, useRef, useState } from 'react';

interface UploadDropzoneProps {
  label: string;
  fileType: 'image' | 'pdf' | 'video';
  file: File | null;
  onFileChange: (file: File | null) => void;
  maxSizeMB?: number;
  helperText?: string;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  label,
  fileType,
  file,
  onFileChange,
  maxSizeMB = 25,
  helperText,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Derivar URL de vista previa mediante useMemo sin llamar setState en un effect
  const previewUrl = React.useMemo(() => {
    if (file && fileType === 'image') {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file, fileType]);

  // Limpieza de URL de objeto creada al desmontar o cambiar archivo
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);


  // Validación estricta de extensiones y tipos MIME
  const validateAndSetFile = (candidateFile: File) => {
    setErrorMessage(null);

    // Validación de tipo de archivo
    if (fileType === 'image') {
      const isImageMime = candidateFile.type.startsWith('image/');
      const isImageExt = /\.(png|jpe?g|webp|tiff?|bmp|svg)$/i.test(
        candidateFile.name
      );
      if (!isImageMime && !isImageExt) {
        setErrorMessage(
          `Formato inválido: "${candidateFile.name}". Solo se admiten archivos de imagen (PNG, JPG, WEBP, TIFF).`
        );
        onFileChange(null);
        return false;
      }
    } else if (fileType === 'pdf') {
      const isPdfMime = candidateFile.type === 'application/pdf';
      const isPdfExt = /\.pdf$/i.test(candidateFile.name);
      if (!isPdfMime && !isPdfExt) {
        setErrorMessage(
          `Formato inválido: "${candidateFile.name}". Solo se admiten documentos en formato PDF (.pdf).`
        );
        onFileChange(null);
        return false;
      }
    } else if (fileType === 'video') {
      const isVideoMime = candidateFile.type.startsWith('video/');
      const isVideoExt = /\.(mp4|webm|ogg|mov|mkv)$/i.test(candidateFile.name);
      if (!isVideoMime && !isVideoExt) {
        setErrorMessage(
          `Formato inválido: "${candidateFile.name}". Solo se admiten archivos de video (MP4, WEBM, MOV).`
        );
        onFileChange(null);
        return false;
      }
    }

    // Validación de tamaño máximo
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (candidateFile.size > maxSizeBytes) {
      setErrorMessage(
        `El archivo excede el límite de ${maxSizeMB}MB (${(
          candidateFile.size /
          (1024 * 1024)
        ).toFixed(1)}MB).`
      );
      onFileChange(null);
      return false;
    }

    onFileChange(candidateFile);
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndSetFile(selected);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
    setErrorMessage(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const acceptAttribute =
    fileType === 'image'
      ? 'image/*'
      : fileType === 'video'
      ? 'video/*,.mp4,.webm,.mov'
      : '.pdf,application/pdf';

  const defaultHelper =
    helperText ||
    (fileType === 'image'
      ? 'PNG, JPG, TIFF hasta 25MB'
      : fileType === 'video'
      ? 'MP4, WEBM o MOV hasta 50MB'
      : 'PDF hasta 25MB');

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      <label className="block font-['Inter'] font-semibold text-xs text-[#d4e4fa] uppercase tracking-wider mb-2">
        {label}
      </label>

      {/* Dropzone Container */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 relative group overflow-hidden ${
          isDragOver
            ? 'border-[#7bd0ff] bg-[#7bd0ff]/10 scale-[1.01]'
            : file
            ? 'border-white/20 bg-[#122131]/90'
            : 'border-[#45464d] hover:border-[#7bd0ff] bg-[#122131]/60 hover:bg-[#122131]/90'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptAttribute}
          onChange={handleInputChange}
          className="hidden"
        />

        {file ? (
          /* Visualización del archivo cargado */
          <div className="flex items-center gap-3 w-full text-left py-1">
            {fileType === 'image' && previewUrl ? (
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#1c2b3c] border border-white/10 shrink-0">
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : fileType === 'video' ? (
              <div className="w-12 h-12 rounded-lg bg-[#7bd0ff]/20 border border-[#7bd0ff]/30 flex items-center justify-center text-[#7bd0ff] shrink-0">
                <span className="material-symbols-outlined text-2xl">
                  movie
                </span>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-[#93000a]/20 border border-[#ffb4ab]/20 flex items-center justify-center text-[#ffb4ab] shrink-0">
                <span className="material-symbols-outlined text-2xl">
                  picture_as_pdf
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0 pr-2">
              <p className="font-['Inter'] text-xs font-semibold text-[#d4e4fa] truncate">
                {file.name}
              </p>
              <p className="font-['Inter'] text-[11px] text-[#909097]">
                {formatFileSize(file.size)} • Listo para publicar
              </p>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg bg-[#1c2b3c] hover:bg-[#273647] text-[#909097] hover:text-[#ffb4ab] transition-colors cursor-pointer shrink-0"
              title="Quitar archivo"
            >
              <span className="material-symbols-outlined text-[18px]">
                close
              </span>
            </button>
          </div>
        ) : (
          /* Estado vacío para subir */
          <div className="flex flex-col items-center justify-center py-2">
            <span className="material-symbols-outlined text-3xl sm:text-4xl text-[#909097] group-hover:text-[#7bd0ff] mb-2 transition-colors">
              {fileType === 'image'
                ? 'add_photo_alternate'
                : fileType === 'video'
                ? 'videocam'
                : 'picture_as_pdf'}
            </span>
            <span className="font-['Inter'] text-xs sm:text-sm font-medium text-[#c6c6cd] group-hover:text-[#d4e4fa] transition-colors">
              {fileType === 'image'
                ? 'Arrastre la imagen o haga clic'
                : fileType === 'video'
                ? 'Arrastre el video o haga clic'
                : 'Arrastre el PDF de metadatos o haga clic'}
            </span>
            <span className="font-['Inter'] text-[11px] text-[#909097] mt-1">
              {defaultHelper}
            </span>
          </div>
        )}
      </div>

      {/* Mensaje de validación de error */}
      {errorMessage && (
        <div className="mt-2 text-xs text-[#ffb4ab] bg-[#93000a]/20 border border-[#ffb4ab]/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in duration-150">
          <span className="material-symbols-outlined text-[15px] shrink-0">
            warning
          </span>
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
