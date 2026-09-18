# Put the Invoxa website online

The smart contract is already deployed to BOT mainnet. Website hosting is the remaining external release step. Vercel can provide an HTTPS website address; a custom domain can be added later.

1. Sign in to Vercel and import the Git repository containing these changes.
2. Set **Root Directory** to `frontend`, framework to **Next.js**, and Node.js version to **22.x**. Only the frontend is the website build.
3. Add the values from `frontend/.env.production.example` as project environment variables for the production build and mainnet previews. Keep deployment private keys out of Vercel.
4. Deploy a preview and open `/invoice/677/0x5b5d14c50138053c6d9aa2ee38e17b3ab8d402d0/0` on its website address. It should load the confirmed rehearsal payment without existing browser storage or a wallet connection.
5. Check dashboard wallet connection, the network label, and invoice-link reloads. Promote the validated build to production and share its assigned website address.

The included `frontend/vercel.json` sets the install/build commands. See [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs) and [Root Directory configuration](https://vercel.com/docs/builds/configure-a-build#root-directory).

No hosting account was connected or website published during implementation. The selected host's account/project access is needed to complete that step.
