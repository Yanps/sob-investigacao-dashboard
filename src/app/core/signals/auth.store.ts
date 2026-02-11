import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'sob_dashboard_token';
const USER_KEY = 'sob_dashboard_user';

export interface DashboardUser {
  email: string;
  name?: string;
  role?: string;
}

export interface LoginResponse {
  access_token: string;
  user?: DashboardUser;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  private readonly tokenSignal = signal<string | null>(this.getStoredToken());
  private readonly userSignal = signal<DashboardUser | null>(this.getStoredUser());
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly isLoggedIn = computed(() => !!this.tokenSignal());

  private getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private getStoredUser(): DashboardUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as DashboardUser;
    } catch {
      return null;
    }
  }

  login(email: string, password: string) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/api/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          if (res.access_token) {
            localStorage.setItem(TOKEN_KEY, res.access_token);
            this.tokenSignal.set(res.access_token);
            if (res.user) {
              localStorage.setItem(USER_KEY, JSON.stringify(res.user));
              this.userSignal.set(res.user);
            } else {
              this.userSignal.set({ email });
            }
            this.router.navigate(['/dashboard']);
          }
        }),
        catchError((err) => {
          const msg = err.error?.message || err.message || 'Falha no login';
          this.errorSignal.set(msg);
          return of(null);
        }),
        tap(() => this.loadingSignal.set(false))
      );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.errorSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }
}
