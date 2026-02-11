import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export type ConversationStatus = 'active' | 'closed';

export interface ConversationDto {
  id: string;
  conversationId: string;
  phoneNumber: string;
  agentPhoneNumberId: string;
  adkSessionId: string | null;
  status: ConversationStatus;
  startedAt: any;
  lastMessageAt: any;
  closedAt: any;
}

export interface AgentResponseDto {
  id: string;
  traceId: string;
  phoneNumber: string;
  question: string;
  response: {
    text: string;
  };
  createdAt: any;
  source: string;
}

export interface ConversationMessagesResponse {
  conversation: ConversationDto;
  messages: AgentResponseDto[];
}

export interface AgentResponsesResponse {
  responses: AgentResponseDto[];
  nextCursor?: string;
}

@Injectable({ providedIn: 'root' })
export class AgentApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api`;

  getConversationsByPhone(
    phoneNumber: string,
    params?: { limit?: number; status?: ConversationStatus },
  ): Observable<ConversationDto[]> {
    const query: any = {};
    if (params?.limit) query.limit = params.limit;
    if (params?.status) query.status = params.status;
    return this.http.get<ConversationDto[]>(`${this.base}/agent/conversations/${encodeURIComponent(phoneNumber)}`, {
      params: query,
    });
  }

  getConversationMessages(
    conversationId: string,
    params?: { limit?: number },
  ): Observable<ConversationMessagesResponse> {
    const query: any = {};
    if (params?.limit) query.limit = params.limit;
    return this.http.get<ConversationMessagesResponse>(
      `${this.base}/agent/conversations/${encodeURIComponent(conversationId)}/messages`,
      { params: query },
    );
  }

  getResponsesByPhone(
    phoneNumber: string,
    params?: { limit?: number; startAfter?: string },
  ): Observable<AgentResponsesResponse> {
    const query: any = {};
    if (params?.limit) query.limit = params.limit;
    if (params?.startAfter) query.startAfter = params.startAfter;
    return this.http.get<AgentResponsesResponse>(
      `${this.base}/agent/responses/${encodeURIComponent(phoneNumber)}`,
      { params: query },
    );
  }
}

