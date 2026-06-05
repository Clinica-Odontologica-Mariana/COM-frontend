export type InventoryStatus = 'critico' | 'estavel' | 'vencendo';

export interface InventoryItem {
  name: string;
  details: string;
  quantity: string;
  minimum: string;
  validity: string;
  status: InventoryStatus;
  icon: string;
}

export interface Supplier {
  initials: string;
  name: string;
  lastOrder: string;
  action: 'phone' | 'email';
}
