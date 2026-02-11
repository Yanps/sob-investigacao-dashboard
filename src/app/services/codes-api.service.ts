import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CodeItem {
  id: string;
  code: string;
  used: boolean;
  usedAt?: any;
  usedByPhoneNumber?: string;
  batchId?: string;
  gameId?: string;
  createdAt?: any;
}

export interface CodesListResponse {
  codes: CodeItem[];
  nextCursor?: string;
}

export interface GenerateCodesBody {
  gameId?: string;
  quantity: number;
  batchId?: string;
}

export interface GenerateCodesResponse {
  codes: string[];
  batchId: string;
}

export interface GetCodeResponse {
  code: CodeItem;
}

@Injectable({ providedIn: 'root' })
export class CodesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api`;

  list(params: { batchId?: string; used?: boolean; limit?: number; startAfter?: string }): Observable<CodesListResponse> {
    const query: any = {};
    if (params.batchId?.trim()) query.batchId = params.batchId.trim();
    if (params.used !== undefined) query.used = params.used ? 'true' : 'false';
    if (params.limit) query.limit = params.limit;
    if (params.startAfter) query.startAfter = params.startAfter;
    return this.http.get<CodesListResponse>(`${this.base}/codes`, { params: query });
  }

  generate(body: GenerateCodesBody): Observable<GenerateCodesResponse> {
    return this.http.post<GenerateCodesResponse>(`${this.base}/codes/generate`, body);
  }

  getByCode(code: string): Observable<GetCodeResponse> {
    return this.http.get<GetCodeResponse>(`${this.base}/codes/${encodeURIComponent(code.trim())}`);
  }
}

