import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { CodeItem, CodesApiService } from '../../services/codes-api.service';
import { MOCK_CODES_LIST } from '../mocks/page-mocks';

export type UsedFilter = 'all' | 'used' | 'unused';

function toDate(value: any): Date | null {
  if (!value) return null;
  if (typeof value === 'object' && 'seconds' in value) {
    return new Date((value.seconds as number) * 1000);
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

@Injectable({ providedIn: 'root' })
export class CodigosStore {
  private readonly api = inject(CodesApiService);

  // filtros
  readonly batchId = signal<string>('');
  readonly usedFilter = signal<UsedFilter>('all');

  // listagem
  private readonly codesSignal = signal<CodeItem[]>([]);
  readonly codes = this.codesSignal.asReadonly();
  readonly nextCursor = signal<string | null>(null);

  // geração
  readonly formProductId = signal<string>('');
  readonly formBatchId = signal<string>('');
  readonly formQuantity = signal<number>(1);
  readonly generatedBatchId = signal<string | null>(null);
  readonly generatedCodes = signal<string[]>([]);

  // busca por código específico
  readonly searchCode = signal<string>('');
  readonly searchResult = signal<CodeItem | null>(null);

  // metadados
  readonly loadingList = signal(false);
  readonly loadingMore = signal(false);
  readonly loadingGenerate = signal(false);
  readonly loadingSearch = signal(false);
  readonly error = signal<string | null>(null);

  readonly hasMore = computed(() => !!this.nextCursor());

  private mapFilters(): { batchId?: string; used?: boolean } {
    const usedFilter = this.usedFilter();
    let used: boolean | undefined;
    if (usedFilter === 'used') used = true;
    if (usedFilter === 'unused') used = false;
    const batchId = this.batchId().trim() || undefined;
    return { batchId, used };
  }

  buscarPrimeiraPagina(limit: number = 20) {
    const { batchId, used } = this.mapFilters();
    this.loadingList.set(true);
    this.error.set(null);
    this.codesSignal.set([]);
    this.nextCursor.set(null);

    this.api
      .list({ batchId, used, limit })
      .pipe(
        catchError((_err) => {
          this.error.set('Não foi possível carregar os códigos.');
          return of({ codes: [], nextCursor: undefined });
        }),
        finalize(() => this.loadingList.set(false)),
      )
      .subscribe((res) => {
        const list = res.codes ?? [];
        const mapped = list.map((c) => ({
          ...c,
          createdAt: toDate(c.createdAt),
          usedAt: toDate(c.usedAt),
        }));
        const toShow = list.length > 0 ? mapped : MOCK_CODES_LIST.map((c) => ({
          ...c,
          createdAt: toDate(c.createdAt) ?? undefined,
          usedAt: c.usedAt ? toDate(c.usedAt) ?? undefined : undefined,
        }));
        this.codesSignal.set(toShow);
        this.nextCursor.set(res.nextCursor ?? null);
      });
  }

  carregarMais(limit: number = 20) {
    const cursor = this.nextCursor();
    if (!cursor) return;
    const { batchId, used } = this.mapFilters();
    this.loadingMore.set(true);
    this.error.set(null);

    this.api
      .list({ batchId, used, limit, startAfter: cursor })
      .pipe(
        catchError((_err) => {
          this.error.set('Não foi possível carregar mais códigos.');
          return of({ codes: [], nextCursor: undefined });
        }),
        finalize(() => this.loadingMore.set(false)),
      )
      .subscribe((res) => {
        const list = res.codes ?? [];
        const mapped = list.map((c) => ({
          ...c,
          createdAt: toDate(c.createdAt),
          usedAt: toDate(c.usedAt),
        }));
        this.codesSignal.set([...this.codesSignal(), ...mapped]);
        this.nextCursor.set(res.nextCursor ?? null);
      });
  }

  gerarCodigos() {
    const quantity = Math.floor(this.formQuantity());
    if (!quantity || quantity < 1 || quantity > 1000) {
      this.error.set('Quantidade deve ser entre 1 e 1000.');
      return;
    }
    const productId = this.formProductId().trim();
    if (!productId) {
      this.error.set('Selecione um produto.');
      return;
    }
    this.loadingGenerate.set(true);
    this.error.set(null);
    this.generatedCodes.set([]);
    this.generatedBatchId.set(null);

    const body = {
      productId,
      batchId: this.formBatchId().trim() || undefined,
      quantity,
    };

    this.api
      .generate(body)
      .pipe(
        catchError((_err) => {
          this.error.set('Não foi possível gerar os códigos.');
          return of({ codes: [], batchId: '' });
        }),
        finalize(() => this.loadingGenerate.set(false)),
      )
      .subscribe((res) => {
        this.generatedCodes.set(res.codes ?? []);
        this.generatedBatchId.set(res.batchId || null);
        if (res.batchId) {
          this.batchId.set(res.batchId);
        }
      });
  }

  buscarPorCodigo() {
    const code = this.searchCode().trim();
    if (!code) return;
    this.loadingSearch.set(true);
    this.error.set(null);
    this.searchResult.set(null);

    this.api
      .getByCode(code)
      .pipe(
        catchError((_err) => {
          this.error.set('Código não encontrado.');
          return of({ code: null });
        }),
        finalize(() => this.loadingSearch.set(false)),
      )
      .subscribe((res) => {
        if (res.code) {
          this.searchResult.set({
            ...res.code,
            createdAt: toDate(res.code.createdAt),
          });
        }
      });
  }
}

