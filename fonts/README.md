# fonts

`style.css` self-hosts ibm plex mono here, per design rule 10 (no external
requests). drop these three files in, exactly these names:

| file | weight | style |
|---|---|---|
| `ibm-plex-mono-400.woff2` | 400 | normal |
| `ibm-plex-mono-400-italic.woff2` | 400 | italic |
| `ibm-plex-mono-600.woff2` | 600 | normal |

three faces and no more — design rule §4 loads nothing else.

source: <https://github.com/IBM/plex> (ofl-1.1), or subset the woff2 from a
google fonts download. latin subset is enough unless the ipa glyphs in the
pronunciation lines fall back — check `/ɒ/`, `/ə/`, `/ʊ/`, `/ʒ/`, `/ŋ/`, and
the combining caron-below on `writing`.

until these files exist the `@font-face` src fails and the stack falls back to
the platform monospace. that is a correct render, not a broken one — the page
is still monospace and still compliant. it just is not plex.
