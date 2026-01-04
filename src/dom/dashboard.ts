import { logout, getUser } from "../auth/auth";
import { gerarPlano } from "../services/gemini";
import { buscarPlano, criarPlano, excluirPlano, listarPlanos } from "../services/planos.service";
import type { PlanoDeAula, Rubrica } from "../types/Plano";

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: { className?: string; text?: string } = {}
) {
  const node = document.createElement(tag);
  if (opts.className) node.className = opts.className;
  if (opts.text) node.textContent = opts.text;
  return node;
}

function renderPlanoDetalhe(plano: PlanoDeAula) {
  const article = el("article", { className: "plano-detalhe" });
  const h3 = el("h3", { text: plano.tema });
  h3.className = "plano-tema";

  const h4Intro = el("h4", { text: "Introdução Lúdica" });
  const pIntro = el("p", { text: plano.introducao_ludica });
  pIntro.className = "plano-introducao";

  const h4Obj = el("h4", { text: "Objetivo (BNCC)" });
  const pObj = el("p", { text: plano.objetivo_bncc });
  pObj.className = "plano-objetivo";

  const h4Passo = el("h4", { text: "Passo a Passo" });
  const pPasso = el("p");
  pPasso.className = "plano-passo";
  pPasso.innerHTML = plano.passo_a_passo.replace(/\n/g, "<br>");

  const h4Rubrica = el("h4", { text: "Rubrica de Avaliação" });
  const ul = el("ul", { className: "plano-rubrica" });
  const liExc = el("li");
  liExc.innerHTML = `<strong>Excelente:</strong> <span class="rubrica-excelente"></span>`;
  (liExc.querySelector("span") as HTMLSpanElement).textContent = (plano.rubrica_avaliacao as Rubrica).Excelente;
  const liBom = el("li");
  liBom.innerHTML = `<strong>Bom:</strong> <span class="rubrica-bom"></span>`;
  (liBom.querySelector("span") as HTMLSpanElement).textContent = plano.rubrica_avaliacao.Bom;
  const liDev = el("li");
  liDev.innerHTML = `<strong>Em Desenvolvimento:</strong> <span class="rubrica-emdesenvolvimento"></span>`;
  (liDev.querySelector("span") as HTMLSpanElement).textContent = plano.rubrica_avaliacao["Em Desenvolvimento"];
  ul.append(liExc, liBom, liDev);

  const fecharDiv = el("div", { className: "plano-fechar" });
  const fecharBtn = el("button", { text: "Fechar", className: "fechar-btn"});
  fecharBtn.id = "fechar-plano";
  fecharBtn.addEventListener("click", () => {
    article.parentElement?.classList.add("hidden");
    article.parentElement!.innerHTML = "";
  });
  fecharDiv.appendChild(fecharBtn);

  article.append(h3, h4Intro, pIntro, h4Obj, pObj, h4Passo, pPasso, h4Rubrica, ul, fecharDiv);
  return article;
}

function buildPrompt({ tema, ano_escolar, disciplina }: { tema: string; ano_escolar: string; disciplina: string; }) {
  return `Você é um especialista em pedagogia e na BNCC. Crie um plano de aula para a disciplina "${disciplina}", destinado ao "${ano_escolar}", com o tema "${tema}". Sua resposta DEVE ser um objeto JSON, sem nenhum texto ou formatação adicional fora dele. O JSON deve ter EXATAMENTE a seguinte estrutura: {"introducao_ludica": "Uma introdução criativa e curta para o tema.", "objetivo_bncc": "Um objetivo de aprendizagem claro, incluindo o código da habilidade da BNCC (ex: EF03CI02).", "passo_a_passo": "Um roteiro detalhado da atividade em formato de texto simples. Não use asteriscos (*) e nem hashtags (#), separe os tópicos em números e pulando linhas (exemplo: 1) Inicio \n 2)Passo a passo)", "rubrica_avaliacao": {"Excelente": "Descrição para o critério 'Excelente'.", "Bom": "Descrição para o critério 'Bom'.", "Em Desenvolvimento": "Descrição para o critério 'Em Desenvolvimento'."}}`;
}

async function fetchAndRenderPlanos(container: HTMLElement, resultadoWrap: HTMLElement) {
  container.classList.add("hidden");
  const msgLoading = el("p", { text: "Carregando seus planos..." });
  msgLoading.id = "planos-msg-loading";
  msgLoading.className = "info";
  const msgError = el("p");
  msgError.id = "planos-msg-error";
  msgError.className = "error hidden";
  const msgEmpty = el("p", { text: "Você ainda não gerou nenhum plano." });
  msgEmpty.id = "planos-msg-empty";
  msgEmpty.className = "info hidden";

  const header = container.previousElementSibling;
  if (header && header.matches("h2")) {
  }
  const parent = container.parentElement!;
  parent.querySelectorAll("#planos-msg-loading, #planos-msg-error, #planos-msg-empty").forEach(n => n.remove());
  parent.insertBefore(msgLoading, container);
  parent.insertBefore(msgError, container);
  parent.insertBefore(msgEmpty, container);

  const user = await getUser();
  if (!user) return;
  const { data, error } = await listarPlanos(user.id);

  msgLoading.classList.add("hidden");
  if (error) {
    msgError.textContent = `Erro ao carregar: ${error.message}`;
    msgError.classList.remove("hidden");
    return;
  }
  if (!data || data.length === 0) {
    msgEmpty.classList.remove("hidden");
    return;
  }

  container.innerHTML = "";
  container.classList.remove("hidden");

  data.forEach((plano) => {
    const item = el("div", { className: "plano-salvo-item" });
    (item as any).dataset.id = String(plano.id);

    const header = el("div", { className: "plano-salvo-header" });
    const titulo = el("h4", { text: plano.tema });
    titulo.className = "plano-titulo link-style";
    const btnExcluir = el("button", { text: "Excluir" });
    btnExcluir.className = "btn-excluir";
    header.append(titulo, btnExcluir);

    const pInfo = el("p", { text: `${plano.disciplina} - ${plano.ano_escolar}` });
    pInfo.className = "plano-info";
    const pData = el("p");
    pData.className = "plano-data";
    const em = el("em", { text: `Criado em: ${new Date(plano.created_at!).toLocaleDateString('pt-BR')}` });
    pData.appendChild(em);

    titulo.addEventListener("click", async () => {
      const { data, error } = await buscarPlano(plano.id!);
      if (error || !data) {
        alert("Erro ao carregar plano: " + (error?.message || ""));
        return;
      }
      resultadoWrap.innerHTML = "";
      resultadoWrap.classList.remove("hidden");
      resultadoWrap.appendChild(renderPlanoDetalhe(data as any));
      window.scrollTo({ top: (resultadoWrap as any).offsetTop ?? 0, behavior: "smooth" });
    });

    btnExcluir.addEventListener("click", async () => {
      if (!confirm("Deseja realmente excluir este plano?")) return;
      const { error } = await excluirPlano(plano.id!);
      if (error) {
        alert("Erro ao excluir plano: " + error.message);
        return;
      }
      const tituloAberto = document.querySelector('.plano-tema') as HTMLElement | null;
      if (tituloAberto && tituloAberto.textContent === plano.tema) {
        resultadoWrap.classList.add('hidden');
        resultadoWrap.innerHTML = '';
      }
      await fetchAndRenderPlanos(container, resultadoWrap);
    });

    item.append(header, pInfo, pData);
    container.appendChild(item);
  });
}

export function renderDashboard(): HTMLElement {
  // @ts-ignore
  const root = el("div");

  const header = el("header");
  const h1 = el("h1", { text: "Gerador de Planos de Aula" });
  header.appendChild(h1);

  const appSection = el("section");
  appSection.id = "app-section";

  const userInfo = el("div", { className: "user-info" });
  const pUser = el("p");
  const spanEmail = el("span");
  spanEmail.id = "user-email";
  pUser.append("Seu email: ", spanEmail);
  userInfo.appendChild(pUser);

  const novoPlano = el("section");
  novoPlano.id = "novo-plano";
  const h2Novo = el("h2", { text: "Crie um Novo Plano de Aula" });
  const form = el("form");
  form.id = "plano-form";

  const lblTema = el("label", { text: "Tema da Aula:" });
  lblTema.setAttribute("for", "tema");
  const inputTema = el("input") as HTMLInputElement;
  inputTema.id = "tema"; inputTema.required = true; inputTema.placeholder = "Ex: Ciclo da Água";

  const lblAno = el("label", { text: "Ano Escolar:" });
  lblAno.setAttribute("for", "ano_escolar");
  const inputAno = el("input") as HTMLInputElement;
  inputAno.id = "ano_escolar"; inputAno.required = true; inputAno.placeholder = "Ex: 3º ano do Ensino Fundamental";

  const lblDisc = el("label", { text: "Disciplina:" });
  lblDisc.setAttribute("for", "disciplina");
  const inputDisc = el("input") as HTMLInputElement;
  inputDisc.id = "disciplina"; inputDisc.required = true; inputDisc.placeholder = "Ex: Ciências";

  const btnGerar = el("button", { text: "Gerar Plano de Aula" }) as HTMLButtonElement;
  btnGerar.id = "gerar-btn";
  btnGerar.type = "submit";

  form.append(lblTema, inputTema, lblAno, inputAno, lblDisc, inputDisc, btnGerar);

  const spinner = el("div");
  spinner.id = "spinner";
  spinner.className = "hidden";
  spinner.innerHTML = `<p>Gerando seu plano de aula... Isso pode levar um momento.</p>`;

  novoPlano.append(h2Novo, form, spinner);

  const resultado = el("section");
  resultado.id = "resultado";
  resultado.className = "hidden";
  const h2Res = el("h2", { text: "Seu Novo Plano de Aula" });
  const planoContainer = el("div");
  planoContainer.id = "plano-container";
  resultado.append(h2Res, planoContainer);

  const planosSection = el("section");
  planosSection.id = "planos-salvos";
  const h2Planos = el("h2", { text: "Meus Planos Salvos" });
  const planosContainer = el("div");
  planosContainer.id = "planos-salvos-container";
  planosContainer.className = "hidden";
  planosSection.append(h2Planos, planosContainer);

  const btnLogout = el("button", { text: "Sair" });
  btnLogout.id = "logout-button";
  btnLogout.addEventListener("click", async () => {
    await logout();
    planoContainer.innerHTML = "";
    resultado.classList.add("hidden");
  });

  appSection.append(userInfo, novoPlano, resultado, planosSection, btnLogout);

  (async () => {
    const user = await getUser();
    if (user) {
      spanEmail.textContent = user.email ?? "";
      await fetchAndRenderPlanos(planosContainer, resultado);
    }
  })();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const tema = inputTema.value.trim();
    const ano_escolar = inputAno.value.trim();
    const disciplina = inputDisc.value.trim();
    if (!tema || !ano_escolar || !disciplina) {
      alert("Preencha todos os campos.");
      return;
    }
    btnGerar.disabled = true;
    spinner.classList.remove("hidden");
    resultado.classList.add("hidden");
    planoContainer.innerHTML = "";
    try {
      const prompt = buildPrompt({ tema, ano_escolar, disciplina });
      const planoGerado = await gerarPlano(prompt);
      const user = await getUser();
      if (!user) throw new Error("Usuário não autenticado");
      const dados: PlanoDeAula = {
        user_id: user.id,
        tema,
        ano_escolar,
        disciplina,
        introducao_ludica: planoGerado.introducao_ludica,
        objetivo_bncc: planoGerado.objetivo_bncc,
        passo_a_passo: planoGerado.passo_a_passo,
        rubrica_avaliacao: planoGerado.rubrica_avaliacao as Rubrica,
      };
      const { data: inserted, error: saveError } = await criarPlano(dados);
      if (saveError) throw new Error(saveError.message);
      const { data: planoCompleto, error } = await buscarPlano(inserted!.id);
      if (error || !planoCompleto) throw new Error(error?.message || "Erro ao buscar plano salvo");
      resultado.classList.remove("hidden");
      planoContainer.innerHTML = "";
      planoContainer.appendChild(renderPlanoDetalhe(planoCompleto as any));
      await fetchAndRenderPlanos(planosContainer, resultado);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      planoContainer.innerHTML = `<p class="error">Erro: ${err?.message || String(err)}</p>`;
      resultado.classList.remove("hidden");
    } finally {
      btnGerar.disabled = false;
      spinner.classList.add("hidden");
    }
  });

  const rootWrap = el("div");
  rootWrap.append(header, appSection);
  return rootWrap;
}
