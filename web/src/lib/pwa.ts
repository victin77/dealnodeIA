// Instalacao do PWA ("baixar o app no celular").
//
// O navegador dispara o evento `beforeinstallprompt` cedo — normalmente
// antes de qualquer tela montar. Este modulo registra o listener assim que
// e importado (ver main.tsx) e guarda o evento, para que um botao
// "Instalar app" possa dispara-lo depois, na hora que o usuario quiser.

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

window.addEventListener("beforeinstallprompt", (e) => {
  // Impede o mini-banner automatico; o app oferece o proprio botao.
  e.preventDefault();
  deferred = e as BeforeInstallPromptEvent;
  notify();
});

window.addEventListener("appinstalled", () => {
  deferred = null;
  notify();
});

/** Assina mudancas no estado de instalacao. Retorna a funcao de cancelamento. */
export function subscribeInstall(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** true quando o navegador ja liberou o prompt nativo de instalacao. */
export function canInstall(): boolean {
  return deferred !== null;
}

/** O app esta aberto ja instalado (modo standalone)? */
export function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/** iPhone/iPad — onde a instalacao e manual (sem prompt nativo). */
export function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** Dispara o prompt nativo de instalacao. Retorna true se o usuario aceitou. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  notify();
  return outcome === "accepted";
}
