import { Component, inject, signal, effect } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { AuthStore } from '../../core/signals/auth.store';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, SidebarModule, MenuModule, AvatarModule, TooltipModule],
  template: `
    <div class="flex min-h-screen w-full bg-surface-100 dark:bg-surface-900">
      <!-- Sidebar desktop: fixo à esquerda, oculto em mobile -->
      <aside
        class="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 bg-surface-0 dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 shrink-0 z-10">
        <div class="p-4 border-b border-surface-200 dark:border-surface-700">
          <h1 class="text-lg font-semibold text-primary-600 dark:text-primary-400 truncate">SOB Investigação</h1>
        </div>
        <nav class="flex-1 overflow-y-auto py-2">
          <ul class="space-y-0.5 px-2">
            <li>
              <a
                routerLink="/dashboard"
                routerLinkActive="!bg-primary-50 !text-primary-700 dark:!bg-primary-900/30 dark:!text-primary-400"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                <i class="pi pi-home text-lg"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a
                routerLink="/conversas"
                routerLinkActive="!bg-primary-50 !text-primary-700 dark:!bg-primary-900/30 dark:!text-primary-400"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                <i class="pi pi-comments text-lg"></i>
                <span>Conversas</span>
              </a>
            </li>
            <li>
              <a
                routerLink="/codigos"
                routerLinkActive="!bg-primary-50 !text-primary-700 dark:!bg-primary-900/30 dark:!text-primary-400"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                <i class="pi pi-tag text-lg"></i>
                <span>Códigos</span>
              </a>
            </li>
            <li>
              <a
                routerLink="/jogos"
                routerLinkActive="!bg-primary-50 !text-primary-700 dark:!bg-primary-900/30 dark:!text-primary-400"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                <i class="pi pi-th-large text-lg"></i>
                <span>Jogos</span>
              </a>
            </li>
            <li>
              <a
                routerLink="/jobs"
                routerLinkActive="!bg-primary-50 !text-primary-700 dark:!bg-primary-900/30 dark:!text-primary-400"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                <i class="pi pi-list text-lg"></i>
                <span>Jobs</span>
              </a>
            </li>
            <li>
              <a
                routerLink="/usuarios"
                routerLinkActive="!bg-primary-50 !text-primary-700 dark:!bg-primary-900/30 dark:!text-primary-400"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
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
        [style]="{ 'background-color': isDark() ? '#1e293b' : '#ffffff' }"
        styleClass="w-64 lg:hidden">
        <ng-template pTemplate="header">
          <span class="font-semibold" [style.color]="isDark() ? '#60a5fa' : '#2563eb'">Menu</span>
        </ng-template>
        <nav class="py-2">
          <ul class="space-y-0.5">
            <li>
              <a routerLink="/dashboard" routerLinkActive="sidebar-active" (click)="sidebarVisible = false"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                [style.color]="isDark() ? '#e5e7eb' : '#374151'">
                <i class="pi pi-home"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a routerLink="/conversas" routerLinkActive="sidebar-active" (click)="sidebarVisible = false"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                [style.color]="isDark() ? '#e5e7eb' : '#374151'">
                <i class="pi pi-comments"></i>
                <span>Conversas</span>
              </a>
            </li>
            <li>
              <a routerLink="/codigos" routerLinkActive="sidebar-active" (click)="sidebarVisible = false"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                [style.color]="isDark() ? '#e5e7eb' : '#374151'">
                <i class="pi pi-tag"></i>
                <span>Códigos</span>
              </a>
            </li>
            <li>
              <a routerLink="/jogos" routerLinkActive="sidebar-active" (click)="sidebarVisible = false"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                [style.color]="isDark() ? '#e5e7eb' : '#374151'">
                <i class="pi pi-th-large"></i>
                <span>Jogos</span>
              </a>
            </li>
            <li>
              <a routerLink="/jobs" routerLinkActive="sidebar-active" (click)="sidebarVisible = false"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                [style.color]="isDark() ? '#e5e7eb' : '#374151'">
                <i class="pi pi-list"></i>
                <span>Jobs</span>
              </a>
            </li>
            <li>
              <a routerLink="/usuarios" routerLinkActive="sidebar-active" (click)="sidebarVisible = false"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
                [style.color]="isDark() ? '#e5e7eb' : '#374151'">
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
        <header class="sticky top-0 z-20 flex items-center gap-3 h-14 px-4 sm:px-6 bg-surface-0 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 shrink-0">
          <p-button
            icon="pi pi-bars"
            [rounded]="true"
            [text]="true"
            severity="secondary"
            (onClick)="sidebarVisible = true"
            class="lg:!hidden" />
          <div class="flex-1 min-w-0">
            <h2 class="text-base sm:text-lg font-semibold text-surface-900 dark:text-surface-0 truncate">SOB Dashboard</h2>
          </div>
          <div class="flex items-center gap-2">
            <span class="hidden sm:inline text-sm text-surface-600 dark:text-surface-300 truncate max-w-[120px] md:max-w-[180px]">
              {{ auth.user()?.name || auth.user()?.email }}
            </span>
            <p-button
              [icon]="isDark() ? 'pi pi-sun' : 'pi pi-moon'"
              [rounded]="true"
              [text]="true"
              severity="secondary"
              (onClick)="toggleTheme()"
              pTooltip="Alternar tema" />
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
  private readonly document = inject(DOCUMENT);
  readonly auth = inject(AuthStore);
  sidebarVisible = false;

  isDark = signal(this.getInitialTheme());

  constructor() {
    effect(() => {
      const dark = this.isDark();
      if (dark) {
        this.document.documentElement.classList.add('dark');
      } else {
        this.document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
  }

  private getInitialTheme(): boolean {
    const stored = localStorage.getItem('theme');
    if (stored) {
      return stored === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  toggleTheme(): void {
    this.isDark.update(v => !v);
  }
}
