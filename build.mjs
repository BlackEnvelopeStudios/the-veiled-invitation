import { readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, 'dist');
const content = JSON.parse(await readFile(path.join(root, 'content.json'), 'utf8'));
// Display change notices with the latest date at the top.
for (const category of content.pages.find(page => page.slug === 'updates')?.categories || []) {
  category.entries?.sort((a, b) => b.date.localeCompare(a.date));
}
const redditIcon = await readFile(path.join(root, 'assets/icons/reddit.svg'), 'utf8');
const discordIcon = await readFile(path.join(root, 'assets/icons/discord.svg'), 'utf8');
const studioStatus = JSON.parse(await readFile(path.join(root, 'studio-status.json'), 'utf8'));
if (!Object.hasOwn(studioStatus.options, studioStatus.selected)) throw new Error('Invalid studio status');
const creatures = [
  { slug: 'the-twins', name: 'The Twins', galleryImage: 'The Twins Hand.png', galleryWidth: 1086, galleryHeight: 1448, image: 'The Twins.png', imageWidth: 1086, imageHeight: 1448, imageAlt: 'The Twins, two pale figures joined into a single body, emerging from a stone pit in a candlelit chamber.', introduction: 'Two women bound into a single ruined form, The Twins carry opposite halves of the same suffering. One gazes upon the world with haunting sorrow, while the other answers it with naked hatred, dragging them both forward whenever grief begins to hesitate.' },
  { slug: 'un-gulg', name: 'Un-Gulg', galleryImage: 'Un-Gulg Hand.png', galleryWidth: 1150, galleryHeight: 1368, image: 'Un-Gulg.png', imageWidth: 1024, imageHeight: 1536, imageAlt: 'Un-Gulg, a spined, many-legged creature with a circular tooth-lined mouth, resting on the edge of a stone pit.', introduction: 'Un-Gulg begins as something small enough to be underestimated\u2014an invasive little horror that slips through the nearest orifice and disappears inside. Once nestled within a host, it does not feed in haste or kill in frenzy; it simply settles, incubates, and waits to become something far worse.' },
  { slug: 'the-severant', name: 'The Severant', galleryImage: 'The Severant Hand.png', galleryWidth: 1122, galleryHeight: 1402, image: 'The Severant.png', imageWidth: 1086, imageHeight: 1448, imageAlt: 'The Severant, a long-bodied creature with sharp teeth, hooked weapons, and multiple limbs, rising from a stone pit.', introduction: 'A narrow, alien-like hunter with a smooth maw and immense hooked limbs, The Severant looks almost engineered rather than evolved. Its body is all reach, leverage, and predatory intent.' },
  { slug: 'the-oculith', name: 'The Oculith', galleryImage: 'The Oculith Hand Sepia.png', galleryWidth: 1254, galleryHeight: 1254, image: 'The Oculith.png', imageWidth: 1184, imageHeight: 1328, imageAlt: 'The Oculith, a tentacled creature with a single large eye and a towering clawed limb, emerging from a stone pit.', introduction: 'Wrapped in coils of living tissue and crowned by a single alien eye, The Oculith seems built entirely around watching and reaching. Its scythe-like claws extend far beyond the body, turning distance into little protection.' },
  { slug: 'the-mutilator', name: 'The Mutilator', galleryImage: 'Mutilator Hand.png', galleryWidth: 1122, galleryHeight: 1402, image: 'The Mutilator.png', imageWidth: 1086, imageHeight: 1448, imageAlt: 'The Mutilator, a masked figure with a jagged blade and curved hook, emerging from a stone pit.', introduction: 'Armed with a massive blade and hooked limb, The Mutilator attacks with crushing persistence. It does not stop when its prey falls, only when there is nothing left worth striking.' },
  { slug: 'the-fleshstripper', name: 'The Fleshstripper', galleryImage: 'The Fleshstripper Hand Borderless.png', galleryWidth: 1091, galleryHeight: 1442, image: 'The Fleshstripper Borderless.png', imageWidth: 1024, imageHeight: 1536, imageAlt: 'The Fleshstripper, a tall humanoid creature with exposed ribs, elongated limbs, and clawed hands, stepping from a stone pit.', introduction: 'Slow, silent, and deliberate, The Fleshstripper seems almost passive until its grip closes. What follows is not frenzy, but a precise feeding process carried out with unnerving care.' },
  { slug: 'the-charred', name: 'The Charred', galleryImage: 'The Charred hand.png', image: 'The Charred Image.png', imageAlt: 'The Charred, a scorched skeletal figure rising from a stone pit amid smoke and flames.', introduction: 'The Charred looks like something dragged alive from the heart of a fire. A scorched figure of exposed bone and split, coal-black flesh, it continues to wander long after death should have claimed it.' },
  { slug: 'the-bloat', name: 'The Bloat', galleryImage: 'The Bloat Hand.png', image: 'The Bloat Art.png', imageAlt: 'The Bloat, a swollen figure emerging from dark liquid in a stone pit.', introduction: 'The Bloat lumbers forward beneath the weight of its own swollen body, skin stretched tight over something heavy and fluid. Every movement carries the sound of water shifting and wherever it passes, the floor is left damp behind it.' },
  { slug: 'the-cleaved', name: 'The Cleaved', galleryImage: 'The Cleaved Hand.png', image: 'Cleaved.png', imageAlt: 'The Cleaved, an uneven humanoid figure stitched together down the center, climbing from a stone pit.', introduction: 'Split unevenly from head to torso, The Cleaved moves as two mismatched halves forced into the same body. It moves with just enough coordination to make the imbalance more disturbing, not less.' },
  { slug: 'the-nightchild', name: 'The Nightchild', galleryImage: 'The Nightchild Hand.png', image: 'Nightchild.png', imageAlt: 'The Nightchild, a small dark-skinned figure with luminous eyes reaching out from a stone pit.', introduction: 'The Nightchild looks more lost than dangerous, a tiny cosmic figure trembling at the edge of The Pit. Its fear is genuine, which only makes the unseen thing following it more troubling.' },
  { slug: 'the-voices', name: 'The Voices', galleryImage: 'The Voices Head.png', galleryWidth: 1198, galleryHeight: 1313, image: 'The Voices.png', imageWidth: 1122, imageHeight: 1402, imageAlt: 'The Voices, a pale figure with blank eyes and blades fanning across its torso, stepping from a stone pit.', introduction: 'The Voices is a gaunt, straitjacketed figure consumed by whatever speaks inside her mind. Her fear can become rage without warning, and the blades extending from her chest make that transformation deadly.' },
  { slug: 'the-whisper', name: 'The Whisper', galleryImage: 'The Whisper Hand.png', galleryWidth: 1122, galleryHeight: 1402, image: 'The Whisper.png', imageWidth: 1122, imageHeight: 1402, imageAlt: 'The Whisper, a faint spectral figure suspended above a stone pit in a candlelit chamber.', introduction: 'Barely visible and almost impossible to track, The Whisper makes itself known through suggestion rather than force. It turns the mind against itself long before violence begins.' },
  { slug: 'the-marrowslurper', name: 'The Marrowslurper', galleryImage: 'The Marrowslurper Hand.png', galleryWidth: 1122, galleryHeight: 1402, image: 'The Marrowslurper.png', imageWidth: 1122, imageHeight: 1402, imageAlt: 'The Marrowslurper, a long-limbed creature with red eyes, a circular tooth-lined mouth, and an extended forked tongue, climbing from a stone pit.', introduction: 'A pale, blotched hunter with a circular maw and an impossibly long tongue, The Marrowslurper seeks what lies beneath the skin. Flesh is only what stands in the way.' },
  { slug: 'the-crawler', name: 'The Crawler', galleryImage: 'The Crawler Hand.png', galleryWidth: 1149, galleryHeight: 1369, image: 'The Crawler.png', imageWidth: 1122, imageHeight: 1402, imageAlt: 'The Crawler, a skeletal creature with an exposed rib cage, long fangs, and clawed limbs, emerging from a stone pit.', introduction: 'A grotesque four-legged horror of exposed bone and creeping veins, The Crawler waits in silence before it strikes.\nIts massive arched ribs drag low, cradling loose organs beneath a hollow skull armed with enormous fangs.' },
  { slug: 'the-fear-chaser', name: 'The Fear Chaser', galleryImage: 'The Fear Chaser Hand.png', galleryWidth: 1122, galleryHeight: 1402, image: 'The Fear Chaser.png', imageWidth: 1122, imageHeight: 1402, imageAlt: 'The Fear Chaser, a pale, many-limbed creature with an eyeless head and sharp teeth, climbing from a stone pit.', introduction: 'The Fear Chaser sees nothing until something becomes afraid. Then terror itself becomes a beacon, drawing the eyeless creature forward with every panicked breath.' },
  { slug: 'mag-mo-nai', name: 'Mag Mo-Nai', galleryImage: 'Mag Mo-Nai Hand.png', galleryWidth: 1122, galleryHeight: 1402, image: 'Mag Mo-Nai.png', imageWidth: 1024, imageHeight: 1536, imageAlt: 'Mag Mo-Nai, a pale, hollow-eyed figure in a dark suit, stepping through a pool of black liquid in a candlelit stone chamber.', introduction: 'Mag Mo-Nai rises through cracks in the stone as liquid darkness, slowly assembling itself into an exact replica of its chosen target. Behind the perfect face is a calculating intelligence that seems to understand the prey before it understands the threat.' },
  { slug: 'asmodeus', name: 'Asmodeus', galleryImage: 'Asmodeus Hand.png', galleryWidth: 1184, galleryHeight: 1328, image: 'Asmodeus.png', imageWidth: 1184, imageHeight: 1328, imageAlt: 'Asmodeus, a horned figure with a muscular torso, hooves, and a decaying equine body, standing on stone steps in a candlelit chamber.', introduction: 'An immense horned figure bound to the wreckage of his own equine body. He rises slowly, silently, and with the certainty of something that has already endured worse than whatever stands before him.' },
  { slug: 'helvangarde', name: 'Helvangarde', galleryImage: 'Helvangarde Hand.png', galleryWidth: 1184, galleryHeight: 1328, image: 'Helvangarde.png', imageWidth: 1192, imageHeight: 1320, imageAlt: 'Helvangarde, a crowned skeletal figure in tattered robes and chains, carrying a scepter as it steps from a stone pit.', introduction: 'Once adorned like a king, Helvangarde now shambles beneath a crooked crown and the rotting remains of forgotten splendor. It moves with the frailty of something barely held together, until recognition strikes and the ruined monarch suddenly bolts with wild, undignified panic.' },
  { slug: 'yggdrasil', name: 'Yggdrasil', galleryImage: 'Yggdrasil Hand Borderless.png', galleryWidth: 1024, galleryHeight: 1536, image: 'Yggdrasil Borderless.png', imageWidth: 1024, imageHeight: 1536, imageAlt: 'Yggdrasil, a towering tree-like creature with gaping faces and figures hanging from its branches, emerging from a stone pit.', introduction: 'Yggdrasil is a colossal union of beast and living growth, its vast frame crowned by branching tendrils that drink from whatever they can claim. What Yggdrasil takes becomes part of it, feeding an ancient body that seems determined to outlive everything around it.' },
  { slug: 'child-eater', name: 'Child Eater', galleryImage: 'Child Eater Hand Borderless.png', galleryWidth: 1024, galleryHeight: 1536, image: 'Child Eater Borderless.png', imageWidth: 1024, imageHeight: 1536, imageAlt: 'Child Eater, a massive clawed creature carrying a cage on its back, emerging from a stone pit.', introduction: 'A hulking predator of children, The Child Eater lumbers beneath a swollen frame and a cage built for its chosen prey. Slow to stir but impossible to ignore, it collects, waits, and feeds when hunger demands it.' },
];
const souls = [
  {
    slug: 'the-host', name: 'The Host', image: 'The Host.png',
    envelope: "Host's Envelope.png",
    imageAlt: 'The Host, a red-eyed figure in a dark suit, holding a sealed invitation in a candlelit chamber.',
    introduction: 'The Host is the enigmatic curator of <strong>The Veiled Invitation</strong>, personally seeking out each Soul and drawing them into his game. Charming, calculating, and impossible to read, he always seems to know more than he should. What he truly wants from those who accept his invitation remains his alone to know.',
  },
  {
    slug: 'the-rotting-body', name: 'The Rotting Body', image: 'The Rotting Body.png',
    envelope: "The Rotting Body's Envelope.png",
    imageAlt: 'The Rotting Body, a decaying figure in a tattered suit, seated beside an open grave and casket in a moonlit cemetery.',
    introduction: 'The Rotting Body awakens with no memory of who he was or how he came to be buried. Confused, decaying, and desperate for answers, he enters The Host&#8217;s game with little more than the remnants of his former life and a casket he cannot leave behind.',
  },
  {
    slug: 'the-dreadnought', name: 'The Dreadnought', image: 'The Dreadnought.png',
    envelope: 'The Dreadnought Envelope.png',
    imageWidth: 1122, imageHeight: 1402,
    imageAlt: 'The Dreadnought, glowing eyes visible through a towering riveted iron prison restrained by massive chains in a stone dungeon.',
    introduction: 'The Dreadnought is a towering engine of rage, sealed within an iron prison and restrained by massive chains strong enough to hold him. Freed from confinement, he enters The Host&#8217;s game with one purpose burning beneath: find somewhere to unleash what has been kept buried for far too long.',
  },
  {
    slug: 'the-tormented-prisoner', name: 'The Tormented Prisoner', image: 'The Tormented Prisoner.png',
    envelope: 'The Tormented Prisoner Envelope.png',
    imageWidth: 1024, imageHeight: 1536,
    imageAlt: 'The Tormented Prisoner, a riveted humanoid machine connected to tubes and cables between tall glass cylinders in a dark laboratory.',
    introduction: 'The Tormented Prisoner is a sentient human trapped inside a body built for someone else&#8217;s purpose. Driven by cold programming but haunted by very human suffering, he enters The Host&#8217;s game as both captor and captive, unable to escape the commands buried within him.',
  },
  {
    slug: 'the-one-who-is-many', name: 'The One Who is Many', image: 'The One Who is Many.png',
    envelope: 'The One Who is Many Envelope.png',
    imageWidth: 1086, imageHeight: 1448,
    imageAlt: 'The One Who is Many, a towering black entity with multiple faces and a gaping mouth, standing in a laboratory.',
    introduction: 'The One Who Is Many is a shapeless black entity capable of wrapping itself around skeletal remains, using bone as a framework for its form. Drawn into The Host&#8217;s game with a new structure to inhabit, it moves as one creature, yet speaks with several voices.',
  },
];
const escape = (text) => String(text).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const imageFiles = [...new Set([
  'brand/The Veiled Invitation Logo.png', 'brand/Black Envelope Studios Icon.png',
  ...souls.flatMap(item => [item.image, item.envelope || 'veiled-envelope.png'].map(file => `souls/${file}`)),
  ...creatures.flatMap(item => [item.image, item.galleryImage].map(file => `creatures/${file}`)),
])];
if (process.argv.includes('--image-list')) {
  console.log(JSON.stringify(imageFiles));
  process.exit(0);
}
const imageManifest = JSON.parse(await readFile(path.join(root, 'web-images/manifest.json'), 'utf8'));
for (const file of imageFiles) {
  const input = await readFile(path.join(root, 'assets', file));
  const id = createHash('sha256').update(file).update(input).digest('hex').slice(0, 20);
  if (imageManifest[file]?.small !== `${id}-small.webp`) {
    throw new Error(`Artwork changed: ${file}. Run node optimize-images.mjs before building.`);
  }
}
function imageAttrs(prefix, folder, file, sizes, full = false) {
  const image = imageManifest[`${folder}/${file}`];
  if (!image) throw new Error(`Run image optimization for ${folder}/${file}`);
  const url = name => escape(`${prefix}web-images/${name}`);
  return `src="${url(image.medium)}" srcset="${url(image.small)} ${image.smallWidth}w, ${url(image.medium)} ${image.mediumWidth}w" sizes="${sizes}"${full ? ` data-full-src="${url(image.full)}"` : ''}`;
}

const creatureCategories = [
  { id: 'depth-i', name: 'Depth I', description: 'The first things to answer The Pit\u2019s call. Lesser creatures by comparison, but no less eager to maim, hunt, or feed.', slugs: ['the-charred', 'the-bloat', 'the-cleaved', 'the-voices', 'the-nightchild'], placeholders: ['The Anguished Mother'] },
  { id: 'depth-ii', name: 'Depth II', description: 'The Pit grows less forgiving. Creatures of this Depth are stronger, stranger, and far more difficult to put down. Their bodies begin to reflect the deeper horrors below.', slugs: ['the-whisper', 'the-marrowslurper', 'the-crawler', 'the-mutilator', 'the-oculith'], placeholders: [] },
  { id: 'depth-iii', name: 'Depth III', description: 'Few things from this far beneath should ever reach the surface. These creatures are brutal, unnatural, and bring threats that extend far beyond tooth, claw, and muscle.', slugs: ['the-fear-chaser', 'the-fleshstripper', 'the-severant'], placeholders: [] },
  { id: 'depth-iv', name: 'Depth IV', description: 'The deepest horrors that still obey classification. Creatures of this Depth are exceptionally dangerous, each capable of turning a room into a slaughterhouse.', slugs: ['mag-mo-nai', 'un-gulg'], placeholders: [] },
  { id: 'alpha', name: 'Alpha', description: 'They do not belong to a Depth. They stand above it. Alpha creatures are rare apex horrors, things even the lesser spawn of The Pit would instinctively avoid. When one emerges, survival becomes the only sensible objective.', slugs: ['asmodeus', 'helvangarde', 'yggdrasil', 'child-eater', 'the-twins'], placeholders: [] },
];

function creatureGallery(items, placeholders = []) {
  return `<div class="creature-gallery">${items.map(creature => `<a class="creature-link" href="${creature.slug}/"><img ${imageAttrs('../', 'creatures', creature.galleryImage, '(max-width: 540px) 88vw, (max-width: 1000px) 42vw, 280px')} width="${creature.galleryWidth || 1024}" height="${creature.galleryHeight || 1536}" alt="" loading="lazy"><h3>${escape(creature.name)}</h3></a>`).join('\n')}
    ${placeholders.map(name => `<div class="creature-link creature-placeholder"><div class="creature-placeholder-art">Coming soon</div><h3>${escape(name)}</h3></div>`).join('\n')}
  </div>`;
}

function creatureDirectory() {
  const assigned = new Set(creatureCategories.flatMap(category => category.slugs));
  const unassigned = creatures.filter(creature => !assigned.has(creature.slug));
  return `<div class="creature-categories" role="group" aria-label="Creature categories" hidden>
    ${creatureCategories.map(category => `<button type="button" aria-pressed="false" aria-controls="${category.id}" data-category="${category.id}">${category.name}</button>`).join('\n')}
  </div>
  ${creatureCategories.map(category => `<section class="creature-category" id="${category.id}" aria-labelledby="${category.id}-heading">
    <h2 id="${category.id}-heading">${category.name}</h2>
    ${category.description ? `<p class="intro">${escape(category.description)}</p>` : ''}
    ${category.slugs.length || category.placeholders?.length ? creatureGallery(category.slugs.map(slug => creatures.find(creature => creature.slug === slug)), category.placeholders) : '<p class="category-empty">No creatures revealed yet.</p>'}
  </section>`).join('\n')}
  ${unassigned.length ? `<section class="creature-category" aria-labelledby="unassigned-heading"><h2 id="unassigned-heading">Unassigned</h2>${creatureGallery(unassigned)}</section>` : ''}
  <script src="../creatures.js" defer></script>`;
}

function render(page, soul = null, creature = null, updateCategory = null) {
  const detail = soul || creature;
  const prefix = detail || updateCategory ? '../../' : page ? '../' : './';
  const nav = content.pages.map(item => `<a href="${prefix}${item.slug}/"${page?.slug === item.slug ? ` aria-current="${detail || updateCategory ? 'location' : 'page'}"` : ''}>${escape(item.title)}</a>`).join('');
  const title = updateCategory ? `${updateCategory.title} | Updates | ${content.title}` : detail ? `${detail.name} | ${content.title}` : page ? `${page.title} | ${content.title}` : content.title;
  const body = updateCategory ? `
    <section class="page-heading">
      <a class="back" href="../">Back to Updates</a>
      <p class="eyebrow">Updates</p>
      <h1>${escape(updateCategory.title)}</h1>
      <p class="intro">Change notices for ${escape(updateCategory.title)}.</p>
    </section>
    <section class="update-notices" aria-label="Change notices">
      ${updateCategory.entries?.length ? updateCategory.entries.map(entry => `<article class="update-entry">
        <h2><time datetime="${escape(entry.date)}">${escape(entry.displayDate)}</time></h2>
        <p>${escape(entry.text)}</p>
        ${entry.bullets?.length ? `<ul>${entry.bullets.map(bullet => `<li>${escape(bullet)}</li>`).join('')}</ul>` : ''}
      </article>`).join('\n') : '<p>No updates posted yet.</p>'}
    </section>` : creature ? `
    <article class="creature-profile" aria-labelledby="creature-title">
      <a class="back" href="../#${creatureCategories.find(category => category.slugs.includes(creature.slug))?.id || 'depth-i'}">Back to The Creatures of The Pit</a>
      <div class="creature-profile-layout">
        <img class="creature-portrait" ${imageAttrs('../../', 'creatures', creature.image, '(max-width: 540px) 88vw, 460px', true)} width="${creature.imageWidth || 1024}" height="${creature.imageHeight || 1536}" alt="${escape(creature.imageAlt)}" fetchpriority="high">
        <div class="creature-profile-copy">
          <h1 id="creature-title">${escape(creature.name)}</h1>
          ${creature.introduction ? `<p class="creature-introduction">${escape(creature.introduction).replaceAll('\n', '<br>')}</p>` : ''}
        </div>
      </div>
    </article>` : soul?.introduction ? `
    <article class="soul-profile" aria-labelledby="soul-title">
      <a class="back" href="../">Back to the Soul Gallery</a>
      <div class="soul-profile-layout">
        <img class="soul-portrait" ${imageAttrs('../../', 'souls', soul.image, '(max-width: 480px) 88vw, 420px', true)} width="${soul.imageWidth || 1024}" height="${soul.imageHeight || 1536}" style="aspect-ratio: ${soul.imageWidth || 1024} / ${soul.imageHeight || 1536}" alt="${escape(soul.imageAlt)}" fetchpriority="high">
        <div class="soul-profile-copy">
          <p class="eyebrow">The Soul Gallery</p>
          <h1 id="soul-title">${escape(soul.name)}</h1>
          <p>${soul.introduction}</p>
        </div>
      </div>
    </article>` : soul ? `
    <section class="page-heading">
      <a class="back" href="../">Back to the Soul Gallery</a>
      <p class="eyebrow">The Soul Gallery</p>
      <h1>${escape(soul.name)}</h1>
    </section>
    <section class="unrevealed" aria-label="Publication status">
      <span class="status">Coming soon</span>
      <h2>This Soul&#8217;s profile has not been published yet.</h2>
    </section>` : page ? `
    <section class="page-heading">
      <a class="back" href="../">Back to the invitation</a>
      <p class="eyebrow">The Veiled Invitation</p>
      <h1>${escape(page.title)}</h1>
      ${page.slug === 'souls' ? `<div class="soul-introduction">
        <p><strong>Welcome to the Soul Gallery.</strong></p>
        <p>Here you&#8217;ll find the Souls currently invited into playtesting for <strong>The Veiled Invitation</strong>.</p>
        <p>Each one enters the tournament with their own abilities, history, and private ambitions. Some are already being tested at the table. Others are still waiting beyond the veil.</p>
        <p>As more Souls become ready for play, they&#8217;ll be added to the Gallery.</p>
      </div>` : `<p class="intro">${escape(page.description)}</p>`}
    </section>
    ${page.slug === 'souls' ? `<section class="soul-gallery" aria-label="Souls">
      ${souls.map(soul => `<a class="soul-button" href="${soul.slug}/"><span class="soul-envelope${soul.envelopeFit === 'contain' ? ' soul-envelope--contained' : ''}" aria-hidden="true"><img ${imageAttrs('../', 'souls', soul.envelope || 'veiled-envelope.png', '(max-width: 540px) 94vw, 400px')} alt="" loading="lazy"></span><span class="soul-name">${escape(soul.name)}</span></a>`).join('\n      ')}
    </section>` : page.slug === 'creatures' ? creatureDirectory() : page.slug === 'updates' ? `<div class="updates-grid">
      ${page.categories.map(category => `<a class="update-category update-category-link" href="${escape(category.id)}/" aria-labelledby="${escape(category.id)}-heading">
        <h2 id="${escape(category.id)}-heading">${escape(category.title)}</h2>
        <p class="update-category-description">${escape(category.description)}</p>
        <p>${category.entries?.length ? `${category.entries.length} update${category.entries.length === 1 ? '' : 's'} · Latest: ${escape(category.entries[0].displayDate)}` : 'No updates posted yet.'}</p>
        <span class="update-category-action">Read change notices <span aria-hidden="true">→</span></span>
      </a>`).join('\n')}
    </div>` : `<section class="unrevealed" aria-label="Publication status">
      <h2>${escape(page.empty)}</h2>
      <span class="status">Coming soon</span>
    </section>`}` : `
    <section class="hero">
      <h1 class="logo-heading"><img class="hero-logo" ${imageAttrs('', 'brand', 'The Veiled Invitation Logo.png', '(max-width: 640px) 240px, 360px')} width="1254" height="1254" alt="The Veiled Invitation" fetchpriority="high"></h1>
      <p class="hero-premise">The Host has chosen his guests. Their ambitions are their own.</p>
      <p class="intro">A horror-themed tabletop game in playtesting. Souls with their own abilities, histories, and private ambitions enter The Host&#8217;s tournament, while the horrors of The Pit wait beyond the veil.</p>
    </section>
    <section class="home-chapter" aria-labelledby="home-souls-title">
      <div class="chapter-heading">
        <div><p class="eyebrow">The invited</p><h2 id="home-souls-title">The Soul Gallery</h2></div>
        <p>Beings personally chosen by The Host. Each Soul brings a history, an ambition, and it's own reason to accept the invitation.</p>
      </div>
      <div class="home-art-grid">${['the-host', 'the-tormented-prisoner', 'the-dreadnought'].map(slug => {
        const item = souls.find(soul => soul.slug === slug);
        return `<div class="home-art-item"><img ${imageAttrs('', 'souls', item.image, '(max-width: 640px) 320px, 380px')} width="${item.imageWidth || 1024}" height="${item.imageHeight || 1536}" alt="${escape(item.imageAlt)}" loading="lazy"><h3>${escape(item.name)}</h3></div>`;
      }).join('')}</div>
      <a class="hero-button chapter-link" href="souls/">Visit the Soul Gallery <span aria-hidden="true">&rarr;</span></a>
    </section>
    <section class="home-chapter" aria-labelledby="home-pit-title">
      <div class="chapter-heading">
        <div><p class="eyebrow">What waits below</p><h2 id="home-pit-title">The Creatures of The Pit</h2></div>
        <p>From the first things to answer The Pit&#8217;s call to the rare apex horrors that wait in the deepest depths. The further you descend, the less forgiving it becomes.</p>
      </div>
      <div class="home-art-grid">${['the-charred', 'the-fear-chaser', 'asmodeus'].map(slug => {
        const item = creatures.find(creature => creature.slug === slug);
        return `<div class="home-art-item"><img ${imageAttrs('', 'creatures', item.galleryImage, '(max-width: 640px) 320px, 380px')} width="${item.galleryWidth || 1024}" height="${item.galleryHeight || 1536}" alt="" loading="lazy"><h3>${escape(item.name)}</h3></div>`;
      }).join('')}</div>
      <a class="hero-button chapter-link" href="creatures/">Explore every Depth <span aria-hidden="true">&rarr;</span></a>
    </section>
    <section class="home-chapter home-lore" aria-labelledby="home-lore-title">
      <p class="eyebrow">The unwritten</p>
      <h2 id="home-lore-title">The Lore Tome</h2>
      <p>The Lore Tome is currently being written.</p>
      <span class="status">Coming soon</span>
      <a class="text-link" href="lore/">Visit the Lore Tome <span aria-hidden="true">&rarr;</span></a>
    </section>`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(creature ? `${creature.name}, one of The Creatures of The Pit in The Veiled Invitation.` : soul ? `${soul.name} in The Veiled Invitation's Soul Gallery.` : page?.description || 'Explore The Veiled Invitation: souls, creatures, and lore.')}">
  <meta name="theme-color" content="#080809">
  <link rel="stylesheet" href="${prefix}styles.css">
</head>
<body>
  <dialog class="content-warning" open aria-labelledby="warning-title" aria-describedby="warning-description">
    <h2 id="warning-title">Content Warning</h2>
    <p id="warning-description">The Veiled Invitation contains gore, horror themes, and unsettling images. Viewer discretion is advised.</p>
    <button type="button" id="warning-confirm" disabled autofocus>OK</button>
    <noscript><p>JavaScript must be enabled to acknowledge this warning and enter the website.</p></noscript>
  </dialog>
  <div id="site-content" hidden inert>
  <a class="skip" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="header-brand">
      <a class="wordmark game-wordmark" href="${prefix}" aria-label="The Veiled Invitation homepage"><img ${imageAttrs(prefix, 'brand', 'The Veiled Invitation Logo.png', '52px')} width="52" height="52" alt=""><span>The Veiled Invitation</span></a>
      <a class="wordmark studio-wordmark" href="https://www.blackenvelopestudios.com" aria-label="Developed by Black Envelope Studios; visit the studio website"><img ${imageAttrs(prefix, 'brand', 'Black Envelope Studios Icon.png', '28px')} width="28" height="28" alt=""><span>Developed by Black Envelope Studios</span></a>
    </div>
    <nav aria-label="Main navigation">${nav}</nav>
  </header>
  ${!page && !soul && !creature ? `<div class="home-status-bar">
    <div class="studio-status" data-studio-status="${escape(studioStatus.selected)}" role="status">
      <span class="studio-status-mark" aria-hidden="true"></span>
      <span class="studio-status-copy"><span class="studio-status-label">${escape(studioStatus.title)}</span><span class="studio-status-value">${escape(studioStatus.options[studioStatus.selected])}</span></span>
    </div>
  </div>` : ''}
  <main id="main">${body}</main>
  <section class="community" aria-labelledby="community-heading">
    <h2 id="community-heading">Join the Community</h2>
    <nav class="community-links" aria-label="Community">
      <a href="https://www.reddit.com/r/BlackEnvelopeStudios/" target="_blank" rel="noopener noreferrer" aria-label="Reddit (opens in a new tab)">${redditIcon}Reddit <span aria-hidden="true">&#8599;</span></a>
      <a href="https://discord.gg/QG4KgfTXjb" target="_blank" rel="noopener noreferrer" aria-label="Discord (opens in a new tab)">${discordIcon}Discord <span aria-hidden="true">&#8599;</span></a>
    </nav>
  </section>
  <footer><span>The Veiled Invitation</span><span>Black Envelope Studios</span></footer>
  </div>
  <script src="${prefix}content-warning.js"></script>
  <script defer src="${prefix}visitor-tracking.js"></script>
  ${detail?.image ? `<script src="${prefix}artwork-viewer.js"></script>` : ''}
</body>
</html>
`;
}

await mkdir(output, { recursive: true });
await writeFile(path.join(output, 'index.html'), render(null));
for (const page of content.pages) {
  if (!/^[a-z]+$/.test(page.slug)) throw new Error('Invalid page slug');
  await mkdir(path.join(output, page.slug), { recursive: true });
  await writeFile(path.join(output, page.slug, 'index.html'), render(page));
  if (page.slug === 'updates') {
    for (const category of page.categories) {
      if (!/^[a-z-]+$/.test(category.id)) throw new Error('Invalid update category');
      const directory = path.join(output, page.slug, category.id);
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, 'index.html'), render(page, null, null, category));
    }
  }
}
await copyFile(path.join(root, 'styles.css'), path.join(output, 'styles.css'));
await copyFile(path.join(root, 'visitor-tracking.js'), path.join(output, 'visitor-tracking.js'));
await copyFile(path.join(root, 'analytics.json'), path.join(output, 'analytics.json'));
await copyFile(path.join(root, 'creatures.js'), path.join(output, 'creatures.js'));
await copyFile(path.join(root, 'content-warning.js'), path.join(output, 'content-warning.js'));
await copyFile(path.join(root, 'artwork-viewer.js'), path.join(output, 'artwork-viewer.js'));
for (const soul of souls) {
  const directory = path.join(output, 'souls', soul.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), render(content.pages.find(page => page.slug === 'souls'), soul));
}
await mkdir(path.join(output, 'web-images'), { recursive: true });
for (const file of imageFiles) {
  const image = imageManifest[file];
  for (const variant of new Set([image.small, image.medium, image.full])) {
    await copyFile(path.join(root, 'web-images', variant), path.join(output, 'web-images', variant));
  }
}
for (const creature of creatures) {
  const directory = path.join(output, 'creatures', creature.slug);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), render(content.pages.find(page => page.slug === 'creatures'), null, creature));
}
await writeFile(path.join(output, '.nojekyll'), '');
console.log(`Built the homepage, ${content.pages.length} content pages, ${souls.length} Soul profiles, and ${creatures.length} creature profiles.`);
