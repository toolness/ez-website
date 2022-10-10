This is Eric Zimmerman's new website.

## Quick start

```
npm install
cp .env.sample .env
```

Now edit `.env` as needed. You will need to create a Notion API token with
"Read content" permissions only; it doesn't need to insert or update content,
nor will it need to read any user information.

To cache all data from Notion, run:

```
npm run fetch
```

In a separate terminal, run:

```
npm run watch
```

Now visit http://localhost:8080/ to view the site. Whenever you change any
source files or re-run `npm run fetch`, the website should update automatically
(though you will need to reload the page manually).

## CSS

CSS source is in the `css` directory, and post-processed by [PostCSS](https://postcss.org/)
with the [tailwindcss](https://tailwindcss.com/) plugin.

Changes to source CSS are automatically detected by `npm run watch`. Built CSS is
placed in the `static` folder--please don't edit this CSS directly, as it will be
overwritten the next time the source CSS changes.

## Deployment

To use the cached data to build the website, run:

```
npm run build-website
```

The website will be in `static` and can be deployed to any static web server
that supports the `index.html` convention.
