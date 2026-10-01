# Assets

All photographs are from Unsplash under the free [Unsplash License](https://unsplash.com/license) (no Unsplash+ images). They were downloaded, resized to 2000px on the long edge, saved as JPEG (quality 72) in `public/images/`, and are served with `next/image`. Photographers are credited on `/en/credits` and `/fr/credits`, linked from the footer.

| File | Unsplash page | Photographer | Used on |
|-|-|-|-|
| `public/images/offer-letter.jpg` | https://unsplash.com/photos/woman-signing-on-white-printer-paper-beside-woman-about-to-touch-the-documents-HJckKnwCXxQ | [Gabrielle Henderson](https://unsplash.com/@gabriellefaithhenderson) | Home, use case "Offer letters" |
| `public/images/creative-licence.jpg` | https://unsplash.com/photos/young-woman-drawing-at-a-desk-in-a-cozy-room-vY56afJh-pU | [Hanna Lazar](https://unsplash.com/@potokvarte) | Home, use case "Creative licences" |
| `public/images/collective-approval.jpg` | https://unsplash.com/photos/people-reviewing-documents-in-workspace-wR56AUlEsE4 | [Andreea Avramescu](https://unsplash.com/@minakko) | Home, use case "Collective approvals" |

The three photos share a warm, natural-light grade; on the site they get a light `saturate(0.85) sepia(0.12)` filter so they sit on the bond-paper palette.

## Built in code (no image files)

| Asset | Where |
|-|-|
| SignChain wax-seal mark and wordmark (`src/components/site/seal.tsx`) | Header, footer, mobile menu, completed envelopes |
| Favicon (`src/app/icon.svg`) and standalone mark (`public/brand/signchain-mark.svg`) | Browser tab, project image |
| Open Graph image (`src/app/[locale]/opengraph-image.tsx`) | Social previews, per locale |
| Document sheet, fingerprint printer, signature strokes derived from signature bytes | Hero, app, verifier |
| Tamper diff, EIP-712 message panel, registry interface and verify snippets | `/verify`, wallet prompt, `/how-it-works` |

Icons: [lucide-react](https://lucide.dev) (ISC license).
