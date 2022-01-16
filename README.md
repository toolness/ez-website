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

To cache all data from Notion, run:

```
npm run fetch
```
