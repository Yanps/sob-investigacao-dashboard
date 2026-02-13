import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { UsuariosStore } from '../../core/signals/usuarios.store';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, InputTextModule, InputMaskModule, ButtonModule, TableModule, TagModule, SkeletonModule, DialogModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-xl sm:text-2xl font-bold text-surface-900">Usuários</h1>

      <!-- Filtros -->
      <p-card class="shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 mb-1">Telefone</label>
            <p-inputMask
              [(ngModel)]="phoneInput"
              mask="99 (99) 99999-9999"
              placeholder="55 (99) 99999-9999"
              (keyup.enter)="onBuscar()"
              styleClass="w-full" />
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

      <!-- Lista -->
      <p-card header="Clientes" class="shadow-sm">
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
                <td class="text-xs">{{ formatPhone(c.phoneNumber) }}</td>
                <td class="text-xs">
                  {{ toDate(c.createdAt) | date: 'short' }}
                </td>
                <td>
                  <p-button
                    icon="pi pi-search"
                    [text]="true"
                    [rounded]="true"
                    (onClick)="abrirModal(c)" />
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

      <!-- Modal de Detalhe -->
      <p-dialog
        header="Detalhe do Usuário"
        [visible]="modalVisible()"
        (visibleChange)="modalVisible.set($event)"
        [modal]="true"
        [style]="{ width: '28rem' }"
        [draggable]="false"
        [resizable]="false">
        @if (store.loadingDetail()) {
          <div class="space-y-4">
            <p-skeleton width="60%" height="1.5rem" />
            <p-skeleton width="100%" height="1rem" />
            <p-skeleton width="100%" height="4rem" />
            <p-skeleton width="100%" height="6rem" />
          </div>
        } @else {
          @if (store.userDetail(); as detail) {
            <div class="space-y-4">
              <div>
                <p class="font-semibold text-surface-900 m-0 text-lg">
                  {{ detail.customer?.name || '-' }}
                </p>
                <p class="text-sm text-surface-600 m-0">
                  {{ detail.customer?.id || detail.customer?.email || '-' }}
                </p>
              </div>
              <div class="text-sm text-surface-600 space-y-1">
                <p class="m-0">
                  <span class="font-medium">Telefone:</span> {{ formatPhone(detail.customer?.phoneNumber) }}
                </p>
                <p class="m-0">
                  <span class="font-medium">Telefone alternativo:</span> {{ formatPhone(detail.customer?.phoneNumberAlt) }}
                </p>
                <p class="m-0">
                  <span class="font-medium">Pedidos:</span> {{ detail.ordersCount ?? 0 }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-surface-700 mb-1">Jogos</p>
                @if ((detail.games?.length ?? 0) === 0) {
                  <p class="text-sm text-surface-500 m-0">Nenhum jogo associado.</p>
                } @else {
                  <ul class="text-sm text-surface-700 list-disc list-inside m-0">
                    @for (g of detail.games; track g) {
                      <li>{{ g }}</li>
                    }
                  </ul>
                }
              </div>
              <div class="border-t border-surface-200 pt-4 space-y-3">
                <p class="text-sm font-medium text-surface-700 m-0">
                  Alterar telefone
                </p>
                <div>
                  <label class="block text-xs text-surface-600 mb-1">Email (para localizar pedido)</label>
                  <input
                    pInputText
                    type="email"
                    [(ngModel)]="changeEmailInput"
                    placeholder="cliente@email.com"
                    class="w-full" />
                </div>
                <div>
                  <label class="block text-xs text-surface-600 mb-1">Novo telefone</label>
                  <p-inputMask
                    [(ngModel)]="changePhoneInput"
                    mask="99 (99) 99999-9999"
                    placeholder="55 (99) 99999-9999"
                    styleClass="w-full" />
                </div>
                <p-button
                  label="Alterar telefone"
                  icon="pi pi-refresh"
                  (onClick)="onAlterarTelefone()"
                  [loading]="store.loadingChangePhone()"
                  styleClass="w-full" />
                @if (store.changePhoneError(); as err) {
                  <p class="text-xs text-red-600 mt-2 m-0">{{ err }}</p>
                }
              </div>
            </div>
          }
        }
      </p-dialog>
    </div>
  `,
})
export class UsuariosPage {
  readonly store = inject(UsuariosStore);

  phoneInput = '';
  emailInput = '';
  changeEmailInput = '';
  changePhoneInput = '';
  modalVisible = signal(false);

  toDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') return new Date(value);
    const obj = value as { seconds?: number; _seconds?: number };
    const seconds = obj.seconds ?? obj._seconds;
    if (seconds) return new Date(seconds * 1000);
    return null;
  }

  formatPhone(phone: unknown): string {
    if (!phone) return '-';
    const str = String(phone);
    const digits = str.replace(/\D/g, '');
    if (digits.length === 13) {
      // 55 21 99999 9999 -> 55 (21) 99999-9999
      return `${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
    }
    if (digits.length === 11) {
      // 21 99999 9999 -> (21) 99999-9999
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    return str;
  }

  onBuscar() {
    this.store.phoneFilter.set(this.phoneInput);
    this.store.emailFilter.set(this.emailInput);
    this.store.listarPrimeiraPagina();
  }

  abrirModal(c: { phoneNumber?: string; id?: string }) {
    if (!c.phoneNumber) return;
    this.changeEmailInput = c.id || '';
    this.changePhoneInput = '';
    this.store.changePhoneError.set(null);
    this.modalVisible.set(true);
    this.store.selecionarCliente(c as any);
  }

  onAlterarTelefone() {
    this.store.alterarTelefone(this.changeEmailInput, this.changePhoneInput);
  }
}

