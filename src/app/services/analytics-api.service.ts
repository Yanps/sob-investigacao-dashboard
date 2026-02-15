import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AnalyticsPeriod = '24h' | '7d' | '30d';

export interface PhaseMetric {
  phaseId: string;
  phaseName: string;
  totalInsultos: number;
  totalDesistencia: number;
  totalMensagens: number;
  tempoMedioMin?: number;
  topWords: Array<{ word: string; count: number }>;
}

export interface DashboardAnalyticsResponse {
  jobStats: { pending: number; processing: number; done: number; failed: number; period?: string };
  tempoMedioTotalMin: number;
  totalInsultos: number;
  totalDesistencia: number;
  mediaMensagensPorFase: number;
  porFase: PhaseMetric[];
  period?: string;
  gameId?: string;
}

export interface PhaseAnalysisItem {
  id: string;
  gameId: string;
  phaseId: string;
  phaseName?: string;
  analysisText?: string;
  topWords?: Array<{ word: string; count: number }>;
  generatedAt?: string | number | { toMillis?: () => number };
}

export interface PhaseAnalysisSaveBody {
  gameId: string;
  phaseId: string;
  phaseName?: string;
  analysisText?: string;
  topWords?: Array<{ word: string; count: number }>;
}

/** Resposta do GET /api/dashboard/summary (métricas a partir de agent_responses). */
export interface DashboardSummaryResponse {
  gameType: string | null;
  averageTimes: { labels: string[]; data: number[]; avgTotalTime: number };
  swearWords: { labels: string[]; data: number[]; totalSwearWords: number };
  giveupWords: { labels: string[]; data: number[]; totalGiveupWords: number };
  phaseMessages: { labels: string[]; data: number[] };
  aiAnalysis: Array<{
    phaseId: string;
    phase: string;
    analysis: string;
    createdAt?: string;
    topWords: Array<{ word: string; count: number }>;
  }>;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api`;

  /** Dashboard completo a partir de agent_responses (summary). */
  getDashboardSummary(period?: AnalyticsPeriod, gameType?: string): Observable<DashboardSummaryResponse> {
    const params: Record<string, string> = {};
    if (period) params['period'] = period;
    if (gameType?.trim()) params['gameType'] = gameType.trim();
    return this.http.get<DashboardSummaryResponse>(`${this.base}/dashboard/summary`, { params });
  }

  getDashboardAnalytics(period?: AnalyticsPeriod, gameId?: string): Observable<DashboardAnalyticsResponse> {
    const params: Record<string, string> = {};
    if (period) params['period'] = period;
    if (gameId?.trim()) params['gameId'] = gameId.trim();
    return this.http.get<DashboardAnalyticsResponse>(`${this.base}/jobs/analytics`, { params });
  }

  getPhaseAnalyses(gameId: string): Observable<{ analyses: PhaseAnalysisItem[] }> {
    return this.http.get<{ analyses: PhaseAnalysisItem[] }>(`${this.base}/jobs/phase-analyses`, {
      params: { gameId: gameId.trim() },
    });
  }

  getPhaseAnalysis(gameId: string, phaseId: string): Observable<{ analysis: PhaseAnalysisItem | null }> {
    return this.http.get<{ analysis: PhaseAnalysisItem | null }>(
      `${this.base}/jobs/phase-analyses/${encodeURIComponent(gameId)}/${encodeURIComponent(phaseId)}`,
    );
  }

  savePhaseAnalysis(body: PhaseAnalysisSaveBody): Observable<{ success: boolean; id?: string; generatedAt?: string }> {
    return this.http.post<{ success: boolean; id?: string; generatedAt?: string }>(
      `${this.base}/jobs/phase-analyses`,
      body,
    );
  }
}
