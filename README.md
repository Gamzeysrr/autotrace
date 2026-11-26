# AutoTrace — Verifiable Vehicle History

**AutoTrace helps a used-car buyer check where a vehicle-history report came from and whether its contents still match a tamper-evident proof.**

A buyer may find an inspection PDF in a listing, but the document alone does not make its issuer or revision history independently verifiable. Accident, insurance, inspection, and repair records also live in separate places. AutoTrace demonstrates a shared vehicle-history workflow where institutions submit sourced records and a Solana proof makes later changes detectable.

## Why would anyone use AutoTrace?

### For used-car buyers

Search by VIN, review the available records in chronological order, and see each record's source and date. Where a Solana proof exists, compare the report's digest with the on-chain record. This gives the buyer a clearer basis for asking questions before purchase.

### For inspection firms

Attach a verification link or QR code to an inspection report. A customer can check that the report matches the digest recorded at a particular time. This may help an inspection firm differentiate its service through traceability and give it an audit trail when a report's integrity is disputed.

### For insurers

Anchor the digest and timestamp of an accident or claim record so its integrity can be checked later. If multiple parties refer to the same record, they can independently check whether the content changed after the proof was created.

### For repair shops and service centers

Create a traceable record of repairs and part replacements. A vehicle owner can share that service history with a future buyer, while the shop can show which work it recorded.

These are product hypotheses, not proven savings or guaranteed commercial outcomes. A real pilot must measure whether traceability improves customer trust, reduces time spent resolving document disputes, or helps institutions win or retain business.

## Initial go-to-market hypothesis

Start with one inspection firm rather than trying to onboard the entire vehicle ecosystem at once:

1. The firm creates a report and gives the customer an AutoTrace verification link or QR code.
2. The vehicle owner shares that link with prospective buyers.
3. The buyer checks the source, timestamp, and matching proof.
4. The pilot measures report-submission effort, verification-link visits, buyer feedback, and the firm's willingness to keep using the workflow.

If that small pilot shows value, add repair and insurance records through integrations with the institutions' existing systems. A possible business model is a SaaS subscription or API for issuing and verifying reports; pricing and willingness to pay still need validation with institutions.

## How the prototype works

1. Anyone can search a VIN without signing in.
2. An institution applies for an account.
3. An AutoTrace administrator reviews and approves the application.
4. The approved account can submit only the report types allowed for its institution role.
5. The report draft is hashed. Phantom asks the user to sign a transaction calling the AutoTrace Solana program on Devnet.
6. The server verifies the transaction signature, program ID, record ID, and digest. Only then does it save the report in the database and make it available in VIN search.

## What Solana does

AutoTrace includes a custom Anchor/Rust program deployed to Solana Devnet. Its `anchor_report` instruction creates a Program Derived Address (PDA) for each report, derived from the issuer wallet and a random 16-byte record ID. The PDA stores:

- The signing wallet address
- The record ID
- A 32-byte SHA-256 digest of the report proof data
- The Solana timestamp

The report digest is salted before submission. VINs, license plates, report numbers, report text, and PDFs are kept off-chain. The program initializes a new PDA for each issuer and record ID; it has no instruction to edit an existing proof. The backend independently checks the successful Devnet transaction and its instruction data before publishing the corresponding report.

### Why use a blockchain instead of only a database?

A database is needed to store and retrieve the reports, but one database operator can change database contents. A Solana proof provides an independently inspectable, tamper-evident reference that multiple parties can check without relying only on AutoTrace's database history. In this MVP, Neon Postgres stores the report; Solana stores its integrity proof.

A hash does **not** prove that a report was truthful when it was created. It proves only that the checked content matches the digest recorded on-chain. A wallet signature identifies a wallet; this prototype does not independently prove that the wallet belongs to a real insurance, inspection, or service company.

## Live demo

- **Website:** [autotrace-alpha.vercel.app](https://autotrace-alpha.vercel.app/)
- **GitHub:** [Gamzeysrr/autotrace](https://github.com/Gamzeysrr/autotrace)
- **Solana program:** [View the AutoTrace program on Devnet Explorer](https://explorer.solana.com/address/DdgCkKAxxCm6jAy5bss4mkCq9djBw9KNHDaqxjmT7ChV?cluster=devnet)
- **Deployment transaction:** [View on Solana Explorer](https://explorer.solana.com/tx/5AqvfXM4LdZFPoJ37P6ixcSnkVVCj6TfCXMfPw6Wsz6bFiEj31GpJ1s4wE9pPtgRJPFgsAAzt2ecwsBYnt9gt9w2?cluster=devnet)
- **Backend health:** [Check the production API](https://autotrace-alpha.vercel.app/api/health). A healthy response currently reports `mode: "vercel-postgres"` and `chainRequired: true`.

### Try the demo

**Public reviewer account** — use this to review and approve fictional institution applications:

- Email: `reviewer@autotrace.test`
- Password: `AutoTraceReview2026!`

**Sample institution accounts** — use these to view the institution submission flow:

- Insurance — `sigorta@ufuk-sigorta.test` / `UfukDemo2026!`
- Vehicle inspection — `ekspertiz@mercek-ekspertiz.test` / `MercekDemo2026!`
- Service center — `servis@rota-otomotiv.test` / `RotaDemo2026!`

The application review queue contains three fictional pending requests:

- Blue Harbor Insurance — `claims@blueharbor-insurance.test`
- Clearview Inspection Group — `applications@clearview-inspection.test`
- Cedar Motor Works — `intake@cedar-motorworks.test`

If one is approved, its new demo account password is `SampleApproval2026!`. The owner's private administrator account is separate and is not published.

### Sample vehicle scenarios

- Front-end damage: `ATQ23A1B000000001`
- Hail damage: `ATQ24C2D000000002`
- Rear damage: `ATQ20E3F000000003`

These are fictional scenario codes for exploring the interface. They are not real VINs or real vehicle histories.

## What's implemented in this MVP

- Public VIN search and a chronological vehicle-history timeline
- Institution applications, administrator approval, and role-restricted report types
- A public demo reviewer account and fictional pending applications for the jury walkthrough
- Required Phantom approval for a report's Solana Devnet proof
- Server-side verification of the Devnet transaction before report publication
- Neon Postgres persistence on Vercel and SQLite for the local demo
- Independent verification of an exported AutoTrace proof package

## Scope and limitations

All included institutions, people, applications, and vehicle scenarios are fictional. AutoTrace is not connected to real insurers, inspection firms, repair shops, government databases, or real vehicle records. Do not enter real personal or company information.

The current institution approval is a prototype administrator workflow, not legal-entity verification. The system does not yet integrate with insurers' or inspection firms' existing systems, verify an institution's real-world wallet, or establish the truth of a report. VIN access in a real service would need lawful data access, vehicle-owner consent, privacy controls, and an institution identity and authorization model. The current network is Devnet, not Solana Mainnet.

A production pilot would need verified institutional identities and wallets, secure integrations, consent and access policies, backups, monitoring, a process for appending corrections, and a security review of the on-chain program and backend.

## Run the local demo

Node.js 22.15 or later is required. On Windows, launch `AutoTrace-Open.bat`. The app opens at `http://127.0.0.1:4177/` and uses SQLite at `data/autotrace.sqlite`. The launcher configures Node.js to use the Windows certificate store for Solana Devnet RPC connections.

## Technical overview

- **Frontend:** single-page HTML, CSS, and JavaScript application
- **Local backend:** Node.js HTTP server, SQLite, and Node.js crypto
- **Hosted backend:** Vercel Functions and Neon Postgres via `@neondatabase/serverless`
- **On-chain program:** Anchor/Rust program on Solana Devnet
- **Authentication:** HttpOnly, SameSite session cookies and scrypt password hashes

Database and administrator settings are supplied through server-side environment variables. Never commit private keys, seed phrases, database URLs, or the owner's administrator password.
