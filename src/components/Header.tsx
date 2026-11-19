import React from 'react';
import { Search, ShoppingBag, X } from 'lucide-react';
import { STORE_NAME } from '../config';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cartCount: number;
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  cartCount,
  onOpenCart,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D9] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo y Nombre de la Tienda */}
          <div className="flex flex-col">
            <a
              href="#"
              className="group inline-flex items-baseline gap-1 focus:outline-none"
            >
              <span className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#2D2721] group-hover:text-[#B86B52] transition-colors">
                {STORE_NAME}
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#B86B52]"></span>
            </a>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#786F66] font-medium hidden sm:inline-block">
              Lanera Artesanal & Hilados
            </span>
          </div>

          {/* Barra de búsqueda */}
          <div className="flex-1 max-w-xs sm:max-w-sm mx-1 sm:mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#786F66]">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por lana, grosor..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-[#E8E2D9] rounded-full text-[#2D2721] placeholder-[#A0968A] focus:outline-none focus:border-[#B86B52] focus:ring-1 focus:ring-[#B86B52]/20 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#A0968A] hover:text-[#2D2721] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Botón de Carrito con Contador */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCart}
              className="relative inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-[#FDF9F7] active:bg-[#F8EFEA] border border-[#E8E2D9] hover:border-[#B86B52]/40 text-[#2D2721] rounded-full text-xs font-medium transition-all shadow-2xs group"
              aria-label={`Ver carrito de compras con ${cartCount} productos`}
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-[#786F66] group-hover:text-[#B86B52] transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-[#B86B52] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50 duration-200">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline-block text-[#2D2721] font-medium text-[11px]">
                Mi Carrito
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
