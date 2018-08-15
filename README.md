# AWS Lambda Backend

## Build

```bash
npm install
npm run build
```

## Test

```bash
npm test
```

## Deploy

Use Docker to build a deployment container:

```bash
docker build -t deploy .
```

Put deployment credentials in an `.env` file:

```
AWS_DEFAULT_REGION=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

and

```bash
docker run --env-file=.env deploy
```