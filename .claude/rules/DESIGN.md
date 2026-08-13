# design rules — convects.dev

The binding design specification for this site. Every agent working on this
codebase follows it. The reference implementation is `prototype/`; where this
document and the prototype disagree, **this document wins** and the prototype
should be corrected.

Owner: convects. Last revised: 2026-08-13.

---

## 1. concept

The site is a **dictionary**. Not a site with dictionary decoration — a site
whose every page is a dictionary entry, structured after the
[Cambridge Dictionary](https://dictionary.cambridge.org/dictionary/english/apple)
layout.

Two consequences drive everything else:

1. **There is no navigation chrome.** No header, no nav bar, no tabs, no
   footer, no menu, no logo, no buttons. Navigation lives *inside the example
   sentences*, exactly the way a printed dictionary cross-references itself.
2. **Every page fits one screen.** Entries do not scroll. The only exception
   is a post page (§9.2), which cannot be budgeted to one screen.

If a proposed feature requires chrome, it is wrong. Find the dictionary
equivalent instead.

---

## 2. hard rules

These are non-negotiable. Violating any one of them is a defect.

| # | rule |
|---|---|
| 1 | **No uppercase letters** anywhere in rendered text. Ever. |
| 2 | **Monospace only.** No proportional font is loaded or used, anywhere. |
| 3 | **No color** outside the tokens in §3. No accents, no hues, no gradients. |
| 4 | **No navigation chrome.** Links appear only inside example sentences. |
| 5 | **Entry pages never scroll.** `overflow: hidden` is the default state. |
| 6 | **Text animates with fade + slide up. Images animate with fade only.** |
| 7 | **Reveal order is reading order** — a row left to right, then the next row. |
| 8 | `prefers-reduced-motion: reduce` **disables all motion.** No exceptions. |
| 9 | **No framework, no build step.** Hand-written html, css, and vanilla js. |
| 10 | **No external requests** beyond the self-hosted font. No analytics, no cdn, no trackers. |

---

## 3. color

Dark theme only. There is no light mode and none is planned.

### tokens

```css
:root {
  /* given */
  --bg:            #171A21;  /* page background */
  --text-primary:  #F4F4F6;  /* headwords, links, item names */
  --text-body:     #E6E6E9;  /* definitions, prose, descriptions */
  --text-muted:    #9999A1;  /* part of speech, examples, metadata */

  /* derived */
  --surface:       #1E222B;  /* image wells, raised blocks */
  --rule:          #2A2F3A;  /* hairline dividers */
  --dim:           #6E6E77;  /* sense numbers, ipa, link underlines */
}
```

### usage

| token | applies to |
|---|---|
| `--bg` | `body` background. Nothing else. |
| `--text-primary` | headword, link text, project/post names, `::selection` text |
| `--text-body` | sense definitions, prose paragraphs, item descriptions |
| `--text-muted` | part of speech, example sentences, dates, item metadata, `::selection` background |
| `--surface` | image container background |
| `--rule` | the divider under the entry head, the divider above the closing example, image borders, scrollbar thumb |
| `--dim` | sense numbers, item numbers, ipa, dateline, resting link underline |

### notes

- `--surface`, `--rule`, and `--dim` were derived from the given four to
  supply the structure a dictionary layout needs. Do not add further colors
  without the owner's approval.
- **The resting link underline is `--dim` (`#6E6E77`), not `--rule`.** This
  was a deliberate correction: at `#2A2F3A` the underline is effectively
  invisible against `#171A21`, and since inline links are the site's *only*
  navigation, an invisible underline means no visible way off the page.
- Never set color on an element that does not need it. Inherit by default.

---

## 4. typography

### family

**IBM Plex Mono.** Weights 400 and 600, plus italic 400. Nothing else.

```css
--font: "IBM Plex Mono", ui-monospace, "SF Mono", "Cascadia Mono",
        Consolas, "Liberation Mono", monospace;
```

**Production must self-host `woff2` files** and declare `@font-face` with
`font-display: swap`. The prototype loads from Google Fonts for convenience
only; this must be replaced before launch, per hard rule 10.

### scale

```css
--fs-headword: clamp(2rem, 3.4vw, 2.875rem);  /* entry headword */
--fs-body:     1.0625rem;                      /* definitions, prose */
--fs-meta:     0.9375rem;                      /* pos, ipa, dates, metadata */
--lh-body:     1.75;
```

Post titles override the headword size, since a title is a sentence rather
than a word:

```css
.headword--post {
  font-size: clamp(1.5rem, 2.2vw, 1.9rem);
  line-height: 1.35;
  max-width: 34ch;
}
```

Do not introduce sizes outside this scale.

### weight and style

| element | weight | style |
|---|---|---|
| headword | 600 | roman |
| project name, post title in a list | 600 | roman |
| part of speech | 400 | *italic* |
| example sentence | 400 | *italic* |
| everything else | 400 | roman |

Italic is reserved for **part of speech and example sentences**. It carries
meaning here — do not use it for emphasis.

### lowercase enforcement

Two layers, both required:

1. **Author all content in lowercase.** Including proper nouns, place names,
   acronyms, and the first word of a sentence.
2. **`text-transform: lowercase` on `body`** as a safety net for anything
   that slips through, including future dynamic content.

Both layers exist because either alone is insufficient — the css alone leaves
uppercase in the source and in `<title>`, and authoring alone has no guard.
Page `<title>` and all `<meta>` content must also be lowercase; css does not
reach them.

Headword letter-spacing is `-0.02em`; ipa is `+0.02em`. Nothing else adjusts
tracking.

---

## 5. layout

```css
--margin-x:   15vw;   /* left and right */
--margin-top: 10vh;   /* top */
--measure:    68ch;   /* reading column cap */
```

`.page` owns the margins. `.entry` caps the measure. Two elements, because a
single one cannot do both with `box-sizing: border-box`.

```css
.page  { height: 100%; padding: var(--margin-top) var(--margin-x) 0; }
.entry { max-width: var(--measure); }
```

The measure cap exists so text does not stretch to 1800px on an ultrawide
display. The entry stays left-aligned at the 15% margin; it does not center.

**Desktop only.** Phone and tablet rules are deliberately out of scope and
not yet specified — see §14.

Prose blocks cap tighter at `60ch`.

---

## 6. entry anatomy

Every page is an entry. The order is fixed and follows Cambridge:

```
headword                 ← --fs-headword, weight 600, --text-primary
part of speech           ← --fs-meta, italic, --text-muted
pronunciation            ← --fs-meta, --dim
─────────────────────    ← 1px --rule, the entry__head bottom border
1  definition:           ← --fs-body, --text-body, ends with a colon
     example sentence    ← italic, --text-muted, indented 2ch, no quote marks
2  definition:
     example sentence
```

### rules

- **Headword, part of speech, and pronunciation each sit on their own line.**
  All three are `display: block`.
- **Definitions end with a colon**, not a period. Cambridge convention.
- **A definition of a person opens with `a person who…`** — or `the person
  who…` where the referent is unique, as in sense 1 of `index`. A headword
  that is not a person (`about`, `projects`, `writing`) takes Cambridge's own
  definition of that word, lowercased and lightly adapted for number if the
  pos line says plural. Cambridge's agent-noun forms
  are `a person who`, `a person whose job is to`, and `someone who`; of these
  the house style here is `a person`. **`one who…` is never used** — that is
  Merriam-Webster's form, not Cambridge's. Verified against *craftsman* ("a
  person who is skilled in a particular craft"), *engineer* ("a person whose
  job is to design or build machines…"), and *programmer* ("someone who
  writes computer programs as a job").
- A definition is a **noun phrase, not a sentence** — it must be able to
  grammatically replace the headword. Never "convects is a…".
- **Example sentences carry no quotation marks.** They are set apart by
  indent, italic, and color. This is Cambridge's convention and it is the
  house style here.
- **Every example sentence must contain its entry's headword.** An example
  exists to show the word in use — Cambridge's *bobby* reads "people liked
  seeing their friendly local bobby on his beat," not a sentence about police
  in general. An example with no instance of the word is not an example, it is
  a caption. Inflected and possessive forms count (`convects'`, `projects`),
  and the closing example on an entry page is bound by this too.
  **Consequence on `index`:** each example there must carry *both* the
  headword `convects` and its outbound link word (§7), since the entry is the
  home page and its examples are the only navigation off it.
  **Exception:** a post page, whose headword is a full sentence rather than a
  word (§9.2), is exempt — its closing example carries only the links back.
- Sense numbers hang in the left margin: `.sense` gets `padding-left: 3ch`,
  the `::before` counter is absolutely positioned at `left: -3ch`.
- Sense numbering uses css counters (`counter-reset: sense` on the list,
  `counter-increment` on the item), never hard-coded digits.
- **The lead definition on a single-sense page is sense zero.** `.entry__def`
  hangs a literal `0.` in the same 3ch gutter the numbered senses and items
  use — number at the entry's left edge, text indented `3ch` — so every page
  shares one number column and one content column. Prose following a lead
  definition takes the same `3ch` indent; a post page has neither. Sense zero
  is the word itself, stated before the specifics are enumerated. This digit
  is the documented exception to the no-hard-coded-digits rule above — it must
  be `content: "0."`, never an uninitialized `counter()`, which renders the
  same glyphs by accident and reads as a bug to anyone auditing the css.
- Examples indent a further `2ch` from their definition.

### pronunciation

- Use **Cambridge Dictionary US pronunciation**, in slashes.
- Current values: `about` `/əˈbaʊt/` · `writing` `/ˈraɪ.t̬ɪŋ/` ·
  `projects` `/ˈprɑː.dʒekts/` · `convects` `/kɒnˈvɛkts/`.
- `convects` is owner-supplied and takes precedence over any dictionary form.
- Write ipa as **html entities**, not raw glyphs, so encoding cannot corrupt
  it. E.g. `/&#601;&#712;ba&#650;t/`.
- Combining diacritics (the tapped `t̬` in *writing*) place inconsistently in
  monospace. Verify visually; fall back to the plain form if it breaks.

---

## 7. navigation

**The only navigation on this site is words inside example sentences.**

- The main entry's three senses each carry exactly one outbound link, in this
  fixed order: **1 about → 2 projects → 3 writing**.
- Every other page ends with a closing example, set below a `--rule` divider,
  containing the link back. `about`, `projects`, and `writing` link home via
  the word `convects`. A post links back via both `convects` and `writing`.
- The linked word must read naturally in the sentence. Never write a sentence
  around a link that would not survive without it.
- No page is reachable except through an example sentence. If a page cannot be
  reached that way, it does not belong on the site.

### link styling

```css
a {
  color: var(--text-primary);
  text-decoration: underline;
  text-decoration-color: var(--dim);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.25em;
  transition: text-decoration-color 0.18s ease, color 0.18s ease;
}
a:hover         { text-decoration-color: var(--text-muted); }
a:visited       { color: var(--text-primary); }   /* no visited distinction */
a:focus-visible { outline: 1px solid var(--text-muted); outline-offset: 3px; }
```

A link inside an italic muted example sentence renders at `--text-primary`,
which lifts it out of the sentence. That contrast is the affordance — it is
intentional, not an inconsistency.

---

## 8. motion

### parameters

```css
--anim-duration: 0.6s;
--anim-stagger:  0.5s;   /* between STARTS, not after completion */
--anim-distance: 12px;
--anim-ease:     cubic-bezier(0.22, 0.61, 0.36, 1);
```

**The stagger is measured between starts, so animations overlap.** Element *n*
begins 0.5s after element *n−1* began, not 0.5s after it finished. Total
settle time is `(steps − 1) × 0.5s + 0.6s`.

### what animates how

| content | animation |
|---|---|
| text | fade `0 → 1` **and** slide `translateY(12px) → 0` |
| images | fade `0 → 1` **only**. Never slides. |

Images fade without motion so they read as plates set into the page rather
than elements flying in.

### ordering

**Reveal order is dom order, and dom order is authored to equal reading
order.** In a grid: row one left to right, then row two left to right.

```
┌─────────┬─────────┐
│    1    │    2    │
├─────────┼─────────┤
│    3    │    4    │
└─────────┴─────────┘
```

The two-column grid on `projects` is the only place a left-to-right dimension
exists. Every other page is single column and therefore purely top to bottom.
Because css grid places items in dom order, the source order gives the correct
reveal order for free — never reorder visually with `order` or `grid-area`.

### step granularity

The hero entry reveals **line by line**; list and prose content reveals
**block by block**.

| page | steps | settles |
|---|---|---|
| `index` | 8 — headword, pos+ipa, then 3 senses × (definition, example) | 4.1s |
| `projects` | 7 — headword, pos+ipa, definition, 4 grid items, closing example | 4.1s |
| `writing` | 5 — headword, pos+ipa, definition, 1 list item, closing example | 2.6s |
| `about` | 6 — headword, pos+ipa, definition, 2 prose blocks, closing example | 3.1s |
| post | header, then one step per paragraph, then closing example | varies |

Part of speech and pronunciation reveal **together as one step**, not two.

**Keep total settle time at or under ~4.5 seconds.** If a page grows past
that, cut content or merge steps — do not shorten the stagger, which is a
global constant.

### implementation

Elements opt in with `data-reveal`. Images use `data-reveal="image"`.

```css
.js [data-reveal] { opacity: 0; }
.js [data-reveal].is-revealed {
  animation: reveal-text var(--anim-duration) var(--anim-ease) both;
  animation-delay: calc(var(--i, 0) * var(--anim-stagger));
}
.js [data-reveal="image"].is-revealed { animation-name: reveal-image; }
```

`main.js` walks the elements in dom order and sets `--i` to the step index.

**The `.js` guard is required.** An inline script in `<head>` adds `js` to
`<html>` before first paint. Without it, a visitor with javascript disabled
gets `opacity: 0` and a blank page. Every page must carry that inline script.

### scroll-triggered reveal

On a scrolling post page, content below the fold would otherwise finish
animating before the reader ever reaches it. So:

- Elements **inside the first viewport at load** run as one staggered sequence
  immediately.
- Elements **starting below the fold** wait for `IntersectionObserver` and
  reveal on entry, **once**. They never replay on scrolling back up.
- Without `IntersectionObserver`, below-fold elements are shown immediately —
  fail toward visible, never toward hidden.

On entry pages nothing is below the fold, so this path never fires.

### reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  .js [data-reveal],
  .js [data-reveal].is-revealed {
    opacity: 1;
    transform: none;
    animation: none !important;
  }
  a { transition: none; }
  .figure img { transition: none; }
}
```

Content appears instantly and completely. This is not optional and is not
subject to design preference.

---

## 9. page types

### 9.1 entry page

`index.html`, `about.html`, `projects.html`, `writing.html`.

- Never scrolls. `overflow: hidden` on `html` and `body`.
- Must be authored to fit within one viewport at 1280×800 and above.
- Follows the §6 anatomy exactly.
- Ends with a closing example carrying the link home (except `index`, which
  is home).

**Overflow is clipped silently, not scrolled.** A `projects` or `writing` page
that outgrows the viewport loses content with no visual warning. Four to six
items fit comfortably; verify at 1280×800 whenever items are added. The
two-column grid on `projects` roughly doubles capacity and is the first tool
to reach for.

### 9.2 post page

One page per piece of writing. `on-leaving-things-unfinished.html` is the
reference implementation.

**This is the only page type that scrolls.** It opts in with
`class="scrolls"` on `<html>`:

```css
.scrolls, .scrolls body { height: auto; min-height: 100%; overflow-y: auto; }
.scrolls { scrollbar-width: thin; scrollbar-color: var(--rule) var(--bg); }
.scrolls .page { height: auto; padding-bottom: var(--margin-top); }
```

The rule is **entries never scroll; posts always may**. Do not add `scrolls`
to an entry page to escape a layout problem — fix the content instead.

Post pages remap the entry head:

| slot | entry page | post page |
|---|---|---|
| headword | the word | the post title, `.headword--post` |
| part of speech | `noun`, `verb`, … | `essay` |
| pronunciation | ipa in slashes | the date, `.dateline`, in `--dim` |

A sentence has no pronunciation, so that line carries the date instead rather
than sitting empty.

- Filename is the slug: `on-leaving-things-unfinished.html`, flat at root.
- Body is `.prose` paragraphs, capped at `60ch`, one reveal step each.
- Ends with a closing example linking back to both `convects` and `writing`.

---

## 10. images

No images exist on the site yet. These rules are binding when they are added.

```css
.figure {
  background: var(--surface);
  border: 1px solid var(--rule);
  overflow: hidden;
}
.figure img {
  display: block;
  width: 100%;
  height: auto;
  filter: grayscale(1);
  transition: filter 0.3s ease;
}
.figure:hover img { filter: grayscale(0); }
```

- **Grayscale by default, full color on hover.** Color is allowed to enter the
  page only through photographic content, and only on intent.
- **Images fade in. They never slide.** Mark them `data-reveal="image"`.
- Every image needs a lowercase `alt`. Decorative images get `alt=""`.
- Always set `width` and `height` attributes — a layout shift on a page that
  cannot scroll is especially destructive.
- Prefer `webp` with a `jpg` fallback. Keep files under 200kb.

---

## 11. content and voice

- **Lowercase, always.** See §4.
- **Pronouns: they/them** for the site owner throughout, unless the owner
  specifies otherwise. Current copy in `index.html` senses 2 and 3 uses
  *they/their*.
- Definitions are **brief** — one line where possible, and they must actually
  say something about the owner rather than filling the slot.
- Example sentences read as real dictionary examples: third person, concrete,
  no second-person address, no marketing voice.
- No exclamation marks. No emoji. No em-dash-heavy asides in entry copy.
- Placeholder copy currently in the prototype is the owner's to replace and
  should not be treated as final.

---

## 12. code structure

```
prototype/
  index.html                            main entry
  about.html                            about entry
  projects.html                         projects entry
  writing.html                          writing index entry
  on-leaving-things-unfinished.html     post template
  style.css                             all styles
  main.js                               reveal only
```

- **One stylesheet, one script.** Do not split into modules or add a bundler.
- **Separate html files, real urls.** No client-side router, no hash routing,
  no single-page swapping. Navigation is a page load, which is also what makes
  the reveal animation re-run for free.
- `main.js` does exactly one thing: reveal. Anything else needs justification.
- Vanilla js, no dependencies. Written in es5 syntax with `"use strict"` — no
  build step means no transpiler.
- Class naming is loose bem: `.entry`, `.entry__head`, `.headword--post`.
- Keep the css section comments intact and in order.
- Every page needs: `<html lang="en">`, the inline `.js` class script,
  `charset`, `viewport`, a lowercase `<title>`, and the same font links.

---

## 13. accessibility

- Semantic html: `<main>` for entries, `<article>` for posts, `<h1>` for the
  headword, `<ol>` for senses and lists.
- One `<h1>` per page — the headword.
- `:focus-visible` is styled and must never be removed. It is the only way to
  see keyboard focus on a site with no other chrome.
- Link text must make sense out of context. A word like *projects* or
  *writing* does; a word like *here* does not and is banned.
- Contrast against `--bg` `#171A21`:

  | token | ratio | verdict |
  |---|---|---|
  | `--text-primary` `#F4F4F6` | 15.8:1 | AAA |
  | `--text-body` `#E6E6E9` | 14.0:1 | AAA |
  | `--text-muted` `#9999A1` | 6.2:1 | AA, AAA for large text |
  | `--dim` `#6E6E77` | 3.5:1 | **fails AA for body text** |

  `--dim` is therefore restricted to non-essential decoration — sense numbers,
  ipa, datelines, link underlines — and must never carry content a reader
  needs. Note this makes the ipa line decorative by contrast, which is
  acceptable because it is never the only route to meaning.
- Reduced motion is honored (§8).
- Never convey meaning by color alone. There is barely any color to convey it
  with.

---

## 14. browser support

Modern evergreen browsers on desktop. The css relies on custom properties,
`clamp()`, grid, and `:focus-visible`; the js relies on
`IntersectionObserver`, with a fail-visible fallback.

**Phone and tablet are explicitly out of scope and unspecified.** At the
owner's direction, no mobile breakpoints are defined yet. A `15vw` margin on a
390px screen leaves a ~273px column, which is too narrow for monospace prose —
so mobile needs a real decision, not a default. Do not invent breakpoints
without the owner. Note that a phone-sized viewport currently clips entry
content silently because of `overflow: hidden`.

---

## 15. checklist for a new page

1. Copy an existing entry page as the skeleton.
2. Lowercase `<title>`, inline `.js` script, font links, `style.css`, `main.js`.
3. Headword → part of speech → pronunciation (Cambridge US), each on its own line.
4. Senses numbered via css counters. Definitions end with a colon.
5. Examples indented, italic, muted, no quote marks. **Each one contains the
   headword** — on `index`, the link word as well.
6. A closing example containing the link home.
7. `data-reveal` on each intended step, in reading order. Images get
   `data-reveal="image"`.
8. Count the steps: `(n − 1) × 0.5 + 0.6` ≤ ~4.5s.
9. Confirm it fits one viewport at 1280×800 without clipping — unless it is a
   post, which gets `class="scrolls"` on `<html>`.
10. Verify: no uppercase rendered, no color outside §3, no chrome, keyboard
    focus visible, reduced-motion setting produces no motion.

---

## 16. open items

Not yet decided. Do not resolve these unilaterally — ask the owner.

- **Mobile and tablet.** Entirely unspecified (§14).
- **Self-hosting IBM Plex Mono.** Required before launch; prototype still
  points at Google Fonts (§4).
- **Final copy.** All definitions, examples, project entries, and post text in
  the prototype are placeholder.
- **Remaining ipa.** Cambridge blocks automated fetching, so the three
  dictionary-sourced pronunciations in §6 were written from memory and want a
  visual check against the site.
- **Cambridge grammar labels** (`noun [ C ]`) and **CEFR level badges**
  (`A1`, `B2`) — both offered, neither adopted. Badges are colored in
  Cambridge and would need a gray treatment to fit §3.
- **Overflow policy as content grows** (§9.1). Currently: author to fit,
  reach for the two-column grid, clip silently past that.
- **Favicon, og tags, 404 page.** None exist. A 404 styled as *word not found*
  is the obvious dictionary move.
