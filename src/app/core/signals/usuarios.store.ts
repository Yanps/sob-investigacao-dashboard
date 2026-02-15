import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, of, forkJoin } from 'rxjs';
import { Customer, UsersApiService, UserDetailResponse } from '../../services/users-api.service';
import { GamesApiService, GameItem } from '../../services/games-api.service';

@Injectable({ providedIn: 'root' })
export class UsuariosStore {
  private readonly api = inject(UsersApiService);
  private readonly gamesApi = inject(GamesApiService);

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
  readonly changePhoneSuccess = signal<string | null>(null);

  readonly selectedPhone = signal<string | null>(null);
  readonly userDetail = signal<UserDetailResponse | null>(null);

  // Mapa de jogos: código -> nome completo
  private readonly gamesMapSignal = signal<Map<string, string>>(new Map());
  private gamesLoaded = false;

  readonly hasMore = computed(() => !!this.nextCursor());

  // Computed que retorna os jogos com nomes completos
  readonly userGamesWithNames = computed(() => {
    const detail = this.userDetail();
    const gamesMap = this.gamesMapSignal();
    if (!detail?.games) return [];
    return detail.games.map(code => ({
      code,
      name: gamesMap.get(code) || gamesMap.get(code.toLowerCase()) || code,
    }));
  });

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
    console.log('[DEBUG] selecionarCliente chamado com:', c);
    console.log('[DEBUG] c.phoneNumber:', c.phoneNumber, '| tipo:', typeof c.phoneNumber);
    if (!c.phoneNumber) {
      console.log('[DEBUG] phoneNumber vazio/undefined, retornando...');
      return;
    }
    const phoneStr = String(c.phoneNumber);
    this.selectedPhone.set(phoneStr);
    this.userDetail.set(null);
    this.loadingDetail.set(false);
    console.log('[DEBUG] Chamando carregarDetalhe com:', phoneStr);
    this.carregarDetalhe(phoneStr);
  }

  carregarDetalhe(phone: string) {
    console.log('[DEBUG] carregarDetalhe chamado com phone:', phone);
    this.loadingDetail.set(true);
    this.error.set(null);
    this.userDetail.set(null);

    console.log('[DEBUG] Fazendo requisição para getByPhone...');

    // Carrega jogos em paralelo se ainda não foram carregados
    const requests: any[] = [this.api.getByPhone(phone)];
    if (!this.gamesLoaded) {
      requests.push(this.gamesApi.list({ limit: 100 }));
    }

    forkJoin(requests)
      .pipe(
        catchError((_err) => {
          console.log('[DEBUG] Erro na requisição:', _err);
          this.error.set('Não foi possível carregar o detalhe do usuário.');
          return of([null, null]);
        }),
        finalize(() => {
          console.log('[DEBUG] Finalize - setando loadingDetail para false');
          this.loadingDetail.set(false);
        }),
      )
      .subscribe((results: any[]) => {
        const userRes = results[0] as UserDetailResponse | null;
        const gamesRes = results[1] as { games: GameItem[] } | null | undefined;

        // Atualiza mapa de jogos se carregou
        if (gamesRes?.games) {
          const map = new Map<string, string>();
          for (const g of gamesRes.games) {
            map.set(g.id, g.name);
            map.set(g.id.toLowerCase(), g.name);
            if (g.productId) {
              map.set(g.productId, g.name);
              map.set(g.productId.toLowerCase(), g.name);
            }
          }
          this.gamesMapSignal.set(map);
          this.gamesLoaded = true;
        }

        console.log('[DEBUG] Resposta recebida:', userRes);
        if (userRes) this.userDetail.set(userRes);
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
    this.changePhoneSuccess.set(null);

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
          this.changePhoneSuccess.set(res.message || 'Telefone alterado com sucesso!');
          this.selectedPhone.set(trimmedPhone);
          this.carregarDetalhe(trimmedPhone);
        }
      });
  }

  limparMensagens() {
    this.changePhoneError.set(null);
    this.changePhoneSuccess.set(null);
  }
}

