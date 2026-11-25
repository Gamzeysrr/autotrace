# AutoTrace

**Trust before transfer.** AutoTrace helps a used-car buyer inspect a vehicle's document trail: compare what two inspection reports say, fingerprint an exact report file, and publish only that fingerprint to Solana Devnet with the document owner's wallet approval.

## The problem

Inspection PDFs are easy to forward and hard to compare. Two documents can disagree about the same vehicle, while a buyer has no quick way to tell whether a report file changed after it was issued. AutoTrace makes both the conflict and the document's history visible. It does not decide which inspection is true.

## What works in this MVP

- **Local report comparison:** import TXT files or text-based PDFs, then compare normalized `Field: Value` lines. PDF text extraction runs in the browser; scanned/image-only PDFs are not OCRed. Content stays on the device.
- **SHA-256 fingerprint:** select a file and compute its digest locally. The bundled PDF A button matches the reference digest; PDF B demonstrates a different fingerprint without file-picker access.
- **Solana Devnet proof:** connect Phantom and approve a Memo signature. The app obtains its recent blockhash from Devnet, Phantom signs the transaction, then the app broadcasts the signed bytes only to the Devnet RPC endpoint and waits for confirmation. The Memo contains only the SHA-256 digest; the report itself is never uploaded or put onchain. The public transaction also exposes the wallet address that paid the Devnet fee.
- **Clear limits:** data shown in the dashboard and sample reports are synthetic. A hash proves byte-level identity after the reference was made; it does not prove the report's claims, issuer identity, or the vehicle's physical condition.

## Run the demo

1. On Windows, double-click `AutoTrace-Open.bat`. It starts the local server if needed and opens `http://127.0.0.1:4173/`. Alternatively, run `python -m http.server 4173 --bind 127.0.0.1` in PowerShell. PDF.js and Solana web3.js are bundled locally; internet is needed only for Phantom and Devnet RPC/faucet. A static HTTPS host also works.
2. Install Phantom only from [its official download page](https://phantom.com/download), then switch its Solana network to **Devnet**. Use a Devnet-only wallet with a small test balance from the [official Solana faucet](https://faucet.solana.com/); Devnet SOL is for testing and has no mainnet value. Never share a recovery phrase or private key with anyone or enter one in this app.
3. In **Rapor Karşılaştırma**, click **Sentetik PDF A/B’yi yükle ve karşılaştır** to load and parse the bundled examples in the browser. You can also select other TXT or text-based PDF reports, or edit the `Field: Value` examples.
4. In **Belge Doğrulama**, press the synthetic PDF A hash button to compute and match its fingerprint. Press the PDF B button to show a mismatch, then press A again before anchoring.
5. With PDF A's hash loaded, press **Cüzdanı bağla & hash'i kaydet**. Inspect the Memo in Phantom and confirm that it contains the selected file's SHA-256 digest. The report itself is not sent; the transaction and wallet address are public on Devnet. Wait for confirmation, then verify from the same session or select the same file again after a reload.

No backend or remote database is used. Vehicle and event demo entries are saved in local browser storage. Uploaded reports are read in-browser and never sent to a server. Devnet transactions are public and permanent; the Memo includes only the document hash, while the transaction exposes its fee payer wallet address.

## Why Solana

For the prototype, Solana provides a public transaction record with wallet authorization and a verifiable timestamp without storing the report in a public database. The MVP uses the existing Memo program, not a custom smart contract. A production version would add verified inspection-company identities, a robust report schema/OCR pipeline, privacy-reviewed access controls, and an issuer-signature flow.

## Hackathon focus

This is an open-source Solana project for the Dev3pack Global Hackathon and the SuperteamTR Türkiye track. The hackathon submission is expected during 27–29 November 2026. This UI existed before the main event; disclose it and describe the code and integrations added during the official build window in the project submission.

## Tech

Single-page HTML/CSS/JavaScript, Web Crypto SHA-256, Phantom injected wallet, bundled `pdfjs-dist` 3.11.174 and `@solana/web3.js` 1.98.4, Solana Devnet Memo program. Third-party licenses are in `vendor/`.

## Demo data

All vehicle, report, inspection-company and event information is invented for demonstration. No real plate, VIN, report, business, or customer is represented.

### Expected sample fingerprints

These are file-level SHA-256 values for the bundled PDF bytes. PDF A is the reference match in the app; PDF B intentionally differs in the hood field.

```text
autotrace-demo-report-a.pdf  FD4D228CDEE84DA3D2C6DA6E8223982C66B5B15794F8058966BF342602EF767C
autotrace-demo-report-b.pdf  D6C8069E569D53F805F26696D45C566A5E9D05C3E7EA9C1D8BACD43E201C9A7E
```

## Verified Devnet transaction

Pre-event smoke test, signed by the wallet owner and independently read back from Solana Devnet RPC:

- Transaction: [2PTL3jpTcUn1j3pTiAKwKQ49VQSDDS8sShsbzgrwcL7ZgPzgVHmDXuNn2iS2VsfbTQrtU78DEQCsZpgUUpQToeK](https://explorer.solana.com/tx/2PTL3jpTcUn1j3pTiAKwKQ49VQSDDS8sShsbzgrwcL7ZgPzgVHmDXuNn2iS2VsfbTQrtU78DEQCsZpgUUpQToeK?cluster=devnet)
- Confirmed slot: `526136076`; transaction status: successful.
- Memo: `{"app":"autotrace","v":1,"sha256":"fd4d228cdee84da3d2c6da6e8223982c66b5b15794f8058966bf342602ef767c"}`
- Network fee: `0.00008` Devnet SOL. Fee payer wallet: `ChZy2CkC2PpZTVHE7a2gTQsVDNh8jRP7AeMgUHzj69os` (public onchain data).

This is a test record created before the hackathon build window; disclose it as pre-event validation, not as a sprint contribution.
