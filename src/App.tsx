import React, { useState, useMemo } from 'react';
import { useProducts } from './hooks/useProducts';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductSkeleton } from './components/ProductSkeleton';
import { ErrorMessage } from './components/ErrorMessage';
import { FilterSidebar } from './components/FilterSidebar';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer, type CartItem } from './components/CartDrawer';
import { STORE_NAME, WHATSAPP_NUMBER } from './config';
import type { GroupedProduct, ProductVariant, FilterState } from './types';
import {
  Sparkles,
  RefreshCw,
  Heart,
  MessageCircle,
  PackageOpen,
  SlidersHorizontal,
} from 'lucide-react';

const CART_STORAGE_KEY = 'danibel_cart';

export const App: React.FC = () => {
  const { products, loading, error, refetch, lastUpdated } = useProducts();

  // Estados de interfaz y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // 1. Gestión del carrito con persistencia en localStorage
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error al recuperar carrito de localStorage:', e);
      return [];
    }
  });

  // Guardar en localStorage ante cualquier cambio
  React.useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Error al guardar carrito en localStorage:', e);
    }
  }, [cartItems]);

  // Estado del Modal de Detalle
  const [selectedProductForModal, setSelectedProductForModal] =
    useState<GroupedProduct | null>(null);
  const [selectedVariantForModal, setSelectedVariantForModal] = useState<
    ProductVariant | undefined
  >(undefined);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Estados de Filtros (WooCommerce style)
  const initialFilters: FilterState = {
    category: 'Todas',
    minPrice: '',
    maxPrice: '',
    onlyOnSale: false,
    hideOutOfStock: false,
    sortBy: 'destacados',
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleFilterChange = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setSearchQuery('');
  };

  // Filtrado y Ordenamiento Combinado
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // 1. Filtrado
    const list = products.filter((product) => {
      // Búsqueda por texto (nombre, descripción, categoría, código o colores)
      const matchesQuery =
        !query ||
        product.nombre.toLowerCase().includes(query) ||
        product.descripcion.toLowerCase().includes(query) ||
        product.categoria.toLowerCase().includes(query) ||
        product.codigo_producto.toLowerCase().includes(query) ||
        product.variants.some((v) => v.color.toLowerCase().includes(query));

      // Filtro de Categoría
      const matchesCategory =
        filters.category === 'Todas' || product.categoria === filters.category;

      // Filtro de Rango de Precio
      const matchesMinPrice =
        filters.minPrice === '' || product.maxPrice >= Number(filters.minPrice);
      const matchesMaxPrice =
        filters.maxPrice === '' || product.minPrice <= Number(filters.maxPrice);

      // Filtro "Solo en oferta"
      const matchesOnSale =
        !filters.onlyOnSale ||
        Boolean(
          product.hasDiscount ||
            product.variants.some(
              (v) => v.precio_anterior && v.precio_anterior > v.precio
            )
        );

      // Filtro "Ocultar sin stock"
      const matchesStock = !filters.hideOutOfStock || product.totalStock > 0;

      return (
        matchesQuery &&
        matchesCategory &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesOnSale &&
        matchesStock
      );
    });

    // 2. Ordenamiento
    const sorted = [...list];
    switch (filters.sortBy) {
      case 'precio-menor':
        sorted.sort((a, b) => a.minPrice - b.minPrice);
        break;
      case 'precio-mayor':
        sorted.sort((a, b) => b.maxPrice - a.maxPrice);
        break;
      case 'nombre-az':
        sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'destacados':
      default:
        // Mantener orden original del CSV
        break;
    }

    return sorted;
  }, [products, searchQuery, filters]);

  // Manejo del Modal de Detalle
  const handleOpenDetailModal = (
    product: GroupedProduct,
    variant?: ProductVariant
  ) => {
    setSelectedProductForModal(product);
    setSelectedVariantForModal(variant);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedProductForModal(null);
    setSelectedVariantForModal(undefined);
  };

  // Manejadores del Carrito
  const handleAddToCartFromModal = (
    product: GroupedProduct,
    variant: ProductVariant,
    quantityToAdd: number
  ) => {
    if (variant.stock <= 0 || quantityToAdd <= 0) return;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.variant.id === variant.id);
      if (existing) {
        return prev.map((item) =>
          item.variant.id === variant.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + quantityToAdd,
                  variant.stock
                ),
              }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          variant,
          quantity: Math.min(quantityToAdd, variant.stock),
        },
      ];
    });

    // Cerrar modal de detalle y abrir carrito según requerimiento
    handleCloseDetailModal();
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (variantId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.variant.id === variantId) {
            const newQty = item.quantity + delta;
            if (newQty > item.variant.stock) return item;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (variantId: string) => {
    setCartItems((prev) => prev.filter((item) => item.variant.id !== variantId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.error('Error al limpiar localStorage:', e);
    }
  };

  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D2721] flex flex-col font-sans">
      {/* 1. Barra superior informativa */}
      <AnnouncementBar />

      {/* 2. Header con Logo, Búsqueda y Carrito */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Hero Portada */}
      <section className="bg-gradient-to-b from-[#F3EFEA]/60 via-[#FAF8F5] to-[#FAF8F5] py-5 sm:py-7 border-b border-[#E8E2D9]/70">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#E8E2D9] text-[11px] text-[#786F66] shadow-2xs mb-2">
            <Sparkles className="w-3 h-3 text-[#B86B52]" />
            <span>Colección Artesanal & Hilados Premium</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-[#2D2721] tracking-tight max-w-xl mx-auto">
            Tejidos que abrigan historias
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#786F66] max-w-lg mx-auto leading-relaxed">
            Descubrí lanas sedificadas, hilos y accesorios seleccionados cuidadosamente para tus proyectos creativos en Talca y todo Chile.
          </p>

          {/* Sincronización en vivo */}
          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-[#A0968A]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Precios y stock sincronizados en vivo</span>
            {lastUpdated && (
              <span className="hidden sm:inline">
                · Actualizado:{' '}
                {lastUpdated.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
            <button
              onClick={() => refetch()}
              disabled={loading}
              title="Refrescar catálogo desde la planilla"
              className="p-0.5 hover:text-[#B86B52] transition-colors rounded disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3 h-3 ${loading ? 'animate-spin text-[#B86B52]' : ''}`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Contenido Principal con Barra Lateral de Filtros (WooCommerce) */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-6 w-full">
        {/* Barra superior de conteo y botón móvil de filtros */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8E2D9]">
          <div className="flex items-center gap-2.5">
            {/* Botón "Filtrar productos" para celulares y tablets */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E8E2D9] hover:border-[#B86B52] rounded-lg text-xs font-semibold text-[#2D2721] shadow-2xs transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#B86B52]" />
              <span>Filtrar</span>
              {(filters.category !== 'Todas' ||
                filters.minPrice !== '' ||
                filters.maxPrice !== '' ||
                filters.onlyOnSale ||
                filters.hideOutOfStock) && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#B86B52]" />
              )}
            </button>

            <span className="text-xs text-[#786F66]">
              Mostrando <strong className="text-[#2D2721]">{filteredProducts.length}</strong>{' '}
              {filteredProducts.length === 1 ? 'producto' : 'productos'}
            </span>
          </div>

          {/* Quick select de ordenamiento en header para móvil */}
          <div className="lg:hidden text-xs text-[#786F66]">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                handleFilterChange('sortBy', e.target.value as any)
              }
              className="bg-white border border-[#E8E2D9] rounded-lg px-2 py-1 text-xs text-[#2D2721] focus:outline-none"
            >
              <option value="destacados">Destacados</option>
              <option value="precio-menor">Menor precio</option>
              <option value="precio-mayor">Mayor precio</option>
              <option value="nombre-az">Nombre A-Z</option>
            </select>
          </div>
        </div>

        {/* Layout en 2 columnas: Sidebar izquierda fija (260px) + Grilla de 3 columnas */}
        <div className="flex items-start gap-8">
          {/* 1. Sidebar de Filtros para Escritorio */}
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            products={products}
            totalFilteredCount={filteredProducts.length}
          />

          {/* 2. Grilla de Productos (3 columnas en desktop) */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <ProductSkeleton count={6} />
            ) : error ? (
              <ErrorMessage message={error} onRetry={refetch} />
            ) : filteredProducts.length === 0 ? (
              /* Estado sin resultados */
              <div className="bg-white border border-[#E8E2D9] rounded-xl p-8 text-center max-w-sm mx-auto my-6 shadow-2xs">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF6F0] border border-[#E8E2D9] flex items-center justify-center text-[#B86B52] mb-3">
                  <PackageOpen className="w-6 h-6" />
                </div>
                <h3 className="font-display text-lg font-semibold text-[#2D2721] mb-1.5">
                  No encontramos productos
                </h3>
                <p className="text-xs text-[#786F66] mb-4">
                  {searchQuery
                    ? `No hay coincidencias para "${searchQuery}". Probá cambiando los términos o limpiando los filtros.`
                    : 'No hay productos que coincidan con los filtros seleccionados.'}
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-1.5 rounded-full border border-[#B86B52] text-[#B86B52] hover:bg-[#B86B52] hover:text-white text-xs font-semibold transition-colors"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              /* Grilla responsive: 2 columnas en celular, 3 en tablet y 4 en pantallas grandes */
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.codigo_producto}
                    product={product}
                    onOpenDetail={handleOpenDetailModal}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Drawer de Filtros Móvil */}
      {isMobileFilterOpen && (
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          products={products}
          isMobileModal={true}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
          totalFilteredCount={filteredProducts.length}
        />
      )}

      {/* Modal de Detalle de Producto */}
      <ProductDetailModal
        product={selectedProductForModal}
        initialVariant={selectedVariantForModal}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onAddToCart={handleAddToCartFromModal}
      />

      {/* Drawer del Carrito */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />

      {/* Botón flotante de WhatsApp */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          '¡Hola! Tengo una consulta sobre los hilados de Danibel.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-40 bg-[#25D366] hover:bg-[#20BE5B] text-white p-3 rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-white stroke-none" />
      </a>

      {/* Footer */}
      <footer className="mt-12 bg-[#F3EFEA] border-t border-[#E8E2D9] text-[#786F66] text-xs py-5">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-display font-semibold text-[#2D2721] text-xs sm:text-sm">
              {STORE_NAME} · Lanera Artesanal
            </p>
            <p className="mt-0.5 text-[11px] text-[#A0968A]">
              Talca, Región del Maule, Chile · Envíos a todo el país
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#786F66]">
            <span>Hecho con</span>
            <Heart className="w-3 h-3 text-[#B86B52] fill-[#B86B52]" />
            <span>para tejedoras y artesanas</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
