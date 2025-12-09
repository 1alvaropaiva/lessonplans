import { login, signUp } from "../auth/auth";

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  opts: { className?: string; text?: string } = {}
) {
  const node = document.createElement(tag);
  if (opts.className) node.className = opts.className;
  if (opts.text) node.textContent = opts.text;
  return node;
}

export function renderLogin(): HTMLElement {
  const root = el("div");

  const header = el("header");
  const h1 = el("h1", { text: "Gerador de Planos de Aula" });
  header.appendChild(h1);

  const section = el("section");
  const h2 = el("h2", { text: "Acesse ou Cadastre-se" });
  const form = el("form");

  const lblEmail = el("label", { text: "Email:" });
  lblEmail.setAttribute("for", "email");
  const inputEmail = el("input") as HTMLInputElement;
  inputEmail.type = "email";
  inputEmail.id = "email";
  inputEmail.required = true;

  const lblPassword = el("label", { text: "Senha (mínimo 6 caracteres):" });
  lblPassword.setAttribute("for", "password");
  const inputPassword = el("input") as HTMLInputElement;
  inputPassword.type = "password";
  inputPassword.id = "password";
  inputPassword.minLength = 6;
  inputPassword.required = true;

  const btn = el("button", { text: "Entrar / Cadastrar" }) as HTMLButtonElement;
  btn.type = "submit";

  const pError = el("p");
  pError.id = "auth-error";
  pError.className = "error";
  const pInfo = el("p");
  pInfo.id = "confirm-message";
  pInfo.className = "info";

  form.append(
    lblEmail,
    inputEmail,
    lblPassword,
    inputPassword,
    btn,
    pError,
    pInfo
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    pError.textContent = "";
    pInfo.textContent = "";
    const email = inputEmail.value.trim();
    const password = inputPassword.value.trim();

    btn.disabled = true;
    try {
      await login(email, password);
    } catch (err: any) {
      const msg: string = err?.message || String(err);
      if (msg.includes("Invalid login credentials")) {
        try {
          const { user } = await signUp(email, password) as any;
          if (user?.identities?.length === 0) {
            pError.textContent = "Senha incorreta. Por favor, tente novamente.";
          } else {
            pInfo.textContent =
              "Conta criada! Verifique seu e-mail para confirmar antes de fazer login.";
          }
        } catch (e2: any) {
          pError.textContent = e2?.message || String(e2);
        }
      } else {
        pError.textContent = `Erro: ${msg}`;
      }
    } finally {
      btn.disabled = false;
    }
  });

  section.append(h2, form);
  root.append(header, section);
  return root;
}
