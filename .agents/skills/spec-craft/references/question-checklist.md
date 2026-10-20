# Roteiro de Discovery & Checklist de Alinhamento com o Usuário

Ao iniciar o planejamento de uma nova funcionalidade, correção ou refatoração, utilize este roteiro para identificar a real necessidade e esclarecer premissas antes de redigir o plano técnico.

---

## 0. Discovery & Enquadramento do Problema (TLC Discover)

Antes de discutir tecnologia ou escrever código, entenda o problema real:

* [ ] **Qual a natureza do problema?**
  * **Dor (Pain):** Algo que já existe e gera defeito, lentidão ou atrito para os usuários. *Pergunta-chave: Qual o impacto atual e a frequência do problema?*
  * **Ausência (Absence):** Uma funcionalidade inexistente. *Pergunta-chave: Quem precisa disso hoje e o que fazem em seu lugar (o substituto atual: planilha, processo manual, suporte)?*
  * **Construção (Construction):** Um bloco fundacional de infraestrutura ou roadmap. *Pergunta-chave: Por que construir agora e quais entregas dependem deste bloco?*
* [ ] **Qual a menor solução viável (Smallest Shape)?**
  * Podemos resolver com uma Server Action simples em um módulo existente em vez de criar um domínio novo?
  * Podemos reaproveitar tabelas e componentes existentes de `@/shared/components`?
* [ ] **Veredito:** Vale a pena construir agora? O escopo está claro e o impacto justificado?

---

## 1. Escopo de Negócio & Autorização

* [ ] **Autenticação & Papéis:** A funcionalidade é pública, restrita a usuários logados ou restrita a funções específicas (admin, owner, member)?
* [ ] **Propriedade dos Dados:** O recurso pertence a um usuário individual (`userId`) ou a uma organização/workspace (`tenantId` / `organizationId`)?
* [ ] **Ciclo de Vida do Recurso:** Quando o usuário ou a entidade pai for deletada, o que deve acontecer (`ON DELETE CASCADE`, arquivamento suave / soft delete)?
* [ ] **Limites & Regras de Uso:** Existe cota numérica, rate limit ou regras de concorrência a aplicar?

---

## 2. UX, Design System & Estados de Interface

* [ ] **Localização na Interface:** Onde a funcionalidade reside (nova rota em `src/app/`, aba em layout existente, modal/dialog)?
* [ ] **Estados de Interface:**
  * *Loading State:* Como a página/componente exibe o carregamento (esqueleto `Skeleton` ou indicador sutil)?
  * *Empty State:* Como a interface orienta o usuário quando não há registros cadastrados?
  * *Feedback Visual:* Confirmações de sucesso e mensagens de erro utilizam Toast e validações contextuais?
* [ ] **Ações Destrutivas:** Exclusões ou mutações irreversíveis solicitam confirmação prévia em Dialog?

---

## 3. Dados, Persistência & Schemas

* [ ] **Modelagem no PostgreSQL:** A alteração requer nova tabela ou novas colunas em `src/db/schema/<dominio>.ts`?
* [ ] **Migração:** Será gerada migration via `pnpm db:generate` e aplicada via `pnpm db:migrate`?
* [ ] **Índices & Performance:** Existem chaves estrangeiras ou colunas frequentemente consultadas que exigem índices dedicados?

---

## 4. Casos de Borda & Cenários de Falha

* [ ] **Concorrência & Duplicidade:** O que acontece se o usuário clicar duas vezes no botão de submissão (idempotência, restrição de unicidade no banco)?
* [ ] **Validação Zod:** Quais são os limites de tamanho (min/max), formatos permitidos e campos opcionais?
* [ ] **Resiliência a Falhas:** Como o sistema se comporta caso uma chamada externa ou conexão de banco oscile durante o processamento?
