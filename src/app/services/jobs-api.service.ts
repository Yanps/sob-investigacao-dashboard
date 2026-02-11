import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface JobsStats {
  pending: number;
  processing: number;
  done: number;
  failed: number;
  period?: string;
}

@Injectable({ providedIn: 'root' })
export class JobsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api`;

  getStats(period?: '24h' | '7d' | '30d'): Observable<JobsStats> {
    const params: Record<string, string> | undefined = period ? { period } : undefined;
    return this.http.get<JobsStats>(`${this.base}/jobs/stats`, {
      params,
      responseType: 'json',
    });
  }
}
