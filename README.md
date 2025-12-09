# Gerador de Planos de Aula com IA

## Descrição
Frontend em HTML + CSS + TypeScript (vanilla) com Vite. O app autentica usuários via Supabase Auth, gera planos de aula com a API Google Gemini 2.5 Flash e salva/lista os resultados em uma tabela no Supabase. Há duas telas separadas: Login/Cadastro e Dashboard (após autenticação), com visualização detalhada e exclusão dos planos gerados.

O projeto é modular (TypeScript) e utiliza `@supabase/supabase-js` e `axios` instalados via NPM. As variáveis sensíveis são injetadas pelo Vite via `import.meta.env`.

---

### Escolha do Modelo: Gemini 2.5 Flash

O modelo Gemini 2.5 Flash foi escolhido por oferecer bom equilíbrio entre qualidade e custo/latência para o caso de uso (texto curto/estruturado). A resposta é solicitada estritamente em JSON para facilitar o parse e a persistência.

---

## Principais funcionalidades
- Autenticação de usuários (login) e criação de conta (cadastro) via Supabase Auth.
- Duas telas: Login/Signup e Dashboard autenticado.
- Geração de planos de aula a partir de tema, ano/série e disciplina usando o modelo Gemini 2.5 Flash.
- Persistência dos planos de aula no Supabase (por usuário autenticado).
- Lista “Meus Planos Salvos” com estados de carregando, vazio e erro.
- Visualização detalhada de um plano salvo (introdução, objetivo BNCC, passo a passo e rubrica).
- Exclusão de um plano salvo.
- Logout.

Observação: ao criar conta, o Supabase irá enviar um e-mail de confirmação. Confirme para efetivar o login.

---

## Como clonar o repositório
Pré‑requisito:
- Git instalado

Clonando via HTTPS:
```
git clone https://github.com/1alvaropaiva/lessonplans
cd <PASTA_DO_PROJETO>
```

Se você já tem o projeto como ZIP, apenas extraia e navegue até a pasta no terminal.

---

## Como executar
Pré‑requisitos:
- Node.js 18+ (recomendado 20+)
- NPM
- Um projeto Supabase configurado (URL e chave pública anon)
- Uma API Key do Gemini

Como obter as chaves do Supabase:
- URL do projeto: Project Settings → Data API → Project URL
- Anon key: Project Settings → API Keys → `anon public`

Como obter a Gemini API Key:
- Acesse https://aistudio.google.com/
- Crie/seleciona um Project e gere uma API Key em API Keys

1) Crie o arquivo `.env` na raiz com:

```
VITE_SUPABASE_URL=<sua url do supabase>
VITE_SUPABASE_ANON_KEY=<sua anon key do supabase>
VITE_GEMINI_API_KEY=<sua api key do gemini>
```

2) Instale as dependências:
```
npm install
```

3) Execute em modo desenvolvimento:
```
npm run dev
```

4) Build de produção:
```
npm run build
```

5) Pré‑visualização do build produzido:
```
npm run preview
```

---

## Banco de dados (Supabase)
Este app usa a tabela `public.planos_de_aula`. O script SQL para criá‑la está em `supabase/planos_de_aula.sql` e inclui:
- Tabela com colunas: `id bigserial PK`, `user_id uuid FK auth.users(id)`, `tema`, `ano_escolar`, `disciplina`, `introducao_ludica`, `objetivo_bncc`, `passo_a_passo`, `rubrica_avaliacao jsonb`, `prompt_enviado text` (opcional), `created_at timestamptz default now()`.
- Índices em `user_id` e `created_at`.
- RLS habilitado e políticas para permitir que cada usuário CRUD apenas seus próprios registros.

Como aplicar:
1. Abra o Supabase Studio do seu projeto.
2. Vá em SQL Editor.
3. Copie e execute o conteúdo de `supabase/planos_de_aula.sql`.
4. Verifique a tabela/policies no schema `public`.

---

## Tecnologias utilizadas
- HTML/CSS
- TypeScript (vanilla)
- Vite
- @supabase/supabase-js
- Axios
- Google Generative Language API (Gemini)

### Funções de cada tecnologia
- HTML/CSS: estrutura e estilo da interface.
- TypeScript: lógica de autenticação, geração e persistência.
- Vite: dev server/bundler e injeção de variáveis via `import.meta.env`.
- Supabase JS: Auth e acesso ao banco (tabela `planos_de_aula`).
- Axios: cliente HTTP para a API do Gemini.
- Gemini: modelo generativo para produzir o conteúdo do plano de aula em JSON.

---

## Estrutura de pastas (resumo)
```yml
lessonplans/
  index.html
  src/
    main.ts               # Bootstrap; alterna Login/Dashboard conforme sessão
    styles.css            # Estilos globais
    auth/
      auth.ts            # Helpers de sessão/login/signup/logout
    dom/
      login.ts           # Renderiza tela de Login/Signup
      dashboard.ts       # Renderiza Dashboard (form + lista + detalhe + excluir + sair)
    services/
      supabase.ts        # Cliente Supabase único
      gemini.ts          # Chamada à API do Gemini e parse do JSON
      planos.service.ts  # CRUD de planos no Supabase
    types/
      Plano.ts           # Tipos: Rubrica e PlanoDeAula
  supabase/
    planos_de_aula.sql   # Script de criação de tabela, índices e RLS
  .env
  package.json
  tsconfig.json
  README.md
```

### Fluxo principal da aplicação
- `main.ts` restaura a sessão e escuta `onAuthStateChange` para alternar entre `login.ts` e `dashboard.ts`.
- Em `dashboard.ts`, o formulário cria o prompt, chama `services/gemini.ts`, faz o parse do JSON e salva via `services/planos.service.ts` (que usa `services/supabase.ts`).
- Os planos são listados filtrando por `user_id`; é possível abrir o detalhe e excluir.

---

## Principais abordagens
- Variáveis de ambiente via Vite (não expor chaves em código).
- Integração direta com Supabase Auth + RLS por `user_id`.
- Prompt do Gemini com instrução para responder ESTRITAMENTE em JSON; limpeza de cercas de código (```json ... ```).
- UI reativa a eventos de autenticação para alternar telas.
- Estados de UX: carregando, vazio e erro na listagem.

---

## Dicas e resolução de problemas
- Verifique se o `.env` aponta para o MESMO projeto Supabase onde você aplicou o SQL.
- Confirme que as policies RLS estão ativas para o role `authenticated`.
- Veja o console do navegador para mensagens de erro do Supabase ou da API do Gemini.

---

## Possíveis melhorias
- Persistir também o `prompt_enviado` (campo já existe no SQL) e tipar no modelo.
- Paginação na listagem.
- Tratamento adicional para respostas inválidas do Gemini.