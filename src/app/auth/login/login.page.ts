import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { AuthStore } from '../../core/signals/auth.store';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule,
    MessageModule,
  ],
  template: `
    <div class="min-h-screen flex flex-col md:flex-row">
      <!-- Lado esquerdo: branding (oculto em mobile pequeno, opcional em tablet) -->
      <div
        class="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-primary-500 text-white flex-col justify-center px-8 xl:px-16 py-12">
        <h1 class="text-2xl xl:text-3xl font-bold mb-2">SOB Investigação</h1>
        <p class="text-primary-100 text-sm xl:text-base">
          Dashboard unificado para análise, conversas e códigos.
        </p>
      </div>

      <!-- Lado direito: formulário -->
      <div
        class="w-full lg:w-1/2 xl:w-3/5 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
        <div class="w-full max-w-md">
          <div class="lg:hidden mb-6 text-center">
            <h1 class="text-xl font-bold text-surface-900">SOB Investigação</h1>
          </div>

          <p-card class="shadow-lg border-0 rounded-lg overflow-hidden">
            <ng-template pTemplate="header">
              <div class="p-4 sm:p-6 border-b border-surface-200">
                <h2 class="text-lg sm:text-xl font-semibold text-surface-900 m-0">
                  Entrar
                </h2>
                <p class="text-surface-600 text-sm mt-1 mb-0">
                  Use suas credenciais do dashboard.
                </p>
              </div>
            </ng-template>
            <div class="p-4 sm:p-6">
              @if (auth.error(); as err) {
                <p-message severity="error" [text]="err" class="w-full mb-4" />
              }
              <form (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                  <label for="email" class="font-medium text-surface-700 text-sm">
                    E-mail
                  </label>
                  <input
                    pInputText
                    id="email"
                    type="email"
                    [(ngModel)]="email"
                    name="email"
                    placeholder="seu@email.com"
                    class="w-full"
                    required
                    autocomplete="email" />
                </div>
                <div class="flex flex-col gap-2">
                  <label for="password" class="font-medium text-surface-700 text-sm">
                    Senha
                  </label>
                  <p-password
                    id="password"
                    [(ngModel)]="password"
                    name="password"
                    placeholder="Senha"
                    [feedback]="false"
                    [toggleMask]="true"
                    styleClass="w-full"
                    inputStyleClass="w-full"
                    inputId="password-inp"
                    autocomplete="current-password" />
                </div>
                <p-button
                  type="submit"
                  label="Entrar"
                  icon="pi pi-sign-in"
                  [loading]="auth.loading()"
                  [disabled]="!email.trim() || !password"
                  styleClass="w-full mt-2" />
              </form>
            </div>
          </p-card>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class LoginPage {
  readonly auth = inject(AuthStore);
  email = '';
  password = '';

  onSubmit() {
    if (!this.email.trim() || !this.password) return;
    this.auth.login(this.email.trim(), this.password).subscribe();
  }
}
