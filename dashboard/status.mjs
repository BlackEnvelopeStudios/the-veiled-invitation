export const options = {
  inactive: 'No active development or playtesting underway.',
  playtesting: 'Playtesting live right now! Come watch in Discord!',
  developing: 'Developing live right now! Join us in Discord!'
};

export function updateStudio(html, selected) {
  if (!Object.hasOwn(options, selected)) throw new Error('Unknown status');
  const pattern = /<div class="studio-live-status" data-studio-status="(inactive|playtesting|developing)" role="status" aria-live="polite">[\s\S]*?<\/div>/g;
  const blocks = [...html.matchAll(pattern)];
  if (blocks.length !== 1) throw new Error('Studio status display has changed. No files were overwritten.');
  const block = blocks[0][0];
  const message = /<p class="studio-live-status-message">[^<]*<\/p>/g;
  if ([...block.matchAll(message)].length !== 1) throw new Error('Studio status message is missing');
  return html.replace(block, block
    .replace(/data-studio-status="[^"]*"/, `data-studio-status="${selected}"`)
    .replace(message, `<p class="studio-live-status-message">${options[selected]}</p>`));
}
