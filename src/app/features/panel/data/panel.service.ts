import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DashboardData } from '../models/panel.model';
import { DASHBOARD_MOCK_DATA } from './panel.mock';

@Injectable({ providedIn: 'root' })
export class PanelService {
  getDashboardData(): Observable<DashboardData> {
    return of(DASHBOARD_MOCK_DATA).pipe(delay(120));
  }
}