import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GameItem {
  id: string;
  productId?: string;
  name: string;
  type: string;
  prompts?: Record<string, unknown>;
  config?: Record<string, unknown>;
  active?: boolean;
  createdAt?: any;
}

export interface GamesListResponse {
  games: GameItem[];
  nextCursor?: string;
}

export interface CreateGameBody {
  name: string;
  type: string;
  productId?: string;
  prompts?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

export interface UpdateGameBody {
  name?: string;
  type?: string;
  productId?: string;
  prompts?: Record<string, unknown>;
  config?: Record<string, unknown>;
  active?: boolean;
}

export interface GetGameResponse {
  game: GameItem;
}

@Injectable({ providedIn: 'root' })
export class GamesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api`;

  list(params: { active?: boolean; type?: string; limit?: number; startAfter?: string }): Observable<GamesListResponse> {
    const query: any = {};
    if (params.active !== undefined) query.active = params.active ? 'true' : 'false';
    if (params.type?.trim()) query.type = params.type.trim();
    if (params.limit) query.limit = params.limit;
    if (params.startAfter) query.startAfter = params.startAfter;
    return this.http.get<GamesListResponse>(`${this.base}/games`, { params: query });
  }

  getById(gameId: string): Observable<GetGameResponse> {
    return this.http.get<GetGameResponse>(`${this.base}/games/${encodeURIComponent(gameId)}`);
  }

  create(body: CreateGameBody): Observable<GameItem> {
    return this.http.post<GameItem>(`${this.base}/games`, body);
  }

  update(gameId: string, body: UpdateGameBody): Observable<GameItem> {
    return this.http.put<GameItem>(`${this.base}/games/${encodeURIComponent(gameId)}`, body);
  }

  delete(gameId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.base}/games/${encodeURIComponent(gameId)}`,
    );
  }
}

