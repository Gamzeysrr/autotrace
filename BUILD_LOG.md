# AutoTrace pre-hackathon build notes — November 25, 2026

This work was prepared before the Dev3pack Global Hackathon. The team should disclose the existing UI prototype and the pre-event MVP code according to the event rules. Do not present these items as work completed during the hackathon.

- Read TXT and text-based PDF reports locally and identify field-level differences.
- Store the selected file's hash in a Phantom-approved Solana Devnet Memo transaction.
- Read the Memo back from Devnet and compare it with the file hash.
- Write only the selected SHA-256 digest to the Memo and disclose in the interface that the wallet address is public.
- Bundle browser distributions of PDF.js 3.11.174 and Solana web3.js 1.98.4 locally; include third-party licenses.
- Add a one-click flow to load and compare a fictional PDF pair and calculate PDF A/B hashes without selecting files manually.
- Manual browser check: PDF.js extracted both local examples; the hood field differed, PDF A matched the reference hash, and PDF B produced a different hash.
- Recalculate the SHA-256 values for the bundled PDF A/B files and record them in the README and demo notes.
- Use browser `localStorage` for fictional vehicle and incident data.
- Add a one-click local demo launcher for Windows.
- Keep all reports fictional; no real inspection firm or user data is included.
- Complete a pre-event Devnet smoke test: the PDF A hash was recorded with a Phantom signature and independently read from Solana Devnet RPC. Transaction: `2PTL3jpTcUn1j3pTiAKwKQ49VQSDDS8sShsbzgrwcL7ZgPzgVHmDXuNn2iS2VsfbTQrtU78DEQCsZpgUUpQToeK`; slot `526136076`; `meta.err = null`. This is a pre-event verification.

When the hackathon begins, add each team contribution with its date and time, feature, contributor, and evidence link. Disclose pre-event work as required and claim only sprint-period contributions as hackathon output.
