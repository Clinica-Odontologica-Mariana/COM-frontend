import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  CreateUserRequestDto,
  CreateUserResponseDto,
  ProfessionalCreatePayload,
  ProfessionalDto,
  ProfessionalPageResponse,
  SystemRole,
  UserSummaryDto,
} from '../models/professional.models';

const ROLE_CACHE_KEY = 'com-frontend.user-roles';

@Injectable({ providedIn: 'root' })
export class ProfessionalsApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  listUsers(): Observable<UserSummaryDto[]> {
    return this.http.get<UserSummaryDto[]>(`${this.base}/users`).pipe(map((response) => response ?? []));
  }

  createUser(payload: CreateUserRequestDto): Observable<CreateUserResponseDto> {
    return unwrap(this.http.post<CreateUserResponseDto | ApiResponse<CreateUserResponseDto>>(`${this.base}/users`, payload)).pipe(
      map((response) => {
        this.cacheRole(response.id, response.role);
        return response;
      }),
    );
  }

  listProfessionals(page = 0, size = 20): Observable<ProfessionalPageResponse> {
    return unwrap(
      this.http.get<ProfessionalPageResponse | ApiResponse<ProfessionalPageResponse>>(
        `${this.base}/professionals?page=${page}&size=${size}`,
      ),
    );
  }

  getProfessional(id: string): Observable<ProfessionalDto> {
    return unwrap(this.http.get<ProfessionalDto | ApiResponse<ProfessionalDto>>(`${this.base}/professionals/${id}`));
  }

  createProfessional(payload: ProfessionalCreatePayload): Observable<ProfessionalDto> {
    return unwrap(
      this.http.post<ProfessionalDto | ApiResponse<ProfessionalDto>>(`${this.base}/professionals`, payload),
    );
  }

  updateProfessional(id: string, payload: ProfessionalCreatePayload): Observable<ProfessionalDto> {
    return unwrap(
      this.http.put<ProfessionalDto | ApiResponse<ProfessionalDto>>(`${this.base}/professionals/${id}`, payload),
    );
  }

  deleteProfessional(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/professionals/${id}`);
  }

  roleForUser(userId: string, fallback?: SystemRole): SystemRole | 'UNKNOWN' {
    return this.readRoleCache()[userId] ?? fallback ?? 'UNKNOWN';
  }

  fullName(user: Pick<UserSummaryDto, 'firstName' | 'lastName'>): string {
    return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Usuário';
  }

  cacheRole(userId: string, role: SystemRole): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const cache = this.readRoleCache();
    cache[userId] = role;
    localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(cache));
  }

  private readRoleCache(): Record<string, SystemRole> {
    if (typeof localStorage === 'undefined') {
      return {};
    }

    const raw = localStorage.getItem(ROLE_CACHE_KEY);
    if (!raw) {
      return {};
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, SystemRole>;
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }
}

function unwrap<T>(source: Observable<T | ApiResponse<T>>): Observable<T> {
  return source.pipe(map((response) => (isApiResponse(response) ? response.data : response)));
}

function isApiResponse<T>(value: T | ApiResponse<T>): value is ApiResponse<T> {
  return typeof value === 'object' && value !== null && 'data' in value;
}
