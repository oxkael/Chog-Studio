# Chog Studio — Source of Truth

**Purpose:** Give coding agents and collaborators a shared understanding of what Chog Studio is, what has been decided, and what should remain flexible.

This document describes the product, not every implementation detail. Use good judgment where a decision is still open. If a proposed change would alter the product's purpose or add a significant feature, ask before expanding scope.

## 1. Product vision

Chog Studio is a web app that lets holders of a Chog Genesis NFT on Monad turn their own Chog into the main character of a comic or short story.

The NFT is central to the experience: users connect a wallet, prove they hold at least one eligible Chog, choose from their actual Chogs, and create a comic using that character. Other Chogs from the collection may appear as supporting characters where the editor supports it.

The product should feel like a playful, polished creative studio—not a generic crypto dashboard and not an AI image generator.

**Core promise:** Your Chog. Your story.

## 2. Who it is for

The primary audience is Chog Genesis holders who want to make something personal and shareable with their NFT.

The experience should be understandable to someone who is not a developer or crypto power user. Explain wallet access and eligibility clearly, and do not assume visitors understand technical blockchain terms.

## 3. Core user journey

1. A visitor arrives at a distinctive, character-led landing page.
2. They choose to connect their wallet.
3. The app checks whether the connected wallet owns at least one token from the Chog Genesis collection on Monad.
4. Eligible holders enter the studio and see the Chogs they actually own