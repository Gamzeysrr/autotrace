# Third-party notices

The demo bundles these pinned browser libraries so the comparison and wallet code does not depend on third-party CDNs at runtime:

- `vendor/pdf.min.js` and `vendor/pdf.worker.min.js` — `pdfjs-dist` 3.11.174, Apache-2.0. License text: `vendor/LICENSE-pdfjs.txt`. Upstream package: https://www.npmjs.com/package/pdfjs-dist/v/3.11.174
- `vendor/solana-web3.min.js` — `@solana/web3.js` 1.98.4, MIT. License text: `vendor/LICENSE-solana-web3.txt`. Upstream package: https://www.npmjs.com/package/@solana/web3.js/v/1.98.4

The bundled files are distributed under their respective upstream licenses. The application still needs internet access to connect to Phantom and Solana Devnet RPC.
