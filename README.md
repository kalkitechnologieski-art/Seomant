# Seoman

Internal SEO, AEO, and GEO command board by KALKI Intelligence. The production host is [seo-man.vercel.app](https://seo-man.vercel.app/). The board is `noindex, nofollow`.

The marketing site it measures is [kalki-intelligence.in](https://kalki-intelligence.in). This repository does not change that site or the kalkios repository.

## Hourly refresh

`vercel.json` schedules `GET /api/cron/measure` at minute 30 of every UTC hour. That instant is the top of the hour in Asia/Calcutta.

The job calls PageSpeed Insights for the home page, the Enterprise SEO offer, and `/chat`, once for mobile and once for desktop. It stores the snapshot in Vercel Blob (or a local `.data` file outside Vercel). The board reads that snapshot with a 3600-second revalidation and refreshes when the job writes. This path does not call Grok Bot.

Cron requests must send `Authorization: Bearer $CRON_SECRET`. Vercel adds that header when `CRON_SECRET` is set on the project. Cron runs on production deployments.

## Update now

The command view has a secondary **Update now** button. It does not run on a timer. One click sends a single signed POST to `WEBHOOK_URL` and then stops. The signature is `sha256` HMAC of `${timestamp}.${rawBody}` using `WEBHOOK_SECRET`, in the `X-Seoman-Signature` header. A second request inside 15 minutes is refused. If either env var is missing, nothing is sent.

## Environment

See `.env.example`.

| Name | Required | Purpose |
| --- | --- | --- |
| `CRON_SECRET` | Yes, in production | Authenticates the hourly job |
| `BLOB_READ_WRITE_TOKEN` or `BLOB_STORE_ID` | Yes, for durable history | Vercel Blob snapshot archive |
| `BLOB_ACCESS` | No | Set to `public` only for a public store. Default is private |
| `PAGESPEED_API_KEY` or `GOOGLE_API_KEY` | No | PageSpeed Insights. Failures are stored as failures |
| `WEBHOOK_URL` | No | https endpoint for Update now. Leave empty until it exists |
| `WEBHOOK_SECRET` | No | Shared secret for the signed Update now request |
| `SEOMAN_GATE` | No | Optional share token. Unset leaves the noindex board open |

## Local

```bash
npm install
npm test
npm run dev
```
