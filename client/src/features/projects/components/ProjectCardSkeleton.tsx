import React from 'react';

export const ProjectCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#122131]/60 border border-white/5 rounded-xl overflow-hidden shadow-md animate-pulse flex flex-col">
      {/* Contenedor de Imagen Skeleton */}
      <div className="relative aspect-[16/9] w-full bg-[#1c2b3c]/60" />

      {/* Contenedor de Texto Skeleton */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2.5">
          <div className="h-5 bg-[#1c2b3c] rounded w-3/4" />
          <div className="h-3 bg-[#1c2b3c]/60 rounded w-full" />
          <div className="h-3 bg-[#1c2b3c]/40 rounded w-5/6" />
        </div>

        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="h-3.5 bg-[#1c2b3c]/50 rounded w-24" />
          <div className="h-3.5 bg-[#1c2b3c]/70 rounded w-20" />
        </div>
      </div>
    </div>
  );
};
