import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [CardModule, ButtonModule, RouterLink],
  template: `
    <div class="min-h-[70vh] flex items-center justify-center p-4">
      <p-card class="w-full max-w-md shadow-lg text-center">
        <div class="flex flex-col items-center gap-4 py-4">
          <span class="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600" aria-hidden="true">
            <i class="pi pi-search text-3xl"></i>
          </span>
          <div>
            <h1 class="text-2xl font-bold text-surface-900">Página não encontrada</h1>
            <p class="text-surface-600 mt-2">
              O endereço que você acessou não existe (404).
            </p>
          </div>
          <div class="flex flex-wrap gap-2 justify-center">
            <p-button label="Ir para o dashboard" icon="pi pi-home" [routerLink]="['/dashboard']" />
            <p-button label="Fazer login" icon="pi pi-sign-in" [routerLink]="['/login']" severity="secondary" />
          </div>
        </div>
      </p-card>
    </div>
  `,
})
export class NotFoundPage {}
