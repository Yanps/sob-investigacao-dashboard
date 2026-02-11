import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MOCK_JOBS_STATS, MOCK_JOBS_LIST } from '../../core/mocks/page-mocks';

@Component({
  selector: 'app-jobs-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ChartModule, TableModule, DropdownModule, SkeletonModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-xl sm:text-2xl font-bold text-surface-900">Jobs</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <p-card class="lg:col-span-2 shadow-sm">
          <ng-template pTemplate="header">
            <div class="p-4 flex flex-wrap items-center gap-2 justify-between">
              <span class="font-semibold">Status (período)</span>
              <p-dropdown
                [options]="periodOptions"
                [(ngModel)]="selectedPeriod"
                optionLabel="label"
                optionValue="value"
                (onChange)="loadStats()"
                placeholder="Período"
                [style]="{ minWidth: '120px' }" />
            </div>
          </ng-template>
          @if (loadingStats()) {
            <p-skeleton width="100%" height="220px" />
          } @else if (chartData()) {
            <div class="h-[220px] p-4">
              <p-chart type="bar" [data]="chartData()!" [options]="chartOptions" [responsive]="true" style="height: 100%;" />
            </div>
          }
        </p-card>
        <p-card header="Resumo" class="shadow-sm">
          <ul class="space-y-2 text-sm">
            <li class="flex justify-between"><span class="text-surface-500">Pendentes</span><span class="font-medium">{{ stats()?.pending ?? 0 }}</span></li>
            <li class="flex justify-between"><span class="text-surface-500">Processando</span><span class="font-medium">{{ stats()?.processing ?? 0 }}</span></li>
            <li class="flex justify-between"><span class="text-surface-500">Concluídos</span><span class="font-medium">{{ stats()?.done ?? 0 }}</span></li>
            <li class="flex justify-between"><span class="text-surface-500">Falhos</span><span class="font-medium">{{ stats()?.failed ?? 0 }}</span></li>
          </ul>
        </p-card>
      </div>

      <p-card header="Lista de jobs (últimos)" class="shadow-sm">
        @if (loadingList()) {
          <p-skeleton width="100%" height="200px" />
        } @else {
          <p-table [value]="jobs()" [scrollable]="true" styleClass="p-datatable-sm p-datatable-striped" [tableStyle]="{ minWidth: '50rem' }">
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="id">ID</th>
                <th>Status</th>
                <th>Telefone</th>
                <th>Criado</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-job>
              <tr>
                <td class="font-mono text-xs">{{ job.id }}</td>
                <td><span [class]="badgeClass(job.status)">{{ job.status }}</span></td>
                <td>{{ job.phoneNumber }}</td>
                <td>{{ formatJobDate(job.createdAt) }}</td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr><td colspan="4" class="text-center text-surface-500 py-4">Nenhum job encontrado.</td></tr>
            </ng-template>
          </p-table>
        }
      </p-card>
    </div>
  `,
})
export class JobsPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api`;
  readonly loadingStats = signal(true);
  readonly loadingList = signal(true);
  readonly stats = signal<{ pending: number; processing: number; done: number; failed: number } | null>(null);
  readonly jobs = signal<any[]>([]);
  selectedPeriod: '24h' | '7d' | '30d' = '24h';
  periodOptions = [
    { label: '24 horas', value: '24h' },
    { label: '7 dias', value: '7d' },
    { label: '30 dias', value: '30d' },
  ];
  chartData = signal<{ labels: string[]; datasets: any[] } | null>(null);
  chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' as const } } };

  ngOnInit() {
    this.loadStats();
    this.loadList();
  }

  loadStats() {
    this.loadingStats.set(true);
    this.http.get<{ pending: number; processing: number; done: number; failed: number }>(`${this.base}/jobs/stats`, { params: { period: this.selectedPeriod } }).subscribe({
      next: (res: { pending: number; processing: number; done: number; failed: number }) => {
        const total = (res?.pending ?? 0) + (res?.processing ?? 0) + (res?.done ?? 0) + (res?.failed ?? 0);
        const data = total > 0 ? res : MOCK_JOBS_STATS;
        this.stats.set(data);
        this.chartData.set({
          labels: ['Pendentes', 'Processando', 'Concluídos', 'Falhos'],
          datasets: [{ label: 'Jobs', data: [data.pending, data.processing, data.done, data.failed], backgroundColor: ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444'] }],
        });
        this.loadingStats.set(false);
      },
      error: () => {
        this.stats.set(MOCK_JOBS_STATS);
        this.chartData.set({
          labels: ['Pendentes', 'Processando', 'Concluídos', 'Falhos'],
          datasets: [{ label: 'Jobs', data: [MOCK_JOBS_STATS.pending, MOCK_JOBS_STATS.processing, MOCK_JOBS_STATS.done, MOCK_JOBS_STATS.failed], backgroundColor: ['#f59e0b', '#3b82f6', '#22c55e', '#ef4444'] }],
        });
        this.loadingStats.set(false);
      },
    });
  }

  loadList() {
    this.loadingList.set(true);
    this.http.get<{ jobs: any[] }>(`${this.base}/jobs`, { params: { limit: '20' } }).subscribe({
      next: (res: { jobs: any[] }) => {
        const list = res?.jobs ?? [];
        this.jobs.set(list.length > 0 ? list : MOCK_JOBS_LIST);
        this.loadingList.set(false);
      },
      error: () => {
        this.jobs.set(MOCK_JOBS_LIST);
        this.loadingList.set(false);
      },
    });
  }

  badgeClass(status: string): string {
    const m: Record<string, string> = { pending: 'text-amber-600', processing: 'text-blue-600', done: 'text-green-600', failed: 'text-red-600' };
    return m[status] ?? 'text-surface-600';
  }

  /** Converte createdAt (string, number, Date ou objeto da API) para exibição. */
  formatJobDate(value: string | number | Date | Record<string, unknown> | null | undefined): string {
    if (value == null) return '-';
    if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
      const d = typeof value === 'number' ? new Date(value) : value instanceof Date ? value : new Date(value);
      return isNaN(d.getTime()) ? '-' : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    }
    if (typeof value === 'object' && value !== null) {
      const v = (value as { $date?: string }).$date ?? (value as { iso?: string }).iso;
      if (typeof v === 'string') return this.formatJobDate(v);
      if (typeof v === 'number') return this.formatJobDate(v);
    }
    return '-';
  }
}
