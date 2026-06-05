import { InventoryItem, Supplier } from '../models/inventory.model';

export const LOW_STOCK_TAGS = ['Resina Z350 (2)', 'Anestésico 2% (5)', 'Agulhas G27 (10)'];

export const INVENTORY_ITEMS: InventoryItem[] = [
  {
    name: 'Anestésico Lidocaína 2%',
    details: 'Anestésicos • Dental Cremer',
    quantity: '20',
    minimum: '10 unidades',
    validity: '15 Out 2025',
    status: 'critico',
    icon: '+',
  },
  {
    name: 'Resina Filtek Z350 XT',
    details: 'Dentística • 3M Espe',
    quantity: '12',
    minimum: '08 unidades',
    validity: '22 Jan 2026',
    status: 'estavel',
    icon: '✣',
  },
  {
    name: 'Luvas de Nitrila (Tam M)',
    details: 'Biossegurança • Supermax',
    quantity: '45',
    minimum: '20 caixas',
    validity: '12 Mai 2024',
    status: 'vencendo',
    icon: '▥',
  },
  {
    name: 'Sugadores Descartáveis',
    details: 'Descartáveis • SS White',
    quantity: '200',
    minimum: '100 unidades',
    validity: 'Indeterminado',
    status: 'estavel',
    icon: '⌯',
  },
];

export const SUPPLIERS: Supplier[] = [
  {
    initials: 'DC',
    name: 'Dental Cremer',
    lastOrder: 'Último pedido: Há X dias',
    action: 'phone',
  },
  {
    initials: 'SW',
    name: 'SS White',
    lastOrder: 'Último pedido: Há 1232 dias',
    action: 'email',
  },
];
