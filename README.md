# SOB Investigação - Dashboard

Dashboard Angular para a API SOB Investigação (análise, conversas, códigos).

## Stack

- **Angular 20** (última estável)
- **PrimeNG 19** (componentes UI)
- **Tailwind CSS 4** + tailwindcss-primeui
- **Chart.js** (gráficos via PrimeNG Chart)
- **Signals** para estado (auth)

## Requisitos

- Node.js 20+
- npm ou pnpm

## Instalação

```bash
cd sob-dashboard
npm install --legacy-peer-deps
```

(O `--legacy-peer-deps` é necessário porque o PrimeNG 19 declara peer Angular 19; o projeto usa Angular 20 e funciona com essa flag.)

## Desenvolvimento

```bash
npm start
```

Abre em `http://localhost:4200`. A API usada em dev é `http://localhost:3000` (definida em `src/environments/environment.development.ts`).

## Build produção

```bash
npm run build
```

Saída em `dist/sob-dashboard`. Em produção a API usada é `https://sob-investigacao-api-508898990955.us-central1.run.app`.

## Layout responsivo

- **Mobile:** menu hambúrguer abre sidebar em overlay; conteúdo em uma coluna.
- **Tablet/Desktop (lg+):** sidebar fixa à esquerda; área de conteúdo à direita.
- Cards e gráficos usam grid responsivo (1 coluna em mobile, 2–4 em telas maiores).

## Páginas

| Rota        | Descrição                          |
|------------|-------------------------------------|
| `/login`   | Login (email/senha → JWT)           |
| `/dashboard` | Início: cards de status + gráfico jobs |
| `/conversas` | Conversas (placeholder)            |
| `/codigos` | Códigos (placeholder)               |
| `/jogos`   | Jogos (placeholder)                 |
| `/jobs`    | Lista de jobs + gráfico por período |
| `/usuarios` | Usuários (placeholder)             |

## API

- **Dev:** `http://localhost:3000` (prefixo `/api`)
- **Prod:** `https://sob-investigacao-api-508898990955.us-central1.run.app` (prefixo `/api`)

Autenticação: após `POST /api/auth/login`, o token JWT é enviado no header `Authorization: Bearer <token>`.
