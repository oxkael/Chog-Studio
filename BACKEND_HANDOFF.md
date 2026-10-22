# Chog Studio: backend handoff (version 2, replaces the earlier one)

Read this first. It records what was tested, what went wrong, what was decided and what to build. Do not guess facts that are listed here as verified.

## 1. What the product is

Chog Studio is a web app for holders of the Chog Genesis NFT collection on Monad. A holder turns their Chog into the star of a comic: pages with 2, 3 or 4 panels, one or two Chogs per panel, speech bubbles, captions, flat colors. The studio only opens for wallets that own at least one Chog.

Judging: Novelty 30%, Fun 20%, Retention 20%, Clarity 15%, Execution 15%. The $CHOG token is an optional bonus. The Chog NFT must be essential.

The frontend (landing page and studio) is finished as reference files in `design-reference`. This document covers the data and backend work.

## 2. Verified facts (tested on the real contract)

- Contract: `0xc96d31f8626c6d03fae5dcd3d61e3fb9f4a73763` on Monad. RPC `https://rpc.monad.xyz` connects.
- ERC-721 (`supportsInterface` true). **Not** ERC721Enumerable, so `tokenOfOwnerByIndex` does not work.
- `totalSupply()` = **1969**. Token IDs run **1 to 1969**. Token 0 and 1970 do not exist. (An earlier figure of 1990 was wrong.)
- **Token IDs and metadata file numbers differ.** `tokenURI(1)` returns `ipfs://bafybeid4ybujnscdipkno7ps5utqelp5ry5ryreqhay3zhgk3a6x4jruqu/1462.json`, and `tokenURI(1969)` ends in `1461.json`. Always call `tokenURI(id)`. Never compute or guess the file name.
- Token names differ from IDs too (token 1 is named "CHOG #1462"). Key everything by **token ID**. Show the name from the metadata.
- Metadata JSON has `name`, `description`, `image`, `attributes`. Seen traits: Background, Aura (some), Base, Skin, Side (Left or Right), Body, Mouth, Eyes, Head, Accessory (some), Form, Tier, Naked. Not every token has every trait.
- Image URIs look like `ipfs://bafybeihau2egcccbdxymeckmmbrqytbfor5gkt3en6d5fsbueymdbq7g6e/1462.webp`.
- **Gateway:** only `https://gateway.pinata.cloud/ipfs/` worked from scripts. `ipfs.io`, `dweb.link`, `w3s.link` return a 429 "service worker only" page. `4everland.io` returns a 403 challenge page.
- Images are `.webp`, about 275 to 300 KB, close-up busts with the background baked in. They are not transparent.

## 3. What happened, and why the plan changed

1. The first plan was to download metadata and images for all 1969 tokens to the owner's laptop (`chog-test` folder) with `download_all.py`, then host them.
2. The first version (0.5 s between tokens) worked for about 127 tokens, then Pinata started returning **429 (too many requests)** and nearly everything failed.
3. A slower version (3 s between tokens, rests 5 minutes after 3 failures in a row) reached about token 253, then Pinata was still returning 429. The owner stopped the script. The exact number of finished tokens is unknown; count the files in `chog-test\metadata` and `chog-test\originals`.
4. Conclusion: do **not** bulk-download from the free Pinata gateway. It is too many requests in a row. Fetching a few tokens at a time is fine.

## 4. New strategy

**Two sources of Chogs in the studio:**

- **Your Chogs (live):** when a wallet connects, the app finds the token IDs it owns, then for each one reads `tokenURI(id)` and fetches the metadata and image through the Pinata gateway. A person with 3 Chogs makes about 3 image requests. Cache results in the browser.
- **Supporting cast (static):** the Chogs already downloaded to `chog-test` are hosted with the site and offered as extra characters. A user picks their own Chog as the hero, and any cast member (or any of their other Chogs) as the second or supporting character in a panel. The art is public, so using a Chog the user does not own as a supporting character is allowed. The studio still only opens for holders.

The cast is a partial set (roughly 250 tokens, exact count to be checked). It can grow later (see Plan B).

## 5. Other decisions (unchanged)

- **Original artwork is always the default and fallback.** Never edit, replace or redraw it. No generative AI.
- **Cutouts are optional.** Offer an original/cutout toggle only for IDs in an approved `manifest.json`. A manual background remover worked on 2 of 3 tries, so it is unreliable. Everything else stays original. `rembg` produced no output on the owner's Python 3.14 (cause unconfirmed); retry later with Python 3.12.
- **Saving is device-only** (browser storage) plus Export and Import as a JSON file. No database. Keep story data plain and serializable so a database can be added later.
- **No login or SIWE** for now (no database). The wallet gate only reads public on-chain data. No signatures or transactions to connect or verify.
- **Non-holders** see a clear "you need a Chog" page. No demo Chogs.
- **Local test access only.** The owner may enter the studio without a Chog while running the app on their own computer (development mode), using a wallet address set in a local, uncommitted environment file. That wallet may pick any supporting-cast Chog as its hero, and the studio shows a small "Test access" label. In the deployed site this must do nothing: production ignores the setting and the real ownership check applies to everyone. No hidden bypass on the live site.
- **Two Chogs per panel** is supported.
- **Left out of V1:** a public showcase of user comics, server-side export or thumbnails, trading, minting, price or analytics features.
- **No invented content.** Landing page example frames stay empty until the owner supplies real examples.
- **A network or RPC error must never be shown as "you own no Chogs".** Show an error and a retry button.

## 6. Owner's environment and folders

- Windows, PowerShell, Python 3.14 (`web3` 8.0.0 and `requests` installed). The owner finds technical steps hard: explain simply, one step at a time, give exact PowerShell commands.
- `chog-test\` holds scripts and downloaded data: `download_all.py`, `metadata\<id>.json` (with `tokenId`, `tokenURI` and the metadata fields), `originals\<id>.webp`, and possibly `failed.json`. Some tokens may have metadata but no image, or the reverse.
- `Chog_studio\` is the website project. `design-reference\` holds the finished mock files and a copy of 5 test images in `originals\`. Do not put the cast downloads in that folder.
- Never edit or delete files in `chog-test\originals`. They are the untouched backup. Do not commit or deploy them.

## 7. Build order

Core path first:

1. **Ownership lookup** (server function): given a wallet address, return the token IDs it owns. Call `balanceOf` first (0 means owns none). Otherwise check `ownerOf` for IDs 1 to 1969 in batches (use a multicall contract if Monad has one; verify first). Cache briefly. Keep any RPC key on the server. If any call fails, return an error, not an empty list.
2. **Live loading of the user's Chogs:** `tokenURI(id)`, then metadata and image via Pinata, one at a time with a short delay. Cache in the browser. Loading state, and on 429 or network errors a retry button with backoff.
3. **Wallet gate and studio wiring:** the studio opens only if the lookup returns at least one token. The Chog picker shows the user's Chogs.
4. **Device-only saving** with Export and Import.

Then:

5. **Supporting cast:**
   - Find tokens that have both `metadata\<id>.json` and a valid image in `originals\<id>.webp` (open each image to confirm it is not damaged).
   - Resize to about 512 px as `web\cast\<id>.webp`. Never overwrite an original.
   - Write `cast.json` with `id`, `name`, image path and `attributes` for each.
   - Host with the site. Add a "Supporting cast" list to the studio's left sidebar so the user can drop a cast member into a panel as the second Chog.
6. **Traits drive the story:** use the Chog's attributes (Head, Eyes, Body, Mouth, Tier, Side) for the starter story. Use `Side` to set the default flip.
7. **Later:** cutouts, reviewed by eye, listed in `manifest.json`.

## 8. Plan B (if something fails)

- **Live loading from Pinata is too slow or throttled:** host resized copies of images ourselves. Options: continue the bulk download slowly in the background (10 s or more between tokens, small batches, resume where it stopped, and the script skips files it has); or try a free Pinata account with its own gateway link (not tested). Do not retry the fast bulk script.
- **Batched `ownerOf` is not workable on Monad:** check owners one by one on the server with limited concurrency and caching; or build an owner snapshot from `Transfer` logs in small block ranges (RPCs often cap ranges), refresh it periodically, and still confirm each token with a live `ownerOf` before opening the studio.
- **The host cannot run server functions:** choose one that can (for example Cloudflare Pages Functions or Vercel), or do the lookup in the browser through a public RPC and accept its rate limits.
- **Browser storage is unavailable (private mode):** Export and Import still work. Tell the user.
- **Cutouts fail:** nothing breaks. The original is the default.

## 9. Hosting notes

- Deploy: `web\cast\`, `cast.json`, `manifest.json`. Never the originals.
- Cloudflare Pages free plan (checked October 2026): 20,000 files per site, 25 MiB per file. A cast of a few hundred resized images fits easily. Other hosts have their own limits, so check before choosing.
- The hosting choice is still open. Ask the owner.

## 10. Rules for the agent

- Follow the files in `design-reference` exactly for look and behavior. Do not "improve" the design.
- Use the existing framework. Do not switch stacks. Do not change wallet or routing code unless a task needs it, and say so first.
- Build one stage at a time and test it before the next. Tell the owner what you changed in plain words.
- The local test access must never work in a production build. Add a safeguard for that.
- Never request seed phrases or private keys. Never require a transaction to connect or verify.
- Do not add features outside this document without asking.
