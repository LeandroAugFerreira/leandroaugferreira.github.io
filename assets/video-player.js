const portfolioPlayers = Array.from(document.querySelectorAll('[data-teaser-player], [data-transcricao-player], [data-nexolog-player], [data-atelie-player], [data-project-player]'));

portfolioPlayers.forEach((player) => {
  const video = player.querySelector('video');
  const toggle = player.querySelector('[data-teaser-toggle], [data-video-toggle]');
  const language = player.querySelector('[data-teaser-language], [data-caption-language]');
  const controls = toggle?.parentElement;
  if (!video || !toggle || !language || !controls) return;
  const teaser = player.hasAttribute('data-teaser-player');
  const name = player.dataset.projectName || video.getAttribute('aria-label').replace(/^Apresentação do /, '');
  const context = player.dataset.teaserContext ? ` ${player.dataset.teaserContext}` : '';
  const title = document.createElement('div');
  title.className = 'video-scene-title';
  title.textContent = name;
  const captions = document.createElement('p');
  captions.className = 'video-subtitles';
  captions.setAttribute('aria-label', 'Legenda da narração');
  player.classList.add('portfolio-video');
  player.prepend(title);
  video.after(captions);
  video.controls = false;
  video.tabIndex = 0;
  const timeline = document.createElement('div');
  timeline.className = 'video-timeline';
  const seek = document.createElement('input');
  seek.type = 'range'; seek.min = '0'; seek.max = '0'; seek.step = '0.1'; seek.value = '0';
  seek.setAttribute('aria-label', `Posição do vídeo de ${name}${context}`);
  const clock = document.createElement('span');
  timeline.append(seek, clock);
  captions.after(timeline);
  let scenes = [];
  let scenesLoading;

  function renderCaption() {
    const track = Array.from(video.textTracks).find((item) => item.language === language.value);
    const active = track?.activeCues;
    captions.textContent = active ? Array.from(active).map((cue) => cue.text).join(' ').replace(/\s+/g, ' ') : '';
    captions.style.visibility = language.value === 'off' ? 'hidden' : 'visible';
  }
  function updateCaptions() {
    Array.from(video.textTracks).forEach((track) => {
      track.mode = track.language === language.value ? 'hidden' : 'disabled';
      track.oncuechange = renderCaption;
    });
    renderCaption();
  }
  function updateTitle() {
    const scene = scenes.find((item) => video.currentTime >= item.start && video.currentTime < item.end);
    title.textContent = scene?.title || (video.ended ? scenes.at(-1)?.title : scenes[0]?.title) || name;
  }
  function loadScenes() {
    if (scenesLoading || !player.dataset.scenes) return;
    scenesLoading = fetch(player.dataset.scenes).then((response) => {
      if (!response.ok) throw new Error('scene metadata');
      return response.json();
    }).then((items) => { scenes = items; updateTitle(); }).catch(() => { title.textContent = name; });
  }
  function updatePlayback() {
    toggle.textContent = video.paused ? (teaser ? `▶ Resumo · ${player.dataset.duration}s` : '▶ Reproduzir') : 'Ⅱ Pausar';
    toggle.setAttribute('aria-label', `${video.paused ? 'Reproduzir' : 'Pausar'} ${teaser ? 'resumo de' : 'apresentação de'} ${name}${context}`);
  }
  function togglePlayback() {
    if (video.paused) video.play().catch(updatePlayback);
    else video.pause();
  }
  function formatTime(value) {
    const seconds = Number.isFinite(value) ? Math.floor(value) : 0;
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  }
  function updateTimeline() {
    seek.max = Number.isFinite(video.duration) ? String(video.duration) : '0';
    seek.disabled = !Number.isFinite(video.duration);
    seek.value = String(video.currentTime);
    clock.textContent = `${formatTime(video.currentTime)} / ${formatTime(Number.isFinite(video.duration) ? video.duration : Number(player.dataset.duration))}`;
  }
  seek.addEventListener('input', () => { if (Number.isFinite(video.duration)) video.currentTime = Number(seek.value); });
  toggle.addEventListener('click', togglePlayback);
  video.addEventListener('click', togglePlayback);
  video.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); togglePlayback(); }
  });
  video.addEventListener('play', () => {
    portfolioPlayers.forEach((other) => { if (other !== player) other.querySelector('video')?.pause(); });
    loadScenes();
    updateCaptions();
    updatePlayback();
  });
  ['pause', 'ended'].forEach((event) => video.addEventListener(event, updatePlayback));
  video.addEventListener('timeupdate', () => { updateTitle(); updateTimeline(); });
  video.addEventListener('seeked', () => { updateTitle(); renderCaption(); });
  video.addEventListener('loadedmetadata', () => { updateCaptions(); loadScenes(); updateTimeline(); });
  video.querySelectorAll('track').forEach((track) => track.addEventListener('load', updateCaptions));
  video.textTracks.addEventListener('change', () => {
    const nativeSelection = Array.from(video.textTracks).find((track) => track.mode === 'showing');
    if (nativeSelection) { language.value = nativeSelection.language; updateCaptions(); }
    else renderCaption();
  });
  language.addEventListener('change', updateCaptions);

  const mute = document.createElement('button');
  mute.type = 'button'; mute.className = 'video-mute';
  function updateMute() {
    mute.textContent = video.muted ? '🔇 Som' : '🔊 Som';
    mute.setAttribute('aria-label', `${video.muted ? 'Ativar' : 'Silenciar'} som de ${name}${context}`);
    mute.setAttribute('aria-pressed', String(video.muted));
  }
  mute.addEventListener('click', () => { video.muted = !video.muted; updateMute(); });
  controls.append(mute);
  updateMute();

  if (player.requestFullscreen) {
    const fullscreen = document.createElement('button');
    fullscreen.type = 'button';
    fullscreen.className = 'video-fullscreen';
    fullscreen.textContent = '⛶ Tela cheia';
    fullscreen.setAttribute('aria-label', `Tela cheia: ${name}${context}`);
    fullscreen.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement === player) await document.exitFullscreen();
        else await player.requestFullscreen();
      } catch { fullscreen.textContent = 'Tela cheia indisponível'; }
    });
    document.addEventListener('fullscreenchange', () => {
      const active = document.fullscreenElement === player;
      fullscreen.textContent = active ? '⛶ Sair da tela cheia' : '⛶ Tela cheia';
      fullscreen.setAttribute('aria-label', `${active ? 'Sair da tela cheia' : 'Tela cheia'}: ${name}${context}`);
    });
    controls.append(fullscreen);
  }
  updateCaptions();
  updatePlayback();
  updateTimeline();
});
