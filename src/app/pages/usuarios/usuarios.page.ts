import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { UsuariosStore } from '../../core/signals/usuarios.store';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, InputTextModule, ButtonModule, TableModule, TagModule, SkeletonModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-xl sm:text-2xl font-bold text-surface-900">Usuários</h1>

      <!-- Filtros -->
      <p-card class="shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Telefone</label>
            <input
              pInputText
              type="tel"
              [(ngModel)]="phoneInput"
              (keyup.enter)="onBuscar()"
              placeholder="Ex: 5599999999999"
              class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Email</label>
            <input
              pInputText
              type="email"
              [(ngModel)]="emailInput"
              (keyup.enter)="onBuscar()"
              placeholder="cliente@email.com"
              class="w-full" />
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

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Lista -->
        <p-card header="Clientes" class="shadow-sm lg:col-span-2">
          @if (store.loadingList()) {
            <p-skeleton width="100%" height="220px" />
          } @else {
            <p-table
              [value]="store.customers()"
              [scrollable]="true"
              scrollDirection="both"
              styleClass="p-datatable-sm"
              [tableStyle]="{ 'min-width': '56rem' }">
              <ng-template pTemplate="header">
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>Criado em</th>
                  <th style="width: 5rem">Ações</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-c>
                <tr>
                  <td class="text-sm">{{ c.name || '-' }}</td>
                  <td class="text-xs">{{ c.id || c.email || '-' }}</td>
                  <td class="text-xs">{{ c.phoneNumber || '-' }}</td>
                  <td class="text-xs">
                    {{ c.createdAt | date: 'short' }}
                  </td>
                  <td>
                    <p-button
                      icon="pi pi-search"
                      [text]="true"
                      [rounded]="true"
                      (onClick)="store.selecionarCliente(c)" />
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="5" class="text-center text-surface-500 py-4">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              </ng-template>
            </p-table>
            <div class="mt-4 flex justify-end">
              <p-button
                label="Carregar mais"
                icon="pi pi-chevron-down"
                (onClick)="store.carregarMais()"
                [disabled]="!store.hasMore() || store.loadingMore()"
                [loading]="store.loadingMore()" />
            </div>
          }
        </p-card>

        <!-- Detalhe -->
        <p-card header="Detalhe do usuário" class="shadow-sm lg:col-span-1">
          @if (store.loadingDetail()) {
            <p-skeleton width="100%" height="220px" />
          } @else if (!store.userDetail()) {
            <p class="text-sm text-surface-500 m-0">
              Selecione um cliente para ver os detalhes.
            </p>
          } @else {
            <div class="space-y-3 text-sm">
              <div>
                <p class="font-semibold text-surface-900 m-0">
                  {{ store.userDetail()?.customer?.name || '-' }}
                </p>
                <p class="text-xs text-surface-600 m-0">
                  {{ store.userDetail()?.customer?.id || store.userDetail()?.customer?.email || '-' }}
                </p>
              </div>
              <div class="text-xs text-surface-600">
                <p class="m-0">
                  Telefone: {{ store.userDetail()?.customer?.phoneNumber || '-' }}
                </p>
                <p class="m-0">
                  Telefone alternativo: {{ store.userDetail()?.customer?.phoneNumberAlt || '-' }}
                </p>
                <p class="m-0">
                  Pedidos: {{ store.userDetail()?.ordersCount ?? 0 }}
                </p>
              </div>
              <div>
                <p class="text-xs font-semibold text-surface-700 mb-1">Jogos</p>
                @if ((store.userDetail()?.games?.length ?? 0) === 0) {
                  <p class="text-xs text-surface-500 m-0">Nenhum jogo associado.</p>
                } @else {
                  <ul class="text-xs text-surface-700 list-disc list-inside m-0">
                    @for (g of store.userDetail()!.games; track g) {
                      <li>{{ g }}</li>
                    }
                  </ul>
                }
              </div>
              <div class="border-t border-surface-200 pt-3 space-y-2">
                <p class="text-xs font-semibold text-surface-700 m-0">
                  Alterar telefone (via email + migração)
                </p>
                <input
                  pInputText
                  type="email"
                  [(ngModel)]="changeEmailInput"
                  placeholder="Email do usuário (para localizar pedido)"
                  class="w-full text-xs" />
                <input
                  pInputText
                  type="tel"
                  [(ngModel)]="changePhoneInput"
                  placeholder="Novo telefone"
                  class="w-full text-xs" />
                <p-button
                  label="Alterar telefone"
                  icon="pi pi-refresh"
                  (onClick)="onAlterarTelefone()"
                  [loading]="store.loadingChangePhone()"
                  styleClass="w-full" />
              </div>
            </div>
          }
        </p-card>
      </div>
    </div>
  `,
})
export class UsuariosPage {
  readonly store = inject(UsuariosStore);

  phoneInput = '';
  emailInput = '';
  changeEmailInput = '';
  changePhoneInput = '';

  onBuscar() {
    this.store.phoneFilter.set(this.phoneInput);
    this.store.emailFilter.set(this.emailInput);
    this.store.listarPrimeiraPagina();
  }

  onAlterarTelefone() {
    this.store.alterarTelefone(this.changeEmailInput, this.changePhoneInput);
  }
}

