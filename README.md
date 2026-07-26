# Controle Financeiro

App pessoal de controle financeiro (React + Supabase), com login via GitHub,
lançamentos de receita/despesa, despesas fixas recorrentes, painel com
gráficos, e uma visão da regra 50/20/30 (Necessidades/Investimento/Livre).

## Antes de publicar

1. No **Supabase**, rode esta consulta extra no SQL Editor (adiciona o campo
   que controla se o histórico já foi importado, evitando duplicar):

   ```sql
   alter table user_settings add column if not exists history_imported boolean default false;
   ```

2. Confirme que o provedor **GitHub** está ativado em
   Authentication → Providers, com o Client ID/Secret do OAuth App que você
   criou, e que a **Authorization callback URL** no GitHub aponta para:
   `https://<seu-projeto>.supabase.co/auth/v1/callback`

3. Depois de publicar o site (passo abaixo), volte no GitHub OAuth App e
   adicione a URL final do site em **Homepage URL**, e no Supabase em
   **Authentication → URL Configuration → Redirect URLs**, adicione essa
   mesma URL. Sem isso o login funciona só localmente.

## Rodar localmente

```bash
npm install
npm run dev
```

## Publicar (GitHub Pages)

```bash
npm run build
```

Isso gera a pasta `dist/`. Publique o conteúdo dela como GitHub Pages
(Settings → Pages → Deploy from a branch, ou usando uma Action de build).
Se preferir Vercel/Netlify, é só conectar o repositório — eles rodam
`npm run build` automaticamente.

**Importante:** o arquivo `vite.config.js` tem `base: "/controle-financeiro/"`,
que é o caminho usado pelo GitHub Pages (`usuario.github.io/controle-financeiro/`).
Se for publicar em outro lugar (domínio próprio, Vercel, etc.), troque para `base: "/"`.

## Estrutura

- `src/supabaseClient.js` — conexão com o banco (URL + chave pública, segura de expor)
- `src/lib.js` — constantes e funções auxiliares
- `src/FinanceApp.jsx` — lógica principal e telas
- `src/App.jsx` — login/logout
- `src/views/`, `src/modals/`, `src/components/` — telas e peças de UI
