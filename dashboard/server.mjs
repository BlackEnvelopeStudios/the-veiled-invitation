import http from 'node:http';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { options, updateStudio } from './status.mjs';

const port = Number(process.env.STUDIO_DASHBOARD_PORT || 4387);
const origin = `http://127.0.0.1:${port}`;
const owner = 'BlackEnvelopeStudios';
let busy = false;

function credential() {
  return new Promise((resolve, reject) => {
    const child = execFile('git', ['credential', 'fill'], {
      windowsHide: true, timeout: 15000,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' }
    }, (error, stdout) => {
      if (error) return reject(new Error('GitHub sign-in is unavailable. Sign in on this laptop first.'));
      const password = stdout.split(/\r?\n/).find(line => line.startsWith('password='))?.slice(9);
      if (!password) return reject(new Error('GitHub sign-in is unavailable.'));
      resolve(password);
    });
    child.stdin.end('protocol=https\nhost=github.com\n\n');
  });
}

async function api(token, repository, path, method = 'GET', body) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repository}/contents/${path}`, {
    method, signal: AbortSignal.timeout(30000),
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json', 'User-Agent': 'Studio-Local-Dashboard' },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}. Check sign-in and repository access.`);
  return response.json();
}

async function file(token, repo, path) {
  const result = await api(token, repo, path);
  return { sha: result.sha, content: Buffer.from(result.content, 'base64').toString('utf8') };
}

async function publish(token, repo, path, transform) {
  const current = await file(token, repo, path);
  const content = transform(current.content);
  if (current.content === content) return 'Already saved';
  await api(token, repo, path, 'PUT', {
    message: 'Update studio live status', sha: current.sha,
    content: Buffer.from(content).toString('base64')
  });
  return 'Saved; publishing';
}

function reply(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}

const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'");
  if (req.headers.host !== `127.0.0.1:${port}`) return reply(res, 403, { error: 'Local access only' });
  try {
    if (req.method === 'GET' && ['/', '/app.js', '/style.css'].includes(req.url)) {
      const name = req.url === '/' ? 'index.html' : req.url.slice(1);
      res.writeHead(200, { 'Content-Type': { 'index.html': 'text/html', 'app.js': 'text/javascript', 'style.css': 'text/css' }[name], 'Cache-Control': 'no-store' });
      return res.end(await readFile(new URL(name, import.meta.url)));
    }
    if (req.method === 'GET' && req.url === '/state') {
      const token = await credential();
      const game = JSON.parse((await file(token, 'the-veiled-invitation', 'studio-status.json')).content);
      const studio = (await file(token, 'black-envelope-studios', 'index.html')).content.match(/data-studio-status="(inactive|playtesting|developing)"/)?.[1];
      return reply(res, 200, { selected: game.selected, studio, options });
    }
    if (req.method === 'POST' && req.url === '/publish') {
      if (req.headers.origin !== origin || req.headers['content-type'] !== 'application/json') return reply(res, 403, { error: 'Invalid request origin' });
      if (busy) return reply(res, 409, { error: 'An update is already underway' });
      let body = '';
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 1024) return reply(res, 413, { error: 'Request too large' });
      }
      const { selected } = JSON.parse(body);
      if (!Object.hasOwn(options, selected)) return reply(res, 400, { error: 'Choose a valid status' });
      busy = true;
      try {
        const token = await credential();
        const results = {};
        for (const [label, repo, path, transform] of [
          ['game', 'the-veiled-invitation', 'studio-status.json', content => {
            const data = JSON.parse(content);
            if (data.selected === selected) return content;
            return JSON.stringify({ ...data, selected }, null, 2) + '\n';
          }],
          ['studio', 'black-envelope-studios', 'index.html', content => updateStudio(content, selected)]
        ]) {
          try { results[label] = { ok: true, message: await publish(token, repo, path, transform) }; }
          catch (error) { results[label] = { ok: false, message: error.message }; }
        }
        return reply(res, 200, results);
      } finally { busy = false; }
    }
    reply(res, 404, { error: 'Not found' });
  } catch (error) { reply(res, 500, { error: error.message }); }
});
server.listen(port, '127.0.0.1', () => console.log(`Studio dashboard: ${origin}`));
