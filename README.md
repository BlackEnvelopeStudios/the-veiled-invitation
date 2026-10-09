# The Veiled Invitation

Static, multi-page website for GitHub Pages. This is a content-free foundation; game artwork and approved content will be added later.

## Pages

- `/`: landing page
- `/souls/`: souls
- `/creatures/`: creatures
- `/lore/`: game lore

## Build

Use Node.js 22 or newer and run `npm run build`. The generated site is in `dist/`. No dependency installation is needed. Open `dist/index.html` for a local preview.

Shared content lives in `content.json`, layout in `build.mjs`, and appearance in `styles.css`. Output uses relative links so it works under both a GitHub project URL and a custom domain. Directory routes are real HTML pages and can be opened directly.

## Images

Keep original images in `assets/`. Only referenced, optimized WebP copies from `web-images/` are published. Commit `web-images/` with the website so GitHub builds need no image-processing dependency.

After adding or replacing artwork, run `node optimize-images.mjs`, then `node build.mjs`. The optimizer requires the `sharp` package; install it in your development environment or set `SHARP_MODULE` to an existing Sharp module directory. It creates 480px and 960px responsive versions and a full-resolution version for the enlarged artwork view. Original files are never changed. Run `node tests/images.test.mjs` to verify the generated image links and preservation of originals.

## GitHub Pages

Publish the contents of this website directory at the root of the website's own repository. In repository Settings > Pages, choose GitHub Actions. The included workflow publishes pushes to `main`.

After the GitHub Pages deployment works, verify domain ownership with GitHub and set the Pages custom domain to `www.theveiledinvitation.com`. Configure `www` at the domain provider as a CNAME to the repository owner's `<username>.github.io` hostname. Configure the apex domain using GitHub's documented records and enable HTTPS once available. Retain the existing `.net` forwarding.

No live domain settings have been changed by this scaffold.

Official domain instructions: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
