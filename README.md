# Recol: Instant Save, Instant Recall

> **Recol** is a keyboard first bookmark manager designed for speed. Built for engineers and power users who are tired of the friction in browser bookmarks.

---

### The Manifesto

Bookmarks are where ideas go to die. We bury links in folders we never open, using UIs that require too much mouse movement, only to forget they exist.

**Recol**

- **Zero Friction**: Save a link in instantly.
- **Natural Recall**: Find anything instantly with fuzzy search that understands intent, not just exact matches.
- **Deep Integration**: Keyboard-first design that respects your flow. If you have to touch your mouse, we failed.

---

### Key Pillars

#### Keyboard-First (Total Control)

Every interaction is reachable via shortcuts. We use **DOM Capture Phase** event hijacking to ensure that sites like YouTube or LinkedIn don't steal your focus while you're trying to manage your knowledge.

#### Sub-20ms Search

Powered by a background-thread **Fuse.js** index. We keep your links in memory so that searching 10,000 links feels as fast as searching ten.

#### Local-First Architecture

Your data lives in your browser's **IndexedDB** via **Dexie.js**. It's yours. It works offline. It’s private. We only sync to the cloud for cross-device continuity—not as a prerequisite for speed.

#### Defensive UI

Isolated within a **Shadow DOM** to prevent host-site CSS from bleeding in. Styled with a dark, high-performance glassmorphism aesthetic.

---

### Technical Stack

- **Framework**: React 19 (Fiber-ready components)
- **Styling**: Tailwind CSS 4 + Modern CSS Variables
- **Database**: Dexie.js (IndexedDB wrapper)
- **Search Engine**: Fuse.js (Memory-resident fuzzy search)
- **Build Tool**: Vite + CRXJS (HMR for Extension Development)

---

### Development

#### Get Started

```bash
npm install
npm run build
```

#### Commands

- `Shift + CMD + S` (Mac) / `Shift + CTRL + S` (Win): Trigger Save Dialog.
- `Shift + CMD + L` (Mac) / `Shift + CMD + L` (Win): Open Instant Search.
- `Cmd + Backspace`: Instantly delete highlighted result.
- `Arrows + Enter`: Pure keyboard navigation.
