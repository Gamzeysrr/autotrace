# AutoTrace — Hackathon notes

**In one sentence:** AutoTrace is a vehicle-history prototype that links insurance, inspection, and service records to a VIN and makes their source and document integrity traceable.

## Product goal

When a used-car buyer searches a vehicle, they should be able to review accident, inspection, repair, and related records with their sources and timestamps. Records should be submitted by authorized insurers, inspection firms, or service centers. Because license plates can change, the VIN is used as the persistent vehicle identifier. In a real system, access to VINs must also be governed by consent and applicable law.

## What the hackathon prototype demonstrates

- Searching a fictional vehicle history by VIN and viewing records in chronological order.
- Showing a sample field discrepancy between records from different sources.
- Public vehicle search, institution login, an AutoTrace application approval queue, and role-controlled report submission.
- Storing approved-institution reports in local SQLite or, on Vercel, persistent Neon Postgres; searchable by VIN after server verification of the Solana proof.
- A custom Anchor/Rust program deployed to Devnet. The program account is executable in Explorer; its deployment signature and address are in the README.
- Writing only a SHA-256 digest, application identifier, and version on-chain while keeping vehicle identifiers and report contents off-chain.

The production health endpoint has been verified to return `mode: "vercel-postgres"` and `chainRequired: true`. A report submission still needs to be demonstrated end to end with an institution account, a Phantom-approved Devnet transaction, backend verification, and a subsequent VIN lookup.

## What the prototype does not do

- It is not connected to real insurers, inspection firms, repair shops, SBM or public data sources, or real vehicle records.
- Institution profiles do not verify a real legal entity. Sample data is not a trusted institutional signature.
- The demo administrator approves accounts, but this does not verify a real person's or company's identity. Sample accounts are shared fictional accounts.
- SHA-256 and blockchain can reveal whether an anchored document has changed later; they cannot establish that the original information was truthful or prove a vehicle's physical condition.
- The wallet that calls the program is not independently verified as an institution wallet.

Do not present AutoTrace as already showing a vehicle's complete real-world history. Describe it as a prototype for linking authorized submissions with verifiable integrity proofs.

## Production work still required

1. Verify institution membership and authorized signing keys.
2. Establish lawful data access and a consent model for insurance, inspection, and service records.
3. Keep VINs and reports encrypted off-chain and design access controls for search.
4. Define a standardized record schema signed by each institution, including key revocation and rotation.
5. Present duplicate, invalid, and conflicting submissions with their sources and trust levels.
6. Get expert guidance on personal-data protection, retention periods, and audit logs.

## Tracking hackathon contributions

Disclose that the prototype existed before the event. Once the sprint starts, separately record the date and time, contributor, new code or changes, test evidence, and links. Do not describe pre-event UI or Devnet transactions as work completed during the hackathon.
