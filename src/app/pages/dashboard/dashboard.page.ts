import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { AnalyticsApiService, type AnalyticsPeriod, type PhaseMetric, type PhaseAnalysisItem } from '../../services/analytics-api.service';
import { GamesApiService } from '../../services/games-api.service';
import type { GameItem } from '../../services/games-api.service';

const PERIOD_OPTIONS: { label: string; value: AnalyticsPeriod }[] = [
  { label: 'Últimas 24 horas', value: '24h' },
  { label: 'Últimos 7 dias', value: '7d' },
  { label: 'Últimos 30 dias', value: '30d' },
];

function formatAnalysisDate(value: string | number | { toMillis?: () => number } | undefined): string {
  if (value == null) return '';
  let ms: number;
  if (typeof value === 'number') ms = value;
  else if (typeof value === 'string') ms = new Date(value).getTime();
  else if (typeof value === 'object' && typeof (value as { toMillis?: () => number }).toMillis === 'function')
    ms = (value as { toMillis: () => number }).toMillis();
  else return '';
  if (isNaN(ms)) return '';
  return new Date(ms).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ChartModule,
    DropdownModule,
    ButtonModule,
    SkeletonModule,
    MessageModule,
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-xl sm:text-2xl font-bold text-surface-900">Dashboard de Análise</h1>
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-sm text-surface-600">Selecione o Jogo</label>
            <p-dropdown
              [options]="gameOptions()"
              [(ngModel)]="selectedGameId"
              optionLabel="label"
              optionValue="value"
              (onChange)="loadAnalytics()"
              placeholder="Todos os jogos"
              [style]="{ minWidth: '200px' }"
              [loading]="loadingGames()" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm text-surface-600">Período</label>
            <p-dropdown
              [options]="periodOptions"
              [(ngModel)]="selectedPeriod"
              optionLabel="label"
              optionValue="value"
              (onChange)="loadAnalytics()"
              [style]="{ minWidth: '180px' }" />
          </div>
        </div>
      </div>

      @if (error()) {
        <p-message severity="error" [text]="error()!" (close)="error.set(null)" />
      }

      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        @if (loading()) {
          @for (i of [1,2,3,4]; track i) {
            <p-card class="shadow-sm">
              <p-skeleton width="100%" height="4rem" />
            </p-card>
          }
        } @else {
          <p-card class="shadow-sm border border-surface-200">
            <div class="flex flex-col gap-1">
              <span class="text-surface-500 text-sm">Média de tempo para conclusão</span>
              <span class="text-2xl font-bold text-blue-600">{{ analytics()?.tempoMedioTotalMin ?? 0 }} min</span>
            </div>
          </p-card>
          <p-card class="shadow-sm border border-surface-200">
            <div class="flex flex-col gap-1">
              <span class="text-surface-500 text-sm">Ao longo de todas as fases</span>
              <span class="text-2xl font-bold text-red-600">{{ analytics()?.totalInsultos ?? 0 }} insultos</span>
            </div>
          </p-card>
          <p-card class="shadow-sm border border-surface-200">
            <div class="flex flex-col gap-1">
              <span class="text-surface-500 text-sm">Ao longo de todas as fases</span>
              <span class="text-2xl font-bold text-surface-700">{{ analytics()?.totalDesistencia ?? 0 }} desistências</span>
            </div>
          </p-card>
          <p-card class="shadow-sm border border-surface-200">
            <div class="flex flex-col gap-1">
              <span class="text-surface-500 text-sm">Por fase</span>
              <span class="text-2xl font-bold text-blue-600">{{ analytics()?.mediaMensagensPorFase ?? 0 }} msgs</span>
            </div>
          </p-card>
        }
      </div>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Tempo médio por fase (bar) -->
        <p-card header="Tempo Médio por Fase (minutos)" class="shadow-sm">
          @if (loading()) {
            <p-skeleton width="100%" height="280px" />
          } @else if (barChartData()) {
            <div class="h-[280px]">
              <p-chart type="bar" [data]="barChartData()!" [options]="barChartOptions" [responsive]="true" style="height: 100%;" />
            </div>
          } @else {
            <p class="text-surface-500 py-8 text-center">Nenhum dado disponível.</p>
          }
        </p-card>

        <!-- Insultos por fase (pie) -->
        <p-card header="Insultos por Fase" class="shadow-sm">
          @if (loading()) {
            <p-skeleton width="100%" height="280px" />
          } @else if (insultosPieData()) {
            <div class="h-[280px]">
              <p-chart type="pie" [data]="insultosPieData()!" [options]="pieChartOptions" [responsive]="true" style="height: 100%;" />
            </div>
          } @else {
            <p class="text-surface-500 py-8 text-center">Nenhum dado disponível.</p>
          }
        </p-card>

        <!-- Desistência por fase (pie) -->
        <p-card header="Desistência por Fase" class="shadow-sm">
          @if (loading()) {
            <p-skeleton width="100%" height="280px" />
          } @else if (desistenciaPieData()) {
            <div class="h-[280px]">
              <p-chart type="pie" [data]="desistenciaPieData()!" [options]="pieChartOptions" [responsive]="true" style="height: 100%;" />
            </div>
          } @else {
            <p class="text-surface-500 py-8 text-center">Nenhum dado disponível.</p>
          }
        </p-card>

        <!-- Mensagens por fase (line) -->
        <p-card header="Mensagens por Fase" class="shadow-sm">
          @if (loading()) {
            <p-skeleton width="100%" height="280px" />
          } @else if (lineChartData()) {
            <div class="h-[280px]">
              <p-chart type="line" [data]="lineChartData()!" [options]="lineChartOptions" [responsive]="true" style="height: 100%;" />
            </div>
          } @else {
            <p class="text-surface-500 py-8 text-center">Nenhum dado disponível.</p>
          }
        </p-card>
      </div>

      <!-- Análise por IA -->
      <section class="space-y-6">
        <h2 class="text-lg font-semibold text-surface-900">Análise por IA</h2>
        @if (loading()) {
          <p-skeleton width="100%" height="200px" />
        } @else {
          @for (phase of phasesWithAnalysis(); track phase.phaseId) {
            <p-card [header]="phase.phaseName" class="shadow-sm">
              <div class="flex flex-col gap-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  @if (phase.generatedAtFormatted()) {
                    <span class="text-sm text-surface-500">Última análise em {{ phase.generatedAtFormatted() }}</span>
                  }
                  <p-button
                    label="Gerar nova análise"
                    icon="pi pi-refresh"
                    severity="secondary"
                    [loading]="savingPhaseId() === phase.phaseId"
                    (onClick)="savePhaseWords(phase)" />
                </div>
                @if (phase.analysisText) {
                  <p class="text-surface-700 whitespace-pre-wrap">{{ phase.analysisText }}</p>
                } @else {
                  <p class="text-surface-500 italic">Nenhuma análise gerada ainda. Use o botão acima para salvar as palavras mais usadas e, em seguida, preencha a análise (via API ou integração).</p>
                }
                <div>
                  <h3 class="text-sm font-medium text-surface-700 mb-2">Palavras mais usadas</h3>
                  <div class="flex flex-wrap gap-2">
                    @for (w of phase.topWords; track w.word) {
                      <span class="inline-flex items-center rounded-md bg-surface-100 px-2 py-0.5 text-sm text-surface-800">{{ w.word }} {{ w.count }}</span>
                    }
                    @if (phase.topWords.length === 0) {
                      <span class="text-surface-500 text-sm">Nenhuma palavra no período.</span>
                    }
                  </div>
                </div>
              </div>
            </p-card>
          }
          @if (phasesWithAnalysis().length === 0 && !loading()) {
            <p-card class="shadow-sm">
              <p class="text-surface-500 py-4 text-center">Selecione um jogo e período para ver análises por fase.</p>
            </p-card>
          }
        }
      </section>
    </div>
  `,
})
export class DashboardPage implements OnInit {
  private readonly analyticsApi = inject(AnalyticsApiService);
  private readonly gamesApi = inject(GamesApiService);

  readonly loading = signal(true);
  readonly loadingGames = signal(true);
  readonly error = signal<string | null>(null);
  readonly analytics = signal<{
    tempoMedioTotalMin: number;
    totalInsultos: number;
    totalDesistencia: number;
    mediaMensagensPorFase: number;
    porFase: PhaseMetric[];
  } | null>(null);
  readonly phaseAnalyses = signal<PhaseAnalysisItem[]>([]);
  readonly games = signal<GameItem[]>([]);
  readonly savingPhaseId = signal<string | null>(null);

  selectedPeriod: AnalyticsPeriod = '7d';
  selectedGameId = '';
  periodOptions = PERIOD_OPTIONS;

  readonly gameOptions = computed(() => {
    const list = this.games();
    const opts = [{ label: 'Todos os jogos', value: '' }];
    for (const g of list) {
      opts.push({ label: g.name || g.id, value: g.id });
    }
    return opts;
  });

  readonly barChartData = computed(() => {
    const a = this.analytics();
    const phases = a?.porFase ?? [];
    if (phases.length === 0) return null;
    const labels = phases.map((p) => p.phaseName);
    const data = phases.map((p) => p.tempoMedioMin ?? 0);
    return {
      labels,
      datasets: [{ label: 'Tempo Médio (min)', data, backgroundColor: '#3b82f6', borderColor: '#2563eb' }],
    };
  });

  readonly insultosPieData = computed(() => {
    const a = this.analytics();
    const phases = a?.porFase ?? [];
    if (phases.length === 0) return null;
    return {
      labels: phases.map((p) => p.phaseName),
      datasets: [{ data: phases.map((p) => p.totalInsultos), backgroundColor: ['#ef4444', '#f97316', '#eab308'] }],
    };
  });

  readonly desistenciaPieData = computed(() => {
    const a = this.analytics();
    const phases = a?.porFase ?? [];
    if (phases.length === 0) return null;
    return {
      labels: phases.map((p) => p.phaseName),
      datasets: [{ data: phases.map((p) => p.totalDesistencia), backgroundColor: ['#f97316', '#ef4444', '#78716c'] }],
    };
  });

  readonly lineChartData = computed(() => {
    const a = this.analytics();
    const phases = a?.porFase ?? [];
    if (phases.length === 0) return null;
    return {
      labels: phases.map((p) => p.phaseName),
      datasets: [
        {
          label: 'Mensagens por Fase',
          data: phases.map((p) => p.totalMensagens),
          fill: false,
          borderColor: '#3b82f6',
          tension: 0.3,
        },
      ],
    };
  });

  readonly phasesWithAnalysis = computed(() => {
    const a = this.analytics();
    const stored = this.phaseAnalyses();
    const porFase = a?.porFase ?? [];
    const byPhaseId = new Map<string, PhaseAnalysisItem>();
    for (const s of stored) byPhaseId.set(s.phaseId, s);
    return porFase.map((p) => {
      const analysis = byPhaseId.get(p.phaseId);
      const topWords = (analysis?.topWords && analysis.topWords.length > 0 ? analysis.topWords : p.topWords) ?? [];
      const analysisText = analysis?.analysisText ?? '';
      const generatedAt = analysis?.generatedAt;
      const generatedAtFormatted = () => formatAnalysisDate(generatedAt);
      return {
        phaseId: p.phaseId,
        phaseName: p.phaseName,
        analysisText,
        topWords,
        generatedAt,
        generatedAtFormatted,
      };
    });
  });

  barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const } },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Minutos' } },
      x: { title: { display: true, text: 'Fases' } },
    },
  };

  pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const } },
  };

  lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' as const } },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Número de Mensagens' } },
      x: { title: { display: true, text: 'Fases' } },
    },
  };

  ngOnInit(): void {
    this.loadGames();
    this.loadAnalytics();
  }

  loadGames(): void {
    this.loadingGames.set(true);
    this.gamesApi.list({ limit: 100 }).subscribe({
      next: (res) => {
        this.games.set(res?.games ?? []);
        this.loadingGames.set(false);
      },
      error: () => {
        this.games.set([]);
        this.loadingGames.set(false);
      },
    });
  }

  loadAnalytics(): void {
    this.loading.set(true);
    this.error.set(null);
    const gameId = this.selectedGameId?.trim() || undefined;
    this.analyticsApi.getDashboardAnalytics(this.selectedPeriod, gameId).subscribe({
      next: (res) => {
        this.analytics.set({
          tempoMedioTotalMin: res.tempoMedioTotalMin ?? 0,
          totalInsultos: res.totalInsultos ?? 0,
          totalDesistencia: res.totalDesistencia ?? 0,
          mediaMensagensPorFase: res.mediaMensagensPorFase ?? 0,
          porFase: res.porFase ?? [],
        });
        this.loading.set(false);
        if (gameId) this.loadPhaseAnalyses(gameId);
        else this.phaseAnalyses.set([]);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? err?.message ?? 'Erro ao carregar analytics.');
        this.analytics.set(null);
        this.loading.set(false);
      },
    });
  }

  loadPhaseAnalyses(gameId: string): void {
    this.analyticsApi.getPhaseAnalyses(gameId).subscribe({
      next: (res) => this.phaseAnalyses.set(res?.analyses ?? []),
      error: () => this.phaseAnalyses.set([]),
    });
  }

  savePhaseWords(phase: { phaseId: string; phaseName: string; topWords: Array<{ word: string; count: number }> }): void {
    const gameId = this.selectedGameId?.trim();
    if (!gameId) return;
    this.savingPhaseId.set(phase.phaseId);
    this.analyticsApi
      .savePhaseAnalysis({
        gameId,
        phaseId: phase.phaseId,
        phaseName: phase.phaseName,
        topWords: phase.topWords,
      })
      .subscribe({
        next: () => {
          this.savingPhaseId.set(null);
          this.loadPhaseAnalyses(gameId);
        },
        error: () => this.savingPhaseId.set(null),
      });
  }
}
