# Selector-anchored interface diff

- Before: `current.domdoc.json`
- Target: `target/winner.layerdoc.json`
- DOM-side coverage: **48.1%**
- Design-side coverage: 54.3%
- Coordinates were normalized fractionally; non-position lengths use the width ratio.

> Anchor overlap is low: 48.1% of the existing page's elements matched, under the 60.0% gate. The capture was verified to be the page that was requested, so this is a design delta, not a capture mismatch: most of the target is new and arrives as added elements and raster layers. The anchored items below are still real selectors — treat the rest as new work rather than as edits.

## Matched changes

- `.eyebrow`[0/6] (#main-content>section:nth-child(1)>div:nth-child(1)>p:nth-child(1)): content `AGRA / SILVER SHOWROOM`→`AGRA  /  SILVER SHOWROOM`, box `[0.088,0.1638,0.1242,0.0137]`→`[0.088,0.204,0.1767,0.011]`, fontSizePx `11`→`13.312000000000001`, fontWeight `500`→`600`, googleFontFamily `IBM Plex Sans`→`Montserrat`, color `#dce5df`→`#e6e9e5`, align `start`→`left`
- `#main-content>section:nth-child(1)>div:nth-child(1)>h1`: content `Silver, made meaningful.`→`Silver, made
meaningful.`, box `[0.088,0.1867,0.2361,0.1782]`→`[0.088,0.24,0.276,0.154]`, fontSizePx `69.89`→`69.632`, googleFontFamily `Bodoni Moda`→`Cormorant Garamond`, align `start`→`left`
- `.hero-description` (#main-content>section:nth-child(1)>div:nth-child(1)>p:nth-child(3)): content `Timeless pieces for everyday rituals, memorable occasions and the generations that follow.`→`Timeless pieces for everyday rituals,
memorable occasions and the generations
that follow.`, box `[0.088,0.3781,0.2191,0.0711]`→`[0.088,0.436,0.2173,0.065]`, fontSizePx `16`→`16.384`, googleFontFamily `IBM Plex Sans`→`Montserrat`, color `#dce5df`→`#e2e6e2`, align `start`→`left`
- `.xl\:inline` (body>div:nth-child(4)>header>div>div:nth-child(1)>button>span): box `[0.0514,0.0405,0.0282,0.0176]`→`[0.0593,0.045,0.03,0.017]`, fontSizePx `14`→`14.336`, googleFontFamily `IBM Plex Sans`→`Montserrat`, color `#f2f5f1`→`#d3dcd8`, align `center`→`left`
- `body>div:nth-child(4)>header>div>div:nth-child(1)>nav>ul>li:nth-child(1)>a`: box `[0.33,0.042,0.0365,0.0176]`→`[0.282,0.045,0.04,0.012]`, fontSizePx `14`→`13.312000000000001`, googleFontFamily `IBM Plex Sans`→`Montserrat`, color `#f2f5f1`→`#d3dcd8`, align `start`→`left`, style.paddingBottom `14px`→∅, style.paddingTop `14px`→∅
- `body>div:nth-child(4)>header>div>div:nth-child(1)>nav>ul>li:nth-child(2)>a`: box `[0.3874,0.042,0.0416,0.0176]`→`[0.352,0.045,0.0453,0.012]`, fontSizePx `14`→`13.312000000000001`, googleFontFamily `IBM Plex Sans`→`Montserrat`, color `#f2f5f1`→`#d3dcd8`, align `start`→`left`, style.paddingBottom `14px`→∅, style.paddingTop `14px`→∅
- `body>div:nth-child(4)>header>div>div:nth-child(3)>nav>ul>li:nth-child(1)>a`: box `[0.571,0.042,0.0611,0.0176]`→`[0.6,0.045,0.0653,0.012]`, fontSizePx `14`→`13.312000000000001`, googleFontFamily `IBM Plex Sans`→`Montserrat`, color `#f2f5f1`→`#d3dcd8`, align `start`→`left`, style.paddingBottom `14px`→∅, style.paddingTop `14px`→∅
- `body>div:nth-child(4)>header>div>div:nth-child(3)>nav>ul>li:nth-child(2)>a`: box `[0.6529,0.042,0.0285,0.0176]`→`[0.6927,0.045,0.0313,0.012]`, fontSizePx `14`→`13.312000000000001`, googleFontFamily `IBM Plex Sans`→`Montserrat`, color `#f2f5f1`→`#d3dcd8`, align `start`→`left`, style.paddingBottom `14px`→∅, style.paddingTop `14px`→∅
- `.leading-none`[0/3] (body>div:nth-child(4)>header>div>div:nth-child(2)>a>span:nth-child(3)>span:nth-child(1)): kind `text`→`logo`, content `DDA SILVER`→`DDA
SILVER`, box `[0.4635,0.0544,0.1086,0.0361]`→`[0.464,0.022,0.0713,0.063]`, fontSizePx `24`→`39.936`, googleFontFamily `Bodoni Moda`→`Cormorant Garamond`, color `#f2f5f1`→`#f3f5f1`
- `.eyebrow`[1/6] (#main-content>section:nth-child(2)>div>div>p:nth-child(1)): box `[0.0313,0.626,0.1312,0.0146]`→`[0.036,0.624,0.1387,0.011]`, fontSizePx `11.52`→`11.264`, fontWeight `700`→`600`, googleFontFamily `IBM Plex Sans`→`Montserrat`, color `#092a25`→`#44605b`, align `start`→`left`
- `#main-content>section:nth-child(2)>div>div>h2`: content `Timeless silver. For every moment.`→`Timeless
Silver. For
Every Moment.`, box `[0.0313,0.6546,0.1825,0.1556]`→`[0.0353,0.658,0.1867,0.136]`, fontSizePx `41.47`→`48.128`, googleFontFamily `Bodoni Moda`→`Cormorant Garamond`, color `#172622`→`#123d37`, align `start`→`left`
- `.collection-caption`[1/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(2)>a>span:nth-child(2)): content `Idols`→`IDOLS`, box `[0.4194,0.8366,0.1212,0.0176]`→`[0.5687,0.85,0.0253,0.011]`, fontSizePx `14`→`11.264`, fontWeight `400`→`600`, googleFontFamily `IBM Plex Sans`→`Montserrat`, color `#172622`→`#46615c`, align `start`→`left`, style.display `flex`→∅, style.gap `6px`→∅
- `#main-content>section:nth-child(2)>div>nav>div>a:nth-child(5)`: content `Utensils`→`UTENSILS`, box `[0.4316,0.9165,0.0284,0.0146]`→`[0.7093,0.85,0.046,0.011]`, fontSizePx `12`→`11.264`, fontWeight `400`→`600`, googleFontFamily `IBM Plex Sans`→`Montserrat`, color `#172622`→`#46615c`, align `start`→`left`
- `.collection-caption`[3/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(4)>a>span:nth-child(2)): content `Gifts`→`GIFTS`, box `[0.7048,0.8366,0.1212,0.0176]`→`[0.8527,0.85,0.028,0.011]`, fontSizePx `14`→`11.264`, fontWeight `400`→`600`, googleFontFamily `IBM Plex Sans`→`Montserrat`, color `#172622`→`#46615c`, align `start`→`left`, style.display `flex`→∅, style.gap `6px`→∅
- `body`: content ∅→`off-white page background`, style.background `#f2f5f1`→`#f0f2f0`
- `.home-hero` (#main-content>section:nth-child(1)): kind `panel`→`photo`, content ∅→`hero silver thali arrangement on marble with flowers`, box `[0,0.0996,1,0.4746]`→`[0,0.099,1,0.474]`, style.background `#0b3029`→∅, style.display `flex`→∅
- `.z-40` (body>div:nth-child(4)>header): kind `panel`→`background`, content ∅→`dark green navigation bar`, box `[0,0,1,0.0996]`→`[0,0,1,0.1]`, style.paddingLeft 48.1px→55.3px, style.paddingTop 29px→22.5px
- `.collection-photo`[0/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(1)>a>span:nth-child(1)): kind `panel`→`photo`, content ∅→`Pooja utensils collection product image`, box `[0.2656,0.625,0.1323,0.2133]`→`[0.272,0.635,0.1287,0.202]`, style.background `#f4f1eb`→∅
- `.collection-photo`[1/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(2)>a>span:nth-child(1)): kind `panel`→`photo`, content ∅→`Coins collection product image`, box `[0.4194,0.625,0.1212,0.1955]`→`[0.422,0.635,0.1233,0.202]`, style.background `#f4f1eb`→∅
- `.collection-photo`[2/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(3)>a>span:nth-child(1)): kind `panel`→`photo`, content ∅→`Idols collection product image`, box `[0.5621,0.625,0.1212,0.1955]`→`[0.566,0.635,0.1233,0.202]`, style.background `#f4f1eb`→∅
- `.collection-photo`[3/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(4)>a>span:nth-child(1)): kind `panel`→`photo`, content ∅→`Utensils collection product image`, box `[0.7048,0.625,0.1212,0.1955]`→`[0.7093,0.635,0.124,0.202]`, style.background `#f4f1eb`→∅
- `.collection-photo`[4/5] (#main-content>section:nth-child(2)>div>nav>ul>li:nth-child(5)>a>span:nth-child(1)): kind `panel`→`photo`, content ∅→`Gifts collection product image`, box `[0.8475,0.625,0.1212,0.1955]`→`[0.8533,0.635,0.1233,0.202]`, style.background `#f4f1eb`→∅
- `.home-hero-photo` (#main-content>section:nth-child(1)>div:nth-child(2)): kind `panel`→`decoration`, content ∅→`dark translucent hero copy backdrop`, box `[0,0.0996,1,0.4746]`→`[0,0.099,0.4653,0.474]`, style.background `#efeee5`→`rgba(7,38,32,0.72)`, style.clipPath ∅→`polygon(0 0, 100% 0, 61% 100%, 0 100%)`
- `#main-content>section:nth-child(2)>div>div>p:nth-child(3)`: content `For daily rituals, thoughtful gifts and the occasions you hold close.`→`From sacred idols to everyday utensils,
from cherished coins to thoughtful gifts —
find silver pieces for every occasion
and every generation.`, box `[0.0313,0.8265,0.1626,0.0408]`→`[0.036,0.822,0.1727,0.083]`, fontSizePx `14`→`14.336`, googleFontFamily `IBM Plex Sans`→`Montserrat`, color `#53675e`→`#78817e`, align `start`→`left`
- `.header-search` (body>div:nth-child(4)>header>div>div:nth-child(1)>button): kind `button`→`icon`, content `Search`→`search`, box `[0.0313,0.0283,0.0484,0.043]`→`[0.036,0.041,0.0153,0.02]`, fontSizePx `14`→∅, fontWeight `400`→∅, googleFontFamily `IBM Plex Sans`→∅, color `#f2f5f1`→`#d3dcd8`, align `center`→∅, style.display `flex`→∅, style.gap `10px`→∅

## Added elements

- **divider** 'hero eyebrow line'
- **icon** 'user account'
- **divider** 'vertical navigation divider'
- **icon** 'shopping bag'
- **divider** 'collection eyebrow line'
- **text** 'POOJA UTENSILS'
- **divider** 'Pooja utensils label line'
- **text** 'RITUALS & TRADITION'
- **divider** 'collection card divider'
- **text** 'COINS'
- **divider** 'Coins label line'
- **text** 'A LASTING VALUE'
- **divider** 'collection card divider'
- **divider** 'Idols label line'
- **text** 'FAITH & BLESSINGS'
- **divider** 'collection card divider'
- **divider** 'Utensils label line'
- **text** 'FOR EVERYDAY LIVING'
- **divider** 'collection card divider'
- **divider** 'Gifts label line'
- **text** 'THOUGHTFUL & TIMELESS'

## Removed elements

- **text** 'DDA'
- **text** 'SILVER'
- **photo** ''
- **text** 'Deen Dayal Anand Kumar Sarraf'
- **text** 'Login'
- **text** 'Explore products'
- **photo** 'An editorial arrangement of silver tableware on a sunlit stone table'
- **text** 'Discover all silver'
- **photo** ''
- **text** 'Coin'
- **photo** ''
- **photo** ''
- **text** 'Purse'
- **photo** ''
- **photo** ''
- **text** 'Boxes'
- **panel** ''
- **text** 'Also discover'
- **text** 'Singhasan'
- **text** 'Hatri'
- **text** 'Jhula'
- **text** 'Gold Coins & Bars'
- **text** 'Phone Covers'
- **panel** ''
- **panel** ''
- **panel** ''
- **text** 'Confirm availability on WhatsApp'
