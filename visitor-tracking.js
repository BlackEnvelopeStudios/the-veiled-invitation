(() => {
  // Local previews and the private dashboard never send analytics.
  if (!['theveiledinvitation.com', 'www.theveiledinvitation.com'].includes(location.hostname)) return;
  const source = document.currentScript.src;
  fetch(new URL('analytics.json', source), { cache: 'no-store' })
    .then(response => response.ok ? response.json() : null)
    .then(config => {
      if (!config || typeof config.siteCode !== 'string' || !/^[a-z0-9][a-z0-9-]{0,62}$/.test(config.siteCode)) return;
      // One shared path deduplicates visits across all pages in the site.
      window.goatcounter = { path: '/site-visit', title: 'Website visit', referrer: '' };
      const script = document.createElement('script');
      script.src = 'https://gc.zgo.at/count.js';
      script.async = true;
      script.dataset.goatcounter = `https://${config.siteCode}.goatcounter.com/count`;
      document.head.appendChild(script);
    }).catch(() => {});
})();
