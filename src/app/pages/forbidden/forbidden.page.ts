import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-forbidden-page',
  standalone: true,
  imports: [CardModule, ButtonModule, RouterLink],
  template: `
    <div class="min-h-[70vh] flex items-center justify-center p-4">
      <p-card class="w-full max-w-md shadow-lg text-center">
        <div class="flex flex-col items-center gap-4 py-4">
          <span class="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600" aria-hidden="true">
            <i class="pi pi-lock text-3xl"></i>
          </span>
          <div>
            <h1 class="text-2xl font-bold text-surface-900">Acesso negado</h1>
            <p class="text-surface-600 mt-2">
              Você não tem permissão para acessar este recurso (403).
            </p>
          </div>
          <div class="flex flex-wrap gap-2 justify-center">
            <p-button label="Ir para o login" icon="pi pi-sign-in" [routerLink]="['/login']" />
            <p-button label="Voltar ao dashboard" icon="pi pi-home" [routerLink]="['/dashboard']" severity="secondary" />
          </div>
        </div>
      </p-card>
    </div>
  `,
})
export class ForbiddenPage {}
