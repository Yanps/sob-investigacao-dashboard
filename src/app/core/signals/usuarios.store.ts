import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { Customer, UsersApiService, UserDetailResponse } from '../../services/users-api.service';

@Injectable({ providedIn: 'root' })
export class UsuariosStore {
  private readonly api = inject(UsersApiService);

  readonly phoneFilter = signal<string>('');
  readonly emailFilter = signal<string>('');

  private readonly customersSignal = signal<Customer[]>([]);
  readonly customers = this.customersSignal.asReadonly();
  readonly nextCursor = signal<string | null>(null);

  readonly loadingList = signal(false);
  readonly loadingMore = signal(false);
  readonly loadingDetail = signal(false);
  readonly loadingChangePhone = signal(false);
  readonly error = signal<string | null>(null);
  readonly changePhoneError = signal<string | null>(null);

  readonly selectedPhone = signal<string | null>(null);
  readonly userDetail = signal<UserDetailResponse | null>(null);

  readonly hasMore = computed(() => !!this.nextCursor());

  listarPrimeiraPagina(limit: number = 20) {
    this.loadingList.set(true);
    this.error.set(null);
    this.customersSignal.set([]);
    this.nextCursor.set(null);

    const phone = this.phoneFilter().trim() || undefined;
    const email = this.emailFilter().trim() || undefined;

    this.api
      .list({ phoneNumber: phone, email, limit })
      .pipe(
        catchError((_err) => {
          this.error.set('Não foi possível carregar os usuários.');
          return of({ customers: [], nextCursor: undefined });
        }),
        finalize(() => this.loadingList.set(false)),
      )
      .subscribe((res) => {
        const list = res.customers ?? [];
        this.customersSignal.set(list);
        this.nextCursor.set(res.nextCursor ?? null);
      });
  }

  carregarMais(limit: number = 20) {
    const cursor = this.nextCursor();
    if (!cursor) return;
    this.loadingMore.set(true);
    this.error.set(null);

    const phone = this.phoneFilter().trim() || undefined;
    const email = this.emailFilter().trim() || undefined;

    this.api
      .list({ phoneNumber: phone, email, limit, startAfter: cursor })
      .pipe(
        catchError((_err) => {
          this.error.set('Não foi possível carregar mais usuários.');
          return of({ customers: [], nextCursor: undefined });
        }),
        finalize(() => this.loadingMore.set(false)),
      )
      .subscribe((res) => {
        this.customersSignal.set([...this.customersSignal(), ...(res.customers ?? [])]);
        this.nextCursor.set(res.nextCursor ?? null);
      });
  }

  selecionarCliente(c: Customer) {
    if (!c.phoneNumber) return;
    this.selectedPhone.set(c.phoneNumber);
    this.carregarDetalhe(c.phoneNumber);
  }

  carregarDetalhe(phone: string) {
    if (this.loadingDetail()) return;

    this.loadingDetail.set(true);
    this.error.set(null);
    this.userDetail.set(null);

    this.api
      .getByPhone(phone)
      .pipe(
        catchError((_err) => {
          this.error.set('Não foi possível carregar o detalhe do usuário.');
          return of(null);
        }),
        finalize(() => this.loadingDetail.set(false)),
      )
      .subscribe((res) => {
        if (res) this.userDetail.set(res);
      });
  }

  alterarTelefone(email: string, newPhone: string) {
    const trimmedEmail = email.trim();
    const trimmedPhone = newPhone.trim();
    if (!trimmedEmail || !trimmedPhone) {
      this.changePhoneError.set('Email e novo telefone são obrigatórios.');
      return;
    }

    this.loadingChangePhone.set(true);
    this.changePhoneError.set(null);

    this.api
      .changePhone({ email: trimmedEmail, newPhoneNumber: trimmedPhone })
      .pipe(
        catchError((err) => {
          const msg = err?.error?.message || 'Não foi possível alterar o telefone.';
          this.changePhoneError.set(msg);
          return of({ success: false, message: '' });
        }),
        finalize(() => this.loadingChangePhone.set(false)),
      )
      .subscribe((res) => {
        if (res.success) {
          this.changePhoneError.set(null);
          this.selectedPhone.set(trimmedPhone);
          this.carregarDetalhe(trimmedPhone);
        }
      });
  }
}

