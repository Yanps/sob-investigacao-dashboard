import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { GameItem, GamesApiService } from '../../services/games-api.service';

export type ActiveFilter = 'all' | 'active' | 'inactive';

@Injectable({ providedIn: 'root' })
export class JogosStore {
  private readonly api = inject(GamesApiService);

  readonly typeFilter = signal<string>('');
  readonly activeFilter = signal<ActiveFilter>('all');

  private readonly gamesSignal = signal<GameItem[]>([]);
  readonly games = this.gamesSignal.asReadonly();
  readonly nextCursor = signal<string | null>(null);

  readonly loadingList = signal(false);
  readonly loadingMore = signal(false);
  readonly loadingSave = signal(false);
  readonly error = signal<string | null>(null);
  readonly saveSuccess = signal(false);

  readonly selectedGame = signal<GameItem | null>(null);

  readonly hasMore = computed(() => !!this.nextCursor());

  private mapFilters(): { active?: boolean; type?: string } {
    const type = this.typeFilter().trim() || undefined;
    const activeFilter = this.activeFilter();
    let active: boolean | undefined;
    if (activeFilter === 'active') active = true;
    if (activeFilter === 'inactive') active = false;
    return { active, type };
  }

  carregarPrimeiraPagina(limit: number = 20) {
    const { active, type } = this.mapFilters();
    this.loadingList.set(true);
    this.error.set(null);
    this.gamesSignal.set([]);
    this.nextCursor.set(null);

    this.api
      .list({ active, type, limit })
      .pipe(
        catchError((_err) => {
          this.error.set('Não foi possível carregar os jogos.');
          return of({ games: [], nextCursor: undefined });
        }),
        finalize(() => this.loadingList.set(false)),
      )
      .subscribe((res) => {
        this.gamesSignal.set(res.games ?? []);
        this.nextCursor.set(res.nextCursor ?? null);
      });
  }

  carregarMais(limit: number = 20) {
    const cursor = this.nextCursor();
    if (!cursor) return;
    const { active, type } = this.mapFilters();
    this.loadingMore.set(true);
    this.error.set(null);

    this.api
      .list({ active, type, limit, startAfter: cursor })
      .pipe(
        catchError((_err) => {
          this.error.set('Não foi possível carregar mais jogos.');
          return of({ games: [], nextCursor: undefined });
        }),
        finalize(() => this.loadingMore.set(false)),
      )
      .subscribe((res) => {
        const list = res.games ?? [];
        this.gamesSignal.set([...this.gamesSignal(), ...list]);
        this.nextCursor.set(res.nextCursor ?? null);
      });
  }

  selecionar(game: GameItem | null) {
    this.selectedGame.set(game);
  }

  salvar(game: Partial<GameItem>) {
    const payload = {
      name: game.name?.trim() ?? '',
      type: game.type?.trim() ?? '',
      prompts: game.prompts ?? {},
      config: game.config ?? {},
      active: game.active,
    };
    if (!payload.name || !payload.type) {
      this.error.set('Nome e tipo são obrigatórios.');
      return;
    }
    this.loadingSave.set(true);
    this.error.set(null);
    this.saveSuccess.set(false);

    const existingId = (game as GameItem).id;
    const request$ = existingId
      ? this.api.update(existingId, payload)
      : this.api.create({ name: payload.name, type: payload.type, prompts: payload.prompts, config: payload.config });

    request$
      .pipe(
        catchError((_err) => {
          this.error.set('Não foi possível salvar o jogo.');
          return of(null);
        }),
        finalize(() => this.loadingSave.set(false)),
      )
      .subscribe((saved) => {
        if (!saved) return;
        const list = this.gamesSignal();
        if (existingId) {
          this.gamesSignal.set(list.map((g) => (g.id === existingId ? saved : g)));
        } else {
          this.gamesSignal.set([saved, ...list]);
        }
        this.selectedGame.set(saved);
        this.saveSuccess.set(true);
      });
  }
}

