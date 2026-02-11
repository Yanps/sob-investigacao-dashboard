import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { AuthStore } from '../../core/signals/auth.store';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, SidebarModule, MenuModule, AvatarModule],
  template: `
    <div class="flex min-h-screen w-full bg-surface-100">
      <!-- Sidebar desktop: fixo à esquerda, oculto em mobile -->
      <aside
        class="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 bg-surface-0 border-r border-surface-200 shrink-0 z-10">
        <div class="p-4 border-b border-surface-200">
          <h1 class="text-lg font-semibold text-primary-600 truncate">SOB Investigação</h1>
        </div>
        <nav class="flex-1 overflow-y-auto py-2">
          <ul class="space-y-0.5 px-2">
            <li>
              <a
                routerLink="/dashboard"
                routerLinkActive="!bg-primary-50 !text-primary-700"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-700 hover:bg-surface-100 transition-colors">
                <i class="pi pi-home text-lg"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a
                routerLink="/conversas"
                routerLinkActive="!bg-primary-50 !text-primary-700"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-700 hover:bg-surface-100 transition-colors">
                <i class="pi pi-comments text-lg"></i>
                <span>Conversas</span>
              </a>
            </li>
            <li>
              <a
                routerLink="/codigos"
                routerLinkActive="!bg-primary-50 !text-primary-700"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-700 hover:bg-surface-100 transition-colors">
                <i class="pi pi-tag text-lg"></i>
                <span>Códigos</span>
              </a>
            </li>
            <li>
              <a
                routerLink="/jogos"
                routerLinkActive="!bg-primary-50 !text-primary-700"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-700 hover:bg-surface-100 transition-colors">
                <i class="pi pi-th-large text-lg"></i>
                <span>Jogos</span>
              </a>
            </li>
            <li>
              <a
                routerLink="/jobs"
                routerLinkActive="!bg-primary-50 !text-primary-700"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-700 hover:bg-surface-100 transition-colors">
                <i class="pi pi-list text-lg"></i>
                <span>Jobs</span>
              </a>
            </li>
            <li>
              <a
                routerLink="/usuarios"
                routerLinkActive="!bg-primary-50 !text-primary-700"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-700 hover:bg-surface-100 transition-colors">
                <i class="pi pi-users text-lg"></i>
                <span>Usuários</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Sidebar mobile (overlay) -->
      <p-sidebar
        [(visible)]="sidebarVisible"
        position="left"
        [showCloseIcon]="true"
        [modal]="true"
        [dismissible]="true"
        styleClass="w-64 lg:hidden">
        <ng-template pTemplate="header">
          <span class="font-semibold text-primary-600">Menu</span>
        </ng-template>
        <nav class="py-2">
          <ul class="space-y-0.5">
            <li>
              <a routerLink="/dashboard" routerLinkActive="bg-primary-50 text-primary-700" (click)="sidebarVisible = false"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-700 hover:bg-surface-100" href="#">
                <i class="pi pi-home"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a routerLink="/conversas" routerLinkActive="bg-primary-50 text-primary-700" (click)="sidebarVisible = false"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-700 hover:bg-surface-100" href="#">
                <i class="pi pi-comments"></i>
                <span>Conversas</span>
              </a>
            </li>
            <li>
              <a routerLink="/codigos" routerLinkActive="bg-primary-50 text-primary-700" (click)="sidebarVisible = false"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-700 hover:bg-surface-100" href="#">
                <i class="pi pi-tag"></i>
                <span>Códigos</span>
              </a>
            </li>
            <li>
              <a routerLink="/jogos" routerLinkActive="bg-primary-50 text-primary-700" (click)="sidebarVisible = false"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-700 hover:bg-surface-100" href="#">
                <i class="pi pi-th-large"></i>
                <span>Jogos</span>
              </a>
            </li>
            <li>
              <a routerLink="/jobs" routerLinkActive="bg-primary-50 text-primary-700" (click)="sidebarVisible = false"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-700 hover:bg-surface-100" href="#">
                <i class="pi pi-list"></i>
                <span>Jobs</span>
              </a>
            </li>
            <li>
              <a routerLink="/usuarios" routerLinkActive="bg-primary-50 text-primary-700" (click)="sidebarVisible = false"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-700 hover:bg-surface-100" href="#">
                <i class="pi pi-users"></i>
                <span>Usuários</span>
              </a>
            </li>
          </ul>
        </nav>
      </p-sidebar>

      <!-- Área principal -->
      <div class="flex flex-col flex-1 min-w-0">
        <!-- Toolbar: responsiva (menu em mobile, título + user em desktop) -->
        <header class="sticky top-0 z-20 flex items-center gap-3 h-14 px-4 sm:px-6 bg-surface-0 border-b border-surface-200 shrink-0">
          <p-button
            icon="pi pi-bars"
            [rounded]="true"
            [text]="true"
            severity="secondary"
            (onClick)="sidebarVisible = true"
            class="lg:!hidden" />
          <div class="flex-1 min-w-0">
            <h2 class="text-base sm:text-lg font-semibold text-surface-900 truncate">SOB Dashboard</h2>
          </div>
          <div class="flex items-center gap-2">
            <span class="hidden sm:inline text-sm text-surface-600 truncate max-w-[120px] md:max-w-[180px]">
              {{ auth.user()?.name || auth.user()?.email }}
            </span>
            <p-button
              icon="pi pi-sign-out"
              [rounded]="true"
              [text]="true"
              severity="secondary"
              (onClick)="auth.logout()" />
          </div>
        </header>

        <!-- Conteúdo da página -->
        <main class="flex-1 overflow-auto p-4 sm:p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  readonly auth = inject(AuthStore);
  sidebarVisible = false;
}
