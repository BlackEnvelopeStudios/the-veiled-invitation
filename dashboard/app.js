const form = document.querySelector('form');
const fieldset = document.querySelector('fieldset');
const submit = document.querySelector('[type="submit"]');
const refresh = document.querySelector('#refresh');
const message = document.querySelector('#message');
let options = {};
function lock(value) { fieldset.disabled = value; submit.disabled = value; refresh.disabled = value; }
async function request(path, init) {
  const response = await fetch(path, init);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Unable to connect');
  return data;
}
async function load() {
  lock(true);
  message.textContent = 'Checking saved status...';
  try {
    const data = await request('/state');
    options = data.options;
    const radio = [...form.elements.selected].find(input => input.value === data.selected);
    if (radio) radio.checked = true;
    document.querySelector('#game').textContent = options[data.selected] || 'Unknown status';
    document.querySelector('#studio').textContent = options[data.studio] || 'Unknown status';
    message.textContent = data.selected === data.studio ? '' : 'The websites have different saved statuses. Publish to synchronize them.';
    lock(false);
  } catch (error) { message.textContent = error.message; refresh.disabled = false; }
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  const selected = new FormData(form).get('selected');
  if (!selected) return;
  lock(true);
  message.textContent = 'Saving status to both websites...';
  try {
    const result = await request('/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ selected }) });
    for (const key of ['game', 'studio']) document.querySelector(`#${key}`).textContent = result[key].message;
    message.textContent = Object.values(result).every(item => item.ok)
      ? 'Saved to both websites. Allow a minute or two for publication. This status stays saved when the laptop shuts down.'
      : 'One or more updates failed. Review the results above and retry to synchronize both websites.';
  } catch (error) { message.textContent = error.message; }
  finally { lock(false); }
});
refresh.addEventListener('click', load);
load();
