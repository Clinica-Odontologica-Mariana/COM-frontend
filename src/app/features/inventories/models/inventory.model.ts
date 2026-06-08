export type InventoryItemType = 'MATERIAL' | 'EQUIPMENT';
export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT';
export type InventoryStatus = 'critico' | 'estavel';

export interface InventoryItem {
  id: string;
  clinicId: string;
  itemType: InventoryItemType;
  name: string;
  description: string | null;
  sku: string | null;
  unit: string;
  currentQuantity: number;
  minimumQuantity: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItemCreatePayload {
  clinicId: string;
  itemType: InventoryItemType;
  name: string;
  description?: string | null;
  sku?: string | null;
  unit: string;
  minimumQuantity?: number | null;
}

export type InventoryItemUpdatePayload = Omit<InventoryItemCreatePayload, 'clinicId'>;

export interface StockMovementCreatePayload {
  inventoryItemId: string;
  movementType: StockMovementType;
  quantity: number;
  reason?: string | null;
}

export interface StockMovement {
  id: string;
  inventoryItemId: string;
  movementType: StockMovementType;
  quantity: number;
  reason: string | null;
  createdByUserId: string | null;
  createdAt: string;
}

export interface InventoryTypeOption {
  label: string;
  value: InventoryItemType;
}

export interface ClinicOption {
  id: string;
  name: string;
}
