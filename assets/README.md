# Website assets

Place images in the folder that matches their intended use:

- `brand/`: logos, wordmarks, and other shared branding
- `home/`: landing-page artwork and backgrounds
- `souls/`: soul portraits and cards
- `rooms/`: room artwork and themes
- `creatures/`: creature artwork and cards
- `rules/`: rule illustrations and diagrams
- `lore/`: artwork for stories and the game world
- `development/`: progress images and screenshots

PNG, JPG, and WebP are good image formats. Use descriptive filenames such as `soul-name-portrait.png`; lowercase names with hyphens are easiest to reference.

Keep your original artwork here, not in `dist/`. The build copies these folders into the published site's `assets/` directory. Adding an image makes it available to the site but does not automatically place it on a page. Tell me which images you have added and where you would like them to appear.

Only put files intended for the public website in these folders. This guide and the empty-folder markers are excluded from the build.
