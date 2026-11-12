(() => {
  const section = document.querySelector('[data-methodology]');
  if (!section) return;
  const selector = section.querySelector('.method-selector');
  const status = section.querySelector('[data-method-status]');
  function announceMethod(input) {
    const label = input.closest('label').querySelector('span').textContent;
    status.textContent = document.documentElement.lang === 'en-US'
      ? `${label} approach: four steps are shown below.`
      : `Metodologia ${label}: quatro etapas exibidas abaixo.`;
  }
  selector.addEventListener('change', (event) => {
    const input = event.target;
    if (!input.matches('input[name="methodology"]') || !input.checked) return;
    section.querySelectorAll('[data-method-content]').forEach((content) => {
      content.setAttribute('aria-hidden', String(content.dataset.methodContent !== input.value));
    });
    announceMethod(input);
  });
  document.addEventListener('portfolio:languagechange', () => {
    const selected = selector.querySelector('input[name="methodology"]:checked');
    if (selected && status.textContent) announceMethod(selected);
  });
  selector.disabled = false;
})();
