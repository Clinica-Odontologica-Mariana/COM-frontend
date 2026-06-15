import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import {
  ClinicOption,
  InventoryItem,
  InventoryItemCreatePayload,
  InventoryItemUpdatePayload,
  StockMovement,
  StockMovementCreatePayload,
} from '../models/inventory.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: unknown;
}

interface PageResponse<T> {
  content: T[];
}

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listClinics(): Observable<ClinicOption[]> {
    return this.http
      .get<ApiResponse<PageResponse<ClinicOption>>>(`${this.apiBaseUrl}/clinics`)
      .pipe(map((response) => response.data.content));
  }

  listItems(clinicId: string): Observable<InventoryItem[]> {
    const params = new HttpParams().set('clinicId', clinicId);

    return this.http
      .get<ApiResponse<InventoryItem[]>>(`${this.apiBaseUrl}/inventory-items`, { params })
      .pipe(map((response) => response.data));
  }

  findItem(id: string): Observable<InventoryItem> {
    return this.http
      .get<ApiResponse<InventoryItem>>(`${this.apiBaseUrl}/inventory-items/${id}`)
      .pipe(map((response) => response.data));
  }

  createItem(payload: InventoryItemCreatePayload, initialQuantity: number): Observable<InventoryItem> {
    return this.http
      .post<ApiResponse<InventoryItem>>(`${this.apiBaseUrl}/inventory-items`, payload)
      .pipe(
        map((response) => response.data),
        switchMap((item) => {
          if (initialQuantity <= 0) {
            return of(item);
          }

          return this.createMovement({
            inventoryItemId: item.id,
            movementType: 'ADJUSTMENT',
            quantity: initialQuantity,
            reason: 'Quantidade inicial',
          }).pipe(map(() => ({ ...item, currentQuantity: initialQuantity })));
        }),
      );
  }

  updateItem(id: string, payload: InventoryItemUpdatePayload): Observable<InventoryItem> {
    return this.http
      .put<ApiResponse<InventoryItem>>(`${this.apiBaseUrl}/inventory-items/${id}`, payload)
      .pipe(map((response) => response.data));
  }

  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBaseUrl}/inventory-items/${id}`);
  }

  createMovement(payload: StockMovementCreatePayload): Observable<StockMovement> {
    return this.http
      .post<ApiResponse<StockMovement>>(`${this.apiBaseUrl}/stock-movements`, payload)
      .pipe(map((response) => response.data));
  }
}
