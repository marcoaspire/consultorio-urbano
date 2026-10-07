import React from 'react';

export const AnalysisCardSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col border border-white/5 animate-pulse">
      {/* Thumbnail Area Skeleton */}
      <div className="h-48 bg-[#1c2b3c]/60 relative">
        <div className="absolute top-4 left-4 w-20 h-6 bg-[#273647] rounded-full" />
      </div>

      {/* Content Area Skeleton */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Category line */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 rounded bg-[#273647]" />
          <div className="w-24 h-3 rounded bg-[#273647]" />
        </div>

        {/* Title skeleton */}
        <div className="w-3/4 h-5 rounded bg-[#273647] mb-3" />

        {/* Description skeletons */}
        <div className="space-y-2 mb-6 flex-1">
          <div className="w-full h-3 rounded bg-[#1c2b3c]" />
          <div className="w-5/6 h-3 rounded bg-[#1c2b3c]" />
          <div className="w-2/3 h-3 rounded bg-[#1c2b3c]" />
        </div>

        {/* Footer line */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="w-16 h-3 rounded bg-[#273647]" />
          <div className="w-4 h-4 rounded bg-[#273647]" />
        </div>
      </div>
    </div>
  );
};
