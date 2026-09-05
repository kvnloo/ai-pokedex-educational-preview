import './pwa.css';

const installedQueries = [matchMedia('(display-mode: fullscreen)'), matchMedia('(display-mode: standalone)')];
const privateRelease = import.meta.env.PROD && import.meta.env.MODE === 'private-local';
const tipKey = 'pokedex-display-hint-v1';

function element<T extends Element>(selector: string, type: { new(): T }): T {
  const result = document.querySelector(selector);
  if (!(result instanceof type)) throw new Error(`Missing Pokédex control: ${selector}`);
  return result;
}

const dialog = element('#display-options', HTMLDialogElement);
element('#display-aperture', HTMLElement).append(dialog);
const tip = element('#app-mode-tip', HTMLButtonElement);
const installButton = element('#install-pokedex', HTMLButtonElement);
const fullscreenButton = element('#fullscreen-pokedex', HTMLButtonElement);
const modeLabel = element('#display-mode', HTMLElement);
const feedback = element('#display-feedback', HTMLElement);
let promptInstall: (() => Promise<unknown>) | undefined;
let hintSeen = false;
try { hintSeen = localStorage.getItem(tipKey) === 'seen'; } catch { /* Storage can be disabled. */ }

function installed(): boolean {
  return installedQueries.some(query => query.matches) || ('standalone' in navigator && navigator.standalone === true);
}

function syncDisplay(): void {
  const mode = document.fullscreenElement || installedQueries[0]?.matches ? 'fullscreen' : installed() ? 'standalone' : 'browser';
  document.documentElement.dataset.displayMode = mode;
  modeLabel.textContent = mode === 'browser' ? 'Browser tab' : mode === 'fullscreen' ? 'Fullscreen' : 'Installed app';
  tip.hidden = mode !== 'browser' || hintSeen;
  installButton.hidden = installed() || !promptInstall;
  fullscreenButton.hidden = mode !== 'browser' || !document.fullscreenEnabled;
}

export function showDisplayOptions(): void {
  hintSeen = true;
  try { localStorage.setItem(tipKey, 'seen'); } catch { /* The dialog still works without storage. */ }
  feedback.textContent = privateRelease ? '' : 'Installation is available from the private release link.';
  syncDisplay();
  if (!dialog.open) dialog.show();
}

export function setupPokedexApp(): void {
  installedQueries.forEach(query => query.addEventListener('change', syncDisplay));
  document.addEventListener('fullscreenchange', syncDisplay);
  tip.addEventListener('click', showDisplayOptions);
  element('#close-display-options', HTMLButtonElement).addEventListener('click', () => dialog.close());
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dialog.open) {
      event.preventDefault();
      dialog.close();
    }
  });
  dialog.addEventListener('close', () => {
    // The one-time hint is now hidden; restore focus to a reachable control.
    if (document.activeElement === document.body || document.activeElement === tip) {
      element('#audio-toggle', HTMLButtonElement).focus();
    }
  });
  window.addEventListener('beforeinstallprompt', event => {
    if (!privateRelease || !('prompt' in event) || typeof event.prompt !== 'function') return;
    event.preventDefault();
    const prompt = event.prompt.bind(event);
    promptInstall = async () => { await prompt(); return 'userChoice' in event ? await event.userChoice : undefined; };
    syncDisplay();
  });
  installButton.addEventListener('click', async () => {
    const prompt = promptInstall;
    if (!prompt) return;
    promptInstall = undefined;
    syncDisplay();
    try {
      const choice: unknown = await prompt();
      feedback.textContent = typeof choice === 'object' && choice !== null && 'outcome' in choice && choice.outcome === 'accepted'
        ? 'Open Pokédex from your home screen after installation.'
        : 'You can install later from your browser menu.';
    } catch { feedback.textContent = 'Use your browser menu to install Pokédex.'; }
  });
  window.addEventListener('appinstalled', () => {
    promptInstall = undefined;
    hintSeen = true;
    feedback.textContent = 'Installed. Open Pokédex from your home screen.';
    syncDisplay();
  });
  fullscreenButton.addEventListener('click', async () => {
    try {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      dialog.close();
    } catch { feedback.textContent = 'Fullscreen was unavailable. Install Pokédex or keep using this tab.'; }
  });
  syncDisplay();
  // Keep this visit's hint visible, but do not nag on subsequent visits.
  if (!tip.hidden) {
    try { localStorage.setItem(tipKey, 'seen'); } catch { /* In-memory state lasts for this visit. */ }
  }
  if (privateRelease && isSecureContext && 'serviceWorker' in navigator) {
    const base = new URL(import.meta.env.BASE_URL, location.origin);
    void navigator.serviceWorker.register(new URL('pokedex-sw-v1.js', base), {
      scope: base.pathname, updateViaCache: 'none',
    }).catch(() => {
      element('#offline-status', HTMLElement).textContent = 'Offline setup unavailable. You can still use Pokédex while connected.';
    });
    void navigator.serviceWorker.ready.then(() => {
      element('#offline-status', HTMLElement).textContent = 'The reviewed device shell and Field OS are available offline. The opening animation needs a connection.';
    });
  }
}
