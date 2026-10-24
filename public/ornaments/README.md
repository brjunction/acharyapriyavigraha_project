# Ornaments

Traditional Indian artwork supplied for the site, cut out to transparent PNG (backgrounds, checkerboards and stock-site watermarks removed).

- `*.png`: full-colour cut-outs (mandalas, peacocks, paisley, floral swirl, gold crest and frame).
- `*.mask.png`: single-colour line art stored as an alpha mask, recoloured in CSS with `OrnMask` (see `src/components/motifs.tsx`). Used for the paisley background and the henna border strips (`border-1` to `border-5`).

To add more: place a transparent PNG here and use `<Orn src="name" />`, or add `name.mask.png` and use `<OrnMask src="name" />`.
