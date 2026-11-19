import React from 'react';

interface ProductSkeletonProps {
  count?: number;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden p-0 flex flex-col shadow-2xs"
        >
          {/* Skeleton Cuadrado de la Imagen */}
          <div className="aspect-square w-full bg-[#F3EFEA] animate-shimmer relative">
            <div className="absolute top-2 left-2 w-10 h-3.5 rounded-full bg-[#E5DED4]/60" />
          </div>

          {/* Skeleton del Contenido */}
          <div className="p-2 sm:p-2.5 flex flex-col flex-1 space-y-1.5">
            <div className="h-3.5 bg-[#F3EFEA] rounded w-4/5 animate-shimmer" />

            <div className="pt-1.5 space-y-1">
              <div className="flex gap-1">
                <div className="w-3.5 h-3.5 rounded-full bg-[#F3EFEA] animate-shimmer" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#F3EFEA] animate-shimmer" />
              </div>
            </div>

            <div className="pt-1.5 border-t border-[#F0EAE1] flex items-center justify-between">
              <div className="h-3.5 bg-[#F3EFEA] rounded w-12 animate-shimmer" />
              <div className="h-5 bg-[#F3EFEA] rounded-full w-12 animate-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
