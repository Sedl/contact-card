# Fixed website and PCB fonts

The website serves bundled DejaVu **2.37** fonts rather than selecting a different
system font on each device. WOFF2 files are served from this directory; the
original TTF files are included for use in KiCad. Retain `LICENSE` with both.

| Website text | KiCad family | Style | Original font file |
| --- | --- | --- | --- |
| `$ whoami`, contact details, links, footer | DejaVu Sans Mono | Book / Regular | DejaVuSansMono.ttf |
| Download button | DejaVu Sans Mono | Bold | DejaVuSansMono-Bold.ttf |
| Name / main heading | DejaVu Sans | Bold | DejaVuSans-Bold.ttf |

These fonts are already installed on the development machine. On another Linux
machine, install the TTFs from the repository root:

```sh
mkdir -p ~/.local/share/fonts/visitenkarte
cp web/fonts/*.ttf ~/.local/share/fonts/visitenkarte/
fc-cache -f
```

Restart KiCad, then select the family and bold setting in the PCB text properties.
Use the TTF files, not the WOFF2 files, for desktop installation. Small PCB text
still needs a check of its final stroke widths, spacing and Gerbers; the website's
pixel sizes do not translate directly to millimetres. Existing PCB text has not
been changed by the website font update.

## Deployment and conversion

Upload the entire `fonts/` directory with `style.css` and `index.html`. The page's
CSP permits fonts from its own host. Text may briefly use a fallback while the
bundled font downloads (`font-display: swap`); no locally installed font version
is preferred over these files.

To rebuild WOFF2 files from the bundled TTFs, use Python with fontTools and Brotli:

```sh
python3 - <<'PY'
from pathlib import Path
from fontTools.ttLib import TTFont
for path in Path('web/fonts').glob('*.ttf'):
    font = TTFont(path, recalcTimestamp=False)
    font.flavor = 'woff2'
    font.save(path.with_suffix('.woff2'))
PY
```

Conversion retains all glyphs and metrics; no subsetting is applied. The original
files came from `/usr/share/fonts/TTF/` in the local `ttf-dejavu` package, with the
license copied from `/usr/share/licenses/ttf-dejavu/LICENSE`.
