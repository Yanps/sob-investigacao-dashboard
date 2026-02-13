import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { CodigosStore } from '../../core/signals/codigos.store';
import { GamesApiService, GameItem } from '../../services/games-api.service';
import { CodesApiService, BatchItem, CodeItem } from '../../services/codes-api.service';

@Component({
  selector: 'app-codigos-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    TagModule,
    SkeletonModule,
    DropdownModule,
    TabViewModule,
    TooltipModule,
  ],
  template: `
    <div class="space-y-6">
      <h1 class="text-xl sm:text-2xl font-bold text-surface-900 dark:text-surface-0">Códigos</h1>

      <p-tabView>
        <!-- Aba 1: Gerar Códigos -->
        <p-tabPanel header="Gerar Códigos">
          <div class="space-y-4 pt-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Quantidade</label>
                <input
                  #quantityRef
                  pInputText
                  type="number"
                  min="1"
                  max="1000"
                  [ngModel]="quantityInput"
                  (input)="onQuantityInput(quantityRef)"
                  class="w-full" />
                <small class="text-xs text-surface-500">1 a 1000</small>
              </div>
              <div>
                <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Game <span class="text-red-500">*</span></label>
                <p-dropdown
                  [options]="gameOptions()"
                  [(ngModel)]="selectedGameId"
                  optionLabel="label"
                  optionValue="value"
                  (onChange)="onGameChange()"
                  placeholder="Selecione um jogo"
                  styleClass="w-full"
                  [loading]="loadingGames()" />
              </div>
              <div>
                <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Batch ID (opcional)</label>
                <input
                  pInputText
                  type="text"
                  [(ngModel)]="batchIdGenerateInput"
                  (ngModelChange)="store.formBatchId.set(batchIdGenerateInput)"
                  placeholder="Deixe em branco para gerar automaticamente"
                  class="w-full" />
              </div>
            </div>
            <div class="flex items-center justify-between gap-2">
              <p-button
                label="Gerar códigos"
                icon="pi pi-plus"
                (onClick)="onGerarCodigos()"
                [loading]="store.loadingGenerate()"
                [disabled]="!selectedGameId" />
              @if (store.generatedBatchId(); as gb) {
                <span class="text-xs text-surface-600 dark:text-surface-400">Último lote gerado: <strong>{{ gb }}</strong></span>
              }
            </div>

            @if (store.generatedCodes().length) {
              <div class="mt-4">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-sm font-semibold text-surface-800 dark:text-surface-200">Códigos gerados ({{ store.generatedCodes().length }})</h3>
                  <p-button
                    icon="pi pi-copy"
                    label="Copiar todos"
                    severity="secondary"
                    size="small"
                    (onClick)="copiarCodigosGerados()" />
                </div>
                <div class="max-h-60 overflow-auto border border-surface-300 dark:border-surface-700 rounded-md p-3 text-xs font-mono grid grid-cols-2 md:grid-cols-4 gap-2 bg-surface-100 dark:bg-surface-800">
                  @for (c of store.generatedCodes(); track c) {
                    <span class="bg-white dark:bg-surface-700 px-2 py-1 rounded border border-surface-300 dark:border-surface-600 text-surface-900 dark:text-surface-100">{{ c }}</span>
                  }
                </div>
              </div>
            }

            @if (store.error(); as err) {
              <span class="text-xs text-red-600">{{ err }}</span>
            }
          </div>
        </p-tabPanel>

        <!-- Aba 2: Visualizar Códigos -->
        <p-tabPanel header="Visualizar Códigos">
          <div class="space-y-4 pt-4">
            <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div class="flex-1 w-full sm:w-auto">
                <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Selecione o Lote</label>
                <p-dropdown
                  [options]="batchOptionsForView()"
                  [(ngModel)]="selectedBatchIdView"
                  optionLabel="label"
                  optionValue="value"
                  (onChange)="onBatchChangeView()"
                  placeholder="Selecione um lote"
                  styleClass="w-full"
                  [style]="{ minWidth: '300px' }"
                  [loading]="loadingBatches()" />
              </div>
              <div class="flex gap-2">
                <p-button
                  icon="pi pi-file-pdf"
                  label="Baixar PDF"
                  severity="secondary"
                  [disabled]="!selectedBatchIdView || !viewCodes().length"
                  (onClick)="baixarPdf()" />
                <p-button
                  icon="pi pi-copy"
                  label="Copiar códigos"
                  severity="secondary"
                  [disabled]="!viewCodes().length"
                  (onClick)="copiarCodigosView()" />
              </div>
            </div>

            @if (loadingViewCodes()) {
              <p-skeleton width="100%" height="200px" />
            } @else if (viewCodes().length) {
              <div class="border border-surface-300 dark:border-surface-700 rounded-md bg-surface-100 dark:bg-surface-800">
                <p class="text-sm text-surface-700 dark:text-surface-400 p-4 pb-2">{{ viewCodes().length }} código(s) no lote</p>
                <p-table
                  [value]="viewCodes()"
                  [scrollable]="true"
                  scrollHeight="400px"
                  styleClass="p-datatable-sm">
                  <ng-template pTemplate="header">
                    <tr>
                      <th>Código</th>
                      <th style="width: 80px">Ações</th>
                    </tr>
                  </ng-template>
                  <ng-template pTemplate="body" let-code>
                    <tr>
                      <td class="font-mono text-xs">{{ code.code }}</td>
                      <td>
                        <p-button
                          icon="pi pi-copy"
                          [rounded]="true"
                          [text]="true"
                          size="small"
                          pTooltip="Copiar código"
                          tooltipPosition="left"
                          (onClick)="copiarCodigo(code.code)" />
                      </td>
                    </tr>
                  </ng-template>
                </p-table>
              </div>
            } @else {
              <div class="text-center py-8 text-surface-500">
                @if (selectedBatchIdView) {
                  Nenhum código encontrado neste lote.
                } @else {
                  Selecione um lote para visualizar os códigos.
                }
              </div>
            }
          </div>
        </p-tabPanel>

        <!-- Aba 3: Detalhes dos Códigos -->
        <p-tabPanel header="Detalhes dos Códigos">
          <div class="space-y-4 pt-4">
            <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div class="flex-1 w-full sm:w-auto">
                <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Selecione o Lote</label>
                <p-dropdown
                  [options]="batchOptionsForView()"
                  [(ngModel)]="selectedBatchIdDetails"
                  optionLabel="label"
                  optionValue="value"
                  (onChange)="onBatchChangeDetails()"
                  placeholder="Selecione um lote"
                  styleClass="w-full"
                  [style]="{ minWidth: '300px' }"
                  [loading]="loadingBatches()" />
              </div>
            </div>

            @if (loadingDetailsCodes()) {
              <p-skeleton width="100%" height="300px" />
            } @else if (detailsCodes().length) {
              <p-table
                [value]="detailsCodes()"
                [scrollable]="true"
                styleClass="p-datatable-sm"
                [tableStyle]="{ 'min-width': '70rem' }">
                <ng-template pTemplate="header">
                  <tr>
                    <th>Código</th>
                    <th>Status</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Data de Ativação</th>
                    <th>Canal</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-code>
                  <tr>
                    <td class="font-mono text-xs">{{ code.code }}</td>
                    <td>
                      <p-tag
                        [value]="code.used ? 'Usado' : 'Disponível'"
                        [severity]="code.used ? 'danger' : 'success'"
                        styleClass="text-xs" />
                    </td>
                    <td class="text-xs">{{ code.usedByName || '-' }}</td>
                    <td class="text-xs">{{ code.usedByEmail || '-' }}</td>
                    <td class="text-xs">{{ code.usedByPhoneNumber || '-' }}</td>
                    <td class="text-xs">
                      {{ code.usedAt ? (code.usedAt | date: 'dd/MM/yyyy HH:mm') : '-' }}
                    </td>
                    <td class="text-xs">{{ code.channel || '-' }}</td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="7" class="text-center text-surface-500 py-4">
                      Nenhum código encontrado.
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            } @else {
              <div class="text-center py-8 text-surface-500">
                @if (selectedBatchIdDetails) {
                  Nenhum código encontrado neste lote.
                } @else {
                  Selecione um lote para ver os detalhes dos códigos.
                }
              </div>
            }
          </div>
        </p-tabPanel>
      </p-tabView>
    </div>
  `,
})
export class CodigosPage implements OnInit {
  readonly store = inject(CodigosStore);
  private readonly gamesApi = inject(GamesApiService);
  private readonly codesApi = inject(CodesApiService);

  readonly games = signal<GameItem[]>([]);
  readonly loadingGames = signal(true);
  readonly batches = signal<BatchItem[]>([]);
  readonly loadingBatches = signal(true);

  // Aba Visualizar
  readonly viewCodes = signal<CodeItem[]>([]);
  readonly loadingViewCodes = signal(false);
  selectedBatchIdView = '';

  // Aba Detalhes
  readonly detailsCodes = signal<CodeItem[]>([]);
  readonly loadingDetailsCodes = signal(false);
  selectedBatchIdDetails = '';

  // Aba Gerar
  quantityInput = 1;
  selectedGameId = '';
  batchIdGenerateInput = '';

  readonly gameOptions = computed(() => {
    return this.games().map((g) => ({
      label: g.name || g.id,
      value: g.productId || g.id,
    }));
  });

  readonly batchOptionsForView = computed(() => {
    return this.batches().map((b) => ({
      label: `${b.batchId} (${b.count} códigos)`,
      value: b.batchId,
    }));
  });

  ngOnInit() {
    this.loadGames();
    this.loadBatches();
  }

  loadGames() {
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

  loadBatches() {
    this.loadingBatches.set(true);
    this.codesApi.listBatches().subscribe({
      next: (res) => {
        this.batches.set(res?.batches ?? []);
        this.loadingBatches.set(false);
      },
      error: () => {
        this.batches.set([]);
        this.loadingBatches.set(false);
      },
    });
  }

  onQuantityInput(input: HTMLInputElement) {
    let qty = +input.value || 1;
    if (qty < 1) qty = 1;
    if (qty > 1000) qty = 1000;
    input.value = String(qty);
    this.quantityInput = qty;
    this.store.formQuantity.set(qty);
  }

  onGameChange() {
    this.store.formProductId.set(this.selectedGameId);
  }

  onGerarCodigos() {
    this.store.gerarCodigos();
    // Recarrega os batches após gerar novos códigos
    setTimeout(() => this.loadBatches(), 1000);
  }

  copiarCodigosGerados() {
    const codes = this.store.generatedCodes().join('\n');
    navigator.clipboard.writeText(codes);
  }

  // Aba Visualizar
  onBatchChangeView() {
    if (!this.selectedBatchIdView) {
      this.viewCodes.set([]);
      return;
    }
    this.loadingViewCodes.set(true);
    this.codesApi.list({ batchId: this.selectedBatchIdView, limit: 1000 }).subscribe({
      next: (res) => {
        this.viewCodes.set(res?.codes ?? []);
        this.loadingViewCodes.set(false);
      },
      error: () => {
        this.viewCodes.set([]);
        this.loadingViewCodes.set(false);
      },
    });
  }

  copiarCodigosView() {
    const codes = this.viewCodes().map((c) => c.code).join('\n');
    navigator.clipboard.writeText(codes);
  }

  copiarCodigo(code: string) {
    navigator.clipboard.writeText(code);
  }

  baixarPdf() {
    const codes = this.viewCodes();
    if (!codes.length) return;

    // Gera um PDF simples com os códigos
    const content = codes.map((c) => c.code).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codigos_${this.selectedBatchIdView}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Aba Detalhes
  onBatchChangeDetails() {
    if (!this.selectedBatchIdDetails) {
      this.detailsCodes.set([]);
      return;
    }
    this.loadingDetailsCodes.set(true);
    this.codesApi.list({ batchId: this.selectedBatchIdDetails, limit: 1000 }).subscribe({
      next: (res) => {
        this.detailsCodes.set(res?.codes ?? []);
        this.loadingDetailsCodes.set(false);
      },
      error: () => {
        this.detailsCodes.set([]);
        this.loadingDetailsCodes.set(false);
      },
    });
  }
}
