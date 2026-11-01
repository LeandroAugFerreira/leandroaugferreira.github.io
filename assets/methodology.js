(() => {
  const section = document.querySelector('[data-methodology]');
  if (!section) return;
  const selector = section.querySelector('.method-selector');
  const status = section.querySelector('[data-method-status]');
  selector.addEventListener('change', (event) => {
    const input = event.target;
    if (!input.matches('input[name="methodology"]') || !input.checked) return;
    section.querySelectorAll('[data-method-content]').forEach((content) => {
      content.setAttribute('aria-hidden', String(content.dataset.methodContent !== input.value));
    });
    const label = input.closest('label').querySelector('span').textContent;
    status.textContent = `Metodologia ${label}: quatro etapas exibidas abaixo.`;
  });
  selector.disabled = false;
})();
