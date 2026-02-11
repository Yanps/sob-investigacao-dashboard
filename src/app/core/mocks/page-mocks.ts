/**
 * Dados mock para exibir nas páginas quando a API não retornar dados,
 * permitindo que gráficos e tabelas mostrem algo ao cliente.
 */

export const MOCK_JOBS_STATS = {
  pending: 12,
  processing: 3,
  done: 48,
  failed: 2,
};

export const MOCK_JOBS_LIST = [
  { id: 'job-mock-1', status: 'pending' as const, phoneNumber: '5511999990001', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'job-mock-2', status: 'processing' as const, phoneNumber: '5511999990002', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'job-mock-3', status: 'done' as const, phoneNumber: '5511999990003', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'job-mock-4', status: 'failed' as const, phoneNumber: '5511999990004', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'job-mock-5', status: 'done' as const, phoneNumber: '5511999990005', createdAt: new Date(Date.now() - 259200000).toISOString() },
];

export const MOCK_CODES_LIST = [
  { id: 'mock-1', code: 'DEMO-XXXX-AAAA', used: false, batchId: 'batch_demo', gameId: 'game_demo', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'mock-2', code: 'DEMO-YYYY-BBBB', used: true, usedByPhoneNumber: '5511999999999', batchId: 'batch_demo', gameId: 'game_demo', usedAt: new Date(Date.now() - 3600000).toISOString(), createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'mock-3', code: 'DEMO-ZZZZ-CCCC', used: false, batchId: 'batch_demo', createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 'mock-4', code: 'DEMO-WWWW-DDDD', used: true, usedByPhoneNumber: '5511888888888', usedAt: new Date(Date.now() - 7200000).toISOString(), createdAt: new Date(Date.now() - 345600000).toISOString() },
  { id: 'mock-5', code: 'DEMO-VVVV-EEEE', used: false, gameId: 'quiz_01', createdAt: new Date(Date.now() - 432000000).toISOString() },
];

export const MOCK_GAMES_LIST = [
  { id: 'game-mock-1', name: 'Investigação Demo', type: 'investigation', active: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'game-mock-2', name: 'Quiz Exemplo', type: 'quiz', active: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'game-mock-3', name: 'Jogo Inativo', type: 'custom', active: false, createdAt: new Date(Date.now() - 259200000).toISOString() },
];

export const MOCK_CUSTOMERS_LIST = [
  { id: 'cliente-demo@email.com', name: 'Cliente Demo', email: 'cliente-demo@email.com', phoneNumber: '5511999999999', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'outro@email.com', name: 'Outro Cliente', email: 'outro@email.com', phoneNumber: '5511888888888', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'terceiro@email.com', name: 'Terceiro', email: 'terceiro@email.com', phoneNumber: '5511777777777', createdAt: new Date(Date.now() - 259200000).toISOString() },
];

export const MOCK_CONVERSATIONS_LIST = [
  {
    id: 'conv-mock-1',
    conversationId: 'conv-mock-1',
    phoneNumber: '5511999999999',
    agentPhoneNumberId: 'agent-demo',
    adkSessionId: null,
    status: 'active' as const,
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    closedAt: null,
  },
  {
    id: 'conv-mock-2',
    conversationId: 'conv-mock-2',
    phoneNumber: '5511888888888',
    agentPhoneNumberId: 'agent-demo',
    adkSessionId: null,
    status: 'closed' as const,
    startedAt: new Date(Date.now() - 172800000).toISOString(),
    lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
    closedAt: new Date(Date.now() - 43200000).toISOString(),
  },
];
