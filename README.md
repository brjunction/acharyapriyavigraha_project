# Taptajīvanam 3.0

The complete, organized home of the teachings of Śrīla Gurudeva, Śrī Śrīmad Gour Govinda Swāmī.

**Status:** full design prototype (public site + admin dashboard) with sample data. Neon database and real content come next.

- Specification: [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)
- Run locally: `npm install`, then `npm run dev`, and open http://localhost:3000 (dashboard at `/admin`, sign-in at `/admin/login`)

## Design
- Identity of taptajivanam.com: saffron `#853500`, charcoal `#525252`, page `#EEECEB`, paisley footer `#592300` / `#4C1B00`, the flower-band divider and its banners.
- Quality bar of harinamamritavyakaranam.com: hover mega-menus with icon blocks, a drill-down mobile menu, Search (Ctrl K) and one Settings menu.
- Fonts: Gentium Book Plus (Taptajīvanam's own serif, full IAST) for headings and reading; Inter for the interface.
- Ornament (paisley field, flower band, lotus rosette, logo) is drawn in `src/components/motifs.tsx`.
- Menu structure lives in one place: `src/lib/nav.ts` (header, mobile menu, hubs, footer and search all read it).

Stack: Next.js (App Router) · TypeScript · Tailwind CSS v4 · lucide icons. Planned: Neon Postgres + Drizzle, Vercel.
