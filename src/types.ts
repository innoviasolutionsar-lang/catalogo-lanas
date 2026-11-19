export interface ProductVariant {
  id: string;
  color: string;
  color_hex: string;
  stock: number;
  precio: number;
  precio_anterior?: number;
  imagen_url: string;
  link_mp?: string;
}

export interface GroupedProduct {
  codigo_producto: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  etiqueta?: string;
  disponible: boolean;
  variants: ProductVariant[];
  totalStock: number;
  minPrice: number;
  maxPrice: number;
  defaultVariant: ProductVariant;
  hasDiscount?: boolean;
}

export type Product = GroupedProduct;

export type SortOption =
  | 'destacados'
  | 'precio-menor'
  | 'precio-mayor'
  | 'nombre-az';

export interface FilterState {
  category: string;
  minPrice: number | '';
  maxPrice: number | '';
  onlyOnSale: boolean;
  hideOutOfStock: boolean;
  sortBy: SortOption;
}
