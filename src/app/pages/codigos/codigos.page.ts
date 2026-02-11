import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { CodigosStore, UsedFilter } from '../../core/signals/codigos.store';

@Component({
  selector: 'app-codigos-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    SelectButtonModule,
    TableModule,
    TagModule,
    SkeletonModule,
  ],
  template: `
    <div class="space-y-6">
      <h1 class="text-xl sm:text-2xl font-bold text-surface-900">Códigos</h1>

      <!-- Filtros e busca -->
      <p-card class="shadow-sm">
        <div class="flex flex-col lg:flex-row gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-surface-700 mb-1">Lote (batchId)</label>
            <input
              pInputText
              type="text"
              [(ngModel)]="batchIdInput"
              (ngModelChange)="store.batchId.set(batchIdInput)"
              placeholder="Ex: batch_..."
              class="w-full" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="block text-sm font-medium text-surface-700 mb-1">Status de uso</label>
            <p-selectButton
              [options]="usedOptions"
              [(ngModel)]="usedFilter"
              optionLabel="label"
              optionValue="value"
              (onChange)="onUsedChange()" />
          </div>

          <div class="flex flex-col justify-end gap-2">
            <p-button
              label="Buscar"
              icon="pi pi-search"
              (onClick)="onBuscar()"
              [disabled]="store.loadingList()" />
            @if (store.error(); as err) {
              <span class="text-xs text-red-600">{{ err }}</span>
            }
          </div>
        </div>
      </p-card>

      <!-- Geração + Busca por código -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <!-- Geração -->
        <p-card header="Gerar códigos" class="shadow-sm lg:col-span-2">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">Quantidade</label>
              <input
                pInputText
                type="number"
                min="1"
                max="1000"
                [(ngModel)]="quantityInput"
                (ngModelChange)="store.formQuantity.set(+quantityInput || 1)"
                class="w-full" />
              <small class="text-xs text-surface-500">1 a 1000</small>
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">Game ID (opcional)</label>
              <input
                pInputText
                type="text"
                [(ngModel)]="gameIdInput"
                (ngModelChange)="store.formGameId.set(gameIdInput)"
                class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-surface-700 mb-1">Batch ID (opcional)</label>
              <input
                pInputText
                type="text"
                [(ngModel)]="batchIdGenerateInput"
                (ngModelChange)="store.formBatchId.set(batchIdGenerateInput)"
                class="w-full" />
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between gap-2">
            <p-button
              label="Gerar códigos"
              icon="pi pi-plus"
              (onClick)="store.gerarCodigos()"
              [loading]="store.loadingGenerate()"
              styleClass="w-full md:w-auto" />
            @if (store.generatedBatchId(); as gb) {
              <span class="text-xs text-surface-600">Último lote gerado: <strong>{{ gb }}</strong></span>
            }
          </div>

          @if (store.generatedCodes().length) {
            <div class="mt-4">
              <h3 class="text-sm font-semibold text-surface-800 mb-2">Códigos gerados ({{ store.generatedCodes().length }})</h3>
              <div class="max-h-40 overflow-auto border border-surface-200 rounded-md p-2 text-xs font-mono grid grid-cols-2 md:grid-cols-3 gap-1">
                @for (c of store.generatedCodes(); track c) {
                  <span>{{ c }}</span>
                }
              </div>
            </div>
          }
        </p-card>

        <!-- Busca por código -->
        <p-card header="Buscar código" class="shadow-sm lg:col-span-1">
          <div class="space-y-3">
            <input
              pInputText
              type="text"
              [(ngModel)]="searchCodeInput"
              (keyup.enter)="onBuscarCodigo()"
              placeholder="Digite o código completo"
              class="w-full" />
            <p-button
              label="Buscar código"
              icon="pi pi-search"
              (onClick)="onBuscarCodigo()"
              [loading]="store.loadingSearch()"
              styleClass="w-full" />
            @if (store.searchResult(); as r) {
              <div class="border border-surface-200 rounded-md p-2 text-xs space-y-1">
                <div class="flex items-center justify-between">
                  <span class="font-mono">{{ r.code }}</span>
                  <p-tag
                    [value]="r.used ? 'Usado' : 'Disponível'"
                    [severity]="r.used ? 'danger' : 'success'"
                    styleClass="text-xs" />
                </div>
                <p class="m-0 text-surface-600">
                  Lote: {{ r.batchId || '-' }} • Game: {{ r.gameId || '-' }}
                </p>
                <p class="m-0 text-surface-500">
                  Telefone: {{ r.usedByPhoneNumber || '-' }}
                </p>
              </div>
            }
          </div>
        </p-card>
      </div>

      <!-- Tabela de códigos -->
      <p-card header="Lista de códigos" class="shadow-sm">
        @if (store.loadingList()) {
          <p-skeleton width="100%" height="220px" />
        } @else {
          <p-table
            [value]="store.codes()"
            [scrollable]="true"
            scrollDirection="both"
            styleClass="p-datatable-sm"
            [tableStyle]="{ 'min-width': '64rem' }">
            <ng-template pTemplate="header">
              <tr>
                <th>Código</th>
                <th>Lote</th>
                <th>Game ID</th>
                <th>Usado</th>
                <th>Telefone</th>
                <th>Criado em</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-code>
              <tr>
                <td class="font-mono text-xs">{{ code.code }}</td>
                <td class="text-xs">{{ code.batchId || '-' }}</td>
                <td class="text-xs">{{ code.gameId || '-' }}</td>
                <td>
                  <p-tag
                    [value]="code.used ? 'Usado' : 'Disponível'"
                    [severity]="code.used ? 'danger' : 'success'"
                    styleClass="text-xs" />
                </td>
                <td class="text-xs">{{ code.usedByPhoneNumber || '-' }}</td>
                <td class="text-xs">
                  {{ code.createdAt ? (code.createdAt | date: 'short') : '-' }}
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="text-center text-surface-500 py-4">
                  Nenhum código encontrado.
                </td>
              </tr>
            </ng-template>
          </p-table>

          <div class="mt-4 flex items-center justify-between">
            <span class="text-xs text-surface-500">
              Exibindo {{ store.codes().length }} código(s).
            </span>
            <p-button
              label="Carregar mais"
              icon="pi pi-chevron-down"
              (onClick)="store.carregarMais()"
              [disabled]="!store.hasMore() || store.loadingMore()"
              [loading]="store.loadingMore()" />
          </div>
        }
      </p-card>
    </div>
  `,
})
export class CodigosPage implements OnInit {
  readonly store = inject(CodigosStore);

  batchIdInput = '';
  usedFilter: UsedFilter = 'all';
  quantityInput = 1;
  gameIdInput = '';
  batchIdGenerateInput = '';
  searchCodeInput = '';

  readonly usedOptions = [
    { label: 'Todos', value: 'all' satisfies UsedFilter },
    { label: 'Disponíveis', value: 'unused' satisfies UsedFilter },
    { label: 'Usados', value: 'used' satisfies UsedFilter },
  ];

  onUsedChange() {
    this.store.usedFilter.set(this.usedFilter);
  }

  ngOnInit() {
    // Carrega a primeira página automaticamente ao entrar na rota /codigos
    this.store.buscarPrimeiraPagina();
  }

  onBuscar() {
    this.store.buscarPrimeiraPagina();
  }

  onBuscarCodigo() {
    this.store.searchCode.set(this.searchCodeInput);
    this.store.buscarPorCodigo();
  }
}

