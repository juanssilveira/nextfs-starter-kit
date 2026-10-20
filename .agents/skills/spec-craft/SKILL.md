---
name: spec-craft
description: 'Engenharia e planejamento de features orientada a especificações (Spec-Lean): Discovery, Plan, Checks congelados com provas observáveis, Build focado, Verificação independente e Arquivamento Zero-Acúmulo. Use quando o usuário solicitar planejar uma funcionalidade, criar uma spec/RFC, modelar um novo módulo/feature, tirar dúvidas de escopo ou desenhar a arquitetura antes da codificação. Triggers: "spec-craft", "spec-lean", "blueprint", "planejamento", "discover", "plan feature", "entre em modo de planejamento".'
---

# Spec-Craft: Planejamento & Engenharia de Features (Modelo Spec-Lean)

O fluxo de desenvolvimento adota a metodologia **Spec-Lean**: carregamos contexto sob demanda (*Progressive Disclosure*), congelamos obrigações determinísticas antes do código, focamos nas decisões irreversíveis (*one-way doors*) e arquivamos a spec assim que verificada (*Zero-Acúmulo*).

```text
┌──────────┐     ┌──────┐     ┌────────┐     ┌───────┐     ┌──────────────────┐
│ DISCOVER │ ──→ │ PLAN │ ──→ │ CHECKS │ ──→ │ BUILD │ ──→ │ VERIFY & ARCHIVE │
└──────────┘     └──────┘     └────────┘     └───────┘     └──────────────────┘
  (se crua)      desenho     obrigações      código       suíte verde + spec
                 aprovado    congeladas      focado       movida p/ arquivo
```

---

## Regra de Ouro

> [!IMPORTANT]
> **Nunca assuma premissas de negócio, modelo de dados ou escopo na dúvida.**
> Faça perguntas curtas e estruturadas antes de consolidar o plano. O código só deve ser iniciado após o desenvolvedor humano aprovar o `plan.md` e os `checks.md`.

---

## O Ciclo em 5 Fases

### Fase 1: Reconhecimento Enxuto & Condicional (Progressive Disclosure)
Evite ler toda a pasta `.docs/` de forma cega. Carregue contexto estritamente necessário em **2 passos**:

1. **Boot Fixo Obrigatório:**
   * Leia [`.specs/STATE.md`](../../../.specs/STATE.md) para consultar o histórico de decisões e obter o **Próximo `<NNN>` Disponível**.
   * Leia [`.specs/LESSONS.md`](../../../.specs/LESSONS.md) para evitar armadilhas de runtime já mapeadas no projeto.
   * Leia o `README.md` e o `index.ts` apenas do(s) módulo(s) afetado(s) em `src/modules/<modulo>/`.
2. **Carregamento Condicional por Escopo da Demanda:**
   * **Toca em UI, Componentes ou Estilos?** → Leia [`.docs/04-SHARED.md`](../../../.docs/04-SHARED.md) e componentes de `@/shared/components`.
   * **Toca em Banco de Dados, Schemas ou Migrações?** → Leia [`.docs/03-DATABASE.md`](../../../.docs/03-DATABASE.md) e o schema específico em `src/db/schema/<dominio>.ts`.
   * **Cria novo módulo, altera rotas (`src/app`) ou regras de negócio?** → Leia [`.docs/01-ARCHITECTURE.md`](../../../.docs/01-ARCHITECTURE.md) e [`.docs/02-MODULES.md`](../../../.docs/02-MODULES.md).

---

### Fase 2: Discovery & Alinhamento (TLC Discover)
*Use quando a demanda ainda for uma ideia abstrata ou necessitar de alinhamento de escopo.*

1. **Enquadre a Natureza do Problema:**
   * **Dor (Pain):** Algo que já existe e gera defeito, atrito ou lentidão.
   * **Ausência (Absence):** Recurso inexistente. Identifique quem precisa dele e **o que fazem hoje em seu lugar (o substituto atual)**.
   * **Construção (Construction):** Bloco fundacional do roadmap. Justifique a sequência e dependências.
2. **Diretrizes para a Entrevista:**
   * Apresente batches curtos: 2 a 4 perguntas diretas com opções estruturadas e recomendação técnica clara.
   * Consulte o roteiro completo em [`references/question-checklist.md`](./references/question-checklist.md).
3. **Veredito:** Valide se a funcionalidade deve ser construída e qual o menor formato viável (*smallest shape*).

---

### Fase 3: PLAN — Plano de Arquitetura (`plan.md`)
1. Crie a pasta da spec e gere o plano em `.specs/features/<NNN-slug-da-feature>/plan.md` seguindo [`references/plan-template.md`](./references/plan-template.md).
2. Em [`.specs/STATE.md`](../../../.specs/STATE.md), incremente o **Próximo `<NNN>` Disponível** e adicione a feature na tabela **Features em Andamento (WIP)** com status `Em Revisão`.
3. O plano deve cobrir de forma concisa: **Problema**, **Flow** (1 linha por salto da rota crítica), **Impact** (termos, migrações, revalidação de cache), **Relations** (schemas Drizzle com índices e chaves estrangeiras), **Surface** (Public API `index.ts`, Server Actions/Services com validação Zod, Thin Routing e componentes UI), **Landing (One-Way Doors)** e **Critérios de Aceite**.

> ✋ **Ponto de Parada:** O desenvolvedor humano deve ler e aprovar o `plan.md` antes de avançar para a fase de codificação.

---

### Fase 4: CHECKS — Contrato Congelado de Provas (`checks.md`)
Derive as obrigações a partir do plano aprovado em `.specs/features/<NNN-slug-da-feature>/checks.md` seguindo [`references/checks-template.md`](./references/checks-template.md):

1. Cada check deve ser **uma afirmação observável com valor concreto** vinculada a uma **prova executável** (teste unitário/integração ou validação estática de tipagem e lint com código de saída 0):
   ```markdown
   | ID | Claim Observável | Prova Executável (Comando / Verificação) |
   | CHK-01 | Schema Zod rejeita payload com e-mail inválido | `pnpm lint` / teste unitário |
   | CHK-02 | Operação não autorizada lança erro de autenticação | `pnpm build` / teste de service |
   ```
2. **Escopo Congelado:** Uma vez aprovados os checks, o escopo não pode ser alterado durante a codificação.

---

### Fase 5: BUILD, VERIFY & HUMAN HANDOFF
1. **BUILD (Implementação Direta):**
   * Codifique a feature atendendo estritamente aos checks aprovados.
   * Respeite as regras invioláveis de [`AGENTS.md`](../../../AGENTS.md) (Public API estrita em módulos, imports `@/`, schemas modulares, thin routing).
2. **VERIFY (Verificação Independente):**
   * Execute a suíte de validação estática e testes do projeto:
     ```bash
     pnpm lint && pnpm build
     ```
   * Gere o relatório em `.specs/features/<NNN-slug-da-feature>/verification.md` seguindo [`references/verification-template.md`](./references/verification-template.md), apontando as evidências `file:line` de cada check e o veredito `PASS`.
3. **HUMAN HANDOFF (Ponto de Parada Obrigatório):**
   * > ✋ **PROIBIDO COMMITAR OU ARQUIVAR ANTES DO OK MANUAL:** O agente **NUNCA deve commitar nem arquivar a spec** automaticamente ao terminar o build.
   * Apresente um resumo claro do que foi implementado e do `verification.md`, pare a execução e aguarde a validação manual e testes do usuário.
4. **AJUSTES, COMMIT & ZERO-ACÚMULO NO GIT (Após Aprovação Manual Explícita):**
   * Realize eventuais ajustes finos solicitados pelo usuário durante o teste manual.
   * **Somente após a aprovação manual explícita do usuário:**
     1. **Sincronia Documental:** Atualize o `README.md` do módulo afetado e os guias em `.docs/` se houve alteração de contrato ou schema.
     2. **Commit da Feature com a Spec:** Execute o commit da implementação incluindo a pasta da spec `.specs/features/<NNN-slug-da-feature>/`. Isso congela e preserva a spec eternamente no histórico do Git associada à entrega.
     3. **Limpeza Zero-Acúmulo da Árvore Ativa:** Remova a pasta `.specs/features/<NNN-slug-da-feature>/` da árvore de arquivos (`git rm -r`), registre o hash do commit na tabela de Histórico em [`.specs/STATE.md`](../../../.specs/STATE.md) e realize o commit de limpeza. Assim, nenhuma spec concluída permanece em disco para poluir o contexto de futuros agentes.

---

## Recursos e Referências da Skill

* [Template de Plano (`plan.md`)](references/plan-template.md)
* [Template de Checks (`checks.md`)](references/checks-template.md)
* [Template de Verificação (`verification.md`)](references/verification-template.md)
* [Roteiro de Discovery & Perguntas](references/question-checklist.md)
