# Só o Básico

Catálogo híbrido de maquiagem, beleza e acessórios, construído do zero com **Next.js App Router, TypeScript, Tailwind CSS, Prisma e PostgreSQL**. Esta entrega é local; **nenhum deploy foi realizado**.

## O que funciona

- Home comercial com categorias, novidades, favoritos da loja, mais vendidos e ofertas.
- Busca por produto, marca e categoria; filtros de categoria, marca, preço, disponibilidade e ofertas; ordenação por preço, nome e novidades.
- Filtros em painel lateral no desktop e drawer acessível no mobile.
- Página de produto, quantidade, galeria quando há múltiplas imagens, relacionados e indisponibilidade.
- Sacola persistida em `localStorage`, com quantidades, remoção, subtotal, entrega e total. Apenas IDs e quantidades são persistidos, nunca CPF ou endereço.
- Checkout com validação de CPF (dígitos verificadores), telefone com DDD, CEP, UF, campos obrigatórios e limites de tamanho. Formulário com máscaras e teclado apropriado no mobile.
- Revisão explícita antes da confirmação, mensagens de erro, loading e manutenção do carrinho em caso de falha.
- Criação real do pedido no PostgreSQL, cálculo de preço no servidor, reserva atômica de estoque e prevenção de duplicidade por idempotência.
- Confirmação acessível apenas no navegador autorizado por cookie HttpOnly, com mensagem dinâmica de WhatsApp a partir do pedido salvo.
- CPF excluído da confirmação e do WhatsApp. Pagamento permanece `PENDING`.

## Como iniciar localmente

Recomendado: Node.js 22 LTS e npm. Não é necessário instalar PostgreSQL ou Docker para usar o banco de desenvolvimento incluído.

```powershell
npm install
Copy-Item .env.example .env
node -e "const fs=require('fs'),c=require('crypto');const p='.env';fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('replace-with-a-random-secret-of-at-least-32-characters',c.randomBytes(32).toString('hex')))"
```

**Nesta máquina `.env` já foi criado com uma chave aleatória, as migrações foram aplicadas e o seed foi executado. Não sobrescreva esse arquivo para iniciar o projeto atual.**

Terminal 1, banco:

```powershell
npm run db:local
```

Mantenha o terminal aberto. O PostgreSQL usa `127.0.0.1:54329` e armazena os dados em `.local-postgres/data`, ignorado pelo Git. As credenciais incluídas são exclusivas de desenvolvimento. O script reutiliza o banco existente e não apaga dados. Se o banco já está rodando, não inicie uma segunda instância.

Terminal 2, para retomar este checkout já configurado:

```powershell
npm run dev
```

Somente em uma instalação nova, prepare o banco antes de iniciar:

```powershell
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

Abra **http://localhost:3000**. Para alterações futuras do schema, use `npm run db:migrate -- --name nome_da_alteracao`.

Para PostgreSQL instalado ou outro banco PostgreSQL, ajuste `DATABASE_URL` no `.env` e dispense `db:local`. Não há mock de criação de pedido: se o banco está indisponível, nenhuma confirmação de sucesso é fabricada.

## Configurações

No `.env`:

```dotenv
NEXT_PUBLIC_STORE_WHATSAPP="5589994549682"
NEXT_PUBLIC_DELIVERY_FEE_CENTS="500"
APP_ORIGIN="http://localhost:3000"
```

- **WhatsApp:** número de teste fornecido, `89 99454-9682`, acrescido de `55`. Use apenas dígitos, incluindo país e DDD. Troque `NEXT_PUBLIC_STORE_WHATSAPP` pelo número oficial quando desejar.
- **Entrega:** `NEXT_PUBLIC_DELIVERY_FEE_CENTS=500` significa **R$ 5,00**. O cálculo e a UI usam `src/lib/store-config.ts`; o valor não é repetido nos componentes. Futuramente, esse ponto será substituído por configuração persistida e cotação por região.
- **Origem:** `APP_ORIGIN` deve coincidir exatamente com o endereço usado no navegador, incluindo porta. A API rejeita outras origens. Para testar pelo IP da rede, ajuste a origem e a interface do servidor explicitamente.
- **Acesso ao pedido:** mantenha `ORDER_ACCESS_SECRET` privado, aleatório, com pelo menos 32 caracteres. Alterar essa chave muda os tokens gerados nos próximos envios. Cookies são HttpOnly e SameSite=Lax, com Secure em HTTPS, válidos por sete dias.
- **Catálogo de fallback:** `DEMO_CATALOG=true` permite visualizar dados fictícios se não houver conexão com o banco. Não permite criar pedidos falsos. Desative esse modo antes de usar produtos reais.

Reinicie o servidor após mudar `.env`. Variáveis `NEXT_PUBLIC_` são incorporadas ao código cliente; refaça o build quando alterá-las em produção.

## Administrar com Prisma Studio

Com o banco rodando:

```powershell
npm run db:studio
```

Abra o endereço exibido, normalmente http://localhost:5555. Cadastre categorias e marcas antes dos produtos. `ProductImage` aceita URLs locais em `/images/...`; para fotografias remotas, configure os domínios em `next.config.ts` antes de usá-las. `position` controla a ordem da galeria.

O seed contém **12 produtos fictícios** em **7 categorias** e não representa o estoque real da Só o Básico. Rodar novamente preserva os produtos e estoques existentes. Para redefinir preços ou quantidades, edite explicitamente pelo Studio; o seed não sobrescreve suas alterações.

Um `/admin` não foi criado nesta etapa. As entidades e serviços estão separados para permitir sua implementação posterior.

## Banco de dados

| Entidade | Responsabilidade |
| --- | --- |
| `Category` | Categorias com nome e slug único |
| `Brand` | Marcas com nome e slug único |
| `Product` | Nome, slug, descrição, preços em centavos, estoque, ativo, destaque, mais vendido, marca, categoria e datas |
| `ProductImage` | Imagens com descrição alternativa e ordem na galeria |
| `Customer` | Dados pessoais do cliente usados no pedido |
| `Address` | Endereço relacionado ao cliente e ao pedido |
| `Order` | Número único `SOB-000123`, totais, cliente, endereço, estados, chave idempotente e hash do token de acesso |
| `OrderItem` | Snapshot de nome, preço unitário, quantidade e subtotal da compra |

Relacionamentos: categoria e marca possuem produtos; produto possui imagens; cliente possui endereços e pedidos; pedido possui itens e endereço. Nome e preço dos itens não dependem do produto atual. O vínculo com o produto pode ser removido sem perder o histórico do item. Cliente e endereço são registros novos a cada pedido, preservando os dados usados naquela compra.

Estados de pedido: `PENDING`, `CONFIRMED`, `PREPARING`, `READY`, `DELIVERED`, `CANCELED`.

Estados de pagamento: `PENDING`, `PAID`, `FAILED`, `REFUNDED`. Modalidades preparadas: `DELIVERY`, `PICKUP`; apenas entrega está disponível na interface.

## Arquitetura

```text
src/
  app/
    page.tsx                home
    produtos/               catálogo e detalhe [slug]
    carrinho/               sacola
    checkout/               dados e revisão
    api/pedidos/            criação do pedido (POST)
    pedidos/[id]/           confirmação com autorização por cookie
    privacidade/            informações provisórias de privacidade
  components/               UI reutilizável e experiência da loja
  lib/
    catalog.ts              leitura do catálogo
    types.ts                tipos públicos
    store-config.ts         configurações e moeda
    validation.ts           validações compartilhadas
    order-calculation.ts    regras de preço em centavos
    orders.ts               transação, estoque e idempotência
    order-access.ts         tokens e verificação de autorização
    whatsapp.ts             mensagem e URL codificada
    rate-limit.ts           proteção local contra excesso de envios
    prisma.ts               cliente único do banco
prisma/
  schema.prisma
  migrations/
  seed.ts
public/images/               ativos locais e registro das fontes
scripts/                     PostgreSQL local e preparação dos ativos
tests/                       regras, integração real e navegador
```

### Integridade do pedido

1. A API exige origem permitida e JSON, limita o corpo a 16 KiB e limita tentativas.
2. Valida cliente, CPF, telefone, endereço, carrinho e chave idempotente.
3. Consulta os produtos cadastrados e recalcula preços promocionais, subtotais, entrega e total. Valores e status enviados pelo navegador são ignorados.
4. Usa transação serializável e decremento condicional de estoque, com retries em conflito.
5. Salva cliente, endereço, itens com snapshot e pedido pendente na mesma transação; falhas revertem todas as operações.
6. Retorna apenas o identificador opaco do pedido e define o cookie privado de acesso.
7. A confirmação verifica o hash do token e seleciona apenas os dados necessários; não carrega CPF para o cliente.

A sacola é limpa depois de abrir a confirmação do pedido recém-criado. Revisitar um pedido antigo não apaga uma nova sacola. Sem confirmação de acesso, a sacola é mantida.

### WhatsApp e pagamento

O botão prepara a URL `https://wa.me/...` com `encodeURIComponent`. O cliente ainda precisa enviar a mensagem no WhatsApp; não há envio automático ou integração com WhatsApp Business API. A mensagem inclui valores e dados de entrega do pedido registrado, sem CPF ou alegação de pagamento confirmado.

URLs internas não incluem CPF, telefone ou endereço. A URL externa do WhatsApp necessariamente contém a mensagem codificada, conforme o fluxo solicitado; a pessoa é informada disso na página de privacidade. Esses links não são usados em logs da aplicação.

Não há integração fictícia com Mercado Pago. Uma integração futura deverá isolar o gateway em um serviço de backend, validar assinatura e origem de webhooks, conferir pedido/valor/moeda e tratar eventos com idempotência. **Nunca definir `PAID` por retorno do navegador, clique ou parâmetros de URL.**

## Validação

### CPF fictício no checkout local

Com `npm.cmd run dev`, o formulário e a API aceitam **111.111.111-11** (também sem pontuação). Essa exceção existe somente quando `NODE_ENV !== "production"`, na validação compartilhada de cliente; a função de validação real de CPF permanece intacta. `npm run build` / `npm run start` usam produção e rejeitam esse CPF mesmo no localhost. Outros CPFs inválidos e os demais campos continuam sendo validados normalmente.

Dados fictícios usados no teste: nome `Cliente Teste Browser`, WhatsApp `89999991234`, CPF `111.111.111-11`, CEP `64500-000`, rua `Rua de Teste`, número `10`, bairro `Centro`, cidade `Oeiras`, UF `PI`; complemento e referência vazios. É necessário marcar a leitura da privacidade.

**Revisar e confirmar pedido** abre o modal de revisão. O pedido só é criado ao clicar em **Confirmar e criar pedido** dentro desse modal; depois aparece a confirmação com o botão de WhatsApp. No teste, a API retornou 201, o CPF fictício foi conferido no registro salvo e o link de WhatsApp não continha CPF. Nenhuma mensagem foi enviada.

Para repetir o cenário automatizado contra o servidor de desenvolvimento:

```powershell
$env:E2E_CHECKOUT_CPF = "11111111111"
npm.cmd run test:e2e -- --grep "mobile purchase"
Remove-Item Env:E2E_CHECKOUT_CPF
```

O CPF padrão da suíte de navegador continua sendo um dado de teste com dígitos verificadores válidos para permitir testar builds de produção. A exceção é coberta separadamente em desenvolvimento, teste e produção, incluindo rejeição explícita pela API de produção sem acesso ao banco.

Com PostgreSQL e o servidor local abertos:

```powershell
npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:e2e
npm run build
```

Os testes de integração usam PostgreSQL real e limpam apenas os registros criados por aquela execução. Os testes de navegador criam um pedido com **dados fictícios** e o deixam disponível para inspeção no Studio, reservando duas unidades do batom de teste. Não abra o WhatsApp nem envie mensagens durante os testes automatizados.

Os testes visuais cobrem **360, 390, 430, 768, 1024 e 1440 px**, verificando carregamento das imagens e ausência de transbordamento da página. Capturas são salvas em `test-results/`, ignorado pelo Git.

O Playwright usa por padrão `C:/Program Files/Google/Chrome/Application/chrome.exe`. Em outra instalação, defina `PLAYWRIGHT_CHROME_PATH` para um executável existente; não há detecção automática de outro navegador. Se instalar Chromium com `npx playwright install chromium`, configure também seu caminho.

Se o PowerShell bloquear `npm.ps1`, use `npm.cmd` nos comandos acima. O erro `uv_os_get_passwd ENOMEM` encontrado no sandbox Windows exige executar PostgreSQL e testes via `tsx` com a permissão apropriada fora do sandbox; não exige recriar o banco.

### Fechamento da validação em 05/10/2026

Lint, typecheck, build e os 8 testes de domínio passaram. Os 4 testes de integração incluem indisponibilidade do PostgreSQL em processo isolado: a API retorna 503, sem identificador de pedido ou cookie de confirmação. A conexão do banco da loja não é interrompida.

A suíte Playwright foi ampliada para 5 cenários, todos aprovados no desenvolvimento e novamente no build de produção local. Produto, sacola, checkout, revisão e confirmação são verificados em 360, 390, 430, 768, 1024 e 1440 px, com capturas em `test-results/`. As capturas de produto, sacola, checkout e confirmação foram inspecionadas nas seis larguras. A galeria usa um produto temporário com duas imagens, removido ao final junto com suas imagens; produtos da loja não são alterados por esse cenário. A compra continua gerando um pedido fictício e reservando estoque, como documentado acima.

A auditoria npm retornou **8 ocorrências altas** no conjunto completo e **3 com `--omit=dev`**, na cadeia `prisma → @prisma/config → deepmerge-ts`. Embora `prisma` esteja declarado em desenvolvimento, `@prisma/client` mantém essa ferramenta na árvore instalada, portanto não se deve declarar a auditoria de produção limpa. A outra cadeia é `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`. Nenhum pacote foi alterado: as soluções automáticas sugerem downgrades que exigem avaliação de compatibilidade. Essa revisão permanece pendente antes de publicar.

## Temporário e próximos passos

- Produtos, marcas, descrições e estoque são fictícios. Fotos de ambientação e ilustrações precisam ser substituídas pelos ativos autorizados dos produtos reais. Fontes: `public/images/SOURCES.md`.
- Mais vendidos e destaques são flags do cadastro, não estatísticas calculadas a partir de vendas.
- A taxa é fixa de teste e não representa uma cotação por CEP. Não há consulta automática ao CEP, restrição geográfica de entrega ou cálculo de frete externo.
- Retirada está preparada no enum, mas não habilitada no checkout.
- Não há gateway, cobrança, webhook, dashboard, login de cliente ou favoritos pessoais nesta etapa.
- Pedidos pendentes reservam estoque. Cancelamento, devolução de estoque e expiração de reservas precisam de um serviço administrativo futuro; alterar apenas o status no Studio não devolve estoque automaticamente.
- A página de privacidade é um rascunho para teste. Definir responsável, base legal, canal para direitos, retenção e procedimentos antes de publicar.
- O rate limiter é de uma única instância em memória. Para publicação com múltiplas instâncias, usar armazenamento compartilhado e configurar IPs/proxies confiáveis. Usar HTTPS, credenciais de produção com acesso mínimo, política de backup e proteção do armazenamento do banco.
- Dependências são fixadas pelo `package-lock.json`. Auditar novamente antes de publicar; não executar `npm audit fix --force` sem revisar mudanças de versões principais.

Este projeto continua **sem deploy**, pronto para avaliação local do fluxo.
