# Magic-Link — Acesso direto ao dashboard

Funcionalidade que permite que um usuário acesse o sistema diretamente pelo dashboard a partir de uma URL única, sem precisar digitar email/senha. Útil para acessos rápidos de admin, demonstrações ou integrações com outros sistemas internos.

> **Status:** frontend e backend implementados. Rotas confirmadas: `POST /api/auth/magic-link`, `POST /api/auth/consume-magic-link`, `POST /api/auth/revoke-magic-link`.

---

## Como o usuário usa

1. Um administrador gera um link no backend (via painel admin, script ou `curl`).
2. O backend retorna uma URL no formato:
   ```
   https://<seu-dominio>/auto-login?token=<jwt>
   ```
3. Quem acessa essa URL é automaticamente autenticado e redirecionado para `/dashboard`.
4. O link expira em poucos minutos (padrão: 5 min) e só pode ser usado **uma vez**.

---

## Fluxo técnico

```
Admin → POST /api/auth/magic-link  ──────────►  backend gera JWT assinado
                                                 retorna URL com ?token=...
                                                          │
Usuário abre a URL                                        ▼
        │
        ▼
Frontend (rota /auto-login) lê ?token= da URL
        │
        ▼
POST /api/auth/consume-magic-link  { token }
        │
        ▼
Backend valida assinatura, expiração, jti único
        │
        ▼
Retorna { token, usuario } (mesmo formato do /api/login)
        │
        ▼
Frontend salva no localStorage / sessionStorage
        │
        ▼
Redireciona para /dashboard
```

---

## O que mudou no frontend

### Arquivos novos
- [src/pages/AutoLogin.tsx](../src/pages/AutoLogin.tsx) — página que recebe o token via query string, chama o endpoint de consumo, exibe loading/erro e redireciona para o dashboard.

### Arquivos alterados
- [src/context/AuthContext.tsx](../src/context/AuthContext.tsx)
  - Adicionada a função `consumeMagicLink(magicToken: string): Promise<boolean>`.
  - A função chama `POST /api/auth/consume-magic-link`, persiste `token` em `localStorage` e `usuario` em `sessionStorage` (mesmo padrão do login normal) e atualiza o estado do contexto.
- [src/App.tsx](../src/App.tsx)
  - Nova rota `/auto-login` registrada **fora** do `AppLayout` (não exige usuário autenticado).
  - A rota está disponível tanto no estado deslogado quanto logado para evitar bloqueio caso o usuário já tenha sessão antiga.

### O que NÃO mudou
- A função `login(email, senha)` original continua funcionando exatamente como antes.
- Nenhum componente protegido foi modificado — a única forma de "pular" o login é via token assinado pelo servidor.

---

## Contrato esperado do backend

> Esses endpoints **ainda não existem**. O frontend já consome o endpoint `consume-magic-link`. Quando o backend for implementado, basta validar que o contrato bate.

### `POST /api/auth/magic-link` (gera o link)
- **Auth:** requer JWT de ADMINISTRADOR.
- **Body:** `{ "email": "sag@gmail.com", "expiresInMinutes": 5 }` (o segundo é opcional, padrão 5, máx 60).
- **Response 200:**
  ```json
  {
    "url": "https://app.exemplo.com/auto-login?token=eyJhbGciOi...",
    "expiresAt": "2026-04-28T15:05:00Z",
    "jti": "a3f9..."
  }
  ```

### `POST /api/auth/consume-magic-link` (consumido pelo frontend)
- **Auth:** público.
- **Body:** `{ "token": "<jwt>" }`.
- **Rate-limit:** habilitado (10 req/min por IP).
- **Response 200 (formato idêntico ao `/api/login`):**
  ```json
  {
    "token": "<jwt-de-sessao>",
    "usuario": {
      "id": 1,
      "nome": "Admin",
      "email": "sag@gmail.com",
      "tipo_usuario": "ADMINISTRADOR",
      "ativo": true,
      "data_expiracao": null,
      "ultimo_login": "2026-04-28T15:00:00Z"
    }
  }
  ```
- **Response 401:** qualquer falha (token inválido, expirado, jti reutilizado, usuário inexistente). Mensagem genérica `"Link inválido ou expirado"`.

### `POST /api/auth/revoke-magic-link` (opcional)
- **Auth:** ADMINISTRADOR.
- **Body:** `{ "jti": "..." }`.
- Adiciona o `jti` à blacklist mesmo antes do consumo.

---

## Regras de segurança

| Regra | Onde é aplicada |
|---|---|
| Token assinado com `MAGIC_LINK_SECRET` (HMAC HS256) | Backend |
| Validade curta (≤ 60 min, padrão 5 min) | Backend (claim `exp`) |
| Single-use via `jti` em blacklist (Redis ou tabela) | Backend |
| Mensagens de erro genéricas (não diferenciam falha) | Backend |
| Rate-limit no `consume-magic-link` | Backend |
| HTTPS obrigatório em produção | Infra |
| Token nunca aparece em logs (mascarar `?token=...`) | Backend / proxy |
| CORS restrito à origem do frontend | Backend |

---

## Como testar

### 1. Login como admin para pegar o token
```bash
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/api/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"sag@gmail.com","senha":"password"}' | jq -r '.token')
```

### 2. Gerar o magic-link
```bash
curl -X POST http://localhost:8080/api/auth/magic-link \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"email":"professor@exemplo.com","expiresInMinutes":10}'
```

### 3. Acessar a URL retornada
Copie o `url` da resposta e abra no navegador. Você cai direto em `/dashboard` autenticado.

### 4. Validações esperadas
- Abrir o **mesmo link uma segunda vez** → erro "Link inválido ou expirado" (single-use).
- Aguardar a expiração (>10 min) → erro "Link inválido ou expirado".
- Mais de 10 requisições por minuto no `consume-magic-link` → 429 (rate-limit).

### Testando o frontend isoladamente (sem backend)
- Acesse `/auto-login` sem `?token=` → deve mostrar erro "Token de acesso ausente na URL".
- Acesse `/auto-login?token=qualquercoisa` → deve mostrar erro de "Link inválido ou expirado" (resposta 401/erro de rede do backend).

---

## FAQ

**Posso usar isso em produção?**
Sim, desde que o backend siga as regras de segurança acima. O magic-link é um padrão usado por Slack, Notion, Auth0, etc.

**E se alguém pegar o link?**
Tem uma janela curta de exposição (5 min) e o token só funciona uma vez. Se já foi consumido, não funciona de novo. Se vazar antes do uso, o admin pode revogar via `revoke-magic-link`.

**Por que não usar `?email=sag@gmail.com&senha=xxx`?**
Senha em URL fica em logs do servidor, histórico do navegador, headers `Referer` etc. Token assinado mitiga tudo isso por ser de uso único e curto.

**Preciso mudar algo no `.env` do frontend?**
Não. O frontend usa o mesmo `VITE_API_URL` / `window.__ENV__.API_URL` que o login normal já usa.

**E se o usuário já estiver logado quando abrir o link?**
A rota `/auto-login` está disponível também no estado autenticado. Ela vai sobrescrever a sessão atual com o usuário do magic-link (útil quando um admin precisa "trocar" para outra conta sem fazer logout manual).

---

## Variáveis de ambiente do backend

| Variável | Descrição |
|---|---|
| `MAGIC_LINK_SECRET` | Secret HMAC HS256, mínimo 32 bytes aleatórios. |
| `MAGIC_LINK_DEFAULT_EXPIRY_MINUTES` | Validade padrão do token (recomendado: `5`). |
| `FRONT_URL` | Base URL do frontend usada para montar o link (ex: `https://sag.exemplo.com`). |

---

## Próximos passos

- [x] Backend implementou os 3 endpoints.
- [x] Frontend integrado em `/auto-login`.
- [ ] Testar fluxo end-to-end em staging.
- [ ] (Opcional) Adicionar botão no painel admin para gerar link de qualquer usuário.
