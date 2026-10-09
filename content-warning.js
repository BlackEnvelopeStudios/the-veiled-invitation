(() => {
  const key = 'veiled-invitation-content-warning-accepted';
  const dialog = document.querySelector('.content-warning');
  const content = document.getElementById('site-content');
  const confirm = document.getElementById('warning-confirm');
  let accepted = false;
  try {
    accepted = sessionStorage.getItem(key) === 'yes';
  } catch {
    // Storage may be unavailable in private browsing or local file previews.
  }

  function reveal() {
    content.hidden = false;
    content.inert = false;
    dialog.close();
    document.documentElement.classList.remove('warning-active');
  }

  if (accepted) {
    reveal();
    return;
  }

  document.documentElement.classList.add('warning-active');
  dialog.removeAttribute('open');
  dialog.showModal();
  confirm.disabled = false;
  confirm.focus();
  dialog.addEventListener('cancel', event => event.preventDefault());
  confirm.addEventListener('click', () => {
    try {
      sessionStorage.setItem(key, 'yes');
    } catch {
      // Acknowledgement still works for this page when storage is blocked.
    }
    reveal();
    const main = document.getElementById('main');
    main.setAttribute('tabindex', '-1');
    main.focus({ preventScroll: true });
  });
})();
