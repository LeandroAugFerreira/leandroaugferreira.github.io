const teasers = Array.from(document.querySelectorAll('[data-teaser-player]'));
teasers.forEach((player) => {
  const video = player.querySelector('video');
  const button = player.querySelector('[data-teaser-toggle]');
  const language = player.querySelector('[data-teaser-language]');
  const name = player.dataset.projectName;
  const duration = player.dataset.duration;
  if (!video || !button || !language) return;
  function updateCaptions() {
    Array.from(video.textTracks).forEach((track) => {
      track.mode = track.language === language.value ? 'showing' : 'disabled';
    });
  }
  function updatePlayback() {
    button.textContent = video.paused ? `▶ Resumo · ${duration}s` : 'Ⅱ Pausar';
    button.setAttribute('aria-label', `${video.paused ? 'Reproduzir' : 'Pausar'} resumo de ${name}`);
  }
  button.addEventListener('click', () => {
    if (video.paused) video.play().catch(updatePlayback);
    else video.pause();
  });
  video.addEventListener('play', () => {
    // Uma voz por vez, mesmo quando várias chamadas estão visíveis.
    teasers.forEach((other) => {
      if (other !== player) other.querySelector('video')?.pause();
    });
    updateCaptions();
    updatePlayback();
  });
  ['pause', 'ended'].forEach((event) => video.addEventListener(event, updatePlayback));
  video.addEventListener('loadedmetadata', updateCaptions);
  language.addEventListener('change', updateCaptions);
  updateCaptions();
});
