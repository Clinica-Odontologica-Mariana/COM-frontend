import { InventoryTypeOption, InventoryUnitOption } from '../models/inventory.model';

export const INVENTORY_TYPE_OPTIONS: InventoryTypeOption[] = [
  { label: 'Material', value: 'MATERIAL' },
  { label: 'Equipamento', value: 'EQUIPMENT' },
];

export const INVENTORY_UNIT_OPTIONS: InventoryUnitOption[] = [
  { label: 'Unidade', value: 'unidade' },
  { label: 'Caixa', value: 'caixa' },
  { label: 'Pacote', value: 'pacote' },
];
