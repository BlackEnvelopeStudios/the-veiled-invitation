(() => {
  const portrait = document.querySelector('.soul-portrait, .creature-portrait');
  if (!portrait || typeof HTMLDialogElement === 'undefined') return;

  const dialog = document.createElement('dialog');
  dialog.className = 'artwork-viewer';
  const name = document.querySelector('h1').textContent;
  dialog.setAttribute('aria-label', `${name} enlarged artwork`);

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'artwork-close';
  close.setAttribute('aria-label', 'Close enlarged artwork');
  close.title = 'Close enlarged artwork (Escape)';
  close.innerHTML = '&#215;';

  const enlarged = document.createElement('img');
  enlarged.alt = portrait.alt;
  dialog.append(close, enlarged);
  document.getElementById('site-content').append(dialog);

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = `${portrait.className} portrait-trigger`;
  trigger.setAttribute('aria-label', `Enlarge ${name} artwork`);
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.title = `Enlarge ${name} artwork`;
  portrait.className = '';
  portrait.replaceWith(trigger);
  trigger.append(portrait);

  trigger.addEventListener('click', () => {
    enlarged.src = portrait.dataset?.fullSrc || portrait.currentSrc || portrait.src;
    dialog.showModal();
    document.documentElement.classList.add('artwork-open');
    close.focus();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('artwork-open');
    trigger.focus({ preventScroll: true });
  });
})();
