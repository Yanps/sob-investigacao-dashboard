import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SkeletonModule } from 'primeng/skeleton';
import { JogosStore, ActiveFilter } from '../../core/signals/jogos.store';

@Component({
  selector: 'app-jogos-page',
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
    DialogModule,
    SkeletonModule,
  ],
  template: `
    <div class="space-y-6">
      <h1 class="text-xl sm:text-2xl font-bold text-surface-900">Jogos</h1>

      <!-- Filtros -->
      <p-card class="shadow-sm">
        <div class="flex flex-col md:flex-row gap-4 items-end">
          <div class="flex flex-col gap-2">
            <label class="block text-sm font-medium text-surface-700 mb-1">Status</label>
            <p-selectButton
              [options]="activeOptions"
              [(ngModel)]="activeFilter"
              optionLabel="label"
              optionValue="value"
              (onChange)="store.activeFilter.set(activeFilter); store.carregarPrimeiraPagina()" />
          </div>
          @if (store.error(); as err) {
            <span class="text-xs text-red-600">{{ err }}</span>
          }
        </div>
      </p-card>

      <!-- Lista + editor -->
      <p-card header="Lista de jogos" class="shadow-sm">
        @if (store.loadingList()) {
          <p-skeleton width="100%" height="220px" />
        } @else {
          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-center">
              <span class="text-xs text-surface-500">Total: {{ store.games().length }} jogo(s)</span>
              <p-button label="Novo jogo" icon="pi pi-plus" (onClick)="abrirNovo()" />
            </div>

            <p-table
              [value]="store.games()"
              styleClass="p-datatable-sm"
              [scrollable]="true"
              scrollDirection="both"
              [tableStyle]="{ 'min-width': '50rem' }">
              <ng-template pTemplate="header">
                <tr>
                  <th>Nome</th>
                  <th>Id do Produto</th>
                  <th>Ativo</th>
                  <th>Criado em</th>
                  <th style="width: 6rem">Ações</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-game>
                <tr>
                  <td class="text-sm">{{ game.name }}</td>
                  <td class="text-xs text-surface-600">{{ game.productId || '-' }}</td>
                  <td>
                    <p-tag
                      [value]="game.active ? 'Ativo' : 'Inativo'"
                      [severity]="game.active ? 'success' : 'secondary'"
                      styleClass="text-xs" />
                  </td>
                  <td class="text-xs">
                    {{ game.createdAt | date: 'short' }}
                  </td>
                  <td>
                    <div class="flex gap-1 justify-end">
                      <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" (onClick)="editar(game)" />
                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="5" class="text-center text-surface-500 py-4">
                    Nenhum jogo encontrado.
                  </td>
                </tr>
              </ng-template>
            </p-table>

            <div class="flex justify-end">
              <p-button
                label="Carregar mais"
                icon="pi pi-chevron-down"
                (onClick)="store.carregarMais()"
                [disabled]="!store.hasMore() || store.loadingMore()"
                [loading]="store.loadingMore()" />
            </div>
          </div>
        }
      </p-card>

      <!-- Dialog de jogo -->
      <p-dialog
        [(visible)]="dialogVisible"
        [modal]="true"
        [style]="{ width: '480px', maxWidth: '95vw' }"
        [closable]="!store.loadingSave()"
        header="{{ selectedGameId ? 'Editar jogo' : 'Novo jogo' }}">
        <div class="flex flex-col gap-3">
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Nome</label>
            <input pInputText type="text" [(ngModel)]="formName" class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">ID do Produto</label>
            <input pInputText type="text" [(ngModel)]="formProductId" class="w-full" placeholder="Ex: produto_123" />
          </div>
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-surface-700">Ativo</label>
            <input type="checkbox" [(ngModel)]="formActive" />
          </div>
          @if (store.error(); as err) {
            <p class="text-xs text-red-600 m-0">{{ err }}</p>
          }
        </div>
        <ng-template pTemplate="footer">
          <div class="flex justify-end gap-2">
            <p-button
              label="Cancelar"
              [text]="true"
              (onClick)="fecharDialog()"
              [disabled]="store.loadingSave()" />
            <p-button
              label="Salvar"
              icon="pi pi-check"
              (onClick)="onSalvar()"
              [loading]="store.loadingSave()" />
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `,
})
export class JogosPage implements OnInit {
  readonly store = inject(JogosStore);

  activeFilter: ActiveFilter = 'all';

  dialogVisible = false;
  selectedGameId: string | null = null;
  formName = '';
  formProductId = '';
  formActive = true;

  readonly activeOptions = [
    { label: 'Todos', value: 'all' satisfies ActiveFilter },
    { label: 'Ativos', value: 'active' satisfies ActiveFilter },
    { label: 'Inativos', value: 'inactive' satisfies ActiveFilter },
  ];

  constructor() {
    effect(() => {
      if (this.store.saveSuccess()) {
        this.dialogVisible = false;
      }
    });
  }

  ngOnInit() {
    this.store.carregarPrimeiraPagina();
  }

  abrirNovo() {
    this.selectedGameId = null;
    this.formName = '';
    this.formProductId = '';
    this.formActive = true;
    this.dialogVisible = true;
    this.store.error.set(null);
  }

  editar(game: any) {
    this.selectedGameId = game.id;
    this.formName = game.name;
    this.formProductId = game.productId || '';
    this.formActive = !!game.active;
    this.dialogVisible = true;
    this.store.error.set(null);
  }

  fecharDialog() {
    if (this.store.loadingSave()) return;
    this.dialogVisible = false;
  }

  onSalvar() {
    this.store.salvar({
      id: this.selectedGameId || undefined,
      name: this.formName,
      productId: this.formProductId,
      active: this.formActive,
    } as any);
  }
}

