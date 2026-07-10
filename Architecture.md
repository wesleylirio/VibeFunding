# Architecture — VibeFunding

## 1. Objetivo

Construir uma aplicação web containerizada que demonstre as duas experiências centrais do VibeFunding:

1. **Investor Experience**
   - Descobrir e analisar projetos;
   - Consultar a Gemma;
   - Alocar recursos simulados;
   - Acompanhar vários investimentos;
   - Observar agentes trabalhando;
   - Consultar Proofs of Build;
   - Visualizar Project Tokens, NFTs, benefícios e retorno simulado.

2. **Founder Experience**
   - Criar ou editar um projeto;
   - Estruturar uma Build Round;
   - Receber apoio da Gemma;
   - Acompanhar recursos captados;
   - Observar coding agents;
   - Controlar o que pode ser mostrado aos investidores;
   - Gerar atualizações para stakeholders;
   - Publicar Proofs of Build.

O MVP não implementará infraestrutura financeira real. Todos os ativos e retornos serão simulados.

---

# 2. Princípios técnicos

- Aplicação web responsiva;
- Interface moderna, minimalista e objetiva;
- Navegação fluida;
- Gemma visível em toda a experiência;
- Investor como experiência padrão;
- Troca rápida entre Investor e Founder;
- Projetos preparados para escala;
- Server-side filtering e pagination;
- Observabilidade de coding agents;
- Proof of Build baseado em dados verificáveis;
- Container único para avaliação;
- Modo demonstrativo independente de serviços externos;
- Modo live para AMD, Gemma e Fireworks;
- Nenhuma credencial exposta no cliente;
- Nenhuma execução arbitrária de código iniciada pelo navegador público.

---

# 3. Stack recomendada

## Aplicação

- **Next.js**
- **TypeScript**
- **App Router**
- **Node.js runtime**
- **React Server Components quando aplicável**

## Interface

- **Tailwind CSS**
- **shadcn/ui**
- **Radix UI**
- **Lucide Icons**
- **Framer Motion**
- **Recharts**

## Dados

- **SQLite**
- **Drizzle ORM**
- Seed determinístico para ambiente de demonstração

## IA

- **Gemma hospedada em infraestrutura AMD**
- API compatível com OpenAI para comunicação com o modelo
- Fireworks AI para modelos open-weight
- FireConnect para integração com coding-agent harnesses

## Infraestrutura

- Docker
- Docker Compose
- Node.js 22
- Aplicação servida na porta `3000`

---

# 4. Arquitetura geral

```text
┌─────────────────────────────────────────────┐
│                 Web Client                  │
│                                             │
│ Investor UI  Founder UI  Gemma  Agent Feed │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│             Next.js Application             │
│                                             │
│ Pages · API Routes · Server Actions         │
│ Auth Demo · Portfolio · Projects · Rounds   │
│ Allocations · Agent Runs · Proofs of Build  │
└───────┬──────────────┬──────────────┬────────┘
        │              │              │
        ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   SQLite    │ │Gemma Gateway│ │Agent Gateway│
│   Drizzle   │ │ AMD / Mock  │ │Fireworks    │
└─────────────┘ └─────────────┘ └──────┬──────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ Coding Harnesses │
                              │ Codex/OpenCode   │
                              │ Claude Code etc. │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ Run Capture      │
                              │ Events/Artifacts │
                              │ Proof Builder    │
                              └─────────────────┘
```

---

# 5. Modos de execução

## 5.1 Demo Mode

Modo usado pelos jurados.

Características:

- Base de dados seeded;
- Projetos pré-carregados;
- Investidores e founders simulados;
- Gemma com respostas reais quando disponível;
- Fallback para respostas previamente geradas;
- Agent Runs reproduzidos por meio de eventos persistidos;
- Proofs of Build completos;
- Nenhuma espera por execução real de coding agents;
- Nenhuma dependência obrigatória de wallet;
- Nenhum ativo financeiro real.

```env
DEMO_MODE=true
```

## 5.2 Live Mode

Modo usado para o vídeo e testes internos.

Características:

- Gemma executada na AMD;
- Fireworks e FireConnect ativos;
- Coding agent trabalhando em um repositório real;
- Captura real de eventos;
- Testes e commits reais;
- Geração real de Proof of Build;
- Possibilidade de transformar uma execução live em replay.

```env
DEMO_MODE=false
```

---

# 6. Estrutura do repositório

```text
vibefunding/
├── app/
│   ├── page.tsx
│   ├── discover/
│   ├── portfolio/
│   ├── projects/
│   ├── proofs/
│   ├── gemma/
│   ├── founder/
│   └── api/
├── components/
│   ├── layout/
│   ├── investor/
│   ├── founder/
│   ├── projects/
│   ├── build-rounds/
│   ├── portfolio/
│   ├── gemma/
│   ├── agents/
│   ├── proofs/
│   └── ui/
├── lib/
│   ├── db/
│   ├── gemma/
│   ├── fireworks/
│   ├── agents/
│   ├── proof-of-build/
│   ├── portfolio/
│   ├── demo/
│   ├── validation/
│   └── security/
├── worker/
│   ├── run-agent.ts
│   ├── capture-events.ts
│   ├── collect-artifacts.ts
│   └── build-proof.ts
├── scripts/
│   ├── seed.ts
│   ├── import-run.ts
│   └── reset-demo.ts
├── public/
├── data/
│   ├── app.db
│   ├── runs/
│   └── proofs/
├── Dockerfile
├── docker-compose.yml
├── README.md
├── ARCHITECTURE.md
└── SPRINTS.md
```

---

# 7. Experiência visual

## Direção de design

- Fundo neutro;
- Alto contraste;
- Poucas cores de destaque;
- Cards com bordas sutis;
- Espaçamento generoso;
- Tipografia clara;
- Animações rápidas e discretas;
- Densidade informacional controlada;
- Dados importantes sempre visíveis;
- Sem estética excessivamente “crypto”;
- Sem excesso de gradientes;
- Sem interfaces semelhantes a cassino;
- Sem dashboards poluídos.

## Layout principal

### Desktop

```text
┌───────────────┬───────────────────────────┬──────────────┐
│ Sidebar       │ Main Content              │ Gemma Panel  │
│               │                           │              │
│ Discover      │ Projects / Portfolio      │ Conversation │
│ Portfolio     │ Build Rounds / Proofs     │ Insights     │
│ Activity      │                           │ Actions      │
│ Founder Mode  │                           │ Sources      │
└───────────────┴───────────────────────────┴──────────────┘
```

### Mobile

- Bottom navigation;
- Gemma aberta como drawer;
- Cards em coluna;
- Tabelas convertidas em listas;
- Agent Feed resumido.

---

# 8. Gemma

## 8.1 Identidade

A assistente será chamada diretamente de **Gemma**.

Gemma deve ser percebida como parte central da plataforma, não como um chatbot adicional.

Presença:

- Painel lateral persistente;
- Busca da plataforma;
- Cards de insights;
- Due diligence;
- Resumos de portfólio;
- Atualizações de projetos;
- Apoio aos founders.

## 8.2 Modos de contexto

```ts
type GemmaContext =
  | "GLOBAL_DISCOVERY"
  | "INVESTOR_PORTFOLIO"
  | "PROJECT_DILIGENCE"
  | "BUILD_ROUND_ANALYSIS"
  | "PROOF_OF_BUILD"
  | "FOUNDER_PROJECT"
  | "FOUNDER_BUILD_ROUND"
  | "FOUNDER_STAKEHOLDER_UPDATE";
```

## 8.3 Gemma para investidores

Gemma deve:

- Descobrir projetos;
- Resumir projetos;
- Comparar Build Rounds;
- Analisar riscos;
- Avaliar histórico de execução;
- Ler Proofs of Build;
- Explicar retornos e benefícios simulados;
- Informar Project Tokens e NFTs recebidos;
- Consolidar atualizações;
- Analisar concentração do portfólio;
- Responder perguntas sobre múltiplos projetos.

## 8.4 Gemma para founders

No MVP, Gemma deve:

- Revisar a descrição de um projeto;
- Identificar informações ausentes;
- Auxiliar na criação de uma Build Round;
- Melhorar a comunicação da rodada;
- Resumir atividade dos agentes;
- Transformar logs técnicos em atualização pública;
- Sugerir quais informações devem permanecer privadas;
- Preparar uma atualização para stakeholders.

Gemma não deve:

- Assumir controle do roadmap;
- Criar sprints automaticamente sem solicitação;
- Alterar código;
- Executar investimentos;
- Publicar informações privadas sem aprovação.

## 8.5 Gateway

```ts
interface GemmaGateway {
  chat(input: GemmaChatInput): Promise<GemmaResponse>;
  analyzeProject(input: ProjectAnalysisInput): Promise<ProjectAnalysis>;
  analyzePortfolio(input: PortfolioAnalysisInput): Promise<PortfolioAnalysis>;
  summarizeProof(input: ProofSummaryInput): Promise<ProofSummary>;
  assistFounder(input: FounderAssistInput): Promise<FounderAssistResponse>;
}
```

Implementações:

```text
AmdGemmaGateway
MockGemmaGateway
CachedGemmaGateway
```

Fallback:

```text
AMD Gemma
   ↓ failure
Cached response
   ↓ missing
Deterministic mock
```

---

# 9. Escala de projetos

A interface deve ser projetada para suportar milhares de projetos.

## Descoberta

- Search server-side;
- Filtros por categoria;
- Filtros por estágio;
- Filtros por tipo de recurso;
- Filtros por risco;
- Filtros por retorno;
- Filtros por tecnologia;
- Filtros por Proof of Build;
- Ordenação;
- Pagination;
- Recomendações da Gemma.

## Regra

Nunca carregar todos os projetos no navegador.

```ts
interface ProjectQuery {
  search?: string;
  category?: string[];
  stage?: string[];
  resourceTypes?: string[];
  returnTypes?: string[];
  verifiedOnly?: boolean;
  sort?: "RELEVANCE" | "TRENDING" | "RECENT" | "PROGRESS";
  cursor?: string;
  limit?: number;
}
```

Para o MVP:

- Seed com quantidade suficiente para transmitir escala;
- Poucos projetos detalhados;
- Demais projetos podem possuir dados resumidos;
- Conteúdo definitivo será definido separadamente.

---

# 10. Rotas

## Públicas e Investor

```text
/
 /discover
 /portfolio
 /activity
 /projects/[projectSlug]
 /projects/[projectSlug]/rounds/[roundId]
 /projects/[projectSlug]/agents
 /proofs/[proofId]
 /gemma
```

## Founder

```text
/founder
/founder/projects
/founder/projects/new
/founder/projects/[projectId]
/founder/projects/[projectId]/rounds/new
/founder/projects/[projectId]/runs
/founder/projects/[projectId]/stakeholder-update
```

## Utilitárias

```text
/api/health
/api/demo/reset
/api/demo/switch-role
```

---

# 11. Troca de papel

Não implementar autenticação completa no MVP.

Usar dois perfis seeded:

```ts
type DemoRole = "INVESTOR" | "FOUNDER";
```

A interface deve possuir um seletor:

```text
Viewing as:
[ Investor ▼ ]
```

A troca deve:

- Manter a sessão;
- Alterar navegação;
- Alterar contexto da Gemma;
- Não exigir recarregamento completo;
- Permitir que o jurado experimente os dois lados.

Perfil inicial:

```text
INVESTOR
```

---

# 12. Entidades principais

## User

```ts
interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  activeRole: "INVESTOR" | "FOUNDER";
}
```

## Project

```ts
interface Project {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  stage: string;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
  logoUrl?: string;
  repositoryUrl?: string;
  websiteUrl?: string;
  founderId: string;
  visibility: "PUBLIC" | "PARTIAL" | "PRIVATE";
  createdAt: Date;
}
```

## BuildRound

```ts
interface BuildRound {
  id: string;
  projectId: string;
  title: string;
  objective: string;
  status:
    | "DRAFT"
    | "OPEN"
    | "FUNDED"
    | "BUILDING"
    | "COMPLETED";
  targetValue: number;
  fundedValue: number;
  startsAt: Date;
  endsAt?: Date;
  expectedDeliverables: string[];
  risks: string[];
}
```

## ResourceRequirement

```ts
type ResourceType =
  | "VIBE"
  | "STABLECOIN"
  | "AGENT_TOKENS"
  | "AGENT_HOURS"
  | "AMD_GPU_HOURS"
  | "COMPUTE_UNITS";

interface ResourceRequirement {
  id: string;
  buildRoundId: string;
  type: ResourceType;
  targetAmount: number;
  fundedAmount: number;
  unit: string;
}
```

## Allocation

```ts
interface Allocation {
  id: string;
  investorId: string;
  buildRoundId: string;
  resourceType: ResourceType;
  amount: number;
  normalizedValue: number;
  createdAt: Date;
}
```

## ReturnMechanism

```ts
type ReturnType =
  | "PROJECT_TOKEN"
  | "VIBE"
  | "NFT"
  | "DIRECT_PAYMENT"
  | "BUYBACK"
  | "REVENUE_SHARE"
  | "PRODUCT_ACCESS"
  | "DISCOUNT";

interface ReturnMechanism {
  id: string;
  buildRoundId: string;
  type: ReturnType;
  title: string;
  description: string;
  simulated: boolean;
}
```

## Holding

```ts
interface Holding {
  id: string;
  investorId: string;
  projectId: string;
  assetType: "PROJECT_TOKEN" | "VIBE" | "NFT";
  assetSymbol: string;
  amount: number;
  simulatedValue?: number;
  metadata?: Record<string, unknown>;
}
```

## NFTBenefit

```ts
interface NFTBenefit {
  id: string;
  projectId: string;
  name: string;
  imageUrl?: string;
  description: string;
  utility?: string[];
  rarity?: string;
  simulated: true;
}
```

---

# 13. Agent Observability

## Objetivo

Permitir que founders e investidores acompanhem coding agents trabalhando sem expor:

- Credenciais;
- Segredos;
- Código privado;
- Dados pessoais;
- Variáveis de ambiente;
- Prompts confidenciais;
- Informações estratégicas.

## Agent Run

```ts
interface AgentRun {
  id: string;
  projectId: string;
  buildRoundId?: string;
  taskId?: string;
  agentName: string;
  harness: string;
  model: string;
  provider: string;
  status:
    | "QUEUED"
    | "RUNNING"
    | "WAITING"
    | "FAILED"
    | "COMPLETED";
  startedAt?: Date;
  completedAt?: Date;
  publicSummary?: string;
  visibility: "PUBLIC" | "INVESTORS" | "FOUNDER_ONLY";
}
```

## Agent Event

```ts
type AgentEventType =
  | "RUN_STARTED"
  | "PLANNING"
  | "READING_FILE"
  | "TOOL_CALL"
  | "FILE_CHANGED"
  | "TEST_STARTED"
  | "TEST_COMPLETED"
  | "COMMIT_CREATED"
  | "ARTIFACT_CREATED"
  | "RUN_COMPLETED"
  | "RUN_FAILED";

interface AgentEvent {
  id: string;
  runId: string;
  sequence: number;
  type: AgentEventType;
  title: string;
  publicMessage: string;
  privatePayload?: Record<string, unknown>;
  visibility: "PUBLIC" | "INVESTORS" | "FOUNDER_ONLY";
  createdAt: Date;
}
```

## Visualização

A tela deve mostrar:

- Agente;
- Modelo;
- Harness;
- Status;
- Tarefa;
- Timeline;
- Arquivos alterados;
- Testes;
- Commits;
- Consumo de tokens;
- Tempo;
- Origem do compute;
- Última atividade.

Exemplo visual:

```text
● Agent started
│
● Reading authentication module
│
● Modified 3 files
│
● Running test suite
│
● 18/18 tests passed
│
● Commit created
│
✓ Proof of Build generated
```

---

# 14. Real Run e Replay Mode

Os jurados não devem esperar um coding agent concluir uma tarefa.

A arquitetura deve suportar:

## Real Run

Usado durante a gravação:

```text
Coding agent
    ↓
Event capture
    ↓
Artifact collection
    ↓
Proof builder
    ↓
Persisted run
```

## Replay Mode

Usado pelos jurados:

```text
Persisted events
    ↓
Replay engine
    ↓
Compressed timeline
    ↓
Agent activity UI
```

O replay deve:

- Reproduzir eventos gradualmente;
- Permitir pausar;
- Permitir acelerar;
- Permitir pular para o resultado;
- Indicar claramente que é uma execução registrada;
- Usar dados provenientes de uma execução real quando disponível.

```ts
interface ReplayOptions {
  speed: 1 | 2 | 4 | 8;
  startFrom?: number;
  autoPlay: boolean;
}
```

Implementação inicial:

- Eventos carregados do banco;
- Atualização visual por timer;
- Não exige WebSocket;
- SSE é opcional para Live Mode.

---

# 15. Proof of Build

## Objetivo

Demonstrar que recursos foram transformados em trabalho verificável.

## Estrutura

```ts
interface ProofOfBuild {
  id: string;
  projectId: string;
  buildRoundId?: string;
  agentRunId: string;

  taskTitle: string;
  taskDescription: string;

  agentName: string;
  harness: string;
  model: string;
  provider: string;
  computeSource: string;

  inputTokens?: number;
  outputTokens?: number;
  computeTimeSeconds?: number;
  normalizedCost?: number;

  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;

  testsTotal?: number;
  testsPassed?: number;
  testsFailed?: number;

  commitHash?: string;
  repositoryUrl?: string;

  artifactRootHash: string;
  manifestHash: string;

  verificationStatus:
    | "RECORDED"
    | "HASH_VERIFIED"
    | "HUMAN_VERIFIED";

  publicSummary: string;
  gemmaSummary?: string;

  createdAt: Date;
}
```

## Proof Artifact

```ts
interface ProofArtifact {
  id: string;
  proofId: string;
  type:
    | "DIFF"
    | "TEST_REPORT"
    | "LOG"
    | "COMMIT"
    | "FILE"
    | "SCREENSHOT"
    | "BUILD";
  name: string;
  path?: string;
  hash: string;
  size?: number;
  visibility: "PUBLIC" | "INVESTORS" | "FOUNDER_ONLY";
}
```

## Manifest

Cada Proof of Build deve possuir um manifest canônico:

```json
{
  "version": "1.0",
  "projectId": "...",
  "buildRoundId": "...",
  "agentRunId": "...",
  "task": {},
  "agent": {},
  "compute": {},
  "changes": {},
  "tests": {},
  "artifacts": [],
  "createdAt": "..."
}
```

Processo:

```text
Collect run data
      ↓
Sanitize private data
      ↓
Hash every artifact with SHA-256
      ↓
Generate canonical manifest
      ↓
Hash manifest
      ↓
Persist Proof of Build
```

O MVP não precisa escrever o hash em blockchain.

A interface pode mostrar:

```text
Proof status: Hash Verified
Manifest hash: 8e9c...a72f
```

---

# 16. Founder Experience

## Founder Dashboard

Exibir:

- Projetos;
- Build Rounds;
- Recursos captados;
- Agentes ativos;
- Proofs of Build;
- Atualizações pendentes;
- Alertas da Gemma.

## Create Project

Formulário em etapas:

1. Informações básicas;
2. Estado atual;
3. Evidências de execução;
4. Recursos;
5. Retornos;
6. Visibilidade;
7. Revisão da Gemma.

## Create Build Round

Campos:

- Título;
- Objetivo;
- Entregas;
- Recursos buscados;
- Project Tokens;
- NFTs e benefícios;
- Possíveis mecanismos de retorno;
- Riscos;
- Informações públicas;
- Informações privadas.

Gemma pode:

- Revisar clareza;
- Detectar campos ausentes;
- Apontar inconsistências;
- Gerar resumo público;
- Preparar perguntas frequentes.

## Agent Workspace

Exibir:

- Runs;
- Eventos;
- Custos;
- Consumo;
- Progresso;
- Testes;
- Commits;
- Proofs;
- Controles de visibilidade.

## Stakeholder Update

Gemma gera um rascunho usando:

- Agent Events;
- Proofs of Build;
- Build Round;
- Entregas;
- Recursos consumidos.

O founder precisa aprovar antes da publicação.

---

# 17. Investor Experience

## Discover

- Search;
- Filtros;
- Feed personalizado;
- Recomendações da Gemma;
- Projetos em destaque;
- Build Rounds;
- Indicadores de Proof of Build.

## Project Detail

Exibir:

- Visão geral;
- Founders;
- Produto;
- Estágio;
- Histórico;
- Build Rounds;
- Proofs of Build;
- Agent Activity;
- Recursos buscados;
- Mecanismos de retorno;
- Project Tokens;
- NFTs;
- Riscos;
- Gemma Due Diligence.

## Allocation Flow

```text
Select resource
      ↓
Choose amount
      ↓
Review simulated return
      ↓
Confirm allocation
      ↓
Receive simulated assets
      ↓
Update portfolio
```

A confirmação deve exibir claramente:

```text
Simulation only — no real financial transaction.
```

## Portfolio

Exibir:

- Valor simulado;
- Projetos;
- Build Rounds;
- Project Tokens;
- NFTs;
- VIBE;
- Alocações;
- Atualizações;
- Proofs recentes;
- Agent activity;
- Distribuição por categoria;
- Distribuição por estágio;
- Alertas da Gemma.

---

# 18. API mínima

## Projects

```text
GET  /api/projects
GET  /api/projects/:id
POST /api/founder/projects
PUT  /api/founder/projects/:id
```

## Build Rounds

```text
GET  /api/projects/:id/rounds
GET  /api/rounds/:id
POST /api/founder/projects/:id/rounds
PUT  /api/founder/rounds/:id
```

## Allocations

```text
POST /api/rounds/:id/allocate
GET  /api/portfolio/allocations
```

## Gemma

```text
POST /api/gemma/chat
POST /api/gemma/project-analysis
POST /api/gemma/portfolio-analysis
POST /api/gemma/proof-summary
POST /api/gemma/founder-assist
POST /api/gemma/stakeholder-update
```

## Agent Runs

```text
GET  /api/projects/:id/runs
GET  /api/runs/:id
GET  /api/runs/:id/events
POST /api/runs/:id/replay
```

## Proofs

```text
GET  /api/proofs/:id
POST /api/internal/proofs
POST /api/internal/proofs/:id/verify
```

## Demo

```text
POST /api/demo/reset
POST /api/demo/switch-role
GET  /api/health
```

---

# 19. Segurança e privacidade

## Regras obrigatórias

- API keys apenas no servidor;
- Nenhuma credencial persistida no browser;
- Nenhuma execução de shell por requisição pública;
- Nenhum repository token enviado ao cliente;
- Sanitização de Markdown e HTML;
- Validação de payloads;
- Rate limit nos endpoints de IA;
- Redação automática de secrets;
- Separação entre payload público e privado;
- Logs sem tokens ou chaves;
- Proof artifacts com controle de visibilidade.

## Redação

Antes de persistir eventos públicos, remover padrões como:

```text
API_KEY
SECRET
TOKEN
PASSWORD
PRIVATE_KEY
.env
Authorization headers
Connection strings
```

---

# 20. Estado e persistência

## Banco

SQLite deve armazenar:

- Usuários;
- Projetos;
- Build Rounds;
- Recursos;
- Alocações;
- Holdings;
- NFTs;
- Agent Runs;
- Agent Events;
- Proofs;
- Artifacts;
- Gemma conversations;
- Gemma insights.

## Arquivos

Arquivos maiores devem ficar em:

```text
/data/runs/[runId]/
/data/proofs/[proofId]/
```

O banco armazena apenas:

- Metadados;
- Paths;
- Hashes;
- Visibilidade.

---

# 21. Container

## Dockerfile

Usar multi-stage build:

```text
dependencies
    ↓
build
    ↓
production runtime
```

Base recomendada:

```dockerfile
node:22-bookworm-slim
```

## Requisitos

- Aplicação disponível em `0.0.0.0:3000`;
- Seed executado automaticamente quando necessário;
- Healthcheck;
- Banco SQLite criado automaticamente;
- Demo Mode ativo por padrão;
- Nenhuma configuração obrigatória para visualizar o MVP.

## Comando esperado

```bash
docker compose up --build
```

## Variáveis

```env
NODE_ENV=production
PORT=3000
DEMO_MODE=true
DATABASE_URL=file:/app/data/app.db

GEMMA_PROVIDER=amd
GEMMA_BASE_URL=
GEMMA_API_KEY=
GEMMA_MODEL=

FIREWORKS_API_KEY=
FIREWORKS_BASE_URL=
FIREWORKS_MODEL=
```

Sem credenciais:

```text
Application runs
Gemma uses cached/demo responses
Agent runs use replay data
```

Com credenciais:

```text
Application uses AMD Gemma
Live AI actions become available
```

---

# 22. Critérios de conclusão

## Investor

O jurado deve conseguir:

- Entrar como investidor;
- Ver múltiplos projetos;
- Usar filtros ou Gemma;
- Abrir um projeto;
- Consultar diligência;
- Ver uma Build Round;
- Fazer uma alocação simulada;
- Receber Project Tokens ou NFT;
- Ver o portfólio atualizado;
- Assistir a um Agent Run;
- Abrir um Proof of Build;
- Receber atualização da Gemma.

## Founder

O jurado deve conseguir:

- Trocar para Founder Mode;
- Criar ou editar um projeto;
- Criar uma Build Round;
- Usar Gemma para revisar a rodada;
- Ver recursos simulados;
- Abrir Agent Workspace;
- Acompanhar uma execução;
- Ver ou gerar um Proof of Build;
- Gerar uma atualização para stakeholders.

## Infraestrutura

- Aplicação inicia por Docker;
- Healthcheck responde;
- Seed funciona;
- Demo Mode funciona sem APIs externas;
- AMD Gemma pode ser habilitada por variável;
- Nenhuma secret é enviada ao cliente;
- Jornada principal não apresenta erro.

---

# 23. Prioridade de implementação

```text
1. Design system e layout
2. Seed e entidades
3. Investor discovery e project detail
4. Gemma global
5. Allocation e portfolio
6. Agent observability
7. Proof of Build
8. Founder mode
9. Container
10. Polish e demo replay
```

---

# 24. Regra final para coding agents

Construir somente o necessário para provar:

```text
Investimento
    ↓
Capital computacional
    ↓
Trabalho agentic observável
    ↓
Proof of Build
    ↓
Retorno e acompanhamento
```

Priorizar:

- Clareza;
- Fluidez;
- Qualidade visual;
- Gemma;
- Investor Experience;
- Founder Experience;
- Agent Observability;
- Proof of Build;
- Container reproduzível.

Não implementar sistemas financeiros reais, blockchain completa ou infraestrutura descentralizada nesta etapa.