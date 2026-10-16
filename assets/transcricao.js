document.querySelectorAll('[data-transcricao-gallery]').forEach((gallery, index) => {
  const preview = gallery.querySelector('[data-preview]');
  const caption = gallery.querySelector('.tc-caption[data-caption]');
  const opener = gallery.querySelector('[data-expand]');
  const options = Array.from(gallery.querySelectorAll('[data-image]'));
  if (!preview || !caption || !opener || !options.length) return;
  let active = 0;
  let previousFocus;
  const dialog = document.createElement('dialog');
  dialog.className = 'tc-lightbox';
  dialog.setAttribute('aria-labelledby', `tc-lightbox-title-${index}`);
  dialog.innerHTML = `<div class="tc-lightbox-bar"><strong id="tc-lightbox-title-${index}">VoxTexto · v1.2.1</strong><button type="button" data-close autofocus>Fechar ×</button></div><img data-full-image alt=""><div class="tc-lightbox-bar"><button type="button" data-previous aria-label="Imagem anterior">← Anterior</button><button type="button" data-next aria-label="Próxima imagem">Próxima →</button></div><p data-full-caption aria-live="polite"></p>`;
  document.body.append(dialog);
  const fullImage = dialog.querySelector('[data-full-image]');
  const fullCaption = dialog.querySelector('[data-full-caption]');
  function select(next) {
    active = (next + options.length) % options.length;
    const option = options[active];
    preview.src = option.dataset.image;
    preview.alt = option.dataset.caption;
    caption.textContent = option.dataset.caption;
    opener.setAttribute('aria-label', `Ampliar: ${option.dataset.caption}`);
    options.forEach((button, position) => button.setAttribute('aria-pressed', String(position === active)));
    fullImage.src = preview.src;
    fullImage.alt = preview.alt;
    fullCaption.textContent = caption.textContent;
  }
  options.forEach((option, position) => option.addEventListener('click', () => select(position)));
  opener.addEventListener('click', () => {
    previousFocus = document.activeElement;
    select(active);
    dialog.showModal();
  });
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-previous]').addEventListener('click', () => select(active - 1));
  dialog.querySelector('[data-next]').addEventListener('click', () => select(active + 1));
  dialog.addEventListener('close', () => previousFocus?.focus());
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
