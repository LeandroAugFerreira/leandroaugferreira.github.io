/* Galerias independentes: os controles do NexoLog e da transcrição são preservados. */
document.querySelectorAll('[data-atelie-gallery]').forEach((gallery, index) => {
  const preview = gallery.querySelector('[data-preview]');
  const caption = gallery.querySelector('.atelie-caption[data-caption]');
  const options = Array.from(gallery.querySelectorAll('[data-image]'));
  const opener = gallery.querySelector('[data-expand]');
  if (!preview || !caption || !opener || !options.length) return;
  let active = 0;
  let previousFocus;
  const dialog = document.createElement('dialog');
  dialog.className = 'atelie-lightbox';
  dialog.setAttribute('aria-labelledby', `atelie-lightbox-title-${index}`);
  dialog.innerHTML = `<div class="atelie-lightbox-toolbar"><strong id="atelie-lightbox-title-${index}">Tela do Ateliê Verde</strong><button type="button" data-close autofocus>Fechar ×</button></div><img data-full-image alt=""><div class="atelie-lightbox-toolbar"><button type="button" data-previous aria-label="Imagem anterior">← Anterior</button><button type="button" data-next aria-label="Próxima imagem">Próxima →</button></div><p class="atelie-lightbox-caption" data-full-caption aria-live="polite"></p>`;
  document.body.append(dialog);
  const fullImage = dialog.querySelector('[data-full-image]');
  const fullCaption = dialog.querySelector('[data-full-caption]');
  if (options.length === 1) {
    dialog.querySelector('[data-previous]').hidden = true;
    dialog.querySelector('[data-next]').hidden = true;
  }
  function select(next) {
    active = (next + options.length) % options.length;
    const option = options[active];
    const text = option.dataset.caption || option.textContent.trim();
    preview.src = option.dataset.image;
    preview.alt = option.dataset.alt || text;
    caption.textContent = text;
    opener.setAttribute('aria-label', `Ampliar: ${text}`);
    options.forEach((button, position) => button.setAttribute('aria-pressed', String(position === active)));
    fullImage.src = preview.src;
    fullImage.alt = preview.alt;
    fullCaption.textContent = text;
  }
  options.forEach((option, position) => option.addEventListener('click', () => select(position)));
  opener.addEventListener('click', () => {
    previousFocus = document.activeElement;
    select(active);
    dialog.showModal();
  });
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => previousFocus?.focus());
  dialog.querySelector('[data-previous]').addEventListener('click', () => select(active - 1));
  dialog.querySelector('[data-next]').addEventListener('click', () => select(active + 1));
  dialog.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      select(active + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  dialog.addEventListener('click', (event) => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
  select(0);
});

document.querySelectorAll('[data-atelie-player]').forEach((player) => {
  const video = player.querySelector('video');
  const language = player.querySelector('[data-caption-language]');
  const toggle = player.querySelector('[data-video-toggle]');
  function updateCaptions() {
    Array.from(video.textTracks).forEach(track => { track.mode = 'disabled'; });
    const chosen = Array.from(video.textTracks).find(track => track.language === language.value);
    if (chosen) chosen.mode = 'showing';
  }
  function updatePlayback() {
    toggle.textContent = video.paused ? '▶ Reproduzir' : 'Ⅱ Pausar';
    toggle.setAttribute('aria-label', video.paused ? 'Reproduzir apresentação do Ateliê Verde' : 'Pausar apresentação do Ateliê Verde');
  }
  language.addEventListener('change', updateCaptions);
  video.addEventListener('loadedmetadata', updateCaptions);
  toggle.addEventListener('click', () => {
    if (video.paused) video.play().catch(updatePlayback);
    else video.pause();
  });
  video.addEventListener('play', updatePlayback);
  video.addEventListener('pause', updatePlayback);
  video.addEventListener('ended', updatePlayback);
  updateCaptions();
});
