# Checkpoint — Só o Básico

## Ajuste durante o teste manual — CPF fictício em desenvolvimento

- A pedido da usuária, `validateCustomer` em `src/lib/validation.ts` agora aceita somente o CPF fictício `11111111111` quando `NODE_ENV !== "production"`, após normalizar a pontuação. O frontend e a API usam essa mesma função. `isValidCpf` permanece intacta; produção continua rejeitando esse CPF.
- O botão do formulário já estava corretamente ligado a `type="submit"`, `onSubmit={prepare}` e `validateCustomer`. Não foi necessário alterar o handler. Ao clicar em **Revisar e confirmar pedido**, abre o modal; **Confirmar e criar pedido** salva via API e navega para a confirmação.
- O servidor anterior usava `npm run start`, portanto era produção local. Foi encerrado e substituído por **`npm.cmd run dev`**, disponível em `http://localhost:3000`, com PostgreSQL existente mantido ativo. A exceção não pode funcionar em `npm run start`, mesmo no localhost.
- Testes adicionados em `tests/cpf-environment.test.ts` para desenvolvimento/teste/produção e em `tests/integration/production-cpf.test.ts` para rejeição real pelo handler da API em produção antes de acessar o banco.
- Cenário de compra Playwright atualizado: CPF inválido de controle é `22222222222`; CPF da compra aceita configuração `E2E_CHECKOUT_CPF`. A execução desta etapa usou `11111111111`, passou pelo formulário, modal, API (201), conferência do CPF no PostgreSQL, confirmação e link correto de WhatsApp sem CPF. Nenhum envio de mensagem foi realizado.
- Dados fictícios restantes do cenário passaram sem outro campo inválido: nome `Cliente Teste Browser`, WhatsApp `89999991234`, CEP `64500000`, rua `Rua de Teste`, número `10`, bairro `Centro`, cidade `Oeiras`, UF `PI`, privacidade aceita. Campos obrigatórios, telefone, CEP, estado e privacidade continuam validados.
- Resultado: **11 testes de domínio, 5 de integração e 1 cenário completo de navegador aprovados; typecheck e lint aprovados**. A compra acrescentou somente um pedido fictício e reservou duas unidades do batom existente; testes de integração limparam apenas suas fixtures. Não houve reset, seed, mudança de schema, `.env`, dependências ou deploy.
- README atualizado com o CPF permitido, dados fictícios, comportamento dos dois botões e comando para repetir o teste. O relato de produção local na seção histórica seguinte foi substituído pelo servidor de desenvolvimento acima.

---

## Atualização da retomada em 05/10/2026 — estado atual

**A retomada foi autorizada e o fechamento técnico da primeira entrega foi concluído.** Esta seção prevalece sobre o relato histórico da pausa abaixo. Nenhum deploy foi realizado; o próximo passo é a usuária avaliar e aprovar o fluxo local antes de definir a etapa seguinte.

- Checkpoint, AGENTS, README, código, artefatos e Git foram conferidos antes de alterações. Divergência encontrada e comunicada: havia um commit (`95a10a1`) e a árvore estava limpa, ao contrário do registro anterior de arquivos não rastreados. O código atual foi preservado; não houve reset, seed, migração, reinstalação, alteração de `.env` ou das dependências.
- A documentação local do Next.js foi consultada. Foi adicionado `data-scroll-behavior="smooth"` em `src/app/layout.tsx`, conforme o guia de atualização da versão 16, para a navegação entre páginas voltar ao topo sem animação da rolagem global.
- `tests/e2e/store.spec.ts` agora possui **5 cenários**. Produto, sacola, checkout, revisão e confirmação geram capturas nas seis larguras previstas e verificam imagens e ausência de overflow. As capturas de produto, sacola, checkout e confirmação foram inspecionadas visualmente nas seis larguras. A galeria com duas imagens foi exercitada com produto temporário e remoção em `finally`; nenhum produto da loja foi modificado por esse cenário.
- Novo `tests/integration/database-unavailable.test.ts`: conexão PostgreSQL impossível em processo separado, sem interromper o banco da loja. Verifica retorno 503, mensagem de carrinho preservado e ausência de identificador/cookie de confirmação. Integrações existentes continuam validando duplicidade, snapshots, preços/status no servidor, concorrência e rollback.
- **Resultados finais:** lint aprovado; typecheck aprovado; 8 testes de domínio aprovados; 4 testes de integração aprovados; build aprovado após o ajuste do layout; **5 testes Playwright aprovados no desenvolvimento e novamente no build de produção local** (última execução: 37,5 s). `test-results/.last-run.json` registra `passed`. O `next-env.d.ts` foi atualizado automaticamente pelo build para `.next/types`, sem edição manual.
- Banco preservado em `.local-postgres/data`: conferência final de **12 produtos, 7 categorias, 6 marcas, 4 pedidos e zero fixtures de galeria**; batom com estoque 12. As duas execuções de navegador desta retomada acrescentaram dois pedidos fictícios e reservaram quatro unidades do batom; pedidos anteriores permanecem. Não confundir lacunas na sequência dos números de pedido com perda de dados: testes de integração removem somente seus registros temporários.
- Auditoria revista: **8 ocorrências altas no conjunto completo e 3 com `--omit=dev`**, na cadeia Prisma/config/deepmerge-ts. `npm ls` confirmou que `@prisma/client` mantém `prisma` na árvore instalada. Não declarar auditoria de produção limpa. Nenhum `audit fix`, override ou downgrade foi aplicado; as soluções automáticas sugerem versões incompatíveis com a stack fixada e precisam de avaliação antes de publicar.
- README atualizado com retomada sem seed, caminho explícito do Chrome, alternativa `npm.cmd`, resultados e ressalva da auditoria. A taxa continua R$ 5,00 e o WhatsApp de teste continua 89 99454-9682. Não foi enviado WhatsApp automaticamente.
- Ambiente deixado para teste: PostgreSQL local ativo na porta 54329 e **`npm.cmd run start`** servindo o build local em `http://localhost:3000`. O dev foi encerrado antes de iniciar produção local. Para editar, encerre esse servidor antes de executar `npm.cmd run dev`; não inicie uma segunda instância do banco. IDs de processo/sessão não devem ser reutilizados.

### Pendências após a primeira entrega local

1. Avaliação e aprovação da usuária no navegador local.
2. Revisar compatibilidade das correções de dependências antes de qualquer publicação.
3. Obter produtos, fotos, estoque, taxa e contatos oficiais; finalizar privacidade e condições operacionais quando for preparar publicação.
4. Cancelamento/reposição/expiração de reservas, administração, retirada e pagamentos continuam etapas futuras; não implementá-las sem novo escopo.

As decisões e limitações históricas abaixo continuam válidas quando não forem substituídas por esta atualização. **Permanece proibido fazer deploy sem autorização explícita.**

---

**Registrado em 05/10/2026. Desenvolvimento pausado por solicitação explícita da usuária.**

## Instrução para a próxima sessão

Leia este arquivo, `AGENTS.md` e `README.md` antes de retomar. Continue sobre os arquivos existentes: não gere outro projeto, não refaça funcionalidades concluídas, não redefina o banco, não sobrescreva `.env` e não reinstale dependências sem necessidade. **Não faça deploy**: a usuária quer testar e aprovar todo o fluxo localmente primeiro. Aguarde uma instrução de retomada antes de desenvolver.

Na pausa, apenas o estado foi inspecionado, os processos deste projeto foram encerrados e este checkpoint foi escrito. Código, configurações, seed, dados e imagens existentes foram preservados. Arquivos já estavam salvos em disco. Não foram criados commits; os arquivos novos continuam não rastreados pelo Git (`git status --short` mostra `??`). Isso não significa que estejam perdidos.

## Objetivo geral

Reconstruir do zero o catálogo da loja **Só o Básico**, com identidade feminina, moderna e comercial em rosa, branco e neutros, sem reproduzir a interface antiga. Experiência mobile first, componentes reutilizáveis e fluxo simples:

**Catálogo → produto → carrinho → checkout → dados do cliente → pedido registrado no banco → confirmação → mensagem no WhatsApp da loja.**

Não é um e-commerce tradicional com gateway nesta etapa. O cliente prepara o pedido no site e conclui o atendimento, pagamento e entrega com a loja pelo WhatsApp. Nunca afirmar que está pago sem confirmação segura de backend/webhook.

## Stack e ambiente

- Next.js **16.3.8**, App Router, TypeScript, React 19, Tailwind CSS 4, Lucide Icons.
- Prisma ORM e Prisma Client **6.19.3**, PostgreSQL real.
- PostgreSQL local fornecido por `embedded-postgres` **18.4.0-beta.17**, somente como dependência de desenvolvimento. Não usa SQLite nem banco simulado.
- Testes de domínio e integração: executor nativo `node:test`, via `tsx`. Navegador: Playwright usando Chrome instalado.
- Windows, PowerShell, Node.js **22.19.0**, npm **10.9.3**.
- Raiz: `C:\Users\Nicole\Documents\praticas\github-of\soobasico`.
- A skill `sites:sites-building` foi consultada para orientações de experiência. A stack explicitamente solicitada pela usuária prevaleceu; não foram usados starter Vinext, registro Sites ou publicação.

## Funcionalidades concluídas

### Base, identidade e catálogo

- Prints e marca analisados como referências de negócio, sem copiar layout antigo. Nome serifado, rosa claro, CTA rosa mais forte, navegação compacta, sem grandes sidebars na home, sem glassmorphism.
- Projeto estruturado, dependências instaladas e `package-lock.json` salvo.
- Header sticky com marca, busca, categorias, menu mobile e carrinho com quantidade.
- Home comercial com hero, categorias, seleção por novidades, mais vendidos, ofertas e destaques; seção de skincare e atendimento WhatsApp discreto.
- Catálogo `/produtos`: pesquisa por nome, marca e categoria, ignorando acentos; filtros por categoria, marca, faixas de preço máximas, estoque e ofertas. Ordenação: novidades, menor preço, maior preço, A–Z.
- Filtros laterais no desktop e drawer baseado em `<dialog>` no mobile.
- Cards com imagem, marca, nome, preço, promoção, feedback ao adicionar e indisponibilidade. Placeholder da marca para produtos sem imagem.
- Detalhe `/produtos/[slug]` com descrição, preço, disponibilidade, quantidade, adicionar, comprar agora e relacionados. Código da galeria aceita várias imagens; o seed atual tem uma imagem por produto ilustrado, portanto esse caso ainda precisa de teste com dados próprios.

### Carrinho e checkout

- Carrinho `/carrinho` com imagem, nome, preço unitário, quantidade, subtotal por item, remoção, subtotal geral, entrega e total.
- Persistência em `localStorage` apenas de IDs e quantidades, sincronização entre abas e tratamento de dados locais inválidos.
- Checkout `/checkout` com nome completo, WhatsApp com DDD, CPF, CEP, rua, número, complemento, bairro, cidade, UF e referência.
- Máscaras e teclado mobile para telefone/CPF/CEP; validações de CPF com dígitos verificadores, telefone, CEP, UF, campos e tamanho no cliente e servidor.
- Resumo ao lado no desktop e abaixo dos campos no mobile; revisão por modal antes de confirmar; estados de loading e erros amigáveis.
- Carrinho vazio, busca sem resultados, produto indisponível, loading, erro e página não encontrada implementados.

### Pedido, segurança e WhatsApp

- `POST /api/pedidos` valida origem, tipo do conteúdo, tamanho máximo de 16 KiB, cliente, carrinho e chave idempotente.
- Produtos e preços são lidos do banco. Totais, valores unitários e status enviados pelo navegador são ignorados.
- Transação serializável com decremento condicional de estoque e retries em conflitos; prevenção de overselling e duplicidade.
- Pedido salvo com número único no formato `SOB-000123`, cliente/endereço, totais em centavos e snapshots dos itens.
- Estados de pedido e pagamento preparados; criação sempre `PENDING` para ambos.
- Confirmação `/pedidos/[id]` exige cookie HttpOnly com token conferido pelo hash salvo no banco. Sem cookie válido, página não encontrada. Só o UUID opaco está na URL interna.
- CPF não é selecionado para o cliente na confirmação nem colocado na mensagem do WhatsApp. Não há logs de corpo, CPF ou endereço nos serviços da aplicação.
- Mensagem dinâmica com número do pedido, itens, quantidades, preços, subtotal, entrega, total e dados de entrega reais do pedido salvo. URL `wa.me` usa `encodeURIComponent`.
- Botão abre o WhatsApp; a pessoa ainda precisa enviar a mensagem. Não existe envio automático por WhatsApp Business API nem confirmação automática de entrega da mensagem.
- Carrinho é limpo quando a confirmação do pedido recém-criado é acessada. Marcador em `sessionStorage` evita limpar uma nova sacola ao revisitar pedido antigo. Se o marcador não pode ser verificado, a sacola é mantida.
- Página `/privacidade` criada como rascunho explícito para testes.
- Headers básicos de segurança e limitação de requisições em memória.

### Banco e ativos

- Schema Prisma criado, cliente gerado, migração inicial aplicada e seed executado no PostgreSQL local.
- Conferência na pausa: **12 produtos, 7 categorias, 6 marcas e 2 pedidos** no banco. Pedidos de navegador usam dados fictícios e foram mantidos para inspeção. Não limpar ou reinicializar o banco automaticamente.
- Fotografias de ambientação baixadas para `public/images/hero.jpg` e `care.jpg`; marca recebida preservada em `brand-reference.jpg`.
- Ilustrações originais de embalagens fictícias em `public/images/products/*.svg`. Não são fotos de produtos reais. Fontes e distinção de uso documentadas em `public/images/SOURCES.md`.
- `README.md` salvo com arquitetura, comandos, configurações, temporários e decisões.

## Último ponto exato da execução de desenvolvimento

O trabalho estava na **validação final e documentação da primeira entrega**, não em criar novas funcionalidades.

1. Primeira execução de Playwright passou em responsividade e rejeição de origem externa, mas teve duas falhas: filtros duplicados no DOM e seletor de teste confundindo alerta de CPF com anunciador de navegação do Next.js.
2. Foram aplicadas e salvas estas correções:
   - `src/components/modal.tsx`: conteúdo montado apenas quando aberto, eliminando filtros escondidos duplicados; `onCancel` impede fechamento nativo automático e respeita o callback.
   - `tests/e2e/store.spec.ts`: erro de CPF selecionado por `.form-error`.
   - `next.config.ts`: `turbopack.root = process.cwd()` para evitar detecção de lockfile externo.
3. Playwright foi reexecutado. Na pausa, **`test-results/.last-run.json` contém `status: passed` e nenhum teste falho**. A suíte possui quatro cenários. A saída textual integral dessa última execução não foi recuperada: as sessões já tinham terminado quando o estado foi verificado.
4. `README.md` já havia sido gravado pela última chamada antes da interrupção. Uma consulta de auditoria de produção havia sido solicitada, mas seu resultado não está confirmado; não presumir auditoria de produção aprovada.
5. **Lint, typecheck e build ainda precisam ser repetidos após os últimos ajustes de modal/configuração/teste.** Não declarar esse fechamento final como concluído apenas porque o build anterior passou.

## Evidências de validação já obtidas

| Verificação | Resultado conhecido |
| --- | --- |
| Typecheck | Passou antes dos últimos ajustes; repetir no estado final |
| Lint | Passou antes dos últimos ajustes; repetir no estado final |
| Testes de domínio | **8 aprovados**: CPF, cliente, carrinho, cálculo, disponibilidade/preço, WhatsApp, acesso ao pedido e rate limit |
| Integração PostgreSQL | **3 aprovados**: manipulação de preço/status e idempotência; concorrência pela última unidade; falha sem reserva parcial |
| Build de produção | Passou e listou todas as rotas; executado antes dos últimos ajustes |
| Playwright inicial | 2 aprovados e 2 falhos; causas corrigidas |
| Playwright mais recente | Arquivo de resultado registra sucesso e zero falhas |
| Responsividade | Home e catálogo testados em **360, 390, 430, 768, 1024 e 1440 px**, com imagens carregadas e sem overflow horizontal |

Os cenários Playwright atuais cobrem busca por marca/categoria, disponibilidade, busca vazia, compra mobile em 390 px, persistência/quantidade, CPF inválido, criação no banco, confirmação, total `R$ 44,80`, URL WhatsApp correta, exclusão do CPF, acesso bloqueado em outro navegador, nova sacola preservada ao revisitar pedido e rejeição de origem externa. Capturas e possíveis traces ficam em `test-results/`, ignorado pelo Git. Home desktop e mobile foram inspecionadas visualmente.

## Em andamento ou parcialmente concluído

- Fechamento das verificações finais após os últimos ajustes.
- Inspeção manual completa de produto, carrinho, checkout e confirmação nas seis larguras: o teste sistemático em todas elas cobre home e catálogo; a compra completa está coberta em 390 px.
- Galeria com múltiplas imagens: implementada, falta cenário de dados/teste dedicado.
- Documentação de entrega final à usuária: README pronto, mas a primeira entrega ainda não foi comunicada como encerrada.
- Revisão da auditoria de dependências e das ressalvas para publicação futura.

## Próximos passos, em ordem, quando houver autorização de retomada

1. Ler este checkpoint, `AGENTS.md`, `README.md` e conferir `git status`; preservar trabalho e banco existentes.
2. Iniciar o PostgreSQL local e o Next.js pelos comandos abaixo. Não rodar duas instâncias do banco.
3. Conferir artefatos anteriores e executar **lint, typecheck, testes de domínio, integração e build** no estado atual. Reexecutar Playwright se precisar confirmar o resultado recuperado ou após qualquer nova correção.
4. Verificar manualmente detalhe, carrinho, checkout e confirmação nas seis larguras e exercitar a galeria com múltiplas imagens sem alterar dados reais. Corrigir apenas problemas encontrados e autorizados pela retomada.
5. Conferir indisponibilidade, erro de banco, pedido duplicado, cookie e geração da mensagem. Não enviar mensagens a terceiros automaticamente.
6. Revisar auditoria, limitações e documentação; não aplicar `npm audit fix --force` ou downgrades de versões principais sem avaliar compatibilidade.
7. Apresentar a primeira entrega com o que foi criado, modelagem, comandos locais, WhatsApp, taxa de entrega, Studio e funcionalidades temporárias. Permanecer sem deploy até autorização explícita.

## Estrutura e modelagem do banco

Schema: `prisma/schema.prisma`. Migração aplicada: `prisma/migrations/20261005171038_init/migration.sql`. Seed: `prisma/seed.ts`.

- **Category**: id, nome, slug único; possui produtos.
- **Brand**: id, nome, slug único; possui produtos.
- **Product**: id, nome, slug único, descrição, `priceCents`, `promotionalPriceCents`, estoque, ativo, destaque, `bestSeller`, categoria/marca e datas.
- **ProductImage**: URL, alt, position e vínculo com produto.
- **Customer**: nome, WhatsApp, CPF, data; possui endereços e pedidos.
- **Address**: cliente, CEP, rua, número, complemento, bairro, cidade, UF e referência; relacionado ao pedido.
- **Order**: UUID, sequência autoincremental, número único, chave idempotente única, hash de token, cliente/endereço, modalidade, totais, status, pagamento e datas.
- **OrderItem**: vínculo com pedido, produto opcional e snapshots de nome, preço unitário, quantidade e subtotal. Excluir um produto não apaga o snapshot.

Enums: `OrderStatus` (`PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `DELIVERED`, `CANCELED`), `PaymentStatus` (`PENDING`, `PAID`, `FAILED`, `REFUNDED`), `FulfillmentMethod` (`DELIVERY`, `PICKUP`). Apenas entrega está habilitada.

Cliente e endereço são criados a cada pedido para preservar os dados da compra; não há deduplicação de clientes ou edição de histórico pela aplicação. Seed repetido preserva produtos/estoque existentes (`update: {}` nos produtos).

## Variáveis necessárias

`.env` existe, está ignorado pelo Git e contém uma chave aleatória válida. **Não imprimir, copiar para documentação ou substituir `ORDER_ACCESS_SECRET`.** `.env.example` está disponível para nova instalação.

```dotenv
DATABASE_URL="postgresql://soobasico:soobasico_local@127.0.0.1:54329/soobasico?schema=public"
NEXT_PUBLIC_STORE_WHATSAPP="5589994549682"
NEXT_PUBLIC_DELIVERY_FEE_CENTS="500"
APP_ORIGIN="http://localhost:3000"
ORDER_ACCESS_SECRET="<segredo aleatório já configurado no .env local>"
DEMO_CATALOG="true"
```

- WhatsApp temporário fornecido: **89 99454-9682**, acrescido de `55`. Troca em `NEXT_PUBLIC_STORE_WHATSAPP`.
- Taxa de teste: **R$ 5,00**, em centavos no env. Fonte central: `src/lib/store-config.ts`.
- `APP_ORIGIN` precisa coincidir exatamente com a origem usada no navegador. Acessar via IP/127.0.0.1 em vez de `localhost` exige ajustar a configuração.
- `DEMO_CATALOG=true` só permite fallback de visualização se o banco falhar; não simula pedido bem-sucedido.
- Variáveis públicas exigem reinício no desenvolvimento e novo build para atualização de produção.

## Comandos para iniciar e verificar

As dependências já estão instaladas, cliente Prisma gerado, schema aplicado e seed inserido.

Terminal 1:

```powershell
cd C:\Users\Nicole\Documents\praticas\github-of\soobasico
npm run db:local
```

Terminal 2:

```powershell
cd C:\Users\Nicole\Documents\praticas\github-of\soobasico
npm run dev
```

Abrir `http://localhost:3000`. Prisma Studio: `npm run db:studio`, normalmente `http://localhost:5555`.

Se precisar preparar outro checkout/banco: `npm install`, configurar `.env` com segredo aleatório, `npm run db:generate`, `npm run db:deploy`, `npm run db:seed`. Para mudanças novas no schema: `npm run db:migrate -- --name nome_da_alteracao`.

```powershell
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:e2e
npm run build
```

Para testar build de produção posteriormente, encerrar o dev e executar `npm run start`. Não é deploy.

## Processos e preservação dos dados na pausa

- Next.js dev foi encerrado; porta **3000** não estava mais em escuta ao concluir a inspeção.
- PostgreSQL foi encerrado corretamente com **`pg_ctl -D <diretório deste banco> -m fast -w stop`**, que confirmou `server stopped`. Porta **54329** deixou de escutar e `postmaster.pid` não existia após o desligamento.
- Dados continuam em **`.local-postgres/data`**. Não apagar, mover ou recriar esse diretório.
- `Stop-Process` apresentou `NullReferenceException` neste ambiente. Foi usado `taskkill` somente nos processos Node previamente confirmados como pertencentes a este projeto, depois do desligamento seguro do banco. Nenhum processo de outro projeto foi encerrado.
- IDs de sessões/processos da sessão anterior são históricos; não reutilizá-los para encerrar processos em nova sessão.

## Erros, pendências e limitações conhecidas

1. **Sandbox Windows:** inicialização de `embedded-postgres` e execução de `tsx` falharam inicialmente com `uv_os_get_passwd ENOMEM`; download do motor Prisma e fotos teve bloqueio de rede. Reruns com permissão fora do sandbox resolveram essas etapas. Se repetir, pedir a escalada para o comando necessário; não alterar a arquitetura por esse erro do ambiente.
2. **Auditoria npm:** a auditoria completa anterior informou **8 vulnerabilidades altas**, envolvendo ferramentas/transitivas de desenvolvimento (`eslint-config-next` → `fast-glob` → `micromatch` → `braces`; `prisma` → `@prisma/config` → `deepmerge-ts`). Não houve correção forçada. Consulta posterior informou `braces` estável `3.0.3` e `deepmerge-ts` `8.0.2`. Resultado de `npm audit --omit=dev` ainda não confirmado. Avaliar com cuidado na retomada.
3. **Aviso Prisma:** `package.json#prisma` para seed é deprecated e será removido no Prisma 7; continua funcional com a versão 6 fixada. Não há `prisma.config.ts`. Migração de configuração é futura, não requisito para reconstruir a aplicação.
4. **Playwright:** `playwright.config.ts` usa por padrão `C:/Program Files/Google/Chrome/Application/chrome.exe`; aceita `PLAYWRIGHT_CHROME_PATH`. README menciona outros ambientes, mas o caminho padrão atual é específico do Windows. Não assumir fallback portátil automático implementado.
5. Avisos de imagem LCP surgiram no dev para imagens de catálogo acima da dobra. Não bloquearam build ou testes; conferir prioridade/loading se necessário.
6. Dados, marcas, estoque e descrições são fictícios. Fotos de ambientação e SVGs não representam catálogo real. Seed não sobrescreve alterações posteriores.
7. Mais vendidos é flag de cadastro, não métrica de vendas. Favoritos pessoais não implementados, conforme opcionais do pedido.
8. Entrega é taxa fixa configurável de teste, sem cálculo por CEP, restrição de área ou consulta automática de endereço. Retirada só está preparada no enum/config, não disponível na UI.
9. Não há pagamento/gateway/webhook. `PAID` só poderá ser definido no futuro por confirmação segura no backend.
10. Pedidos pendentes já reservam estoque. Não há expiração automática ou serviço de cancelamento/devolução de estoque; mudar apenas o status no Studio não repõe unidades. Testes de navegador deixam pedidos fictícios e reduzem estoque do batom.
11. Rate limit em memória funciona para instância única. Antes de múltiplas instâncias, precisa armazenamento compartilhado e definição de proxies/IPs confiáveis.
12. Privacidade é rascunho: definir responsável, base legal, canal de direitos e retenção antes de publicação; CPF/endereço estão registrados no PostgreSQL, sem camada própria de criptografia de campos. Preparar proteção/backup/credenciais do banco na etapa de publicação.
13. Link externo `wa.me` contém necessariamente os dados da mensagem codificados, conforme solicitado. Isso difere das URLs internas sem dados pessoais; o compartilhamento está explicado na página de privacidade.
14. Nenhum `/admin`, login de cliente, gerenciamento de pedidos por UI, política definitiva ou deploy foi criado. São etapas futuras, não motivos para refazer a primeira versão.

## Arquivos importantes já criados ou modificados

- `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `.gitignore`, `.env.example`; `.env` local privado.
- `AGENTS.md` e `CLAUDE.md`: gerados pelo Next.js. AGENTS exige consultar a documentação local relevante em `node_modules/next/dist/docs/` antes de mudanças Next.js. Os arquivos dessa documentação usam **`.md`**, não `.mdx`.
- `src/app/layout.tsx`, `globals.css`, `page.tsx`; páginas `/produtos`, `/produtos/[slug]`, `/carrinho`, `/checkout`, `/pedidos/[id]`, `/privacidade`; loading/error/not-found.
- `src/app/api/pedidos/route.ts`.
- `src/components/`: store-provider, header, footer, home, catalog, product-card, product-detail, quantity, cart, order-summary, checkout, confirmation e modal.
- `src/lib/`: types, store-config, demo-products, prisma, catalog, validation, order-calculation, orders, order-access, whatsapp e rate-limit.
- `prisma/schema.prisma`, `prisma/seed.ts`, migração e migration lock.
- `scripts/local-postgres.mjs`, `create-demo-assets.mjs`, `download-photos.mjs`.
- `public/favicon.svg`, `public/images/*` e `SOURCES.md`.
- `tests/domain.test.ts`, `tests/integration/orders.test.ts`, `tests/e2e/store.spec.ts`, `playwright.config.ts`.
- `README.md` e este `CONTINUAR_PROJETO.md`.
- `.next/`, `node_modules/`, `.local-postgres/`, `test-results/` e `*.tsbuildinfo` são locais/gerados e ignorados pelo Git. Não eliminar o banco por ser ignorado.

## Decisões que não podem ser perdidas

- Não copiar os prints; preservar marca e intenção comercial/mobile first.
- Não fazer deploy sem nova autorização explícita.
- Não inventar produtos reais, disponibilidade real ou integração de pagamento.
- Preços sempre em centavos e recalculados pelo servidor com os produtos do banco.
- Preservar snapshots históricos, transação serializável, controle atômico de estoque e idempotência.
- Preservar autorização da confirmação por cookie e retorno mínimo de dados; nunca incluir CPF no WhatsApp.
- Manter taxa e telefone centralizados, sem espalhar literais nos componentes.
- Preservar `.env` e PostgreSQL existente; seed pode repetir sem reset de estoque.
- Manter bibliotecas enxutas. Nenhum novo dashboard administrativo é necessário para concluir a primeira entrega.
- A primeira entrega está praticamente implementada; retomar pelo fechamento das verificações e avaliação local, **não pela geração do projeto**.
