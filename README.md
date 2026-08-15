# Aventura Turismo — Capitão Gancho

MVP de comanda, pedidos, estoque, caixa e roteamento de impressão BAR/COZINHA.

## Arquivos principais

- `index.html` — interface principal
- `styles.css` — visual responsivo
- `app.js` — comandas, pedidos, estoque, caixa e envio ao Print Bridge
- `supabase-config.js` — URL e chave pública do Supabase
- `schema.sql` — estrutura do banco no Supabase
- `print-bridge/` — serviço local responsável pelas impressoras

## 1. Testar agora sem Supabase

Abra `index.html` no navegador. A versão inicial funciona com `localStorage`.

Você já consegue:
- criar comandas;
- lançar itens;
- separar BAR e COZINHA;
- baixar estoque;
- fechar comanda;
- selecionar PIX/Dinheiro/Cartão;
- consultar painel e relatório diário.

## 2. GitHub

Crie um repositório chamado, por exemplo, `aventura-turismo-pdv` e envie todos os arquivos.

O front-end pode ser publicado no GitHub Pages, pois é uma aplicação web estática. O Supabase fica responsável pelo backend/banco.

## 3. Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor.
3. Cole e execute `schema.sql`.
4. Em Project Settings / API, copie:
   - Project URL
   - chave pública/anon
5. Edite `supabase-config.js`.

Observação: o MVP entregue funciona localmente. O schema já está pronto para a próxima etapa de sincronização integral das telas com o Supabase e autenticação por usuário.

## 4. Impressoras BAR e COZINHA

Por segurança e compatibilidade, o navegador não deve ser tratado como responsável direto por escolher silenciosamente duas impressoras físicas distintas.

A arquitetura deste projeto usa:

Navegador -> Print Bridge local -> Impressora BAR / Impressora COZINHA

### Iniciar a ponte de impressão

No computador do barco:

```bash
cd print-bridge
npm install
npm start
```

Ela roda em:

`http://localhost:8787`

Nesta versão, cada impressão é salva como `.txt` dentro de `print-bridge/spool`.

Assim conseguimos testar todo o roteamento antes de comprar/configurar drivers.

### Para imprimir fisicamente

Precisamos informar:
- marca/modelo da impressora do BAR;
- marca/modelo da impressora da COZINHA;
- conexão: USB, Ethernet ou Wi‑Fi;
- se possuem IP fixo.

Com isso, substituímos a função `sendToPrinter()` por um driver ESC/POS compatível.

## 5. Arquitetura final recomendada

- Front-end: HTML/CSS/JS ou React/Vite
- Código/versionamento: GitHub
- Backend: Supabase
- Banco: PostgreSQL do Supabase
- Login: Supabase Auth
- Atualização simultânea: Supabase Realtime
- Impressão local: Print Bridge no barco
- Perfis: ADMIN / GERENTE / GARÇOM / BAR / COZINHA

## 6. Próximas evoluções

- login real por funcionário;
- perfis e permissões;
- sincronização completa com Supabase;
- histórico de cancelamento e auditoria;
- sangria/suprimento;
- fechamento de caixa por operador;
- comandas por passeio/viagem;
- mais barcos;
- fichas técnicas de produtos;
- relatório PDF;
- dashboards de vendas;
- funcionamento offline com sincronização posterior.
