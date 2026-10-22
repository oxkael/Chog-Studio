# Chog Studio

**A comic and meme creation studio built exclusively for holders of the Chog Genesis NFT collection on Monad.**

Your Chog. Your story. No gas fees. No AI. Just your art and your words.

---

## What is Chog Studio?

Chog Studio is a browser-based creative tool that lets Chog Genesis NFT holders turn their NFTs into comic strips and memes. You connect your wallet, and if you hold a Chog, you're in. Your NFT becomes the hero of your comic — the actual original artwork, never redrawn, never AI-generated, never distorted.

You pick a page layout, drop your Chog into panels, write speech bubbles and captions, and export the finished page as a crisp PNG ready for Twitter, Discord, or anywhere else. You can also save your work as a project file and come back to it later.

The entire experience happens in the browser. There are no transactions, no gas fees, no signatures to sign. Chog Studio simply verifies that you hold a Chog Genesis NFT, and then gets out of the way so you can create.

---

## Why does this exist?

NFT communities create culture through memes and visual storytelling. But most holders don't have design tools or Photoshop skills. Chog Studio gives every holder the power to create comic pages and memes using their own NFT art — with a purpose-built tool that respects the original artwork.

The core principle is simple: **the art is sacred**. Chog Studio never applies filters, never uses generative AI, and never redraws or modifies the original NFT images. What you see in your wallet is exactly what appears in your comic.

---

## How it works

### 1. Connect and verify

When you arrive at Chog Studio, you see an animated landing page that introduces the tool and shows example comics. To enter the studio, you connect your wallet (MetaMask or any Web3 wallet). The app queries the Chog Genesis smart contract on Monad to verify you hold at least one Chog. If you do, you're in. If you don't, the app politely tells you that you need a Chog to enter.

The ownership check happens entirely on-chain using a direct `balanceOf` call to the Chog Genesis contract (`0xc96d31f8626c6d03fae5dcd3d61e3fb9f4a73763`) on the Monad network. There is no backend, no database, and no account system. Your wallet is your identity.

### 2. Choose your hero

Once inside the studio, your owned Chog NFTs are loaded automatically. If you own multiple Chogs, you can pick which one to feature. You also have access to a supporting cast — other characters from the Chog Genesis collection that you can drop into panels alongside your hero to create scenes with multiple characters.

### 3. Build your page

The studio is a three-column editor:

- **Left sidebar** — Pick your Chog, choose a page layout (2, 3, or 4 panels), and optionally generate a starter story based on your Chog's traits.
- **Center canvas** — The live comic page. Drag characters around, reposition speech bubbles, and see your comic take shape in real time.
- **Right sidebar** — Fine-tune the selected panel: adjust art size, position, zoom, crop, and flip. Write speech bubbles and captions. When two characters share a panel, each gets their own dialogue box.

You can choose from four page layouts:
- **2 panels** — stacked vertically
- **3 panels** — one wide panel on top, two below
- **3 panels stacked** — all three stacked vertically
- **4 panels** — a 2×2 grid

Each panel and each page has its own background color, chosen from a hand-picked palette of quiet, flat tones that keep the focus on the art and the story.

### 4. Write the dialogue

Every character in a panel can have a speech bubble. You type the words in the sidebar and the bubble appears on the canvas. You can drag bubbles to position them exactly where you want, and choose which side the tail points to. When two characters share a panel, pressing Enter in the first character's dialogue jumps you straight to the second character's reply — like writing a conversation.

Panels can also have captions — narration text that appears at the bottom, like scene descriptions or location tags.

### 5. Export and share

When your page is ready, you have several options:

- **Export as PNG** — Downloads a crisp, high-resolution (2× retina) image of the current page. Ready to post on Twitter/X, Discord, or anywhere.
- **Export as JSON** — Downloads the full project file with all your pages, panels, dialogue, and settings. This is your backup.
- **Import from JSON** — Load a previously exported project and keep working on it.
- **Save locally** — Saves your current work to your browser's local storage so it's there when you come back.

Comics created in Chog Studio are yours. There is no server storing them, no platform owning them. The PNG lives on your device and you decide where it goes.

---

## Making memes

Chog Studio isn't just for multi-panel comics. A single-panel layout with a speech bubble is a meme maker. Drop your Chog in, write a one-liner, export the PNG, and post it. The speech bubble system, drag positioning, and quick export make it practical for producing memes at the speed that crypto culture demands.

---

## Technical overview

### Stack

- **React 18** with **TypeScript** — the entire UI
- **Vite** — build tool and dev server
- **Tailwind CSS** + custom hand-written CSS — styling and animations
- **viem** — Ethereum/Monad chain interaction
- **html-to-image** — PNG export at 2× retina resolution

### On-chain integration

The app talks directly to the Monad blockchain. There is no backend server.

- **Ownership verification** — A raw `balanceOf` call to the Chog Genesis ERC-721 contract confirms the connected wallet holds at least one token.
- **Token discovery** — Uses Monad's Multicall3 contract (`0xcA11bde05977b3631167028862bE2a173976CA11`) to batch-scan `ownerOf` calls across the collection, identifying which specific tokens the user owns.
- **Metadata resolution** — Token metadata is resolved via `tokenURI` on-chain, with IPFS content fetched through the Pinata gateway. Frequently used characters are pre-bundled for instant loading.
- **Chain switching** — If the user is on the wrong network, the app automatically prompts MetaMask to switch to Monad (or add it if unknown).

### No AI policy

Chog Studio does not use generative AI in any form. It does not redraw NFT art, apply style transfer, generate backgrounds, or auto-write dialogue. Every pixel of NFT art displayed is the authentic original from the collection. Every word in every speech bubble is written by the user.

### Security and access control

- **Wallet-gated access** — Only Chog Genesis holders can enter the studio. Verified on-chain, not through an allowlist.
- **No signatures required** — The app never asks you to sign transactions or messages. It only reads public blockchain data.
- **No gas fees** — Nothing is written to the chain. Everything happens client-side.
- **Development test access** — A local-only test mode (via `.env.local`) allows development without owning a Chog. This code is completely removed from production builds through compile-time dead-code elimination — it cannot be activated on the deployed site.

---

## The landing page

The landing page is a scroll-driven experience with several animated sections:

- **Hero section** — Animated headline with a 3D parallax card stack of Chog characters that respond to mouse movement.
- **Showcase section** — A pinned scroll section demonstrating how comic panels are built, with speech bubbles and captions appearing as you scroll.
- **Pages section** — A horizontal scrolling track of example comic pages, with velocity-based skew effects.
- **How It Works** — A three-step walkthrough (connect wallet, pick a layout, write your words) with interactive elements and a typewriter text effect.
- **Final CTA** — A call to action with a scrolling marquee of Chog characters.

The landing page is fully accessible to everyone — you don't need a wallet or a Chog to browse it. The gate only activates when you try to enter the studio.

---

for the Chog Genesis community on Monad.
