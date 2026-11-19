import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { GOOGLE_SHEET_CSV_URL } from '../config';
import type { GroupedProduct, ProductVariant } from '../types';
import { getColorHexFallback } from '../utils/formatters';

interface UseProductsReturn {
  products: GroupedProduct[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

/**
 * Convierte un valor de precio a número de forma segura
 */
function parsePrice(raw: unknown): number {
  if (typeof raw === 'number') return isNaN(raw) ? 0 : raw;
  if (!raw) return 0;

  const str = String(raw).trim();
  const clean = str.replace(/[^\d.,]/g, '');

  if (!clean) return 0;

  // Manejar separador de miles con punto (ej "4.500")
  if (clean.includes('.') && !clean.includes(',')) {
    const parts = clean.split('.');
    if (parts[parts.length - 1].length === 3) {
      return parseInt(parts.join(''), 10) || 0;
    }
    return Math.round(parseFloat(clean)) || 0;
  }

  if (clean.includes(',')) {
    const normalized = clean.replace(/\./g, '').replace(',', '.');
    return Math.round(parseFloat(normalized)) || 0;
  }

  return parseInt(clean, 10) || 0;
}

/**
 * Parsea el stock como entero
 */
function parseStock(raw: unknown): number {
  if (typeof raw === 'number') return isNaN(raw) ? 0 : Math.floor(raw);
  if (!raw) return 0;
  const num = parseInt(String(raw).replace(/[^\d-]/g, '').trim(), 10);
  return isNaN(num) ? 0 : Math.max(0, num);
}

/**
 * Normaliza el código hexadecimal del color
 */
function normalizeHex(hexRaw: string, colorName: string): string {
  let hex = (hexRaw || '').trim();

  // Si vino "Nombre:#Hex" en color o color_hex
  if (hex.includes(':')) {
    hex = hex.split(':')[1]?.trim() || '';
  }

  if (hex && !hex.startsWith('#')) {
    hex = `#${hex}`;
  }

  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex)) {
    return hex;
  }

  return getColorHexFallback(colorName);
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<GroupedProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Cache-buster para evitar versiones cacheadas
    const cacheBusterUrl = `${GOOGLE_SHEET_CSV_URL}&t=${Date.now()}`;

    try {
      const response = await fetch(cacheBusterUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(
          `No se pudo cargar el catálogo de productos (Error ${response.status}: ${response.statusText})`
        );
      }

      const csvText = await response.text();

      Papa.parse<string[]>(csvText, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const rows = results.data;
            if (!rows || rows.length === 0) {
              setProducts([]);
              setLoading(false);
              return;
            }

            // Localizamos la fila que contiene las cabeceras reales
            let headerRowIndex = rows.findIndex((row) => {
              const lowerCells = row.map((c) => String(c).trim().toLowerCase());
              return lowerCells.includes('id') && lowerCells.includes('nombre');
            });

            if (headerRowIndex === -1) {
              headerRowIndex = 0;
            }

            const headerRow = rows[headerRowIndex].map((c) =>
              String(c).trim().toLowerCase()
            );

            // Mapeamos los índices de las columnas según requerimiento
            const colIndex = {
              id: headerRow.indexOf('id'),
              codigo_producto:
                headerRow.indexOf('codigo_producto') !== -1
                  ? headerRow.indexOf('codigo_producto')
                  : headerRow.indexOf('codigo'),
              nombre: headerRow.indexOf('nombre'),
              categoria: headerRow.indexOf('categoria'),
              descripcion: headerRow.indexOf('descripcion'),
              precio: headerRow.indexOf('precio'),
              precio_anterior: headerRow.indexOf('precio_anterior'),
              color: headerRow.indexOf('color'),
              color_hex: headerRow.indexOf('color_hex'),
              stock:
                headerRow.indexOf('stock') !== -1
                  ? headerRow.indexOf('stock')
                  : headerRow.indexOf('cantidad'),
              imagen_url:
                headerRow.indexOf('imagen_url') !== -1
                  ? headerRow.indexOf('imagen_url')
                  : headerRow.indexOf('imagen'),
              etiqueta:
                headerRow.indexOf('etiqueta') !== -1
                  ? headerRow.indexOf('etiqueta')
                  : headerRow.indexOf('tag'),
              disponible: headerRow.indexOf('disponible'),
              link_mp: headerRow.indexOf('link_mp'),
            };

            const dataRows = rows.slice(headerRowIndex + 1);

            // Estructura temporal para agrupar por codigo_producto
            const groupedMap = new Map<string, GroupedProduct>();

            for (const row of dataRows) {
              const id = (colIndex.id !== -1 ? row[colIndex.id] : '')?.trim();
              const rawCodigo =
                (colIndex.codigo_producto !== -1
                  ? row[colIndex.codigo_producto]
                  : '')?.trim();
              const codigo_producto = rawCodigo || id;

              // Validamos que tenga al menos id o codigo
              if (!id && !codigo_producto) {
                continue;
              }

              // 2. Filtrar filas donde disponible sea distinto de "SI"
              const rawDisponible =
                colIndex.disponible !== -1 ? row[colIndex.disponible] : 'SI';
              const isDisponible =
                String(rawDisponible || '').trim().toUpperCase() === 'SI';

              if (!isDisponible) {
                continue;
              }

              const nombre =
                (colIndex.nombre !== -1 ? row[colIndex.nombre] : '')?.trim() ||
                'Producto sin nombre';
              const categoria =
                (colIndex.categoria !== -1 ? row[colIndex.categoria] : '')?.trim() ||
                'Lanas';
              const descripcion =
                (colIndex.descripcion !== -1 ? row[colIndex.descripcion] : '')?.trim() ||
                '';
              const etiqueta =
                colIndex.etiqueta !== -1 && row[colIndex.etiqueta]
                  ? row[colIndex.etiqueta].trim()
                  : undefined;

              const rawPrecio = colIndex.precio !== -1 ? row[colIndex.precio] : 0;
              const precio = parsePrice(rawPrecio);

              const rawPrecioAnterior =
                colIndex.precio_anterior !== -1 ? row[colIndex.precio_anterior] : '';
              const precio_anterior = rawPrecioAnterior
                ? parsePrice(rawPrecioAnterior)
                : undefined;

              let colorName =
                (colIndex.color !== -1 ? row[colIndex.color] : '')?.trim() || 'Único';
              let rawColorHex =
                (colIndex.color_hex !== -1 ? row[colIndex.color_hex] : '')?.trim() ||
                '';

              // Si color viene en formato "Nombre:#Hex"
              if (colorName.includes(':')) {
                const parts = colorName.split(':');
                colorName = parts[0]?.trim() || colorName;
                if (!rawColorHex) {
                  rawColorHex = parts[1]?.trim() || '';
                }
              }

              const color_hex = normalizeHex(rawColorHex, colorName);

              const rawStock = colIndex.stock !== -1 ? row[colIndex.stock] : 0;
              const stock = parseStock(rawStock);

              const imagen_url =
                (colIndex.imagen_url !== -1 ? row[colIndex.imagen_url] : '')?.trim() ||
                '';

              const link_mp =
                colIndex.link_mp !== -1 && row[colIndex.link_mp]
                  ? row[colIndex.link_mp].trim()
                  : undefined;

              const variant: ProductVariant = {
                id: id || `${codigo_producto}-${colorName}`,
                color: colorName,
                color_hex,
                stock,
                precio,
                precio_anterior,
                imagen_url,
                link_mp,
              };

              const isVariantOnSale = Boolean(
                precio_anterior && precio_anterior > precio
              );

              // 3. Agrupamos por codigo_producto
              if (!groupedMap.has(codigo_producto)) {
                groupedMap.set(codigo_producto, {
                  codigo_producto,
                  nombre,
                  categoria,
                  descripcion,
                  etiqueta,
                  disponible: true,
                  variants: [variant],
                  totalStock: stock,
                  minPrice: precio,
                  maxPrice: precio,
                  defaultVariant: variant,
                  hasDiscount: isVariantOnSale,
                });
              } else {
                const existing = groupedMap.get(codigo_producto)!;
                existing.variants.push(variant);
                existing.totalStock += stock;
                existing.minPrice = Math.min(existing.minPrice, precio);
                existing.maxPrice = Math.max(existing.maxPrice, precio);
                if (isVariantOnSale) {
                  existing.hasDiscount = true;
                }

                // Si la variante por defecto no tiene stock pero esta sí, actualizar default
                if (existing.defaultVariant.stock <= 0 && stock > 0) {
                  existing.defaultVariant = variant;
                }
                // Si la variante tiene imagen y el default no tenía, priorizar imagen
                if (!existing.defaultVariant.imagen_url && variant.imagen_url) {
                  existing.defaultVariant = variant;
                }
              }
            }

            const groupedList = Array.from(groupedMap.values());
            setProducts(groupedList);
            setLastUpdated(new Date());
            setLoading(false);
          } catch (err) {
            console.error('Error al procesar el CSV:', err);
            setError('Error al procesar los productos agrupados del catálogo.');
            setLoading(false);
          }
        },
        error: (parseErr: unknown) => {
          console.error('Error en PapaParse:', parseErr);
          setError('No se pudo leer la estructura del catálogo.');
          setLoading(false);
        },
      });
    } catch (err: unknown) {
      console.error('Error de red al consultar el CSV:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'No se pudo conectar con el catálogo en línea.';
      setError(message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    lastUpdated,
  };
}
