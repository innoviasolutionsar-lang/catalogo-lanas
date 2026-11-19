import React from 'react';
import type { FilterState, SortOption, GroupedProduct } from '../types';
import {
  RotateCcw,
  SlidersHorizontal,
  Tag,
  DollarSign,
  Layers,
  ArrowDownUp,
  X,
} from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
  products: GroupedProduct[];
  isMobileModal?: boolean;
  onCloseMobile?: () => void;
  totalFilteredCount?: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  products,
  isMobileModal = false,
  onCloseMobile,
  totalFilteredCount,
}) => {
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      Todas: products.length,
    };
    products.forEach((p) => {
      const cat = p.categoria || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  const categories = Object.keys(categoryCounts);

  const hasActiveFilters =
    filters.category !== 'Todas' ||
    filters.minPrice !== '' ||
    filters.maxPrice !== '' ||
    filters.onlyOnSale ||
    filters.hideOutOfStock ||
    filters.sortBy !== 'destacados';

  const content = (
    <div className="space-y-4 text-[#2D2721]">
      {/* Título de la sección de filtros */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D9]">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#B86B52]" />
          <h3 className="font-display font-semibold text-sm">
            Filtros
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] text-[#B86B52] hover:text-[#9E553E] font-medium flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* 1. Ordenamiento */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold tracking-wider uppercase text-[#786F66] flex items-center gap-1">
          <ArrowDownUp className="w-3 h-3 text-[#B86B52]" />
          <span>Ordenar por</span>
        </label>
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange('sortBy', e.target.value as SortOption)
            }
            className="w-full text-xs bg-white border border-[#E8E2D9] rounded-lg px-2.5 py-1.5 text-[#2D2721] focus:outline-none focus:border-[#B86B52] focus:ring-1 focus:ring-[#B86B52]/20 transition-all cursor-pointer shadow-2xs"
          >
            <option value="destacados">Destacados</option>
            <option value="precio-menor">Menor precio</option>
            <option value="precio-mayor">Mayor precio</option>
            <option value="nombre-az">Nombre A-Z</option>
          </select>
        </div>
      </div>

      {/* 2. Categorías con contador */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold tracking-wider uppercase text-[#786F66] flex items-center gap-1">
          <Layers className="w-3 h-3 text-[#B86B52]" />
          <span>Categorías</span>
        </label>
        <div className="space-y-0.5">
          {categories.map((cat) => {
            const isSelected = filters.category === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onFilterChange('category', cat)}
                className={`w-full flex items-center justify-between px-2.5 py-1 rounded-md text-xs text-left transition-all ${
                  isSelected
                    ? 'bg-[#B86B52] text-white font-medium shadow-2xs'
                    : 'text-[#5A5046] hover:bg-[#F3EFEA] hover:text-[#2D2721]'
                }`}
              >
                <span className="truncate">{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-[#F0EAE1] text-[#786F66]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Rango de Precio */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-semibold tracking-wider uppercase text-[#786F66] flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-[#B86B52]" />
          <span>Rango de Precio</span>
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <span className="text-[9px] text-[#A0968A] uppercase font-medium">Mín</span>
            <div className="relative mt-0.5">
              <span className="absolute left-2 top-1.5 text-[10px] text-[#A0968A]">$</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) =>
                  onFilterChange(
                    'minPrice',
                    e.target.value === '' ? '' : Math.max(0, Number(e.target.value))
                  )
                }
                className="w-full pl-5 pr-1.5 py-1 text-xs bg-white border border-[#E8E2D9] rounded-md focus:outline-none focus:border-[#B86B52] focus:ring-1 focus:ring-[#B86B52]/20"
              />
            </div>
          </div>
          <div>
            <span className="text-[9px] text-[#A0968A] uppercase font-medium">Máx</span>
            <div className="relative mt-0.5">
              <span className="absolute left-2 top-1.5 text-[10px] text-[#A0968A]">$</span>
              <input
                type="number"
                min="0"
                placeholder="Sin tope"
                value={filters.maxPrice}
                onChange={(e) =>
                  onFilterChange(
                    'maxPrice',
                    e.target.value === '' ? '' : Math.max(0, Number(e.target.value))
                  )
                }
                className="w-full pl-5 pr-1.5 py-1 text-xs bg-white border border-[#E8E2D9] rounded-md focus:outline-none focus:border-[#B86B52] focus:ring-1 focus:ring-[#B86B52]/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Checkboxes de estado */}
      <div className="space-y-2 pt-2 border-t border-[#E8E2D9]">
        <label className="flex items-center gap-2 text-xs text-[#2D2721] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.onlyOnSale}
            onChange={(e) => onFilterChange('onlyOnSale', e.target.checked)}
            className="w-3.5 h-3.5 rounded border-[#E8E2D9] text-[#B86B52] focus:ring-[#B86B52]"
          />
          <span className="flex items-center gap-1">
            <Tag className="w-3 h-3 text-[#B86B52]" />
            <span>Solo en oferta</span>
          </span>
        </label>

        <label className="flex items-center gap-2 text-xs text-[#2D2721] cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.hideOutOfStock}
            onChange={(e) => onFilterChange('hideOutOfStock', e.target.checked)}
            className="w-3.5 h-3.5 rounded border-[#E8E2D9] text-[#B86B52] focus:ring-[#B86B52]"
          />
          <span>Ocultar sin stock</span>
        </label>
      </div>

      {/* Botón de cierre en versión móvil */}
      {isMobileModal && (
        <div className="pt-3 border-t border-[#E8E2D9]">
          <button
            type="button"
            onClick={onCloseMobile}
            className="w-full py-2 bg-[#B86B52] hover:bg-[#9E553E] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            Ver {totalFilteredCount !== undefined ? `${totalFilteredCount} ` : ''}productos
          </button>
        </div>
      )}
    </div>
  );

  if (isMobileModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
        <div
          className="absolute inset-0 bg-[#2D2721]/50 backdrop-blur-xs"
          onClick={onCloseMobile}
        />
        <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#FAF8F5] p-4 overflow-y-auto shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E8E2D9]">
            <span className="font-display font-semibold text-base">Filtros</span>
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded-full text-[#786F66] hover:bg-[#E8E2D9]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {content}
        </div>
      </div>
    );
  }

  return (
    <aside className="w-[210px] flex-shrink-0 hidden lg:block">
      <div className="bg-white border border-[#E8E2D9] rounded-xl p-3.5 shadow-2xs sticky top-20">
        {content}
      </div>
    </aside>
  );
};
