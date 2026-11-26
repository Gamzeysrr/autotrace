# Demo walkthrough

1. For a local presentation, launch `AutoTrace-Open.bat`. The hosted Vercel app uses the same API flow with Neon Postgres.
2. Search a sample scenario or enter a 17-character VIN. Searching is public and does not require an account.
3. Open **Institution Application** and create a fictional institution and user. Submitting an application does not grant write access.
4. Sign in with the public **AutoTrace Demo Reviewer** account and approve the application from **Application Review**.
5. The applicant signs in with the email and password they submitted. The institution type determines which report types they can submit.
6. Prepare a report. The server checks the approved account and, after verifying its Solana proof, stores the report in the database. On Vercel, the report is stored in Neon Postgres and can be retrieved by VIN from another browser session.
7. To publish a report, approve the Phantom transaction on Solana Devnet. The browser calls the AutoTrace Anchor program's `anchor_report` instruction. The server verifies the transaction signature, program ID, record ID, and report hash through Devnet RPC. A report without a matching proof is not shown in VIN search. A Phantom signature identifies a wallet; it does not prove the demo user's real-world institutional identity.

## Preset sample accounts

**AutoTrace Demo Reviewer (public jury account)**

- Email: `reviewer@autotrace.test`
- Password: `AutoTraceReview2026!`

This account can review and approve fictional institution applications. The owner's private administrator account is separate.


**Insurance**

- Email: `sigorta@ufuk-sigorta.test`
- Password: `UfukDemo2026!`

**Vehicle inspection**

- Email: `ekspertiz@mercek-ekspertiz.test`
- Password: `MercekDemo2026!`

**Service center**

- Email: `servis@rota-otomotiv.test`
- Password: `RotaDemo2026!`

All preset accounts and scenario data are fictional. There is no live institutional data integration. The hosted Vercel app uses Neon Postgres. The local demo uses SQLite. The AutoTrace program must be deployed to Devnet for the report submission flow.
