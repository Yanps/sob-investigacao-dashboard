import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ConversasStore, StatusFilter } from '../../core/signals/conversas.store';

@Component({
  selector: 'app-conversas-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    SkeletonModule,
    TagModule,
  ],
  template: `
    <div class="space-y-6">
      <h1 class="text-xl sm:text-2xl font-bold text-surface-900">Conversas</h1>

      <!-- Filtros -->
      <p-card class="shadow-sm">
        <div class="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div class="flex-1 w-full">
            <label class="block text-sm font-medium text-surface-700 mb-1">Telefone</label>
            <input
              pInputText
              type="tel"
              [(ngModel)]="phoneInput"
              placeholder="Ex: 5599999999999"
              class="w-full"
              (keyup.enter)="onBuscar()" />
          </div>
          <div class="w-full md:w-52">
            <label class="block text-sm font-medium text-surface-700 mb-1">Status</label>
            <p-dropdown
              [options]="statusOptions"
              [(ngModel)]="status"
              optionLabel="label"
              optionValue="value"
              (onChange)="onStatusChange()"
              class="w-full" />
          </div>
          <div class="flex gap-2 w-full md:w-auto">
            <p-button
              label="Buscar"
              icon="pi pi-search"
              (onClick)="onBuscar()"
              [disabled]="!phoneInput.trim()"
              styleClass="w-full md:w-auto" />
          </div>
        </div>
        @if (store.error(); as err) {
          <p class="mt-3 text-sm text-red-600">{{ err }}</p>
        }
      </p-card>

      <!-- Conteúdo principal: lista + detalhes -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Lista de conversas -->
        <div class="lg:col-span-1">
          <p-card class="shadow-sm h-full">
            <ng-template pTemplate="header">
              <div class="flex items-center justify-between">
                <span class="font-semibold">Conversas</span>
                @if (store.loadingList()) {
                  <i class="pi pi-spin pi-spinner text-sm text-surface-500"></i>
                }
              </div>
            </ng-template>

            @if (store.loadingList()) {
              <div class="space-y-3">
                <p-skeleton width="100%" height="3rem" />
                <p-skeleton width="100%" height="3rem" />
                <p-skeleton width="100%" height="3rem" />
              </div>
            } @else if (store.conversations().length === 0) {
              <p class="text-sm text-surface-500 m-0">Nenhuma conversa encontrada.</p>
            } @else {
              <ul class="divide-y divide-surface-200 -mx-3">
                @for (c of store.conversations(); track c.id) {
                  <li>
                    <button
                      type="button"
                      class="w-full text-left px-3 py-3 flex flex-col gap-1 hover:bg-surface-50"
                      [ngClass]="{
                        'bg-primary-50 border-l-2 border-primary-500': store.selectedConversation()?.id === c.id
                      }"
                      (click)="store.selecionarConversa(c.id)">
                      <div class="flex items-center justify-between gap-2">
                        <span class="font-medium text-sm text-surface-900 truncate">
                          {{ c.phoneNumber }}
                        </span>
                        <p-tag
                          [severity]="c.status === 'active' ? 'success' : 'secondary'"
                          [value]="c.status === 'active' ? 'Ativa' : 'Encerrada'"
                          styleClass="text-xs" />
                      </div>
                      <div class="flex items-center justify-between text-xs text-surface-500">
                        <span>
                          Última mensagem:
                          {{ c.lastMessageAtDate ?? c.lastMessageAt | date: 'short' }}
                        </span>
                      </div>
                    </button>
                  </li>
                }
              </ul>
            }
          </p-card>
        </div>

        <!-- Detalhes / mensagens -->
        <div class="lg:col-span-2">
          <p-card class="shadow-sm h-full flex flex-col">
            <ng-template pTemplate="header">
              <div class="flex items-center justify-between gap-2">
                <div>
                  <p class="text-sm font-semibold text-surface-900 m-0">
                    {{ store.selectedConversation()?.phoneNumber || 'Nenhuma conversa selecionada' }}
                  </p>
                  @if (store.selectedConversation(); as conv) {
                    <p class="text-xs text-surface-500 m-0">
                      Status:
                      {{ conv.status === 'active' ? 'Ativa' : 'Encerrada' }}
                    </p>
                  }
                </div>
                <div class="flex items-center gap-2">
                  <p-button
                    label="Respostas do agente"
                    icon="pi pi-robot"
                    [text]="true"
                    (onClick)="store.carregarRespostasAgente()"
                    [disabled]="!store.phone().trim()" />
                </div>
              </div>
            </ng-template>

            <div class="flex flex-col lg:flex-row gap-4 h-full">
              <!-- Mensagens da conversa -->
              <div class="flex-1 flex flex-col min-h-[220px] max-h-[460px]">
                <h2 class="text-sm font-semibold text-surface-700 mb-2">Mensagens recentes</h2>
                @if (store.loadingMessages()) {
                  <p-skeleton width="100%" height="200px" />
                } @else if (!store.selectedConversation()) {
                  <p class="text-sm text-surface-500">Selecione uma conversa para ver as mensagens.</p>
                } @else if (store.messages().length === 0) {
                  <p class="text-sm text-surface-500">Nenhuma mensagem encontrada para esta conversa.</p>
                } @else {
                  <div class="flex-1 overflow-auto space-y-3 pr-1">
                    @for (m of store.messages(); track m.id) {
                      <div class="flex flex-col gap-1 border border-surface-200 rounded-md p-2">
                        <p class="text-xs text-surface-500 m-0">
                          {{ m.createdAtDate ?? m.createdAt | date: 'short' }} • {{ m.source }}
                        </p>
                        <p class="text-xs text-surface-600 m-0">
                          <span class="font-semibold">Cliente:</span>
                          {{ m.question }}
                        </p>
                        <p class="text-sm text-surface-900 m-0 whitespace-pre-line">
                          {{ m.response.text }}
                        </p>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Respostas do agente (por telefone) -->
              <div class="w-full lg:w-64 flex flex-col min-h-[220px] max-h-[460px]">
                <h2 class="text-sm font-semibold text-surface-700 mb-2">Histórico do agente</h2>
                @if (store.loadingResponses()) {
                  <p-skeleton width="100%" height="200px" />
                } @else if (store.responses().length === 0) {
                  <p class="text-sm text-surface-500">
                    Carregue as respostas do agente para este telefone.
                  </p>
                } @else {
                  <div class="flex-1 overflow-auto space-y-3 pr-1">
                    @for (r of store.responses(); track r.id) {
                      <div class="border border-surface-200 rounded-md p-2">
                        <p class="text-xs text-surface-500 m-0">
                          {{ r.createdAtDate ?? r.createdAt | date: 'short' }}
                        </p>
                        <p class="text-xs text-surface-600 m-0">
                          <span class="font-semibold">Pergunta:</span> {{ r.question }}
                        </p>
                        <p class="text-xs text-surface-900 m-0 whitespace-pre-line">
                          <span class="font-semibold">Resposta:</span> {{ r.response.text }}
                        </p>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </p-card>
        </div>
      </div>
    </div>
  `,
})
export class ConversasPage {
  readonly store = inject(ConversasStore);

  phoneInput = '';
  status: StatusFilter = 'active';

  readonly statusOptions = [
    { label: 'Ativas', value: 'active' satisfies StatusFilter },
    { label: 'Encerradas', value: 'closed' satisfies StatusFilter },
    { label: 'Todas', value: 'all' satisfies StatusFilter },
  ];

  onBuscar() {
    const phone = this.phoneInput.trim();
    if (!phone) return;
    this.store.buscarConversas(phone);
  }

  onStatusChange() {
    this.store.atualizarStatus(this.status);
  }
}

