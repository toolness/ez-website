This is Eric Zimmerman's new website.

## Quick start

```
npm install
cp .env.sample .env
```

Now edit `.env` as needed. You will need to create a Notion API token with
"Read content" permissions only; it doesn't need to insert or update content,
nor will it need to read any user information.

In a separate terminal, run:

```
npm run watch
```

(Alternatively, if you don't need to develop the site itself,
you can just run `npm run build` in the current terminal.)

To cache all data from Notion, run:

```
npm run fetch
```

To use the cached data to build the website, run:

```
npm run build-website
```

(Alternatively, if you want to have the site rebuild itself whenever any of
its dependent source files change, you can run `npm run build-website:watch`
in a separate terminal.)
