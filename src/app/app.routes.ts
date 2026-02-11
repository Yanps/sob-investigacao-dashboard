import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.page').then((m) => m.LoginPage),
    title: 'Login - SOB Dashboard',
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
        title: 'Dashboard - SOB',
      },
      {
        path: 'conversas',
        loadComponent: () => import('./pages/conversas/conversas.page').then((m) => m.ConversasPage),
        title: 'Conversas - SOB',
      },
      {
        path: 'codigos',
        loadComponent: () => import('./pages/codigos/codigos.page').then((m) => m.CodigosPage),
        title: 'Códigos - SOB',
      },
      {
        path: 'jogos',
        loadComponent: () => import('./pages/jogos/jogos.page').then((m) => m.JogosPage),
        title: 'Jogos - SOB',
      },
      {
        path: 'jobs',
        loadComponent: () => import('./pages/jobs/jobs.page').then((m) => m.JobsPage),
        title: 'Jobs - SOB',
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/usuarios/usuarios.page').then((m) => m.UsuariosPage),
        title: 'Usuários - SOB',
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
