import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { JobsApiService } from '../../services/jobs-api.service';
import { MOCK_JOBS_STATS } from '../../core/mocks/page-mocks';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CardModule, ChartModule, SkeletonModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-xl sm:text-2xl font-bold text-surface-900">Dashboard</h1>

      <!-- Cards de resumo (responsivos: 1 col mobile, 2 cols tablet, 4 cols desktop) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        @if (loading()) {
          @for (i of [1,2,3,4]; track i) {
            <p-card class="shadow-sm">
              <p-skeleton width="100%" height="3rem" />
            </p-card>
          }
        } @else {
          <p-card class="shadow-sm border border-surface-200">
            <div class="flex flex-col gap-1">
              <span class="text-surface-500 text-sm font-medium">Pendentes</span>
              <span class="text-2xl font-bold text-amber-600">{{ stats()?.pending ?? 0 }}</span>
            </div>
          </p-card>
          <p-card class="shadow-sm border border-surface-200">
            <div class="flex flex-col gap-1">
              <span class="text-surface-500 text-sm font-medium">Processando</span>
              <span class="text-2xl font-bold text-blue-600">{{ stats()?.processing ?? 0 }}</span>
            </div>
          </p-card>
          <p-card class="shadow-sm border border-surface-200">
            <div class="flex flex-col gap-1">
              <span class="text-surface-500 text-sm font-medium">Concluídos</span>
              <span class="text-2xl font-bold text-green-600">{{ stats()?.done ?? 0 }}</span>
            </div>
          </p-card>
          <p-card class="shadow-sm border border-surface-200">
            <div class="flex flex-col gap-1">
              <span class="text-surface-500 text-sm font-medium">Falhos</span>
              <span class="text-2xl font-bold text-red-600">{{ stats()?.failed ?? 0 }}</span>
            </div>
          </p-card>
        }
      </div>

      <!-- Gráfico Jobs (responsivo) -->
      <p-card header="Jobs por status (últimas 24h)" class="shadow-sm">
        @if (loading()) {
          <p-skeleton width="100%" height="280px" />
        } @else if (chartData()) {
          <div class="w-full h-[280px] min-h-[240px]">
            <p-chart
              type="doughnut"
              [data]="chartData()!"
              [options]="chartOptions"
              [responsive]="true"
              style="width: 100%; height: 100%;" />
          </div>
        } @else {
          <p class="text-surface-500 py-8 text-center">Nenhum dado disponível.</p>
        }
      </p-card>
    </div>
  `,
})
export class DashboardPage implements OnInit {
  private readonly jobsApi = inject(JobsApiService);
  readonly loading = signal(true);
  readonly stats = signal<{ pending: number; processing: number; done: number; failed: number } | null>(null);

  readonly chartData = computed(() => {
    const s = this.stats();
    if (!s) return null;
    return {
      labels: ['Pendentes', 'Processando', 'Concluídos', 'Falhos'],
      datasets: [
        {
          data: [s.pending, s.processing, s.done, s.failed],
          backgroundColor: ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444'],
          hoverBackgroundColor: ['#d97706', '#2563eb', '#16a34a', '#dc2626'],
        },
      ],
    };
  });

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const },
    },
  };

  ngOnInit() {
    this.jobsApi.getStats('24h').subscribe({
      next: (res: { pending: number; processing: number; done: number; failed: number }) => {
        const total = (res?.pending ?? 0) + (res?.processing ?? 0) + (res?.done ?? 0) + (res?.failed ?? 0);
        this.stats.set(total > 0 ? res : MOCK_JOBS_STATS);
        this.loading.set(false);
      },
      error: () => {
        this.stats.set(MOCK_JOBS_STATS);
        this.loading.set(false);
      },
    });
  }
}
