// Normalize notices and existing bullet entries into one consistently styled list.
export function updateLines(entry) {
  return [entry.text || '', ...(entry.bullets || [])]
    .flatMap(text => text.split(/\r?\n/))
    .map(line => line.trim().replace(/^(?:[-*•]\s+)+/, '').trim())
    .filter(Boolean);
}
