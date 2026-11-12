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
  const english = () => document.documentElement.lang === 'en-US';
  const wording = (pt, en) => english() ? en : pt;
  const projectName = () => window.portfolioLanguage?.translate(name) ?? name;
  const title = document.createElement('div');
  title.className = 'video-scene-title';
  title.textContent = name;
  const captions = document.createElement('p');
  captions.className = 'video-subtitles';
  player.classList.add('portfolio-video');
  player.prepend(title);
  video.after(captions);
  video.controls = false;
  video.tabIndex = 0;
  const timeline = document.createElement('div');
  timeline.className = 'video-timeline';
  const seek = document.createElement('input');
  seek.type = 'range'; seek.min = '0'; seek.max = '0'; seek.step = '0.1'; seek.value = '0';
  const clock = document.createElement('span');
  timeline.append(seek, clock);
  captions.after(timeline);
  let scenes = [];
  let scenesLoading;
  let playbackError = false;

  function renderCaption() {
    if (playbackError) {
      captions.textContent = wording(
        'Não foi possível reproduzir o vídeo. Tente novamente ou consulte as imagens e o manual do projeto.',
        'The video could not be played. Try again or see the project images and manual.',
      );
      captions.style.visibility = 'visible';
      return;
    }
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
    const heading = scene?.title || (video.ended ? scenes.at(-1)?.title : scenes[0]?.title);
    title.textContent = heading ? (window.portfolioLanguage?.translate(heading) ?? heading) : projectName();
  }
  function loadScenes() {
    if (scenesLoading || !player.dataset.scenes) return;
    scenesLoading = fetch(player.dataset.scenes).then((response) => {
      if (!response.ok) throw new Error('scene metadata');
      return response.json();
    }).then((items) => { scenes = items; updateTitle(); }).catch(updateTitle);
  }
  function updatePlayback() {
    const verb = video.paused ? wording('Reproduzir', 'Play') : wording('Pausar', 'Pause');
    toggle.textContent = video.paused
      ? (teaser ? `▶ ${wording('Resumo', 'Overview')} · ${player.dataset.duration}s` : `▶ ${verb}`)
      : `Ⅱ ${verb}`;
    const subject = english()
      ? `${projectName()} ${teaser ? 'overview' : 'presentation'}`
      : `${teaser ? 'resumo de' : 'apresentação de'} ${name}`;
    toggle.setAttribute('aria-label', `${verb} ${subject}${context}`);
  }
  function togglePlayback() {
    if (video.paused) video.play().catch(showPlaybackError);
    else video.pause();
  }
  function showPlaybackError(error) {
    if (error?.name === 'AbortError') return;
    playbackError = true;
    captions.setAttribute('role', 'status');
    renderCaption();
    updatePlayback();
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
    playbackError = false;
    captions.removeAttribute('role');
    portfolioPlayers.forEach((other) => { if (other !== player) other.querySelector('video')?.pause(); });
    loadScenes();
    updateCaptions();
    updatePlayback();
  });
  video.addEventListener('error', showPlaybackError);
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
    mute.textContent = `${video.muted ? '🔇' : '🔊'} ${wording('Som', 'Sound')}`;
    const label = english()
      ? `${video.muted ? 'Unmute' : 'Mute'} ${projectName()}`
      : `${video.muted ? 'Ativar' : 'Silenciar'} som de ${name}`;
    mute.setAttribute('aria-label', label + context);
    mute.setAttribute('aria-pressed', String(video.muted));
  }
  mute.addEventListener('click', () => { video.muted = !video.muted; updateMute(); });
  controls.append(mute);

  let updateFullscreen = () => {};
  if (player.requestFullscreen) {
    const fullscreen = document.createElement('button');
    fullscreen.type = 'button';
    fullscreen.className = 'video-fullscreen';
    fullscreen.addEventListener('click', async () => {
      try {
        if (document.fullscreenElement === player) await document.exitFullscreen();
        else await player.requestFullscreen();
      } catch { fullscreen.textContent = wording('Tela cheia indisponível', 'Fullscreen unavailable'); }
    });
    updateFullscreen = () => {
      const active = document.fullscreenElement === player;
      const label = active ? wording('Sair da tela cheia', 'Exit fullscreen') : wording('Tela cheia', 'Fullscreen');
      fullscreen.textContent = `⛶ ${label}`;
      fullscreen.setAttribute('aria-label', `${label}: ${projectName()}${context}`);
    };
    document.addEventListener('fullscreenchange', updateFullscreen);
    controls.append(fullscreen);
  }
  function updateLanguage() {
    const captionLanguage = english() ? 'en' : 'pt-BR';
    if (window.portfolioLanguage && Array.from(language.options).some((option) => option.value === captionLanguage)) {
      language.value = captionLanguage;
    }
    captions.setAttribute('aria-label', wording('Legenda da narração', 'Narration captions'));
    seek.setAttribute('aria-label', `${wording('Posição do vídeo de', 'Video position for')} ${projectName()}${context}`);
    updateCaptions();
    updatePlayback();
    updateTitle();
    updateMute();
    updateFullscreen();
  }
  document.addEventListener('portfolio:languagechange', updateLanguage);
  updateLanguage();
  updateTimeline();
});
