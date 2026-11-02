(() => {
  const section = document.querySelector('[data-projects]');
  if (!section) return;
  const selector = section.querySelector('.project-filters');
  const inputs = [...selector.querySelectorAll('input[name="project-filter"]')];
  const cards = [...section.querySelectorAll('[data-project-card]')];
  const status = section.querySelector('[data-project-status]');
  const historyKey = 'portfolioProjectFilter';
  const rememberedFilter = () => inputs.find((input) => input.value === window.history.state?.[historyKey]);

  function select(input, announce = true) {
    input.checked = true;
    let count = 0;
    cards.forEach((card) => {
      const visible = input.value === 'all'
        || (input.value === 'featured' && card.dataset.featured === 'true')
        || input.value === card.dataset.category;
      if (!visible) card.querySelectorAll('video').forEach((video) => video.pause());
      card.hidden = !visible;
      if (visible) count += 1;
    });
    if (announce) {
      const label = input.closest('label').querySelector('span').textContent;
      status.textContent = `${count} ${count === 1 ? 'projeto exibido' : 'projetos exibidos'}: ${label}.`;
    }
  }

  selector.addEventListener('change', (event) => {
    if (inputs.includes(event.target) && event.target.checked) {
      window.history.replaceState({ ...window.history.state, [historyKey]: event.target.value }, '');
      select(event.target);
    }
  });

  // Mantém links externos antigos úteis, sem duplicar os cards ou mover o foco.
  function followHash() {
    const saved = rememberedFilter();
    if (saved) { select(saved, false); return; }
    let id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
    const category = { aplicativos: 'app', dashboards: 'bi' }[id];
    if (category) {
      select(inputs.find((input) => input.value === category));
      return;
    }
    const target = id && document.getElementById(id);
    const card = target && target.closest('[data-project-card]');
    if (card?.hidden) {
      select(inputs.find((input) => input.value === 'all'));
      target.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
  }
  selector.disabled = false;
  select(rememberedFilter() || inputs.find((input) => input.value === 'all'), false);
  followHash();
  window.addEventListener('hashchange', followHash);
  window.addEventListener('popstate', followHash);
  // O navegador restaura rádios sem disparar change ao voltar para a página.
  window.addEventListener('pageshow', () => window.requestAnimationFrame(() => {
    select(rememberedFilter() || inputs.find((input) => input.checked), false);
  }));
})();
