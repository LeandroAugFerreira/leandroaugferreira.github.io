/* DOM integration only. Does not replace real-browser layout/keyboard/AT QA.
   node tools/check_interactions.cjs <path-to-an-existing-jsdom-installation> */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require(process.argv[2] || 'jsdom');
const root = path.resolve(__dirname, '..');
const markup = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const errors = [];
const results = { project_filters: {}, cards: 9, players: 9 };

function create(url = 'https://leandroaugferreira.github.io/') {
  const console = new VirtualConsole();
  console.on('jsdomError', (error) => errors.push(error.message));
  const dom = new JSDOM(markup, { url, runScripts: 'outside-only', virtualConsole: console, pretendToBeVisual: true });
  const w = dom.window;
  const states = new WeakMap();
  function state(video) {
    if (!states.has(video)) {
      const tracks = [
        { language: 'pt-BR', mode: 'disabled', activeCues: [{ text: 'Legenda de teste' }] },
        { language: 'en', mode: 'disabled', activeCues: [{ text: 'Test caption' }] },
      ];
      tracks.addEventListener = () => {};
      states.set(video, { paused: true, time: 0, tracks, fail: false });
    }
    return states.get(video);
  }
  Object.defineProperties(w.HTMLMediaElement.prototype, {
    paused: { get() { return state(this).paused; } },
    duration: { get() { return 21; } },
    currentTime: { get() { return state(this).time; }, set(value) { state(this).time = value; } },
    textTracks: { get() { return state(this).tracks; } },
  });
  w.HTMLMediaElement.prototype.play = function () {
    if (state(this).fail) return Promise.reject(Object.assign(new Error('Unavailable'), { name: 'NotSupportedError' }));
    state(this).paused = false;
    this.dispatchEvent(new w.Event('play'));
    return Promise.resolve();
  };
  w.HTMLMediaElement.prototype.pause = function () { state(this).paused = true; this.dispatchEvent(new w.Event('pause')); };
  w.HTMLElement.prototype.scrollIntoView = function () { results.anchor_scrolls = (results.anchor_scrolls || 0) + 1; };
  w.fetch = async (url) => ({ ok: true, json: async () => JSON.parse(fs.readFileSync(path.join(root, url.split('?')[0]), 'utf8')) });
  const style = w.document.createElement('style');
  style.textContent = ['project-standard.css', 'methodology.css', 'project-filters.css'].map((name) => fs.readFileSync(path.join(root, 'assets', name), 'utf8')).join('\n');
  w.document.head.append(style);
  function evaluate(name) { w.eval(fs.readFileSync(path.join(root, 'assets', name), 'utf8')); }
  evaluate('video-player.js');
  evaluate('methodology.js');
  evaluate('project-filters.js');
  return { w, state, close: () => w.close() };
}

async function main() {
  const fallback = new JSDOM(markup);
  assert.equal(fallback.window.document.querySelector('.project-filters').disabled, true);
  assert.equal(fallback.window.document.querySelectorAll('[data-project-card]:not([hidden])').length, 9);
  fallback.window.close();
  results.no_javascript_fallback = true;

  const ctx = create();
  const { w, state } = ctx;
  const d = w.document;
  const cards = [...d.querySelectorAll('[data-project-card]')];
  const players = [...d.querySelectorAll('[data-teaser-player]')];
  const visible = () => cards.filter((card) => !card.hidden).map((card) => card.id);
  const radio = (value) => d.querySelector(`input[name="project-filter"][value="${value}"]`);
  const resources = () => [...d.querySelectorAll('[data-project-card] [href], [data-project-card] [src], [data-project-card] [poster]')].map((e) => [e.tagName, e.getAttribute('href'), e.getAttribute('src'), e.getAttribute('poster')]);
  const originalResources = resources();
  const originalUrl = w.location.href;
  const orders = {
    all: ['chronos', 'transcricao', 'nexolog', 'churn', 'atelie-verde', 'nexofiscal', 'financeiro', 'transporte', 'venda'],
    featured: ['chronos', 'churn'],
    app: ['chronos', 'transcricao', 'nexolog', 'atelie-verde', 'nexofiscal'],
    bi: ['churn', 'financeiro', 'transporte', 'venda'],
  };
  assert.equal(cards.length, 9);
  assert.equal(players.length, 9);
  assert.deepEqual(visible(), orders.all);
  assert.equal(d.querySelector('.project-filters').disabled, false);
  const firstVideo = d.querySelector('#chronos video');
  await firstVideo.play();
  firstVideo.currentTime = 7;
  for (const name of ['bi', 'all', 'featured', 'app', 'bi', 'featured', 'all']) {
    const input = radio(name);
    input.focus(); input.click();
    assert.deepEqual(visible(), orders[name]);
    assert.equal(d.activeElement, input, 'filter must not move focus');
    assert.equal(d.querySelectorAll('[data-project-card]').length, 9);
    assert.ok(cards.every((card, index) => d.querySelectorAll('[data-project-card]')[index] === card), 'cards must be preserved, never cloned/recreated');
    assert.ok(cards.filter((card) => card.hidden).every((card) => w.getComputedStyle(card).display === 'none'));
    assert.match(d.querySelector('[data-project-status]').textContent, /projetos exibidos/);
    assert.deepEqual(resources(), originalResources);
    assert.equal(w.location.href, originalUrl, 'filter must not navigate');
    results.project_filters[name] = visible().length;
  }
  assert.equal(firstVideo.paused, true);
  assert.equal(firstVideo.currentTime, 7, 'filter must preserve playback position');
  results.hidden_video_paused = true;
  results.resources_and_dom_preserved = true;
  results.focus_preserved = true;

  radio('bi').click();
  const method = d.querySelector('input[name="methodology"][value="desenvolvimento"]');
  for (const name of ['desenvolvimento', 'dados', 'desenvolvimento']) {
    d.querySelector(`input[name="methodology"][value="${name}"]`).click();
    assert.deepEqual(visible(), orders.bi);
    assert.equal(d.querySelectorAll('[data-method-content][aria-hidden="false"]').length, 4);
    assert.ok([...d.querySelectorAll('[data-method-content][aria-hidden="false"]')].every((e) => e.dataset.methodContent === name));
  }
  radio('all').click();
  assert.equal(method.checked, true);
  assert.equal(d.querySelectorAll('.process-card').length, 4);
  assert.deepEqual([...d.querySelectorAll('.process-number')].map((e) => e.textContent.trim()), ['01', '02', '03', '04']);
  results.independent_selectors = true;
  results.methodology_switches = 3;
  radio('bi').click();
  assert.equal(w.history.state.portfolioProjectFilter, 'bi');
  // Reproduz o retorno observado: rádio restaurado, cards inicialmente visíveis.
  cards.forEach((card) => { card.hidden = false; });
  w.dispatchEvent(new w.PageTransitionEvent('pageshow', { persisted: true }));
  await new Promise((resolve) => w.requestAnimationFrame(resolve));
  assert.deepEqual(visible(), orders.bi);
  w.history.replaceState({ portfolioProjectFilter: 'app' }, '');
  w.dispatchEvent(new w.PopStateEvent('popstate'));
  assert.deepEqual(visible(), orders.app);
  results.history_restore = true;
  radio('all').click();
  const reducedMotion = [...d.styleSheets].some((sheet) => [...sheet.cssRules].some((rule) =>
    rule.conditionText?.includes('prefers-reduced-motion') && [...rule.cssRules].some((nested) =>
      nested.selectorText === 'html' && nested.style.getPropertyValue('scroll-behavior') === 'auto')));
  assert.equal(reducedMotion, true);
  results.reduced_motion_css_parsed = true;

  radio('app').click();
  w.history.replaceState(null, '', '#featured-churn');
  w.dispatchEvent(new w.HashChangeEvent('hashchange'));
  assert.deepEqual(visible(), orders.all);
  assert.equal(results.anchor_scrolls, 1);
  w.history.replaceState(null, '', '#%E0');
  w.dispatchEvent(new w.HashChangeEvent('hashchange'));
  assert.deepEqual(visible(), orders.all);
  for (const [hash, expected] of [['#dashboards', orders.bi], ['#aplicativos', orders.app]]) {
    const page = create('https://leandroaugferreira.github.io/' + hash);
    assert.deepEqual([...page.w.document.querySelectorAll('[data-project-card]:not([hidden])')].map((e) => e.id), expected);
    page.close();
  }
  results.legacy_anchors = true;

  const video = players[0].querySelector('video');
  players[0].querySelector('[data-teaser-toggle]').click();
  players[1].querySelector('[data-teaser-toggle]').click();
  assert.equal(video.paused, true);
  assert.equal(players[1].querySelector('video').paused, false);
  const language = players[0].querySelector('select');
  language.value = 'en'; language.dispatchEvent(new w.Event('change'));
  assert.equal(state(video).tracks[1].mode, 'hidden');
  language.value = 'off'; language.dispatchEvent(new w.Event('change'));
  assert.equal(players[0].querySelector('.video-subtitles').style.visibility, 'hidden');
  state(video).fail = true;
  players[0].querySelector('[data-teaser-toggle]').click();
  await new Promise((resolve) => setImmediate(resolve));
  const status = players[0].querySelector('.video-subtitles');
  assert.match(status.textContent, /Não foi possível/);
  assert.equal(status.getAttribute('role'), 'status');
  assert.equal(status.style.visibility, 'visible');
  state(video).fail = false;
  players[0].querySelector('[data-teaser-toggle]').click();
  assert.equal(status.hasAttribute('role'), false);
  results.player_controls_and_recovery = true;
  assert.deepEqual(errors, []);
  results.jsdom_errors = errors;
  console.log(JSON.stringify(results));
  ctx.close();
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
