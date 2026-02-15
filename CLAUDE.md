# Sob Investigacao Dashboard

Projeto Angular 20 com PrimeNG, TailwindCSS e Chart.js.

## Stack

- **Framework**: Angular 20 (standalone components, SCSS)
- **UI**: PrimeNG 19 + TailwindCSS 4
- **Charts**: Chart.js
- **Hosting**: Firebase Hosting (Google Cloud)

## Comandos

```bash
npm start              # Dev server em http://localhost:4200
npm run build          # Build de producao
```

## Deploy

O projeto usa Firebase Hosting. O build gera os arquivos em `dist/sob-dashboard/browser`.

```bash
npm run build && firebase deploy --only hosting
```

Caso precise configurar o Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase use sob-investigacao-f6af4
```

## Estrutura

- `src/app/pages/` — Paginas da aplicacao
- `src/app/components/` — Componentes compartilhados
- `src/environments/` — Configuracoes de ambiente (dev/prod)
- `firebase.json` — Configuracao do Firebase Hosting
