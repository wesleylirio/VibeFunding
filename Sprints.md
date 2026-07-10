# Sprints — VibeFunding

## 1. Objetivo

Construir uma demonstração containerizada do VibeFunding para o AMD Developer Hackathon Act II.

O produto deve permitir que um jurado experimente duas perspectivas:

1. **Investor**
   - Descobrir projetos;
   - Consultar a Gemma;
   - Analisar uma Build Round;
   - Alocar recursos simulados;
   - Receber Project Tokens ou NFT;
   - Acompanhar agentes;
   - Consultar Proofs of Build;
   - Visualizar seu portfólio.

2. **Founder**
   - Visualizar seu projeto;
   - Criar ou editar uma Build Round;
   - Receber assistência da Gemma;
   - Acompanhar agentes;
   - Controlar visibilidade;
   - Gerar um Proof of Build;
   - Preparar uma atualização para investidores.

---

# 2. Regra de execução

Antes de iniciar:

1. Ler `README.md`;
2. Ler `ARCHITECTURE.md`;
3. Ler este documento;
4. Inspecionar o estado atual do repositório;
5. Executar os sprints na ordem definida;
6. Não iniciar funcionalidades fora do sprint atual;
7. Validar todos os critérios de aceite antes de avançar.

Depois de cada sprint:

- Executar lint;
- Executar typecheck;
- Executar testes disponíveis;
- Executar build;
- Verificar erros no console;
- Atualizar o checklist deste documento;
- Registrar limitações ou decisões relevantes.

Comandos mínimos esperados:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Quando Docker estiver disponível:

```bash
docker compose up --build
```

---

# 3. Prioridades

## P0 — Obrigatório

- Aplicação funcional;
- Investor Experience;
- Gemma visível;
- Alocação simulada;
- Portfólio;
- Agent Observability;
- Proof of Build;
- Founder Experience mínima;
- Demo Mode;
- Docker;
- Jornada sem erros.

## P1 — Importante

- Integração real com Gemma na AMD;
- Respostas contextuais;
- Replay fluido dos agentes;
- Criação de Build Round;
- Geração de atualização para stakeholders;
- Responsividade;
- Estados de loading e erro.

## P2 — Opcional

- Fireworks live;
- Execução real de coding agent pela aplicação;
- SSE;
- Gráficos avançados;
- NFT gallery detalhada;
- Criação completa de projetos;
- Hash registrado em testnet;
- Autenticação real.

Nenhuma tarefa P2 pode atrasar uma tarefa P0.

---

# 4. Estratégia de implementação

A aplicação deve ser construída como uma vertical slice.

A primeira versão funcional deve demonstrar:

```text
Projeto
   ↓
Gemma Due Diligence
   ↓
Alocação simulada
   ↓
Agent Run em replay
   ↓
Proof of Build
   ↓
Portfolio atualizado
```

Não construir todas as páginas antes de essa jornada funcionar.

---

# Sprint 0 — Foundation

## Objetivo

Criar a base técnica, visual e containerizada da aplicação.

## Tarefas

### Projeto

- [ ] Inicializar Next.js com App Router;
- [ ] Configurar TypeScript;
- [ ] Configurar Tailwind CSS;
- [ ] Configurar shadcn/ui ou componentes equivalentes;
- [ ] Instalar Lucide Icons;
- [ ] Instalar Framer Motion;
- [ ] Configurar ESLint;
- [ ] Configurar script de typecheck;
- [ ] Configurar testes mínimos.

### Dados

- [ ] Configurar SQLite;
- [ ] Configurar Drizzle ORM;
- [ ] Criar schema inicial;
- [ ] Criar migrations;
- [ ] Criar seed idempotente;
- [ ] Criar comando de reset do Demo Mode.

### Layout

- [ ] Criar sidebar;
- [ ] Criar header;
- [ ] Criar área principal;
- [ ] Criar painel lateral da Gemma;
- [ ] Criar seletor Investor/Founder;
- [ ] Implementar navegação sem reload completo;
- [ ] Criar design tokens;
- [ ] Implementar layout mobile básico.

### Infraestrutura

- [ ] Criar `.env.example`;
- [ ] Criar Dockerfile multi-stage;
- [ ] Criar `docker-compose.yml`;
- [ ] Criar `/api/health`;
- [ ] Fazer bind em `0.0.0.0:3000`;
- [ ] Ativar `DEMO_MODE=true` por padrão.

## Seed inicial

Criar dados provisórios para:

- [ ] Um investidor;
- [ ] Um founder;
- [ ] Pelo menos 12 projetos resumidos;
- [ ] Pelo menos 3 projetos detalhados;
- [ ] Build Rounds;
- [ ] Holdings;
- [ ] NFTs;
- [ ] Agent Runs;
- [ ] Agent Events;
- [ ] Proofs of Build.

Os projetos definitivos serão escolhidos posteriormente.

## Critérios de aceite

- [ ] `npm run build` termina sem erro;
- [ ] `/api/health` retorna HTTP 200;
- [ ] O seed pode ser executado mais de uma vez;
- [ ] A aplicação abre em Investor Mode;
- [ ] É possível trocar para Founder Mode;
- [ ] A Gemma aparece no layout;
- [ ] A navegação funciona;
- [ ] `docker compose up --build` inicia a aplicação;
- [ ] A aplicação funciona sem credenciais externas;
- [ ] Não há erros críticos no console.

## Não fazer neste sprint

- Integração real com IA;
- Execução real de coding agent;
- Blockchain;
- Wallet;
- Autenticação;
- Tokenomics;
- Interfaces completas.

---

# Sprint 1 — Investor Vertical Slice

## Objetivo

Completar a primeira jornada funcional do investidor usando dados simulados.

## Tarefas

### Discover

- [ ] Criar `/discover`;
- [ ] Implementar lista paginada de projetos;
- [ ] Implementar busca;
- [ ] Implementar filtros essenciais;
- [ ] Exibir stage;
- [ ] Exibir categoria;
- [ ] Exibir rodada ativa;
- [ ] Exibir progresso da rodada;
- [ ] Exibir indicador de Proof of Build;
- [ ] Exibir mecanismos de retorno;
- [ ] Exibir recomendação ou insight da Gemma.

### Project Detail

- [ ] Criar `/projects/[projectSlug]`;
- [ ] Exibir descrição;
- [ ] Exibir founders;
- [ ] Exibir estágio;
- [ ] Exibir histórico;
- [ ] Exibir Build Rounds;
- [ ] Exibir recursos buscados;
- [ ] Exibir Proofs of Build recentes;
- [ ] Exibir atividade agentic;
- [ ] Exibir Project Token;
- [ ] Exibir NFTs;
- [ ] Exibir riscos;
- [ ] Exibir mecanismos de retorno;
- [ ] Exibir painel de diligência da Gemma.

### Build Round

- [ ] Criar página ou seção detalhada;
- [ ] Exibir objetivo;
- [ ] Exibir entregáveis;
- [ ] Exibir recursos necessários;
- [ ] Exibir Compute Pool;
- [ ] Exibir status;
- [ ] Exibir retornos;
- [ ] Exibir recursos já captados;
- [ ] Exibir disclaimer de simulação.

### Allocation Flow

- [ ] Criar modal ou drawer;
- [ ] Permitir escolher tipo de recurso;
- [ ] Permitir informar quantidade;
- [ ] Exibir recompensa simulada;
- [ ] Exibir Project Tokens;
- [ ] Exibir NFT quando aplicável;
- [ ] Confirmar alocação;
- [ ] Persistir Allocation;
- [ ] Criar ou atualizar Holding;
- [ ] Atualizar Build Round;
- [ ] Exibir confirmação.

### Portfolio

- [ ] Criar `/portfolio`;
- [ ] Exibir saldo VIBE;
- [ ] Exibir projetos investidos;
- [ ] Exibir Project Tokens;
- [ ] Exibir NFTs;
- [ ] Exibir valor simulado;
- [ ] Exibir alocações;
- [ ] Exibir Proofs recentes;
- [ ] Exibir Agent Runs recentes;
- [ ] Exibir distribuição por categoria;
- [ ] Exibir alertas ou insights da Gemma.

## Critérios de aceite

- [ ] O investidor encontra um projeto;
- [ ] O investidor abre uma Build Round;
- [ ] O investidor aloca VIBE simulado;
- [ ] A rodada é atualizada;
- [ ] O investidor recebe um ativo simulado;
- [ ] O ativo aparece no portfólio;
- [ ] O fluxo funciona após reload;
- [ ] Tudo que é simulado está identificado;
- [ ] A interface funciona em desktop;
- [ ] Não há mutações apenas no estado local do componente.

## Não fazer neste sprint

- Carteira blockchain;
- Transação real;
- Compra de token;
- Mercado secundário;
- Retorno financeiro real;
- Due diligence gerada por modelo real.

---

# Sprint 2 — Gemma Core

## Objetivo

Transformar a Gemma em parte central da experiência.

## Tarefas

### Gateway

- [ ] Criar `GemmaGateway`;
- [ ] Implementar `MockGemmaGateway`;
- [ ] Implementar `CachedGemmaGateway`;
- [ ] Implementar `AmdGemmaGateway`;
- [ ] Selecionar gateway por variável de ambiente;
- [ ] Implementar timeout;
- [ ] Implementar fallback;
- [ ] Implementar tratamento de erro;
- [ ] Implementar rate limit básico.

### Interface

- [ ] Criar painel lateral persistente;
- [ ] Criar estado minimizado;
- [ ] Criar drawer mobile;
- [ ] Exibir contexto atual;
- [ ] Exibir sugestões;
- [ ] Exibir loading;
- [ ] Exibir erro;
- [ ] Exibir indicação de resposta demo ou live.

### Investor Contexts

- [ ] Global Discovery;
- [ ] Portfolio Analysis;
- [ ] Project Due Diligence;
- [ ] Build Round Analysis;
- [ ] Proof of Build Explanation.

### Ações rápidas

- [ ] “Summarize this project”;
- [ ] “What are the main risks?”;
- [ ] “Compare with my portfolio”;
- [ ] “Explain this Build Round”;
- [ ] “What changed recently?”;
- [ ] “Explain this Proof of Build”.

### Respostas estruturadas

Gemma deve poder devolver:

```ts
interface GemmaInsight {
  title: string;
  summary: string;
  risks?: string[];
  strengths?: string[];
  questions?: string[];
  portfolioImpact?: string;
  sources?: string[];
  generatedAt: string;
  provider: "AMD_GEMMA" | "CACHE" | "DEMO";
}
```

### Integração AMD

- [ ] Configurar endpoint por ambiente;
- [ ] Não expor credenciais;
- [ ] Registrar provider utilizado;
- [ ] Registrar latência;
- [ ] Registrar modelo;
- [ ] Criar healthcheck interno da integração;
- [ ] Confirmar ao menos uma resposta real para gravação da demo.

## Critérios de aceite

- [ ] A Gemma responde em todas as páginas centrais;
- [ ] A resposta muda conforme o contexto;
- [ ] O projeto atual é enviado ao gateway;
- [ ] O portfólio atual é enviado ao gateway;
- [ ] A aplicação continua funcional sem AMD;
- [ ] O fallback é automático;
- [ ] O usuário sabe se a resposta é live ou demo;
- [ ] Nenhuma API key aparece no cliente;
- [ ] Pelo menos uma ação usa Gemma real na AMD em Live Mode.

## Não fazer neste sprint

- Agente autônomo de investimentos;
- Compra automática;
- Recomendação financeira definitiva;
- Memória vetorial complexa;
- RAG completo;
- Fine-tuning.

---

# Sprint 3 — Agent Observability

## Objetivo

Permitir que investidores e founders acompanhem coding agents trabalhando.

## Tarefas

### Dados

- [ ] Finalizar entidade `AgentRun`;
- [ ] Finalizar entidade `AgentEvent`;
- [ ] Criar eventos seeded;
- [ ] Criar visibilidade por evento;
- [ ] Criar status de execução;
- [ ] Criar métricas de consumo;
- [ ] Criar modelo de origem do compute.

### Interface

- [ ] Criar `/projects/[projectSlug]/agents`;
- [ ] Criar Agent Run Card;
- [ ] Criar timeline;
- [ ] Exibir status;
- [ ] Exibir harness;
- [ ] Exibir modelo;
- [ ] Exibir provider;
- [ ] Exibir tarefa;
- [ ] Exibir tokens;
- [ ] Exibir tempo;
- [ ] Exibir testes;
- [ ] Exibir arquivos alterados;
- [ ] Exibir commit;
- [ ] Exibir origem do compute.

### Replay Mode

- [ ] Reproduzir eventos gradualmente;
- [ ] Adicionar play;
- [ ] Adicionar pause;
- [ ] Adicionar velocidade 1x;
- [ ] Adicionar velocidade 2x;
- [ ] Adicionar velocidade 4x;
- [ ] Adicionar opção “Skip to result”;
- [ ] Exibir “Recorded real run” ou “Demo replay”;
- [ ] Persistir estado final.

### Privacidade

- [ ] Exibir somente eventos permitidos;
- [ ] Implementar níveis de visibilidade;
- [ ] Remover secrets dos eventos;
- [ ] Não exibir conteúdo integral de arquivos privados;
- [ ] Não exibir prompts privados;
- [ ] Não exibir variáveis de ambiente.

## Critérios de aceite

- [ ] O jurado consegue assistir a um run completo;
- [ ] A reprodução dura poucos segundos;
- [ ] O jurado pode acelerar;
- [ ] O jurado pode ir direto ao resultado;
- [ ] O status final corresponde aos eventos;
- [ ] O run mostra trabalho relevante;
- [ ] Investor e Founder visualizam conteúdos diferentes quando necessário;
- [ ] Nenhuma informação sensível é exibida;
- [ ] O replay funciona sem Fireworks ou coding agent ativo.

## Live capture opcional

Somente após o replay funcionar:

- [ ] Importar uma execução real;
- [ ] Converter logs em `AgentEvent`;
- [ ] Capturar testes;
- [ ] Capturar diff;
- [ ] Capturar commit;
- [ ] Persistir o run;
- [ ] Usar o run como replay na demonstração.

---

# Sprint 4 — Proof of Build

## Objetivo

Transformar uma execução agentic em prova verificável e compreensível.

## Tarefas

### Proof Builder

- [ ] Criar serviço `ProofBuilder`;
- [ ] Receber um Agent Run;
- [ ] Coletar métricas;
- [ ] Coletar artifacts;
- [ ] Sanitizar dados;
- [ ] Gerar hashes SHA-256;
- [ ] Gerar manifest canônico;
- [ ] Gerar hash do manifest;
- [ ] Persistir Proof of Build;
- [ ] Associar proof ao projeto;
- [ ] Associar proof à Build Round.

### Artifacts

Suportar:

- [ ] Diff;
- [ ] Test report;
- [ ] Commit;
- [ ] Build output;
- [ ] Screenshot;
- [ ] Log sanitizado;
- [ ] Arquivo produzido.

### Interface

- [ ] Criar `/proofs/[proofId]`;
- [ ] Exibir tarefa;
- [ ] Exibir agente;
- [ ] Exibir modelo;
- [ ] Exibir origem do compute;
- [ ] Exibir consumo;
- [ ] Exibir arquivos alterados;
- [ ] Exibir linhas adicionadas e removidas;
- [ ] Exibir testes;
- [ ] Exibir commit;
- [ ] Exibir artifacts;
- [ ] Exibir manifest hash;
- [ ] Exibir status de verificação;
- [ ] Exibir resumo da Gemma;
- [ ] Exibir disclaimer técnico.

### Verificação

Estados:

```text
RECORDED
HASH_VERIFIED
HUMAN_VERIFIED
```

Para o MVP:

- [ ] Implementar `RECORDED`;
- [ ] Implementar `HASH_VERIFIED`;
- [ ] Simular ou seedar `HUMAN_VERIFIED` apenas quando explicitamente identificado.

## Critérios de aceite

- [ ] Um Agent Run completo gera um Proof of Build;
- [ ] O manifest é determinístico;
- [ ] Os artifacts possuem hash;
- [ ] O hash pode ser recalculado;
- [ ] A interface diferencia evidência de garantia;
- [ ] O Proof aparece na página do projeto;
- [ ] O Proof aparece no portfólio;
- [ ] A Gemma explica o resultado em linguagem não técnica;
- [ ] Dados privados não entram no manifest público.

## Não fazer neste sprint

- Blockchain obrigatória;
- Smart contract;
- Validação formal de código;
- Alegar que o Proof garante qualidade;
- Expor artifacts privados.

---

# Sprint 5 — Founder Experience

## Objetivo

Permitir que o jurado compreenda como founders utilizam o VibeFunding.

## Tarefas

### Founder Dashboard

- [ ] Criar `/founder`;
- [ ] Exibir projetos;
- [ ] Exibir rodadas;
- [ ] Exibir recursos captados;
- [ ] Exibir agentes;
- [ ] Exibir Proofs;
- [ ] Exibir alertas da Gemma;
- [ ] Exibir atualizações pendentes.

### Project Management

- [ ] Criar ou editar informações básicas;
- [ ] Definir visibilidade;
- [ ] Exibir evidências existentes;
- [ ] Exibir recursos;
- [ ] Exibir retornos;
- [ ] Exibir Project Token;
- [ ] Exibir NFTs.

O formulário não precisa cobrir todos os campos possíveis.

### Build Round

- [ ] Criar fluxo de criação ou edição;
- [ ] Informar objetivo;
- [ ] Informar entregáveis;
- [ ] Informar riscos;
- [ ] Informar recursos buscados;
- [ ] Informar mecanismos de retorno;
- [ ] Informar Project Tokens;
- [ ] Informar NFT ou benefício;
- [ ] Informar visibilidade;
- [ ] Salvar como draft.

### Gemma Founder Assist

A Gemma deve:

- [ ] Revisar clareza;
- [ ] Apontar campos ausentes;
- [ ] Detectar inconsistências;
- [ ] Sugerir resumo público;
- [ ] Sugerir perguntas frequentes;
- [ ] Sugerir dados sensíveis a ocultar;
- [ ] Gerar atualização para stakeholders.

A Gemma não deve:

- Criar roadmap sem solicitação;
- Publicar automaticamente;
- Alterar o projeto sem confirmação;
- Definir a estratégia do founder.

### Agent Workspace

- [ ] Listar Agent Runs;
- [ ] Exibir eventos privados;
- [ ] Exibir consumo;
- [ ] Exibir artifacts;
- [ ] Exibir Proofs;
- [ ] Permitir alterar visibilidade simulada;
- [ ] Exibir preview da visão do investidor.

### Stakeholder Update

- [ ] Gerar rascunho com a Gemma;
- [ ] Editar rascunho;
- [ ] Aprovar;
- [ ] Publicar no feed simulado;
- [ ] Exibir no portfólio do investidor.

## Critérios de aceite

- [ ] O jurado troca para Founder Mode;
- [ ] O jurado abre um projeto;
- [ ] O jurado cria ou edita uma Build Round;
- [ ] A Gemma revisa os dados;
- [ ] O jurado acompanha um Agent Run;
- [ ] O jurado consulta um Proof of Build;
- [ ] O jurado gera uma atualização;
- [ ] A atualização aparece para o investidor;
- [ ] Nenhuma publicação ocorre sem confirmação.

---

# Sprint 6 — Live Integrations

## Objetivo

Conectar a demonstração às tecnologias do hackathon sem comprometer o Demo Mode.

## Gemma na AMD

- [ ] Validar endpoint;
- [ ] Validar modelo;
- [ ] Registrar instruções de execução;
- [ ] Testar latência;
- [ ] Testar fallback;
- [ ] Capturar evidência da integração;
- [ ] Exibir provider na interface;
- [ ] Documentar variáveis necessárias.

## Fireworks

- [ ] Configurar credencial no servidor;
- [ ] Validar modelo open-weight;
- [ ] Executar uma tarefa curta;
- [ ] Registrar tokens;
- [ ] Registrar latência;
- [ ] Registrar modelo;
- [ ] Persistir resultado.

## FireConnect

Quando possível:

- [ ] Configurar harness compatível;
- [ ] Executar tarefa em repositório controlado;
- [ ] Capturar logs;
- [ ] Capturar diff;
- [ ] Capturar testes;
- [ ] Capturar commit;
- [ ] Importar execução para o VibeFunding;
- [ ] Gerar Proof of Build real.

## Critérios de aceite

- [ ] Pelo menos uma chamada real à Gemma na AMD;
- [ ] A aplicação não depende dessa chamada para iniciar;
- [ ] Pelo menos um Agent Run possui origem real ou dados reais importados;
- [ ] O Demo Mode continua funcionando offline;
- [ ] Falhas externas não quebram a jornada;
- [ ] Integrações são identificadas corretamente;
- [ ] Nenhuma parceria não confirmada é alegada.

## Regra de corte

Se uma integração live ameaçar a entrega:

1. Manter o gateway;
2. Manter o fallback;
3. Gravar evidência separada;
4. Usar replay na interface;
5. Não atrasar o container final.

---

# Sprint 7 — Demo Experience

## Objetivo

Transformar todas as funcionalidades em uma narrativa clara para o jurado.

## Investor Demo Path

Implementar um caminho guiado:

1. Abrir portfólio;
2. Receber briefing da Gemma;
3. Explorar projetos;
4. Abrir um projeto;
5. Ler diligência;
6. Abrir Build Round;
7. Alocar VIBE;
8. Receber Project Tokens ou NFT;
9. Assistir a Agent Run;
10. Abrir Proof of Build;
11. Voltar ao portfólio;
12. Receber atualização da Gemma.

## Founder Demo Path

Implementar um caminho guiado:

1. Trocar para Founder Mode;
2. Abrir projeto;
3. Editar ou criar Build Round;
4. Solicitar revisão da Gemma;
5. Abrir Agent Workspace;
6. Assistir à execução;
7. Abrir Proof of Build;
8. Gerar atualização para stakeholders;
9. Aprovar atualização;
10. Visualizar resultado como investidor.

## Tarefas

- [ ] Criar dados definitivos da demo;
- [ ] Remover placeholders visuais;
- [ ] Criar empty states;
- [ ] Criar loading states;
- [ ] Criar error states;
- [ ] Criar confirmações;
- [ ] Criar tooltips essenciais;
- [ ] Criar indicação de dados simulados;
- [ ] Criar botão de reset;
- [ ] Criar botão ou link “Start Demo”;
- [ ] Criar tour opcional;
- [ ] Garantir que nenhum fluxo fique bloqueado.

## Critérios de aceite

- [ ] Investor Path funciona sem explicação externa;
- [ ] Founder Path funciona sem explicação externa;
- [ ] O jurado entende o papel da Gemma;
- [ ] O jurado entende o Proof of Build;
- [ ] O jurado entende como investidores recebem retorno;
- [ ] O jurado entende sardinhas, Computers People e tubarões;
- [ ] O jurado entende onde AMD e Fireworks entram;
- [ ] A jornada completa pode ser concluída rapidamente;
- [ ] O reset restaura o estado original.

---

# Sprint 8 — Polish, Validation and Delivery

## Objetivo

Garantir uma entrega reproduzível, estável e apresentável.

## Qualidade visual

- [ ] Revisar hierarquia;
- [ ] Revisar espaçamento;
- [ ] Revisar tipografia;
- [ ] Revisar contraste;
- [ ] Revisar ícones;
- [ ] Revisar animações;
- [ ] Remover elementos desnecessários;
- [ ] Garantir consistência;
- [ ] Evitar estética de cassino;
- [ ] Evitar excesso de informação.

## Responsividade

Testar:

- [ ] Desktop largo;
- [ ] Laptop;
- [ ] Tablet;
- [ ] Mobile;
- [ ] Painel da Gemma;
- [ ] Tabelas;
- [ ] Modais;
- [ ] Timeline;
- [ ] Portfolio.

## Segurança

- [ ] Verificar secrets;
- [ ] Verificar `.env`;
- [ ] Verificar logs;
- [ ] Verificar payloads públicos;
- [ ] Verificar sanitização;
- [ ] Verificar endpoints internos;
- [ ] Verificar execução de shell;
- [ ] Verificar artifacts privados.

## Container

- [ ] Apagar imagens locais anteriores;
- [ ] Executar build limpo;
- [ ] Iniciar via Docker Compose;
- [ ] Testar seed automático;
- [ ] Testar healthcheck;
- [ ] Testar persistência;
- [ ] Testar reset;
- [ ] Testar sem credenciais;
- [ ] Testar com credenciais;
- [ ] Confirmar porta 3000.

## Validação

- [ ] `npm run lint`;
- [ ] `npm run typecheck`;
- [ ] `npm run test`;
- [ ] `npm run build`;
- [ ] Testes de endpoints;
- [ ] Teste Investor Path;
- [ ] Teste Founder Path;
- [ ] Teste Gemma fallback;
- [ ] Teste replay;
- [ ] Teste Proof hash;
- [ ] Teste de reload;
- [ ] Teste de reset.

## Documentação mínima

- [ ] Atualizar README público;
- [ ] Adicionar setup;
- [ ] Adicionar Docker;
- [ ] Adicionar variáveis;
- [ ] Explicar Demo Mode;
- [ ] Explicar Live Mode;
- [ ] Explicar AMD;
- [ ] Explicar Fireworks;
- [ ] Explicar Gemma;
- [ ] Explicar Proof of Build;
- [ ] Adicionar limitações;
- [ ] Adicionar disclaimer.

## Critérios de aceite

- [ ] O container inicia em ambiente limpo;
- [ ] A aplicação funciona sem APIs externas;
- [ ] O Investor Path não apresenta erros;
- [ ] O Founder Path não apresenta erros;
- [ ] O Proof of Build é acessível;
- [ ] A Gemma possui fallback;
- [ ] O replay funciona;
- [ ] Não existem secrets no repositório;
- [ ] O produto está pronto para gravação e avaliação.

---

# 5. Definition of Done global

Uma funcionalidade só está concluída quando:

- Está implementada;
- Está integrada;
- Possui estado de loading;
- Possui estado de erro;
- Possui estado vazio quando necessário;
- Persiste dados quando necessário;
- Funciona após reload;
- Está minimamente responsiva;
- Não apresenta erro no console;
- Passa no typecheck;
- Passa no build;
- Não expõe dados privados;
- Está coerente com `README.md`;
- Está coerente com `ARCHITECTURE.md`;
- Está demonstrável.

---

# 6. Ordem de corte em caso de prazo

Se o tempo acabar, preservar nesta ordem:

1. Investor vertical slice;
2. Gemma;
3. Agent Replay;
4. Proof of Build;
5. Portfolio;
6. Founder vertical slice;
7. Docker;
8. Integração AMD;
9. Integração Fireworks;
10. Polish.

Cortar primeiro:

1. Autenticação;
2. Blockchain;
3. Testnet;
4. SSE;
5. Gráficos complexos;
6. Criação completa de projetos;
7. NFT gallery avançada;
8. Configurações;
9. Marketplace secundário;
10. Funcionalidades sociais.

Nunca cortar:

- Gemma da experiência;
- Retorno dos investidores;
- Agent Observability;
- Proof of Build;
- Investor Mode;
- Founder Mode;
- Demo Mode;
- Container.

---

# 7. Estado dos sprints

```text
[x] Sprint 0 — Foundation
[x] Sprint 1 — Investor Vertical Slice
[x] Sprint 2 — Gemma Core (Demo/Cached; AMD gateway ready, live optional)
[x] Sprint 3 — Agent Observability
[x] Sprint 4 — Proof of Build
[x] Sprint 5 — Founder Experience (minimal vertical slice)
[ ] Sprint 6 — Live Integrations (deferred; gateways ready)
[x] Sprint 7 — Demo Experience (core paths + reset)
[x] Sprint 8 — Polish, Validation and Delivery (demo-ready; Docker included)
```

---

# 8. Relatório esperado do coding agent

Ao finalizar cada sprint, responder com:

```text
Sprint completed:
Files created:
Files changed:
Features delivered:
Tests executed:
Build status:
Docker status:
Known limitations:
Decisions made:
Next sprint:
```

Não apresentar uma funcionalidade como concluída se ela ainda depender de implementação futura.

---

# 9. Instrução final

A prioridade não é construir a visão completa do VibeFunding.

A prioridade é provar este ciclo:

```text
Capital ou compute é alocado
              ↓
Um agente transforma o recurso em trabalho
              ↓
O trabalho é observável
              ↓
O resultado gera um Proof of Build
              ↓
O investidor acompanha e recebe exposição econômica
              ↓
A Gemma organiza todo o contexto
```

Quando esse ciclo estiver funcional, o MVP estará apto a demonstrar a tese central do produto.