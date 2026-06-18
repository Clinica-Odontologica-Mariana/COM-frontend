import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  ChangePasswordPayload,
  UpdateUserProfilePayload,
  UserProfile,
  UserProfileUpdateResponse,
} from '../models/user-profile.models';

@Injectable({ providedIn: 'root' })
export class UserProfileApi {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  getMe(): Observable<UserProfile> {
    return unwrap(this.http.get<UserProfile | ApiResponse<UserProfile>>(`${this.base}/users/me`));
  }

  updateMe(payload: UpdateUserProfilePayload): Observable<UserProfileUpdateResponse> {
    return unwrap(
      this.http.patch<UserProfileUpdateResponse | ApiResponse<UserProfileUpdateResponse>>(
        `${this.base}/users/me`,
        payload,
      ),
    );
  }

  changePassword(payload: ChangePasswordPayload): Observable<void> {
    return this.http.post<void>(`${this.base}/users/me/change-password`, payload);
  }

  getProfilePhotoDownloadUrl(): Observable<string | null> {
    return unwrap(this.http.get<unknown>(`${this.base}/users/me/profile-photo/download-url`)).pipe(
      map((value) => extractDownloadUrl(value)),
    );
  }

  uploadProfilePhoto(file: File): Observable<void> {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<void>(`${this.base}/users/me/profile-photo`, body);
  }

  deleteProfilePhoto(): Observable<void> {
    return this.http.delete<void>(`${this.base}/users/me/profile-photo`);
  }
}

function unwrap<T>(source: Observable<T | ApiResponse<T>>): Observable<T> {
  return source.pipe(map((response) => (isApiResponse(response) ? response.data : response)));
}

function isApiResponse<T>(value: T | ApiResponse<T>): value is ApiResponse<T> {
  return typeof value === 'object' && value !== null && 'data' in value;
}

function extractDownloadUrl(value: unknown): string | null {
  if (typeof value === 'string') {
    return value || null;
  }

  if (typeof value === 'object' && value !== null) {
    const candidate = value as { downloadUrl?: unknown; url?: unknown; data?: unknown };
    const raw = candidate.downloadUrl ?? candidate.url ?? candidate.data;
    if (typeof raw === 'string') {
      return raw || null;
    }
  }

  return null;
}
