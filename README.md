# Alexa Smart Home skill backend

The AWS Lambda behind Linn's Alexa Smart Home skill. Alexa sends it a directive ("turn on the morning
room", "set the volume to 11"); it translates that into calls to the Linn API and answers with an
Alexa event.

## How it is wired to Alexa

The skill invokes this Lambda **directly by ARN** — there is no HTTP endpoint and no DNS in the path.
The binding has two halves:

- the **skill** (in the Alexa developer console) holds the function's ARN;
- the **function** holds the skill's id, as an `EventSourceToken` on its invoke permission, so that no
  other skill can call it. That half lives in `aws/application.yml` and is deployed from here.

The ARN is account + region + **function name**, so the function name is pinned in the template. Change
it and the skill has to be repointed in the developer console, which is a manual step needing skill
admin access. Don't.

## Build and test

```bash
npm ci
npm run build
```

Two test suites, run separately because they answer different questions:

```bash
npm test              # unit - handlers and facade in isolation
npm run test:acceptance   # acceptance - the Lambda entry point against the Alexa contract
npm run test:all
```

The acceptance suite treats the Lambda as a black box: a directive in, an event out, over a mocked
Linn API. It covers every namespace the skill claims to support and the whole error taxonomy, because
an error Alexa doesn't recognise turns into a generic apology with nothing in the logs to explain it.

## Deploy

CloudFormation, driven by `scripts/ci.sh` from Travis. A pull request against `master` deploys to
**sys**, a merge deploys to **prod**. There is no other path — deployment is gated on branch inside
`ci.sh`.

- `aws/persistence.yml` — the bucket deployment packages are uploaded to.
- `aws/application.yml` — the function, its role, its log group and the Alexa invoke permission.
- `scripts/package-lambda.sh` — builds, installs production dependencies only, zips, uploads.
- `scripts/smoke-test.sh` — runs after every deploy (see below).

Sys and prod are separate functions. Only the prod one is bound to the live skill, so a sys deployment
is exercised by the smoke test rather than by talking to Alexa.

## Smoke test

`scripts/smoke-test.sh` invokes the deployed function exactly as Alexa would, with a bearer token that
is deliberately not a JWT, and asserts the response is a correctly addressed
`INVALID_AUTHORIZATION_CREDENTIAL` error. It needs no credentials and touches no customer device,
while proving the function exists at the bound ARN, the runtime boots, the package has a working
handler, the directive is routed and the response is addressed back correctly.

It does **not** prove a real token reaches the Linn API and controls a device — that needs a linked
account, and stays a manual check.

## Dependencies

Exactly one production dependency, `jwt-decode`, used only to read the subject out of the bearer token
for logging. Everything else is a dev dependency and never reaches the deployed package. HTTP goes
through the runtime's own `fetch`.

**The lockfile is committed and must stay committed.** `.gitignore` inherits a `*-lock.json` rule from
elsewhere in the estate and carries an explicit exception for it. Without the lockfile nothing
transitive is pinned, which is how `@types/node` drifted from 14 to 26 against a TypeScript that could
not parse it and left the build dead for years.

## Development references

- <https://developer.amazon.com/docs/smarthome/smart-home-skill-api-message-reference.html>
