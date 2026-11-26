# AutoTrace — Verifiable Vehicle History

AutoTrace is a prototype for bringing accident, insurance, inspection, and repair records together in a vehicle history. It helps a reviewer see who submitted each record and whether its content hash has been anchored to Solana Devnet.

## Live project

- **Website:** [autotrace-alpha.vercel.app](https://autotrace-alpha.vercel.app/)
- **GitHub:** [Gamzeysrr/autotrace](https://github.com/Gamzeysrr/autotrace)
- **Solana program:** [DdgCkKAxxCm6jAy5bss4mkCq9djBw9KNHDaqxjmT7ChV on Devnet](https://explorer.solana.com/address/DdgCkKAxxCm6jAy5bss4mkCq9djBw9KNHDaqxjmT7ChV?cluster=devnet)
- **Program deployment transaction:** [View on Solana Explorer](https://explorer.solana.com/tx/5AqvfXM4LdZFPoJ37P6ixcSnkVVCj6TfCXMfPw6Wsz6bFiEj31GpJ1s4wE9pPtgRJPFgsAAzt2ecwsBYnt9gt9w2?cluster=devnet)
- **Backend status:** The production API is connected to Neon Postgres. Visit [`/api/health`](https://autotrace-alpha.vercel.app/api/health) and look for `mode: "vercel-postgres"` and `chainRequired: true`.

## What the prototype demonstrates

- Anyone can search a 17-character VIN. The API returns records for the requested VIN only.
- Submitting a report requires an authenticated, approved institution account. A pending application does not grant write access.
- An AutoTrace administrator reviews institution applications before the account is activated.
- Institution roles restrict report types: insurers can submit accident and claim records, inspection firms can submit inspection reports, and service centers can submit repair and mileage records.
- The report content stays in the database. The app asks Phantom to sign a transaction that stores a salted SHA-256 digest and a record identifier in the custom Solana program. The backend verifies the transaction before making the record searchable.
- The hosted app uses Neon Postgres for persistent data. The local app uses SQLite.

All included institutions, accounts, and vehicle scenarios are fictional. The prototype is not connected to real insurers, inspection centers, repair shops, government databases, or vehicle records. Do not enter real personal or company information.

## Run the local demo

Node.js 22.15 or later is required. On Windows, double-click `AutoTrace-Open.bat`; no dependency installation is needed. The server starts at `http://127.0.0.1:4177/` and stores its SQLite database at `data/autotrace.sqlite`. The launcher configures Node.js to use the Windows certificate store so TLS verification works with Solana Devnet RPC.

### Fictional institution accounts

**AutoTrace Demo Reviewer (public jury account)**

- Email: `reviewer@autotrace.test`
- Password: `AutoTraceReview2026!`

Use this account to review and approve fictional institution applications. The owner's private administrator account remains separate and is not published.


Each credential is listed separately so visitors can copy and paste it into the sign-in form.

**Horizon Insurance (sample)**

- Email: `sigorta@ufuk-sigorta.test`
- Password: `UfukDemo2026!`

**Clearview Vehicle Inspection (sample)**

- Email: `ekspertiz@mercek-ekspertiz.test`
- Password: `MercekDemo2026!`

**Northstar Service Center (sample)**

- Email: `servis@rota-otomotiv.test`
- Password: `RotaDemo2026!`

The **Fill sign-in form** buttons enter the selected public demo credentials. To try the application flow, sign in with the public Demo Reviewer account, approve a fictional institution application, then sign in with the applicant's account and submit a report. The owner's private administrator credentials are kept separate and are not included in source files or packages.

## Sample vehicle scenarios

- Front-end damage: `ATQ23A1B000000001`
- Hail damage: `ATQ24C2D000000002`
- Rear damage: `ATQ20E3F000000003`

These are scenario identifiers, not real VINs. The records are fictional and exist only to demonstrate the product flow.

## AutoTrace Solana program

The custom Anchor program is in [`programs/autotrace_registry/src/lib.rs`](programs/autotrace_registry/src/lib.rs). Its `anchor_report` instruction creates a new PDA for each report and records the signing wallet, a random record identifier, a salted SHA-256 digest, and a timestamp. The program has no instruction that modifies an existing PDA, and the same wallet cannot write the same record identifier twice. VINs, license plates, report numbers, report contents, and PDFs are never sent to the blockchain.

The program was built in Solana Playground and deployed to Devnet. The server verifies the successful Devnet transaction, program ID, Anchor instruction data, record ID, and hash through `getTransaction` before publishing a report. Compiling, deploying, and verifying a program are separate steps. A deployed program alone does not prove that a report was recorded.

The project can be opened in [Solana Playground](https://beta.solpg.io/) or in an environment with Anchor CLI and WSL installed. The official Anchor setup on Windows requires WSL. Never put a private key or seed phrase in this repository, chat, or a verification package.

A report verification package may contain the VIN and report fields that are kept off-chain. Share it only with an authorized recipient.

## Vercel and persistent storage

The production `/api/*` endpoints run through `api/[...path].js` and use Neon Postgres. The local `server.js` backend continues to use SQLite. The Vercel project is connected to a Neon Free database, and the production health endpoint currently reports `mode: "vercel-postgres"`.

For a new deployment:

1. Connect a Neon Postgres database to the Vercel project. The integration supplies `DATABASE_URL`.
2. Add `AUTOTRACE_ADMIN_EMAIL` and `AUTOTRACE_ADMIN_PASSWORD` under Vercel Project Settings → Environment Variables. Keep these values in the server environment only; never commit them or expose them in browser code. The administrator account is created on the first API request. Changing the environment password later does not automatically change an existing account.
3. Redeploy the project after changing environment variables. The `/api/health` response should include `mode: "vercel-postgres"`.

The API creates the Postgres tables on its first request. It seeds fictional institution accounts when the institutions table is empty. Applications, approvals, sessions, and reports whose Solana proofs have been verified are stored in Postgres. The local administrator configuration and `data/` directory are not committed. Required variable names are listed in `.env.example`.

## Scope and limitations

AutoTrace is not a commercial vehicle registry and is not connected to real institutions. Institution access is approved by the prototype administrator; sample accounts do not establish a real person's or legal entity's identity. A PDA proves that the anchored content hash has not changed since it was recorded. It does not prove that the original report was truthful or that the vehicle had a particular physical condition. The wallet that submits a program instruction is not independently verified as belonging to an institution.

A production system would need verified institution identities and email addresses, allowlisted institution wallets, privacy and access-control policies, backups, lawful data access, and a consent model for VIN lookup. Vehicle and report data should remain off-chain and access-controlled.

## Technical overview

The frontend is a single HTML/CSS/JavaScript application. The local backend uses Node.js `http`, `crypto`, and `node:sqlite`; the Vercel serverless backend uses Node.js and `@neondatabase/serverless` with Postgres. Session cookies are `HttpOnly` and `SameSite`; passwords are stored as scrypt hashes. Database credentials are supplied through environment variables.
