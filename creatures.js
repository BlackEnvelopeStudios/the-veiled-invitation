const controls = document.querySelector('.creature-categories');
const buttons = [...controls.querySelectorAll('button')];
const storageKey = 'veiled-invitation-creature-depth';
const validCategory = id => buttons.some(button => button.dataset.category === id);

function selectCategory(id) {
  if (!validCategory(id)) id = 'depth-i';
  for (const button of buttons) {
    const selected = button.dataset.category === id;
    button.setAttribute('aria-pressed', String(selected));
    document.getElementById(button.dataset.category).hidden = !selected;
  }
  try {
    sessionStorage.setItem(storageKey, id);
  } catch {
    // Local file previews and privacy settings may block storage.
  }
  try {
    history.replaceState(history.state, '', `#${id}`);
  } catch {
    // Category selection still works if URL updates are restricted.
  }
}

for (const button of buttons) {
  button.addEventListener('click', () => selectCategory(button.dataset.category));
}
let rememberedCategory = 'depth-i';
try {
  rememberedCategory = sessionStorage.getItem(storageKey) || rememberedCategory;
} catch {}
const linkedCategory = location.hash.slice(1);
selectCategory(validCategory(linkedCategory) ? linkedCategory : rememberedCategory);
window.addEventListener('hashchange', () => selectCategory(location.hash.slice(1)));
controls.hidden = false;
