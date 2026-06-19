# StreetStride Website

Atlas Calm implementation for the StreetStride marketing and support website.

## Routes

- `/` - landing page
- `/support` - App Store support URL target
- `/privacy` - Privacy Policy
- `/help` - help center
- `/contact` - contact page
- `/terms` - Terms of Use
- `/healthz` - Railway health check

## Local Run

From the repository root:

```bash
npm start
```

Then open `http://localhost:3000`.

## Railway

Railway should run the root `package.json` with:

```bash
npm start
```

The deploy config is in `railway.json`. No Cloudflare Wrangler config is used.
