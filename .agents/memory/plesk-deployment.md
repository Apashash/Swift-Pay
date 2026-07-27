---
name: Plesk deployment
description: Plesk deployment constraints for the SwiftPay pnpm monorepo.
---

Plesk's Node.js installer may invoke npm even when the project uses pnpm. The repository must remain npm-installable for Plesk, and production artifacts need to be committed when Plesk cannot run the workspace build itself.

**Why:** Plesk initially failed on the pnpm-only preinstall guard and could not find the generated API startup file because `dist` was ignored and had not been built.

**How to apply:** Keep `npm install` compatible, build `artifacts/api-server/dist` and `artifacts/swift-pay/dist/public`, and use `artifacts/api-server/dist/index.mjs` as the Node startup file relative to the application root.