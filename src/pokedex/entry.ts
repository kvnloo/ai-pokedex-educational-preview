import './entry.css';

/** The authored device is an entrance to this DOM OS, never a second application. */
export function setupDeviceEntry(): void {
  const stage = document.querySelector('#opening-stage');
  const field = document.querySelector('#field-os');
  const viewport = document.querySelector('#opening-viewport');
  const open = document.querySelector('#open-pokedex');
  const skip = document.querySelector('#skip-opening');
  const status = document.querySelector('#opening-status');
  if (!(stage instanceof HTMLElement) || !(field instanceof HTMLElement) || !(viewport instanceof HTMLElement)
    || !(open instanceof HTMLButtonElement) || !(skip instanceof HTMLButtonElement) || !(status instanceof HTMLElement)) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !navigator.onLine) return;

  let finished = false;
  let scene: { open(): void; dispose(): void } | undefined;
  const controller = new AbortController();
  const enterOs = () => {
    if (finished) return;
    finished = true; clearTimeout(deadline); controller.abort(); scene?.dispose();
    stage.hidden = true; field.hidden = false; field.inert = false;
    document.querySelector<HTMLElement>('#app')?.focus({ preventScroll: true });
  };
  const deadline = window.setTimeout(enterOs, 15000);
  const start = () => { if (!open.disabled && !finished) scene?.open(); };
  skip.addEventListener('click', enterOs);
  open.addEventListener('click', start);
  viewport.addEventListener('click', start);
  field.hidden = true; field.inert = true; stage.hidden = false;
  stage.dataset.phase = 'loading';
  void import('./entryScene').then(async ({ createEntryScene }) => {
    if (finished) return;
    const next = await createEntryScene(viewport, controller.signal, phase => {
      if (finished) return;
      stage.dataset.phase = phase;
      status.textContent = phase === 'closed' ? 'Your field unit is ready to open.' : phase === 'opening' ? 'Opening Pokédex…' : phase === 'booting' ? 'Starting Field OS…' : 'Field OS ready';
      open.disabled = phase !== 'closed';
      if (phase === 'ready') enterOs();
    });
    if (finished) next.dispose();
    else { scene = next; open.disabled = false; clearTimeout(deadline); }
  }).catch(() => { if (!finished) enterOs(); });
  window.addEventListener('pagehide', enterOs, { once: true });
}
