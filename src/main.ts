import "./styles.css";
import { restoreSession, onAuthStateChange } from "./auth/auth";
import { renderLogin } from "./dom/login.ts";
import { renderDashboard } from "./dom/dashboard.ts";

const app = document.getElementById("app")!;

function mount(view: HTMLElement) {
  app.innerHTML = "";
  app.appendChild(view);
}

function renderBySession(sessionPresent: boolean) {
  if (sessionPresent) {
    mount(renderDashboard());
  } else {
    mount(renderLogin());
  }
}

async function bootstrap() {
  await restoreSession();
  let hasSession = false;
  try {
    const { supabase } = await import("./services/supabase");
    const { data } = await supabase.auth.getSession();
    hasSession = !!data.session;
  } catch {
    hasSession = false;
  }
  renderBySession(hasSession);

  onAuthStateChange((session) => {
    renderBySession(!!session);
  });
}

bootstrap();
