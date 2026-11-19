import React, { useState, useEffect } from 'react';
import type { GroupedProduct, ProductVariant } from '../types';
import { formatCLP } from '../utils/formatters';
import { EyeOff, Check, Eye } from 'lucide-react';

interface ProductCardProps {
  product: GroupedProduct;
  onOpenDetail: (product: GroupedProduct, variant?: ProductVariant) => void;
  onAddToCart?: (product: GroupedProduct, selectedVariant: ProductVariant) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetail,
}) => {
  const [activeVariant, setActiveVariant] = useState<ProductVariant>(
    product.defaultVariant || product.variants[0]
  );
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setActiveVariant(product.defaultVariant || product.variants[0]);
    setImageError(false);
  }, [product]);

  const handleSelectVariant = (e: React.MouseEvent, variant: ProductVariant) => {
    e.stopPropagation();
    setActiveVariant(variant);
    setImageError(false);
  };

  const displayImage =
    activeVariant.imagen_url ||
    product.variants.find((v) => Boolean(v.imagen_url))?.imagen_url ||
    '';

  const hasImage = Boolean(displayImage && !imageError);
  const isCompletelyOutOfStock = product.totalStock <= 0;
  const isVariantOutOfStock = activeVariant.stock <= 0;
  const badgeText = product.etiqueta || product.categoria;

  return (
    <article
      onClick={() => onOpenDetail(product, activeVariant)}
      className={`group relative flex flex-col bg-white rounded-xl border border-[#E8E2D9] overflow-hidden shadow-2xs hover:shadow-md hover:border-[#B86B52]/50 transition-all duration-200 cursor-pointer ${
        isCompletelyOutOfStock ? 'opacity-85' : ''
      }`}
    >
      {/* Contenedor Cuadrado de la Imagen */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#FAF6F0] flex items-center justify-center">
        {hasImage ? (
          <img
            key={displayImage}
            src={displayImage}
            alt={`${product.nombre} - ${activeVariant.color}`}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-[#FAF6F0] via-[#F4ECE1] to-[#EAE0D3]">
            <div className="w-10 h-10 rounded-full bg-white/80 border border-[#E8E2D9] flex items-center justify-center shadow-2xs mb-1.5 group-hover:scale-110 transition-transform duration-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="w-5 h-5 text-[#B86B52]"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M4 12c2.5-4 7-6 11-4" />
                <path d="M6 16c3-5 9-6 13-3" />
                <path d="M12 3c-1 3-1 8 1 12" />
                <path d="M8 20c1-3 4-7 8-9" />
              </svg>
            </div>
            <span className="text-[10px] font-serif italic text-[#786F66] line-clamp-1">
              {product.categoria || 'Hilado Artesanal'}
            </span>
            <span className="text-[9px] text-[#A0968A] mt-0.5 line-clamp-1 max-w-[90%] font-medium">
              {product.nombre}
            </span>
          </div>
        )}

        {/* Hover overlay en desktop */}
        <div className="absolute inset-0 bg-[#2D2721]/15 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-[10px] font-semibold text-[#2D2721] shadow-xs transform translate-y-1 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3 h-3 text-[#B86B52]" />
            <span>Ver opciones</span>
          </span>
        </div>

        {/* Etiqueta superior */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {badgeText && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase bg-white/95 backdrop-blur-sm text-[#786F66] border border-[#E8E2D9] shadow-2xs">
              {badgeText}
            </span>
          )}
        </div>

        {/* Sin stock / Agotado */}
        {isCompletelyOutOfStock ? (
          <div className="absolute top-2 right-2 z-10 pointer-events-none">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-[#2D2721]/90 backdrop-blur-sm text-white shadow-2xs">
              <EyeOff className="w-2.5 h-2.5 text-[#E8A598]" />
              Sin stock
            </span>
          </div>
        ) : (
          isVariantOutOfStock && (
            <div className="absolute top-2 right-2 z-10 pointer-events-none">
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[8.5px] sm:text-[9px] font-medium bg-[#8B5E4B]/90 backdrop-blur-sm text-white shadow-2xs">
                Agotado
              </span>
            </div>
          )
        )}
      </div>

      {/* Contenido / Información del Producto */}
      <div className="flex flex-col flex-1 p-2 sm:p-3">
        <h3 className="font-display text-xs sm:text-sm font-semibold text-[#2D2721] line-clamp-1 leading-snug group-hover:text-[#B86B52] transition-colors" title={product.nombre}>
          {product.nombre}
        </h3>

        {product.descripcion && (
          <p className="hidden sm:block text-[10.5px] text-[#786F66] line-clamp-1 mt-0.5 leading-relaxed">
            {product.descripcion}
          </p>
        )}

        <div className="mt-auto pt-2 space-y-1.5">
          {/* Bolitas de Colores */}
          {product.variants.length > 0 && (
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[9.5px] text-[#786F66]">
                <span className="font-medium">
                  {product.variants.length === 1 ? 'Color:' : 'Colores:'}
                </span>
                <span className="text-[#B86B52] font-medium truncate max-w-[90px] sm:max-w-[120px]">
                  {activeVariant.color}
                </span>
              </div>

              {/* Bolitas clicables */}
              <div
                className="flex items-center gap-1 sm:gap-1.5 flex-wrap"
                onClick={(e) => e.stopPropagation()}
              >
                {product.variants.map((variant) => {
                  const isSelected = activeVariant.id === variant.id;
                  const isOutOfStock = variant.stock <= 0;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={(e) => handleSelectVariant(e, variant)}
                      title={`${variant.color}${
                        isOutOfStock
                          ? ' - Sin stock'
                          : ` (${variant.stock} disponibles)`
                      }`}
                      aria-label={`Color ${variant.color}${
                        isOutOfStock ? ' sin stock' : ''
                      }`}
                      className={`relative w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all duration-150 focus:outline-none flex items-center justify-center ${
                        isOutOfStock
                          ? 'opacity-40 hover:opacity-75 cursor-pointer'
                          : 'hover:scale-115'
                      } ${
                        isSelected
                          ? 'ring-1.5 ring-offset-1 ring-[#B86B52] scale-105'
                          : 'hover:ring-1 hover:ring-[#E8E2D9]'
                      }`}
                      style={{
                        backgroundColor: variant.color_hex,
                        boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      {isOutOfStock && (
                        <span
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          aria-hidden="true"
                        >
                          <span className="w-[120%] h-[1px] bg-[#B84030] rotate-45 transform" />
                        </span>
                      )}

                      {isSelected && !isOutOfStock && (
                        <span className="pointer-events-none">
                          <Check
                            className={`w-2 h-2 ${
                              variant.color_hex.toLowerCase() === '#ffffff' ||
                              variant.color_hex.toLowerCase() === '#f5f5dc'
                                ? 'text-[#2D2721]'
                                : 'text-white'
                            }`}
                            strokeWidth={3}
                          />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Precio y Botón "Opciones" */}
          <div className="flex items-center justify-between pt-1.5 border-t border-[#F0EAE1] gap-1">
            <div className="flex flex-col">
              <span className="text-[8.5px] uppercase tracking-wider text-[#A0968A] font-medium leading-none">
                Precio
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xs sm:text-sm font-bold tracking-tight text-[#2D2721]">
                  {formatCLP(activeVariant.precio)}
                </span>
                {activeVariant.precio_anterior &&
                  activeVariant.precio_anterior > activeVariant.precio && (
                    <span className="text-[9px] text-[#A0968A] line-through hidden sm:inline">
                      {formatCLP(activeVariant.precio_anterior)}
                    </span>
                  )}
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(product, activeVariant);
              }}
              className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9.5px] sm:text-[10.5px] font-semibold rounded-full bg-[#B86B52] hover:bg-[#9E553E] active:scale-95 text-white transition-all shadow-2xs whitespace-nowrap"
            >
              {isCompletelyOutOfStock ? 'Ver' : 'Opciones'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
