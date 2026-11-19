/**
 * Formatea un monto numérico a formato de pesos chilenos: "$ 4.500"
 */
export function formatCLP(amount: number): string {
  const formatted = new Intl.NumberFormat('es-CL', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `$ ${formatted}`;
}

const COLOR_MAP: Record<string, string> = {
  crudo: '#F5F5DC',
  blanco: '#FFFFFF',
  natural: '#F0EAD6',
  beige: '#E1D4C0',
  arena: '#D8C3A5',
  terracota: '#B86B52',
  mostaza: '#E5A93B',
  rosa: '#E8A598',
  'rosa viejo': '#C98A7D',
  palo_rosa: '#D4A5A5',
  lila: '#C8A2C8',
  lavanda: '#BDB0D0',
  celeste: '#9BB8CD',
  azul: '#4A6984',
  'azul marino': '#203247',
  verde: '#7A9A7B',
  'verde seco': '#8F9779',
  oliva: '#808000',
  gris: '#A0A0A0',
  'gris perla': '#D3D3D3',
  'gris topo': '#8B8589',
  negro: '#222222',
  chocolate: '#5D4037',
  canela: '#A0522D',
  vino: '#722F37',
  bordo: '#800020',
};

export function getColorHexFallback(name: string): string {
  const normalized = name.trim().toLowerCase();
  return COLOR_MAP[normalized] || '#D2C3B2';
}

