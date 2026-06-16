import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { API_BASE_URL, SUPPRESS_ERROR_TOAST } from '../../../core/config/api.config';
import { ApiResponse } from '../../../core/models/api-response.model';
import { CertificateCreateDto, CertificateDto, CertificateUpdateDto } from '../models/certificate.dto';

function unwrap<T>(source: Observable<ApiResponse<T>>): Observable<T> {
  return source.pipe(map((res) => res.data));
}

@Injectable({ providedIn: 'root' })
export class CertificateApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  getAll(): Observable<CertificateDto[]> {
    return unwrap(
      this.http.get<ApiResponse<CertificateDto[]>>(`${this.base}/certificates`, {
        context: new HttpContext().set(SUPPRESS_ERROR_TOAST, true),
      }),
    );
  }

  getById(id: string): Observable<CertificateDto> {
    return unwrap(
      this.http.get<ApiResponse<CertificateDto>>(`${this.base}/certificates/${id}`),
    );
  }

  create(dto: CertificateCreateDto): Observable<CertificateDto> {
    return unwrap(
      this.http.post<ApiResponse<CertificateDto>>(`${this.base}/certificates`, dto),
    );
  }

  update(id: string, dto: CertificateUpdateDto): Observable<CertificateDto> {
    return unwrap(
      this.http.put<ApiResponse<CertificateDto>>(`${this.base}/certificates/${id}`, dto),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/certificates/${id}`);
  }
}
