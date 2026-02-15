import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Customer {
  id: string;
  name?: string;
  email?: string;
  phoneNumber?: string | number;
  phoneNumberAlt?: string | number;
  createdAt?: any;
}

export interface UsersListResponse {
  customers: Customer[];
  nextCursor?: string;
}

export interface UserDetailResponse {
  customer: Customer | null;
  games: string[];
  ordersCount: number;
}

export interface ChangePhoneBody {
  email: string;
  newPhoneNumber: string;
}

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api`;

  list(params: { phoneNumber?: string; email?: string; limit?: number; startAfter?: string }): Observable<UsersListResponse> {
    const query: any = {};
    if (params.phoneNumber?.trim()) query.phoneNumber = params.phoneNumber.trim();
    if (params.email?.trim()) query.email = params.email.trim();
    if (params.limit) query.limit = params.limit;
    if (params.startAfter) query.startAfter = params.startAfter;
    return this.http.get<UsersListResponse>(`${this.base}/users`, { params: query });
  }

  getByPhone(phoneNumber: string | number): Observable<UserDetailResponse> {
    const phoneStr = String(phoneNumber).trim();
    const url = `${this.base}/users/${encodeURIComponent(phoneStr)}`;
    console.log('[DEBUG] UsersApiService.getByPhone - URL:', url);
    console.log('[DEBUG] UsersApiService.getByPhone - phoneNumber original:', phoneNumber);
    return this.http.get<UserDetailResponse>(url);
  }

  listGames(phoneNumber: string | number): Observable<string[]> {
    const phoneStr = String(phoneNumber).trim();
    return this.http.get<string[]>(`${this.base}/users/${encodeURIComponent(phoneStr)}/games`);
  }

  changePhone(body: ChangePhoneBody): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(
      `${this.base}/users/change-phone`,
      body,
    );
  }
}

