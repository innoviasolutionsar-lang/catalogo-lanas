import React, { useState, useEffect } from 'react';
import type { GroupedProduct, ProductVariant } from '../types';
import { formatCLP } from '../utils/formatters';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  CreditCard,
  EyeOff,
  ExternalLink,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: GroupedProduct | null;
  initialVariant?: ProductVariant;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    product: GroupedProduct,
    variant: ProductVariant,
    quantity: number
  ) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  initialVariant,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen || !product) return null;

  const getDefaultVariant = () => {
    if (initialVariant) return initialVariant;
    const withStock = product.variants.find((v) => v.stock > 0);
    return withStock || product.variants[0];
  };

  const [activeVariant, setActiveVariant] = useState<ProductVariant>(getDefaultVariant);
  const [quantity, setQuantity] = useState<number>(1);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const selected = getDefaultVariant();
    setActiveVariant(selected);
    setImageError(false);
    setQuantity(selected && selected.stock > 0 ? 1 : 0);
  }, [product, initialVariant]);

  const handleVariantChange = (variant: ProductVariant) => {
    setActiveVariant(variant);
    setImageError(false);
    if (variant.stock <= 0) {
      setQuantity(0);
    } else {
      setQuantity(1);
    }
  };

  const handleQuantityDelta = (delta: number) => {
    if (activeVariant.stock <= 0) return;
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > activeVariant.stock) return activeVariant.stock;
      return next;
    });
  };

  const handleAdd = () => {
    if (activeVariant.stock <= 0 || quantity <= 0) return;
    onAddToCart(product, activeVariant, quantity);
  };

  const displayImage =
    activeVariant.imagen_url ||
    product.variants.find((v) => Boolean(v.imagen_url))?.imagen_url ||
    '';

  const hasImage = Boolean(displayImage && !imageError);
  const isOutOfStock = activeVariant.stock <= 0;
  const isProductOutOfStock = product.totalStock <= 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2D2721]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card más compacto */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-[#E8E2D9] shadow-xl overflow-hidden z-10 my-4">
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle"
          className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-white/80 hover:bg-white text-[#786F66] hover:text-[#2D2721] border border-[#E8E2D9] shadow-2xs transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Columna Izquierda: Imagen */}
          <div className="relative aspect-square w-full bg-[#FAF6F0] flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-[#E8E2D9]">
            {hasImage ? (
              <img
                key={displayImage}
                src={displayImage}
                alt={`${product.nombre} - ${activeVariant.color}`}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#FAF6F0] via-[#F4ECE1] to-[#EAE0D3]">
                <div className="w-14 h-14 rounded-full bg-white/90 border border-[#E8E2D9] flex items-center justify-center shadow-2xs mb-2">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="w-7 h-7 text-[#B86B52]"
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
                <span className="text-xs font-serif italic text-[#786F66]">
                  {product.categoria}
                </span>
                <span className="text-[11px] text-[#A0968A] mt-0.5 font-medium">
                  {product.nombre}
                </span>
              </div>
            )}

            {/* Badges superiores */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
              {product.categoria && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/90 text-[#786F66] border border-[#E8E2D9] shadow-2xs">
                  {product.categoria}
                </span>
              )}
            </div>

            {isProductOutOfStock && (
              <div className="absolute top-3 right-11 z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#2D2721]/90 text-white shadow-2xs">
                  <EyeOff className="w-3 h-3 text-[#E8A598]" />
                  Sin stock
                </span>
              </div>
            )}
          </div>

          {/* Columna Derecha: Información y Opciones de compra */}
          <div className="p-4 sm:p-5 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Código y Nombre */}
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-[#A0968A]">
                  Código: {product.codigo_producto}
                </span>
                <h2 className="font-display text-lg sm:text-xl font-semibold text-[#2D2721] mt-0.5 leading-tight">
                  {product.nombre}
                </h2>
              </div>

              {/* Precios */}
              <div className="flex items-baseline gap-2 pt-0.5">
                <span className="text-xl sm:text-2xl font-bold text-[#2D2721]">
                  {formatCLP(activeVariant.precio)}
                </span>
                {activeVariant.precio_anterior &&
                  activeVariant.precio_anterior > activeVariant.precio && (
                    <span className="text-xs text-[#A0968A] line-through font-medium">
                      {formatCLP(activeVariant.precio_anterior)}
                    </span>
                  )}
              </div>

              {/* Descripción */}
              {product.descripcion && (
                <p className="text-xs text-[#786F66] leading-relaxed line-clamp-3">
                  {product.descripcion}
                </p>
              )}

              {/* Selector de variantes / colores */}
              <div className="pt-2 border-t border-[#F0EAE1] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#2D2721]">
                    Color:
                  </span>
                  {isOutOfStock ? (
                    <span className="text-[11px] font-semibold text-[#C53030]">
                      Sin stock en este color
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#786F66]">
                      <strong className="text-[#2D2721]">{activeVariant.color}</strong> — Stock:{' '}
                      <strong className="text-[#B86B52]">{activeVariant.stock}</strong> u.
                    </span>
                  )}
                </div>

                {/* Bolitas de colores */}
                <div className="flex items-center gap-2 flex-wrap pt-0.5">
                  {product.variants.map((v) => {
                    const isSelected = activeVariant.id === v.id;
                    const variantOutOfStock = v.stock <= 0;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleVariantChange(v)}
                        title={`${v.color} - ${
                          variantOutOfStock
                            ? 'Sin stock'
                            : `${v.stock} disponibles`
                        }`}
                        className={`relative w-5.5 h-5.5 rounded-full transition-all duration-150 focus:outline-none flex items-center justify-center ${
                          variantOutOfStock
                            ? 'opacity-40 hover:opacity-75 cursor-pointer'
                            : 'hover:scale-110'
                        } ${
                          isSelected
                            ? 'ring-1.5 ring-offset-1 ring-[#B86B52] scale-105'
                            : 'hover:ring-1 hover:ring-[#E8E2D9]'
                        }`}
                        style={{
                          backgroundColor: v.color_hex,
                          boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        {variantOutOfStock && (
                          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="w-[120%] h-[1px] bg-[#B84030] rotate-45 transform" />
                          </span>
                        )}

                        {isSelected && !variantOutOfStock && (
                          <Check
                            className={`w-3 h-3 ${
                              v.color_hex.toLowerCase() === '#ffffff' ||
                              v.color_hex.toLowerCase() === '#f5f5dc'
                                ? 'text-[#2D2721]'
                                : 'text-white'
                            }`}
                            strokeWidth={3}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selector de Cantidad */}
              <div className="pt-2 border-t border-[#F0EAE1] flex items-center justify-between">
                <span className="text-xs font-medium text-[#2D2721]">
                  Cantidad:
                </span>

                <div className="flex items-center border border-[#E8E2D9] rounded-lg overflow-hidden bg-[#FAF8F5]">
                  <button
                    type="button"
                    disabled={isOutOfStock || quantity <= 1}
                    onClick={() => handleQuantityDelta(-1)}
                    className="px-2 py-1 text-[#786F66] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-semibold text-[#2D2721]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={isOutOfStock || quantity >= activeVariant.stock}
                    onClick={() => handleQuantityDelta(1)}
                    className="px-2 py-1 text-[#786F66] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Acciones de compra */}
            <div className="pt-4 space-y-2">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAdd}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-all ${
                  isOutOfStock
                    ? 'bg-[#E8E2D9] text-[#A0968A] cursor-not-allowed'
                    : 'bg-[#B86B52] hover:bg-[#9E553E] active:scale-[0.99] text-white hover:shadow-xs'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>
                  {isOutOfStock ? 'Sin stock en este color' : 'Agregar al carrito'}
                </span>
              </button>

              {activeVariant.link_mp && (
                <a
                  href={activeVariant.link_mp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 bg-[#009EE3]/10 hover:bg-[#009EE3]/20 text-[#0081BA] border border-[#009EE3]/30 transition-colors shadow-2xs"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Comprar directo con Mercado Pago</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
