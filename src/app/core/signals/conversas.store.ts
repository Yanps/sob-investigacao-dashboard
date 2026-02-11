import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { AgentApiService, AgentResponseDto, ConversationDto, ConversationStatus } from '../../services/agent-api.service';
import { MOCK_CONVERSATIONS_LIST } from '../mocks/page-mocks';

export type StatusFilter = 'all' | ConversationStatus;

export interface ConversationView extends ConversationDto {
  lastMessageAtDate?: Date | null;
}

export interface AgentMessageView extends AgentResponseDto {
  createdAtDate?: Date | null;
}

function toDate(value: any): Date | null {
  if (!value) return null;
  // Firestore Timestamp-like
  if (typeof value === 'object' && 'seconds' in value) {
    return new Date((value.seconds as number) * 1000);
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

@Injectable({ providedIn: 'root' })
export class ConversasStore {
  private readonly api = inject(AgentApiService);

  readonly phone = signal<string>('');
  readonly statusFilter = signal<StatusFilter>('active');

  private readonly conversationsSignal = signal<ConversationView[]>([]);
  private readonly selectedConversationIdSignal = signal<string | null>(null);
  private readonly messagesSignal = signal<AgentMessageView[]>([]);
  private readonly responsesSignal = signal<AgentMessageView[]>([]);

  readonly loadingList = signal(false);
  readonly loadingMessages = signal(false);
  readonly loadingResponses = signal(false);
  readonly error = signal<string | null>(null);

  readonly conversations = this.conversationsSignal.asReadonly();
  readonly selectedConversationId = this.selectedConversationIdSignal.asReadonly();
  readonly messages = this.messagesSignal.asReadonly();
  readonly responses = this.responsesSignal.asReadonly();

  readonly selectedConversation = computed(() =>
    this.conversationsSignal().find((c) => c.id === this.selectedConversationIdSignal()) ?? null,
  );

  buscarConversas(phone: string) {
    const trimmed = phone.trim();
    if (!trimmed) return;

    this.phone.set(trimmed);
    this.loadingList.set(true);
    this.error.set(null);
    this.conversationsSignal.set([]);
    this.selectedConversationIdSignal.set(null);
    this.messagesSignal.set([]);
    this.responsesSignal.set([]);

    const status = this.statusFilter();
    const statusParam: ConversationStatus | undefined = status === 'all' ? undefined : status;

    this.api
      .getConversationsByPhone(trimmed, { status: statusParam, limit: 50 })
      .pipe(
        catchError((_err) => {
          this.error.set('Não foi possível carregar as conversas.');
          return of<ConversationDto[]>([]);
        }),
        finalize(() => this.loadingList.set(false)),
      )
      .subscribe((list) => {
        const raw = list.length > 0 ? list : MOCK_CONVERSATIONS_LIST;
        const mapped: ConversationView[] = raw.map((c) => ({
          ...c,
          lastMessageAtDate: toDate(c.lastMessageAt),
        }));
        this.conversationsSignal.set(mapped);
        if (mapped.length) {
          this.selecionarConversa(mapped[0].id);
        }
      });
  }

  atualizarStatus(status: StatusFilter) {
    this.statusFilter.set(status);
    if (this.phone().trim()) {
      this.buscarConversas(this.phone());
    }
  }

  selecionarConversa(id: string) {
    if (!id) return;
    if (this.selectedConversationIdSignal() === id && this.messagesSignal().length) {
      return;
    }

    this.selectedConversationIdSignal.set(id);
    this.loadingMessages.set(true);
    this.error.set(null);
    this.messagesSignal.set([]);

    this.api
      .getConversationMessages(id, { limit: 50 })
      .pipe(
        catchError((_err) => {
          this.error.set('Não foi possível carregar as mensagens.');
          return of({ conversation: null, messages: [] });
        }),
        finalize(() => this.loadingMessages.set(false)),
      )
      .subscribe((res) => {
        const msgs: AgentMessageView[] = (res.messages ?? []).map((m) => ({
          ...m,
          createdAtDate: toDate(m.createdAt),
        }));
        this.messagesSignal.set(msgs);
      });
  }

  carregarRespostasAgente() {
    const phone = this.phone().trim();
    if (!phone) return;

    this.loadingResponses.set(true);
    this.error.set(null);

    this.api
      .getResponsesByPhone(phone, { limit: 50 })
      .pipe(
        catchError((_err) => {
          this.error.set('Não foi possível carregar as respostas do agente.');
          return of({ responses: [] });
        }),
        finalize(() => this.loadingResponses.set(false)),
      )
      .subscribe((res) => {
        const mapped: AgentMessageView[] = (res.responses ?? []).map((m) => ({
          ...m,
          createdAtDate: toDate(m.createdAt),
        }));
        this.responsesSignal.set(mapped);
      });
  }
}

