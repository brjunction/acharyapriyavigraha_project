# Taptajīvanam 3.0: Product Requirements and Build Specification

> *tava kathāmṛtaṁ tapta-jīvanaṁ*
> "The nectar of Your words and the descriptions of Your activities are the life and soul of those suffering in this material world." (Śrīmad-Bhāgavatam 10.31.9)

| | |
|---|---|
| **Document status** | v1.1 (adds gourgovindaswami.org), foundation spec. Nothing gets built until this document is approved. |
| **Prepared** | 24 October 2026 |
| **Subject of the site** | Śrīla Gurudeva: Śrī Śrīmad Gour Govinda Swāmī |
| **Founder of the site** | HH Haladhara Swāmī Mahārāja, disciple of Śrīla Gurudeva |
| **Replaces / absorbs** | taptajivanam.com (the PHP site, "Taptajivanam 2.0") and all content of gourgovindaswami.org ("Ānanda Sambāda", Google Sites) |
| **Code repository** | `brjunction/acharyapriyavigraha_project`. The old code is removed and the project rebuilt from zero. |
| **Database** | Neon (serverless Postgres) |
| **Hosting** | Vercel |

---

## Table of contents

1. [Vision and guiding principles](#1-vision-and-guiding-principles)
2. [Naming, honorifics and editorial policy](#2-naming-honorifics-and-editorial-policy)
3. [What exists today (inventory of taptajivanam.com)](#3-what-exists-today-inventory-of-taptajivanamcom)
3A. [Second source: gourgovindaswami.org](#3a-second-source-gourgovindaswamiorg)
4. [What we learn from Vanipedia and Vedabase](#4-what-we-learn-from-vanipedia-and-vedabase)
5. [Information architecture and main menu](#5-information-architecture-and-main-menu)
6. [Śrīla Gurudeva hub](#6-śrīla-gurudeva-hub)
7. [His Teachings hub](#7-his-teachings-hub)
8. [Tattva-kośa: the topic treasury (our version of "umbrella terms")](#8-tattva-kośa-the-topic-treasury)
9. [Translations](#9-translations)
10. [Search](#10-search)
11. [Settings (reader preferences)](#11-settings-reader-preferences)
12. [Home page](#12-home-page)
13. [Shared experiences: reader, audio player, video, gallery](#13-shared-experiences)
14. [Admin dashboard](#14-admin-dashboard)
15. [Users, roles and permissions](#15-users-roles-and-permissions)
16. [Data model (Neon / Postgres)](#16-data-model-neon--postgres)
17. [Technical architecture](#17-technical-architecture)
18. [Migration from taptajivanam.com](#18-migration-from-taptajivanamcom)
19. [SEO, indexing and open access](#19-seo-indexing-and-open-access)
20. [Design system](#20-design-system)
21. [Quality: performance, accessibility, security, preservation](#21-quality-requirements)
22. [Delivery phases and acceptance criteria](#22-delivery-phases-and-acceptance-criteria)
23. [What we will NOT build](#23-what-we-will-not-build)
24. [Open questions](#24-open-questions)

---

## 1. Vision and guiding principles

**Vision.** This site becomes the complete, authoritative, organized home of Śrīla Gurudeva's teachings on the internet: every lecture, transcription, book, letter, quote, photo and video, fully indexed, cross-linked, searchable, translated into many languages, and preserved for future generations. Whatever someone looks for, whether a sentence half-remembered from a lecture, a verse, a topic, a place or a date, they find it in seconds, with exact source and attribution.

Vanipedia shows how an ācārya's teachings can be organized at scale. We take that depth of organization and present it in a modern, calm, beautiful interface that keeps the familiar character of Taptajīvanam.

**Guiding principles**

| # | Principle | What it means in practice |
|---|---|---|
| P1 | **Fidelity first** | Gurudeva's words are never altered. Transcriptions keep their original wording; every edit is versioned and attributable. |
| P2 | **Everything is sourced** | Every quote, excerpt and clip links back to its source (lecture, date, place, timestamp or page). |
| P3 | **Everything is connected** | A lecture links to its transcript, verses cited, topics, place, year, related quotes, photos of that day and translations. Nothing is a dead end. |
| P4 | **Discoverable by people and by search engines** | Fast pages, clean URLs, structured data, sitemaps, and full text rendered on the server. |
| P5 | **Blocks, not dropdown mazes** | Hubs are visual pages of blocks (cards and tiles), not deep dropdown menus. Every hub fits on one screen at a glance and opens out into detail. |
| P6 | **Simple to manage** | Every piece of content, menu, homepage block, footer item and setting is managed in the admin dashboard. Nobody needs a developer to publish. |
| P7 | **Multilingual from day one** | Every content type supports translations; the interface itself is translatable. |
| P8 | **Built to last** | Open formats, exportable data, backups, permanent URLs and redirects from every old URL. |

---

## 2. Naming, honorifics and editorial policy

1. **Śrīla Gurudeva** is the site-wide name for Śrī Śrīmad Gour Govinda Swāmī, used in menus, headings and all site-authored copy. Full form where needed: *Śrī Śrīmad Gour Govinda Swāmī*. We do not write "Mahārāja" after his name in site-authored text.
2. **Verbatim archival text** (transcriptions, letters, book text, others' memories) is kept exactly as recorded, including speaker labels as they appear in the original. *(Open question Q1: whether to normalise speaker labels inside transcripts.)*
3. **HH Haladhara Swāmī Mahārāja** is credited as founder of Taptajīvanam, with his own page under "Lineage & associates".
4. **Diacritics.** Sanskrit and Bengali terms use IAST diacritics (Śrīmad-Bhāgavatam, kṛṣṇa-prema). Search must work without them as well (see §10).
5. **Attribution line format** on every quote and excerpt:
   `— Śrīla Gurudeva · Lecture on SB 1.2.6 · 21 Jan 1996 · Bhubaneswar, India · 12:41` (each part is a link).
6. **Copyright notice.** Each content type carries its rights holder (Gopal Jiu Publications, Tattva Vicāra Publications, Taptajīvanam) as metadata, shown on the page.
7. **Thank list.** The existing Thank List (written by Yati Śekhara Dāsa, Padminī Ekādaśī, 29 July 2023) is migrated *word for word*, with every name, region and role, and becomes editable in the dashboard.

---

## 3. What exists today (inventory of taptajivanam.com)

Research of the live site on 24 Oct 2026. Counts are as displayed by the site.

### 3.1 Current menu

| Menu | Sub-items | Old URL |
|---|---|---|
| Home | — | `/index.php` |
| Gour Govinda Swami | Śrīla Prabhupāda; Śrīla Gour Govinda Swami; Life Description; ISKCON Bhubaneswar; Letters; Disciple List; Memories; HH Haladhara Swami Maharaja | `/srila-prabhupada.php`, `/who-is-gour-govinda-swami.php`, `/life-description.php`, `/iskcon-bhubaneswar.php`, `/letters.php`, `/disciples.php`, `/memories.php`, `/haladhara-swami-maharaja.php` |
| Books | 3 publishers | `/books.php`, `/view-books.php?id=`, `/view-magazines.php?id=`, `/view-book-details.php?id=` |
| All Audio Lectures | Basic search; Advanced search; Search by topics | `/simple-audio-lectures.php`, `/audio-archive.php`, `/simple-audio-lecture-topics.php` |
| Transcriptions | — | `/all-transcriptions.php` |
| Videos | Video previews / excerpts | `/videos.php`, `/view-videos.php` |
| Quotes | 44 categories | `/categories.php`, `/view-category.php?id=` |
| Images | 38 tags | `/images-filter.php`, `/view-images.php?img_key=` |
| Contact | — | `/contact.php` |
| (linked) News & updates | — | `/recent-updates.php` |
| (linked) Thank list | — | `/thank-lists.php` |

### 3.2 Content inventory

| Content | Current state | Notes for migration |
|---|---|---|
| **Audio lectures** | **1,595** entries, from 1985 to 1996 plus undated | Detail URL `view-archive.php?<YYMMDD>---<title>---<place>&a_id=<n>`. Fields: title, type (Full lecture, Darśana, Festival…), date, place, book/verse, audio file (external MP3), transcription. |
| **Transcriptions** | **130** lectures with full text | Grouped by year, plus Ācāryas' appearance/disappearance days, Festivals, Q&A, Undated. Contain speaker labels, `[break]`, `[Aside]`, verse blocks with bold citations. |
| **Audio topics** | **112** topics (A–Y), "work in progress" | Becomes the seed of the Tattva-kośa (§8). |
| **Quotes** | **44** categories | Quote + image + attribution (event, date, place). Quote images in `/custom_uploads/quotes_images/`. |
| **Books** | 3 publishers: Gopal Jiu Publications, Tattva Vicāra Publications, Taptajīvanam Publications. Books, magazines, e-books, articles. | Book fields: title, author, publisher, language, binding, release date, pages, edition, description, purchase link. |
| **Letters** | **29**: 25 between Śrīla Prabhupāda and Śrīla Gurudeva; 4 with others; section for disciples (empty) | `view-letters.php?l_id=` |
| **Memories** | **4** disciple memories, each with a YouTube video and text | Speaker, video, testimony. |
| **Life Description** | "Gopal Jiu: the beloved Deity of Śrīla Gour Govinda Swami": acknowledgement, dedication, invocation, preface, chapters 1–5 | Becomes a readable book in the Reader. |
| **Images** | **38** tags: places (Australia, Bali, Murwillumbah, Radhadesh, USA…), themes (Portraits, Deities, Festivals, Initiation…), years (1985, 1986, 1991, 1993, 1995) | `view-images.php?img_key=<tag>` |
| **Videos** | YouTube channel `@taptajivanam`, previews/excerpts | |
| **News & updates** | ~25 posts | |
| **Disciple list** | List of initiated disciples | |
| **Home banners** | 5 slides `/custom_uploads/banner_img/1–5.png` | Reuse. |
| **Graphics** | `sp.png`, `ggs.png`, `leaf-divider.png`, `images/sign.png` (signature), quote images | Reuse all in the new design. |
| **Languages** | English (main), Bahasa, Hindi, Odia, Dutch, Russian (listed as "coming soon") | |
| **Footer** | Social: Instagram, Facebook, WhatsApp group, YouTube. Locations: ISKCON Pattamundai (Śrī Śrī Rādhā-Gopaljiu Gośālā, Odisha 754215) and ISKCON Bhubaneswar (Śrī Śrī Kṛṣṇa-Balarāma, Odisha 751015). Contact: taptajivanam@gmail.com, +91 96687 21555. "Dedicated to Śrīla Gour Govinda Swami". | Keep all of it; every item editable. |

### 3.3 Weaknesses of the current site that we fix

- Audio search returns flat lists; there is no faceting by year, place, scripture or topic at the same time.
- Transcripts aren't linked to audio timestamps; there's no "jump to this sentence".
- Quotes, topics and lectures aren't cross-linked.
- No verse index (which lectures discuss SB 1.2.6?).
- PHP query-string URLs (`?a_id=1154`) are poor for SEO.
- "Languages coming soon" with no translation workflow behind it.
- No reader settings (font, size, dark mode).
- Updating content depends on technical people.

---

## 3A. Second source: gourgovindaswami.org

**gourgovindaswami.org** ("Ānanda Sambāda", a Google Sites site run by Śrīla Gurudeva's disciples and followers) holds a lot of material that taptajivanam.com doesn't. **All of its content is brought into the new site**, with credit to the original authors and the Ānanda Sambāda team, and with their agreement (Q12).

### 3A.1 Inventory and where each part lives in the new site

| gourgovindaswami.org section | Contents | New home |
|---|---|---|
| **Krishna Sent Him** | Introductory biography | Gurudeva hub › *Who is Śrīla Gurudeva* (themed essay) |
| **A Brief Life Story** | Short biography | Gurudeva hub › *Who is Śrīla Gurudeva* |
| **The Carita: Śrīla Gour Govinda Swāmī Carita** | Verse biography by Śrī Kalakaṇṭha Prabhu (Odia), English translation by Śrī Jagannātha Miśra Prabhu | Gurudeva hub › **Carita** (book reader, original + translation side by side) |
| **With Śrīla Prabhupāda** | First meeting and their relationship | Gurudeva hub › *Śrīla Prabhupāda* block |
| **The Disappearance Pastimes** (+7 sub-pages) | Accounts by Nimāi, Madanālasā Devī Dāsī, Līlā Avatāra Prabhu, Vaijayantī-mālā Dāsī; extracts from *When Good Fortune Arises*, *Gopal Jiu…*, *A Life Sketch* (Parantapa, Rāghava Paṇḍita, Gokula Dāsa) | Gurudeva hub › new block **Disappearance pastimes** (collection of accounts, each with author) |
| **Gauḍīya Siddhāntācārya** | Teaching on his position as siddhāntācārya | Gurudeva hub › *Who is Śrīla Gurudeva* + Teachings › Articles |
| **Prayers** (4) | *Śrī Gour Govinda Swāmy-aṣṭakam*, *Śrī Guru-paramparā*, *Vaiṣṇava Śaraṇa*, *Paramānanda He Mādhava* | Teachings › **Prayers & Songs** (text, translation, audio when available) |
| **The Newsletter (Ānanda Sambāda)** + mailing list | Newsletter since April 1991, back issues (Issue 36+) | Teachings › Articles & writings › **Ānanda Sambāda newsletter archive** (issue by issue, PDF + text, searchable); newsletter sign-up form in footer |
| **A.S. on YouTube** | Video channel | Videos (YouTube sync source) |
| **News, Updates and Appeals** | News, announcements (e.g., devotees' departures), appeals | News & updates, with a category **Appeals** |
| **Departed God-brothers and God-sisters** (5+) | Tributes: Śacīnandana Dāsa, Sādhu Hṛdaya Prabhu, HH Svayambhū Swāmī, Yamunā Devī Dāsī, Goloka Vṛndāvana Dāsa … | Gurudeva hub › Remembrance › new block **In memoriam: his disciples** |
| **Some Disciples** (2 pages) | Biographies of disciples | Gurudeva hub › *Disciples* (biography pages linked from the disciple list) |
| **Publications – TVP, GJP** | Books by Tattva Vicāra and Gopal Jiu Publications, recently published books, books by his disciples, *Kṛṣṇāliṅgita Vigraha* official biography series, 50-years-of-sannyāsa book & magazine, *Tattva Darśana*, *Quotes on Guru-tattva*, *Prema-pradāta Śrī Guru*, *When Good Fortune Arises*, GJP *Bindu* e-magazine | Teachings › Books (merged with taptajivanam books; a new type **Books by disciples**, kept separate from Gurudeva's own books) |
| **Book Downloads** | Free PDF downloads | Books › each book's *Download PDF* button + a **Free downloads** filter |
| **Oriya Biographies of Śrī Kṛṣṇa Caitanya Mahāprabhu** | *Mahā-bhāva Prakāśa*, *Vaiṣṇava Līlāmṛta*, *Gaurāṅga Bhāgavata*, *Caitanya Cakāḍā* (translation project) | Teachings › new block **Odia Vaiṣṇava literature** (book reader with Odia original + English translation) |
| **Some ISKCON Sādhus** | Pages on ISKCON sādhus connected with him | Gurudeva hub › *With other sādhus* |
| **A Few Mahātmās** | E.g., *The Reluctant Academic: Professor Fakir Mohan Das* | Gurudeva hub › *With other sādhus* › Mahātmās |
| **The Temples** (7) | Kṛṣṇa-Balarāma Temple Bhubaneswar · Rādhā-Gopāljiu, Gaḍeigiri · Brahmapura Śrī Rāma-Govinda Mandir · Śrīpāṭa at Jagannāthapura · Jantaribol Temple · Pattamundai · Daṇḍa-bhaṅga Āśrama | Gurudeva hub › Projects › **Temples he established** (directory with map, history, photos, darśana times, contact) |
| **The Archives Project** | Archiving effort | Gurudeva hub › About the archive + credits on the Thank List page |
| **Janmasthān Temple Project** (Purī) | Fundraiser to preserve his birthplace; contacts in USA, Australia, UK, India, Bali | Gurudeva hub › Projects › **Janmasthān (birthplace) project** with contacts and how to help |
| **Gour Govinda Āśrama guest rooms, Purī** | Seven rooms for pilgrims | Projects › Janmasthān / Purī page (contact info only; no booking system) |
| **VĀṆĪSAṄGA WhatsApp group** | Daily quotes | Footer *Connect* + Quote of the day ("Get daily quotes on WhatsApp") |
| Photo galleries & embedded videos | Many photos across pages | Gallery (new albums, with credits) + Videos |

### 3A.2 Migration notes
- It's a Google Sites site: content is extracted page by page (text, images, embedded PDFs, YouTube embeds), keeping author names and original page URL as provenance.
- Each migrated item records **source site** and **original author/translator**, shown on the page ("Originally published by Ānanda Sambāda").
- Books by disciples and accounts by others are clearly labelled as *not* Śrīla Gurudeva's own words, so search results and citations never mix them up.
- Duplicates with taptajivanam.com (e.g., *Gopal Jiu* biography, life sketches, books) are merged into one item that lists both sources.

---

## 4. What we learn from Vanipedia and Vedabase

### 4.1 Vanipedia (organization model)

Vanipedia arranges Śrīla Prabhupāda's legacy into two top branches, **"Śrīla Prabhupāda"** (who he is) and **"His Teachings"** (what he taught), each with dozens of sub-collections, and every collection has an **"ALL – n"** index. Each collection can be browsed by **type, place, year, person and language**, with counts.

Patterns we adopt (in our own design and words):

| Vanipedia pattern | Our version |
|---|---|
| Who is Śrīla Prabhupāda (themed pages) | *Who is Śrīla Gurudeva*: themed essays (childhood, mission, humility, Gopāl Jiu, Prabhupāda's order…) |
| Life timeline, "His Days", "His Months" | *Life timeline* + *This day in Śrīla Gurudeva's life* (366 days) |
| His Diaries | *Diaries*: Daily Diary shorts + other diaries |
| Disciples remembering him | *Memories & glorifications* |
| Nectar drops, analogies, stories, jokes, expressions | *Compilations*: Nectar Drops, Analogies, Stories & Anecdotes, Prayers, Ślokas he loved |
| Lectures / conversations / letters by type, place, year | Faceted browsing of every collection |
| Audio by length band | Filter by duration |
| Umbrella terms / categories | *Tattva-kośa* (§8), our own concept index |
| Participating languages, counts per language | *Translations* hub with live coverage per language |
| Random quote | *Inspire me* button |

**What we do differently:** one unified site instead of four sister wikis; hub pages of blocks instead of long link lists; synchronized audio + transcript; modern search; admin dashboard instead of wiki editing.

### 4.2 Vedabase (reading model)

We adopt: a clean library → book → chapter → text reader; verse display (Sanskrit/Bengali → transliteration → word-for-word → translation → commentary) with toggles for each layer; reader settings (font, size, theme); language selector; fast global search with filters.

---

## 5. Information architecture and main menu

### 5.1 Main menu (desktop header)

```
[Logo · Taptajīvanam]   Śrīla Gurudeva   His Teachings   Tattva-kośa   Translations   [🔍 Search …⌘K]   [Aa Settings]   [Language ▾]
```

- **Śrīla Gurudeva** opens the hub (§6). On hover, a *mega-panel of blocks* (not a dropdown list) previews the hub's main blocks.
- **His Teachings** opens the hub (§7), with a mega-panel preview the same way.
- **Tattva-kośa** opens the topic treasury (§8). *(Requested menu was: Śrīla Gurudeva, His Teachings, Translations, Search, Settings. Tattva-kośa is proposed as the replacement for Vanipedia's "Umbrella terms". If you'd rather keep the menu to the five you asked for, it moves inside His Teachings. See Q2.)*
- **Translations** opens the translations hub (§9).
- **Search** is a persistent search field in the header; ⌘K / Ctrl+K opens a command palette from anywhere (§10).
- **Settings** is an "Aa" icon that opens a side drawer (§11).
- **Language** switches the interface and content language.

**Mobile:** compact header with logo, search icon and "Aa". Bottom tab bar: *Home · Gurudeva · Teachings · Search · More*. The audio mini-player sits above the tab bar.

### 5.2 Footer (kept from Taptajīvanam, refined)

- Leaf-divider graphic and Gurudeva's signature (`sign.png`) at the top
- The verse *tava kathāmṛtaṁ tapta-jīvanaṁ* with translation
- Columns: **Explore** (hub links) · **Connect** (Instagram, Facebook, WhatsApp, YouTube) · **Our locations** (Pattamundai, Bhubaneswar, with map links) · **Contact** (email, phone, contact form)
- **Gratitude strip:** "Built with love by disciples, grand-disciples and followers. → Our Thank List"
- Sister sites: Gopal Jiu Publications, Tattva Vicāra Publications, Ānanda Sambāda (gourgovindaswami.org)
- Newsletter sign-up (Ānanda Sambāda) and "Daily quotes on WhatsApp" (Vāṇīsaṅga)
- "Dedicated to Śrīla Gour Govinda Swāmī" · copyright · privacy · Open data
- All footer content is editable in the dashboard (§14.6).

### 5.3 URL structure (permanent, readable, language-prefixed)

```
/{lang}/                                   home
/{lang}/gurudeva                           Śrīla Gurudeva hub
/{lang}/gurudeva/life                      Life description (book reader)
/{lang}/gurudeva/timeline                  Timeline
/{lang}/gurudeva/on-this-day/10-24         This day in his life
/{lang}/gurudeva/diaries/daily             Daily Diary
/{lang}/gurudeva/letters/1974-01-01-prabhupada-to-gurudeva
/{lang}/gurudeva/gallery/portraits
/{lang}/teachings                          His Teachings hub
/{lang}/teachings/audio/1996-01-21-the-mercy-of-srila-prabhupada-bhubaneswar
/{lang}/teachings/audio?year=1996&place=bhubaneswar&scripture=sb
/{lang}/teachings/books/after-the-disappearance-of-sri-guru/ch-1
/{lang}/teachings/quotes/the-holy-name
/{lang}/teachings/verses/sb/1/2/6          every place he discussed SB 1.2.6
/{lang}/tattva/guru-tattva                 topic page
/{lang}/translations/hi                    Hindi hub
/{lang}/search?q=…
```

Every old `.php` URL is redirected (301) to its new URL (§18.4).

---

## 6. Śrīla Gurudeva hub

`/gurudeva` is a **block page** (bento grid): large hero portrait and a short introduction, then the blocks below. Each block shows an image, a title, a one-line description and a live count ("29 letters"). Blocks group into sections; the order, images and visibility of every block are managed in the dashboard.

### 6.1 Section A: Who he is

| Block | Contents |
|---|---|
| **Who is Śrīla Gurudeva** | Brief life sketch (migrated) + themed essays: early years, Kīrtana gurus, meeting Śrīla Prabhupāda, Prabhupāda's order for Bhubaneswar, sannyāsa, preaching worldwide, departure (Māyāpur, 1996). |
| **Life Description** | *"Gopal Jiu: the beloved Deity of Śrīla Gour Govinda Swāmī"* in the book reader: acknowledgement, dedication, invocation, preface, chapters 1–5. |
| **Carita** | *Śrīla Gour Govinda Swāmī Carita*, verse biography by Śrī Kalakaṇṭha Prabhu, English by Śrī Jagannātha Miśra Prabhu (from gourgovindaswami.org). |
| **Official biography** | *Kṛṣṇāliṅgita Vigraha* series, volume by volume. |
| **Disappearance pastimes** | Accounts of his departure by disciples and witnesses, each with author. |
| **Life timeline** | Interactive vertical timeline 1929–1996 with year markers; each event links to photos, lectures and letters from that period. Yearly pages ("1993: Ratha-yātrā, Australia, Radhadesh…") list everything we hold from that year. |
| **This day in his life** | For today's date: lectures given, letters written, photos taken, events, on any year. 366 pages, linked from the home page. |
| **Where he travelled** | World map of every place he lectured (from lecture metadata). Click a place for everything recorded there. |

### 6.2 Section B: His Diaries

| Block | Contents |
|---|---|
| **Daily Diary** | Short daily videos from **HH Haladhara Swāmī Mahārāja's YouTube channel, published as Shorts**. Auto-imported (§14.5): vertical-video feed, one per day, with date, title, description and transcript/caption if available. Calendar view; "today's diary" on the home page. |
| **Gopāl Jiu Diary** | Diary entries connected with Śrī Śrī Rādhā-Gopāl Jiu (format to be confirmed, Q4): text, images and/or video, organized by date. |
| **Other diaries** | Generic "Diary" collection the admin can create (for example, travel diaries, festival diaries). Each has entries with date, place, text, media. |

### 6.3 Section C: His relationships and lineage

| Block | Contents |
|---|---|
| **Śrīla Prabhupāda** | His beloved spiritual master: page + their 25 letters + photos together. |
| **Guru-paramparā** | Visual disciplic succession (Brahma-Madhva-Gauḍīya sampradāya), each ācārya with a short page. Protects and presents the lineage. |
| **Letters** | 29+ letters, grouped as: with Śrīla Prabhupāda · with disciples · with others. Each letter: date, from → to, place, scan image (if available), transcribed text, translation. |
| **Disciples** | Disciple list (initiation name, year, place; privacy-aware: admin decides what's public). |
| **HH Haladhara Swāmī Mahārāja** | Founder of Taptajīvanam: biography, preaching mission, founding of the site. |
| **With other sādhus** | His association with Vaiṣṇavas of other Maṭhas and ISKCON leaders (from gallery tags), plus *Some ISKCON sādhus* and *A few Mahātmās* pages. |

### 6.4 Section D: His projects and holy places

| Block | Contents |
|---|---|
| **ISKCON Bhubaneswar** | History, mud-hut he built, temple construction, the temple today (migrated + gallery tags). |
| **Śrī Śrī Rādhā-Gopāl Jiu** | His beloved Deity: history and darśana gallery. |
| **ISKCON Pattamundai, Rādhā-Gopāljiu Gośālā** | Project page. |
| **Temples he established** | Kṛṣṇa-Balarāma (Bhubaneswar), Rādhā-Gopāljiu (Gaḍeigiri), Śrī Rāma-Govinda Mandir (Brahmapura), Śrīpāṭa (Jagannāthapura), Jantaribol, Pattamundai, Daṇḍa-bhaṅga Āśrama: map + page each. |
| **Janmasthān project, Purī** | Preserving his birthplace; how to help; contacts by country; Gour Govinda Āśrama guest rooms. |
| **Other projects** | Admin-managed project pages (title, place, story, images, links). |

### 6.5 Section E: Remembrance

| Block | Contents |
|---|---|
| **Gallery** | All photo albums (§13.4): portraits, early days, deities, festivals, travels, by year, personal belongings, his holy lotus feet… |
| **Memories** | Disciples and followers remembering him: video + text testimony, speaker name and relation. Admin can add many more. |
| **In memoriam: his disciples** | Tributes to departed god-brothers and god-sisters. |
| **Disciple biographies** | Life stories of disciples ("Some disciples"). |
| **Glorifications & offerings** | Vyāsa-pūjā offerings, appearance/disappearance day glorifications, poems, by year and by author. |
| **Personal belongings** | Gallery with description of each item. |
| **Holy appearance & disappearance days** | Calendar of his and his ācāryas' days with the related lectures. |

---

## 7. His Teachings hub

`/teachings` is a block page with a clear hierarchy.

### 7.1 Primary block: the three pillars (largest tiles, top of page)

```
┌──────────────────┬──────────────────┬──────────────────┐
│  📖 BOOKS         │  🎧 AUDIO          │  ▶ VIDEOS          │
│  n books · n mags │  1,595 lectures    │  n videos           │
│                   │  130 transcribed   │                     │
└──────────────────┴──────────────────┴──────────────────┘
```

#### Books
- Library grouped by publisher (Gopal Jiu, Tattva Vicāra, Taptajīvanam, Vāṇīsaṅga) and by type (book, booklet, magazine, e-book, article, newsletter); separate shelf **Books by his disciples**; filter **Free downloads**.
- Book page: cover, title, author, publisher, language editions, edition, pages, release date, description, table of contents, *Read online* (if text is available), *Buy* link, *Download PDF* (if permitted), quotes from this book, topics.
- **Reader** (§13.1) for books whose text we hold: chapter navigation, verse blocks with layer toggles, footnotes, highlights, share a passage as an image, citation copy.
- Magazines: issues by year with cover grid.

#### Audio lectures
- **Browse with facets** (combinable, with counts): year · month · place/country · type (lecture, darśana, festival, Q&A, kīrtana, initiation, conversation) · scripture (BG, SB, CC, other) with chapter/verse · topic · language spoken · duration band (<15, 15–30, 30–60, 60–90, 90+ min) · *has transcription* · *has translation in [language]*.
- Views: list (default) · by year (accordion of years) · by place (map) · calendar.
- **Lecture page:** title; date; place; scripture reference; type; duration; player; synchronized transcript (§13.2); verses cited (auto-detected, linked to §7.3); topics; quotes from this lecture; photos from that date/place; translations available; download MP3; citation; "next/previous chronologically"; "more from this place / this verse".
- **Audio files stay where they are** (external MP3 URLs); the database stores only the link, duration and checksum. A link-checker (§14.7) flags broken audio.
- **Transcriptions** are a property of a lecture, but also have their own index page ("All 130 transcriptions") for people who want to read.

#### Videos
- YouTube-backed library: playlists/series, lectures on video, excerpts, memories, kīrtanas.
- Video page: embedded player (privacy-enhanced youtube-nocookie), title, date, place, description, linked lecture (if it's a video of an audio lecture), transcript, topics.
- Managed from the dashboard; can import from YouTube channels and playlists (§14.5).

### 7.2 Compilations block

A second row of medium tiles. Each compilation is a curated collection of excerpts, every excerpt linked back to its exact source and timestamp.

| Compilation | Contents |
|---|---|
| **Quotes** | All quote categories (44 migrated, extendable). Quote card: text, attribution, source link, image version, share. "Inspire me" random quote. |
| **Nectar Drops** | Short 1–3 sentence gems, one per day; image cards in many languages, shareable. |
| **Analogies** | His analogies ("When the sun rises, the lotus blossoms…") indexed by subject. |
| **Stories & Anecdotes** | Stories he told (Purāṇic, from his life, from Odisha); title, summary, full excerpt, source. |
| **Questions & Answers** | Q&A sessions split into individual questions, each a searchable unit with its answer excerpt. |
| **Instructions to devotees** | Practical instructions (sādhana, chanting, behaviour), by theme. |
| **Prayers & Songs** | Prayers he composed or sang, bhajanas he led, and prayers to him (*Śrī Gour Govinda Swāmy-aṣṭakam*, *Śrī Guru-paramparā*, *Vaiṣṇava Śaraṇa*, *Paramānanda He Mādhava*), with text, translation and audio. |
| **Ślokas he loved** | Verses he quoted most, ranked by number of lectures, each linked to all its discussions. |
| **Thematic compilations** | Admin-curated anthologies ("On the Holy Name", "On Guru-tattva", "On Separation"), shown like small books. |
| **Glossary** | Sanskrit/Bengali/Odia terms as he used them, with explanations in his own words and links. |

### 7.3 Scripture index block ("Verses he spoke on")

- Browse by scripture → canto/chapter → verse: **Bhagavad-gītā, Śrīmad-Bhāgavatam, Caitanya-caritāmṛta, Caitanya-bhāgavata, Brahma-saṁhitā, Upaniṣads, Bhakti-rasāmṛta-sindhu**, and others.
- Each verse page: verse text (when available), every lecture that has it as its main subject, every lecture that cites it (with timestamp), quotes about it.
- Verse references are detected automatically in transcripts (patterns like "SB 1.2.6", "Bhāg. 1.2.6", "CC Madhya 15.104", "Gītā 18.66") and confirmed by editors.

### 7.4 Letters, conversations and darśanas block
- Letters (also in §6.3), Darśanas and conversations, Interviews: each faceted by year, place, person.

### 7.5 Articles & writings block
- Articles, essays and editorials (migrated "articles"), news written about him, and Taptajīvanam publications.
- **Ānanda Sambāda newsletter archive** (since 1991) and GJP *Bindu* e-magazine: issue pages, PDF + searchable text.

### 7.6 Odia Vaiṣṇava literature block
- Odia biographies of Śrī Caitanya Mahāprabhu (*Mahā-bhāva Prakāśa*, *Vaiṣṇava Līlāmṛta*, *Gaurāṅga Bhāgavata*, *Caitanya Cakāḍā*) with original and translation side by side, and translation progress shown.

---

## 8. Tattva-kośa: the topic treasury

Vanipedia's "Umbrella terms" is a large concept index. We build our own, with our own name and structure.

**Proposed name: *Tattva-kośa*** ("treasury of truths"). Alternatives: *Siddhānta-sāra*, *Topic Treasury*, *Vāṇī-kośa*, *Tattva-darśana*. (Q2.)

### 8.1 What it is
A hierarchical, multilingual index of **concepts**, where every concept page gathers *everything* Śrīla Gurudeva said about that subject across all content types.

```
Tattva-kośa
├── Kṛṣṇa-tattva ── Kṛṣṇa's pastimes · Kṛṣṇa's mercy · Rādhā-Kṛṣṇa · …
├── Gaura-tattva ── Mahāprabhu's advent · mood · teachings · associates …
├── Guru-tattva ── Guru · Disciple · Sādhu-saṅga · Initiation · Paramparā …
├── Jīva-tattva ── Soul & Supersoul · Constitutional position · Karma …
├── Bhakti ── Śravaṇam · Holy Name · Sevā · Surrender · Prema · Separation …
├── Obstacles ── Anarthas · Vaiṣṇava-aparādha · Lust · Envy · Pride · Māyā …
├── Society & practice ── Varṇāśrama · Family life · Brahmacarya · Cow · Prasādam …
├── Philosophy ── Māyāvāda · Various religions · Tattva-vicāra · Kali-yuga …
├── Holy places ── Vṛndāvana · Navadvīpa · Purī · Jagannātha · Vaikuṇṭha …
└── Personalities ── Ācāryas · Devotees · Demons and demigods …
```

The 112 existing audio topics and 44 quote categories are merged, de-duplicated and placed into this tree (editor task in Phase 2).

### 8.2 A concept page shows
- Name (IAST + plain spelling + translations), short definition in Gurudeva's own words (a key quote)
- Parent / child / related concepts (graph view optional)
- Tabs with counts: **Quotes · Lectures (with timestamps) · Transcript excerpts · Books & chapters · Videos · Stories · Q&A · Verses**
- "Start here": 3–5 editor-picked essential lectures on this topic
- Available in every translated language

### 8.3 Other indexes in the Tattva-kośa section
- **People index:** every person he speaks about (Prahlāda, Haridāsa Ṭhākura, Bhaktivinoda Ṭhākura…)
- **Places index:** holy places mentioned (different from places where he lectured)
- **Scripture index:** (§7.3)
- **Year index:** 1985 → 1996
- **A–Z index:** everything alphabetical, Vanipedia-style "ALL – n" counts on every list

### 8.4 Tagging rules
- Tags attach at three levels: whole item (lecture), segment (time range / paragraph), and excerpt (quote).
- Editors tag; an **AI-assisted suggestion tool** can propose tags and verse references from transcripts, but **nothing is published without a human editor's approval.**

---

## 9. Translations

### 9.1 The Translations hub (`/translations`)
- A tile per language with: native name, flag-free icon (languages are not countries), coverage bars (e.g., "Hindi: 312 quotes · 18 transcriptions · interface 100 %"), latest translations, team credits.
- Starting languages (from current site): **English, Bahasa Indonesia, Hindi, Odia, Dutch, Russian.** Planned: Bengali, Spanish, Portuguese, French, German, Italian, Chinese, Ukrainian, Nepali, Tamil, Telugu, Marathi, Gujarati, and any language the admin adds (no code change needed).
- "Help translate" page explaining how volunteers join (contact form → admin creates a translator account).

### 9.2 What can be translated
Every content type: lecture titles & descriptions, transcriptions (paragraph by paragraph), quotes, nectar drops, books/chapters, letters, memories, concept names, gallery captions, the interface (menus, buttons, labels).

### 9.3 How translations behave for readers
- Language switcher changes interface + content. When a piece isn't translated, show the English original with a gentle note "Not yet available in Hindi — help translate".
- **Side-by-side mode** for transcriptions and books: original | translation, paragraph aligned.
- Translated transcripts stay synchronized to audio (paragraph timestamps are shared).
- Translator credits shown on each translated item.
- Right-to-left support built in (for future Arabic/Urdu/Persian).
- Fonts that cover Devanagari, Odia, Bengali, Cyrillic, etc. (§20).

### 9.4 Translation workflow (dashboard)
`Not started → In translation → In review → Approved/Published` (+ "Needs update" when the source text changes after translation). Each language can have its own translators and reviewers (§15). Includes a side-by-side translation editor, glossary of fixed terms per language (for consistent rendering of "sādhu-saṅga" etc.), and optional machine-translation draft (clearly marked as draft, never published unreviewed).

---

## 10. Search

Search is the heart of the site. Two entry points: the header search field and **⌘K / Ctrl+K command palette** anywhere.

### 10.1 What it searches
All content types in one index: lectures (metadata + full transcription text), quotes, books (text where held), letters, memories, diaries, videos, concepts, gallery captions, pages, in every language.

### 10.2 Matching intelligence
| Need | Behaviour |
|---|---|
| Diacritics-insensitive | `srimad bhagavatam` = `Śrīmad-Bhāgavatam`; `krsna` = `krishna` = `kṛṣṇa` |
| Transliteration-tolerant | IAST, Harvard-Kyoto, ITRANS, common English spellings (`Gour/Gaura/Gaur`, `Jiu/Jew/Ji`), Devanagari/Bengali/Odia script |
| Typo-tolerant | fuzzy matching (`mahaprabu` finds `Mahāprabhu`) |
| Exact phrase | `"when the sun rises"` finds the exact sentence |
| Verse lookup | typing `SB 1.2.6`, `BG 18.66`, `CC Madhya 15.104` jumps to the verse page |
| Date lookup | `21 Jan 1996`, `1996-01-21`, `960121` jumps to that lecture |
| Place lookup | `Bhubaneswar 1993` filters |
| Meaning search (Phase 3) | "how to overcome envy" returns relevant passages even without the exact words (semantic vector search) |

### 10.3 Results page
- Grouped by type with counts (Quotes 12 · Lectures 48 · Transcript passages 130 · Books 3 …), or a single "Best matches" list.
- Each result: highlighted snippet, full attribution, and for transcript passages an **▶ Play from here** button that starts the audio at that sentence.
- Facets on the left (same as §7.1) plus language.
- Sort: relevance · date · duration.
- Shareable URLs for every search.
- "Did you mean…" suggestions and zero-result help (suggest related concepts).

### 10.4 Command palette (⌘K)
Instant results while typing; also jumps to pages ("Letters", "Gallery 1993"), actions ("Dark mode", "Change language"), and recently viewed items.

---

## 11. Settings (reader preferences)

Opened with the "Aa" icon as a side drawer; changes apply live; saved on the device (and to the account if the reader is signed in, Phase 3).

| Setting | Options |
|---|---|
| Theme | Light · Dark · Sepia (paper) · System |
| Reading font | Serif (default) · Sans · Dyslexia-friendly |
| Font size | slider, 14–26 px |
| Line height | compact · comfortable · spacious |
| Text width | narrow · medium · wide |
| Diacritics | show IAST (Śrīmad) · simplify (Srimad) |
| Script for verses | Devanagari · Bengali · Odia · transliteration only |
| Verse layers | show/hide: original, transliteration, word-for-word, translation, commentary |
| Interface language | any active language |
| Content language preference | ordered list (e.g., Hindi, then English) |
| Audio | default playback speed (0.75–2×), auto-scroll transcript on/off, continue playing next lecture |
| Motion | reduce animations |
| Data saver | low-quality images, no autoplay |
| Reset | restore defaults |

---

## 12. Home page

Ordered blocks, each switchable and re-orderable from the dashboard (§14.6):

1. **Hero:** large portrait of Śrīla Gurudeva, the verse *tava kathāmṛtaṁ tapta-jīvanaṁ*, prominent search field ("Search 1,595 lectures, quotes, books…"). The 5 existing banners can rotate here.
2. **Today:** three cards side by side: *Quote of the day* (with image and source), *Today's Daily Diary* (short video), *This day in Śrīla Gurudeva's life*.
3. **Continue listening / reading** (if the visitor has history on this device).
4. **The three pillars:** Books · Audio · Videos, with live counts.
5. **Explore by topic:** 8–12 Tattva-kośa concept chips.
6. **Śrīla Gurudeva:** introduction + blocks to Life, Timeline, Letters, Gallery, Memories.
7. **Recently added:** latest lectures, transcriptions, translations (news feed).
8. **Languages:** tiles with coverage.
9. **Gratitude:** short text + link to Thank List.
10. **Footer** (§5.2).

---

## 13. Shared experiences

### 13.1 Reader (books, transcriptions, letters, life description)
- Typography-first layout, settings from §11
- Table of contents sidebar; progress bar; "x min read"
- Verse blocks with layer toggles; footnotes as pop-overs
- Select text → *Copy with citation* · *Share as image* · *Highlight* · *Copy link to paragraph*
- Every paragraph has a permanent anchor (`#p-42`) for linking
- Print-friendly stylesheet; PDF export of a transcription (Phase 2)
- Previous / next item navigation

### 13.2 Audio player
- **Persistent sticky mini-player** that keeps playing across page navigation (the existing repo already has a `StickyPlayer` idea; rebuilt).
- Play/pause, seek, ±15 s, speed 0.5–2×, volume, sleep timer, queue ("Play next", "Add to queue"), download, share **at current time** (`?t=12m41s`).
- **Synchronized transcript**: current paragraph highlighted, click any paragraph to jump there, auto-scroll toggle. Timestamps per paragraph stored in DB (editors align them in the dashboard; Phase 3 option: automatic alignment).
- Media Session API (lock-screen controls on phones).
- Remembers position per lecture ("Resume at 24:10").
- Plays external MP3 URLs (no audio stored in our database).

### 13.3 Video
- Lazy-loaded YouTube embeds (thumbnail first, player on click) for performance.
- Shorts displayed vertically, with swipe-through on mobile for Daily Diary.

### 13.4 Gallery
- Albums + tags (place, theme, year, person); masonry grid; full-screen lightbox with zoom, swipe, caption, date, place, photographer/credit, download (if permitted).
- Tag pages are combinable (Bhubaneswar + 1993).
- Images served via optimized CDN at responsive sizes (AVIF/WebP).
- Original high-resolution files preserved separately (§21.5).

### 13.5 Sharing & citations
- Every item has *Copy citation* (plain, Chicago-like, and BibTeX), *Share* (WhatsApp, Telegram, Facebook, X, email, copy link), and auto-generated social preview images (quote cards with Gurudeva's photo and signature).

### 13.6 Personal library (Phase 3, optional sign-in)
- Bookmarks, highlights, notes, listening history, playlists, "Want to listen", synced across devices. Before sign-in exists, stored on the device.

---

## 14. Admin dashboard

URL `/admin`, protected by **user ID and password**. Built with **shadcn/ui** components. Design goal: *calm, uncluttered, obvious*. Someone who has never used it can publish a quote in under a minute.

### 14.1 UI principles
- Left sidebar with grouped modules and icons, collapsible; top bar with global admin search (⌘K) and user menu.
- Every list is a clean table with search, filters, sort, bulk actions, saved views, and column chooser.
- Every edit form is a single column with clear sections; "Save draft", "Preview", "Publish" always in the same place; autosave every few seconds; unsaved-change warnings.
- Friendly empty states ("No letters yet. Add the first letter"), inline help text, tooltips.
- Light and dark mode for the dashboard too; fully usable on a tablet; key actions usable on phones.
- Destructive actions require confirmation and go to Trash (restorable for 30 days).

### 14.2 Dashboard home
- Greeting + quick actions: *Add lecture · Add quote · Upload photos · Add translation*.
- Stats tiles: total items per type, transcribed %, translated % per language, broken links count.
- "My tasks" (items assigned to me / waiting for my review).
- Recent activity feed (who changed what).
- Site health: last backup, link-check status, YouTube sync status, search index status.

### 14.3 Sidebar modules

```
Overview
CONTENT
  Lectures & audio       (with transcription editor + timestamp aligner)
  Videos                 (with YouTube import)
  Daily Diary            (YouTube Shorts sync)
  Diaries
  Books & magazines      (with chapter/text editor)
  Quotes & compilations  (quotes, nectar drops, analogies, stories, Q&A …)
  Letters
  Memories & glorifications
  Gallery                (albums, tags, bulk upload)
  Life & timeline        (events, on-this-day)
  Pages                  (Who is Gurudeva, projects, lineage, any free page)
  News & updates
ORGANIZE
  Tattva-kośa            (concept tree editor, drag & drop)
  Scriptures & verses
  People · Places · Years
  Tags
TRANSLATIONS
  Languages
  Translation queue
  Glossaries
  Interface strings
SITE
  Home page builder
  Menus & hubs           (blocks on Gurudeva / Teachings hubs)
  Footer, contact, social
  Thank List
  Redirects
  SEO
MEDIA
  Media library          (images, PDFs; external audio links)
  Link checker
PEOPLE
  Users
  Roles & permissions
  Audit log
SYSTEM
  Settings
  Import / export
  Backups
  Integrations (YouTube, email, analytics)
```

### 14.4 Content editing features (all modules)
- **Rich editor** (block-based, Tiptap) with custom blocks: verse block, speaker label, [break] marker, quote with citation, image, YouTube embed, footnote.
- Draft → In review → Published → Archived states; **scheduled publishing**.
- **Revision history** with side-by-side diff and one-click restore; every revision records who and when.
- **Relations panel** on every item: link topics, verses, people, places, related items (search-as-you-type pickers).
- **Preview** exactly as the public will see it, in any language.
- **Bulk import** via CSV/Excel/JSON with column mapping and dry-run validation (e.g., 500 lectures at once).
- **Bulk edit** (set place/year/topic on many items).
- **Duplicate detection** (same date + place + title).
- **Comments/notes** between editors on an item.
- **Transcription tools:** paste from Word/Google Docs (cleans formatting; the existing repo has a Google Docs import parser we keep the idea of), automatic verse-reference detection, timestamp aligner (play audio, press a key at each paragraph start), find & replace with preview.
- **Quote extractor:** select text in a transcript → "Make quote" (pre-fills source, date, place, timestamp).

### 14.5 Integrations
- **YouTube sync** (YouTube Data API v3):
  - Admin connects channels/playlists (HH Haladhara Swāmī Mahārāja's channel for Daily Diary Shorts; `@taptajivanam` for videos).
  - Scheduled sync (e.g., every hour) imports new uploads; Shorts detection by duration/format → routed to Daily Diary; others → Videos queue.
  - Per-source setting: *auto-publish* or *hold for review*. Fetches title, description, date, thumbnail, duration, captions where available.
- **Email** (transactional): password reset, invitations, review notifications (Resend or similar).
- **Analytics**: privacy-friendly (Vercel Analytics or Plausible), shown in the dashboard: top lectures, top searches, zero-result searches (to guide indexing), languages of visitors.

### 14.6 Site builder (no code needed)
- **Home page builder:** list of blocks (§12); drag to reorder, toggle visibility, edit each block's title/text/image, choose the featured items.
- **Hub builder:** Gurudeva and Teachings hubs: add/remove/reorder blocks, set image, title, description, link, size (large/medium/small).
- **Menus:** main menu, mega-panels, mobile tabs, footer columns.
- **Footer & contact:** social links, locations (with map links), email, phone, dedication line, gratitude text.
- **Thank List editor:** sections → regions → people, with roles and notes; drag to reorder.
- **Banners:** upload/replace hero banners with links.
- **Announcements bar:** optional message on top of the site (e.g., festival).

### 14.7 Maintenance tools
- **Link checker:** nightly check of all external MP3 and PDF URLs; report broken ones with "fix" action.
- **Redirect manager:** old URL → new URL (pre-filled from migration), 404 log with one-click redirect.
- **Search index:** status, rebuild button, synonym list editor (Gour = Gaura = Gaur), stop-words.
- **Import/export:** full export of any content type to CSV/JSON; full-site export (§21.5).
- **Backups:** status of Neon point-in-time restore and nightly logical dumps.

### 14.8 SEO panel
Per item: slug, meta title, meta description, social image (auto-generated by default), canonical, no-index toggle. Site-wide: sitemap status, robots rules, structured data validation.

---

## 15. Users, roles and permissions

### 15.1 Authentication
- Login with **user ID (or email) and password**. No public sign-up for the dashboard: only admins create accounts (invitation link by email, or admin sets an initial password that must be changed at first login).
- Passwords hashed with Argon2id; minimum length 12; rate-limited login; lockout after repeated failures; optional **two-factor authentication (TOTP)**, mandatory for Super Admin.
- Sessions in secure, HTTP-only cookies; session list per user with "sign out other devices".
- Password reset by email; admin can force reset or deactivate a user instantly.

### 15.2 Roles (preset, editable)

| Role | Can do |
|---|---|
| **Super Admin** | Everything, including users, roles, system settings, backups, deletes. (The main admin.) |
| **Admin** | Manage all content, site builder, translations, users below Admin. |
| **Editor** | Create/edit/publish content in assigned modules. |
| **Contributor** | Create/edit drafts; submit for review; cannot publish. |
| **Transcriber** | Edit transcriptions and timestamps only. |
| **Translator** | Translate into *assigned languages* only; submit for review. |
| **Language Reviewer** | Approve/publish translations in assigned languages. |
| **Media Manager** | Gallery, media library, videos, YouTube sync. |
| **Viewer** | Read-only dashboard access (e.g., for reporting). |

### 15.3 Granular permissions
- Permission = **module × action** (`view`, `create`, `edit`, `publish`, `delete`, `manage`) with optional **scope** (language, collection, or "own items only").
- Super Admin can build custom roles from a checkbox matrix, and give a person several roles.
- **Audit log:** every login, create, edit, publish, delete, permission change: who, what, when, from where; filterable; cannot be edited.

---

## 16. Data model (Neon / Postgres)

Managed with **Drizzle ORM** migrations in the repo. Key principles: UUID primary keys + human slugs; `created_at/updated_at/created_by/updated_by`; soft delete (`deleted_at`); `status` (draft/review/published/archived); every translatable table has a sibling `*_translations` table keyed by `(item_id, lang)`; all revisions stored.

### 16.1 Core tables (summary)

```
languages(code PK, name_native, name_en, dir, active, sort)
ui_strings(key, lang, value)

people(id, slug, name, honorific, kind[ācārya|disciple|person], bio, image_id)
places(id, slug, name, country, lat, lng, kind[lecture_place|holy_place])
scriptures(id, code[BG|SB|CC…], name)        verses(id, scripture_id, ref_path, text_original, text_translit, translation)

lectures(id, slug, legacy_id, title, date, date_precision, place_id, type, language_spoken,
         scripture_ref_main, audio_url, audio_duration_s, audio_checksum, status, …)
transcript_paragraphs(id, lecture_id, ord, speaker, text, start_ms, end_ms, kind[speech|verse|song|note])
lecture_translations / transcript_paragraph_translations(…, lang, text, translator_id, status)

videos(id, slug, youtube_id, kind[video|short], source_channel_id, title, published_at, duration_s, lecture_id?, …)
youtube_sources(id, channel_or_playlist_id, target[daily_diary|videos], auto_publish, last_synced_at)

diaries(id, slug, title, kind)                diary_entries(id, diary_id, date, place_id, body, video_id?, …)

publishers(id, slug, name, website, credits)
books(id, slug, legacy_id, title, author, publisher_id, kind[book|booklet|magazine|ebook|article],
      language, edition, pages, binding, released_on, description, cover_id, buy_url, pdf_url, rights)
book_sections(id, book_id, parent_id, ord, title, body)        (chapters/texts)

quotes(id, slug, text, source_type, source_id, source_locator[timestamp|page|paragraph], date, place_id, image_id)
compilations(id, slug, kind[nectar|analogy|story|qa|instruction|prayer|anthology], title)
compilation_items(compilation_id, quote_id|excerpt, ord)

letters(id, slug, legacy_id, date, from_person_id, to_person_id, place_id, group, body, scan_ids)
memories(id, speaker_person_id, relation, video_id?, body, date)
glorifications(id, author_person_id, occasion, year, body)
timeline_events(id, date, date_precision, title, body, place_id)
pages(id, slug, title, body, hub)              news_posts(id, slug, title, body, published_at)

media(id, kind[image|pdf|other], storage_url, width, height, caption, credit, taken_on, place_id, rights)
albums(id, slug, title, cover_id)              album_media(album_id, media_id, ord)

concepts(id, slug, name, parent_id, definition_quote_id, sort)      (Tattva-kośa tree)
concept_aliases(concept_id, alias, lang)
taggings(concept_id, target_type, target_id, segment_start_ms?, segment_end_ms?, paragraph_id?)
verse_citations(verse_id, target_type, target_id, paragraph_id?, start_ms?, is_main_subject)
relations(from_type, from_id, to_type, to_id, kind)

home_blocks(id, kind, ord, visible, config_json)   hub_blocks(id, hub, ord, size, config_json)
menus(id, location, items_json)                   site_settings(key, value_json)
thank_list_sections(id, ord, title, body)         thank_list_entries(id, section_id, region, name, role, note, ord)
redirects(from_path, to_path, code, hits)

users(id, username, email, password_hash, totp_secret?, active, must_change_password)
roles(id, name)  permissions(role_id, module, action, scope_json)  user_roles(user_id, role_id)
sessions(id, user_id, expires_at, ip, user_agent)
revisions(id, target_type, target_id, data_json, user_id, created_at)
audit_log(id, user_id, action, target_type, target_id, diff_json, ip, created_at)
translation_tasks(id, target_type, target_id, lang, status, assignee_id, reviewer_id)
search_documents(id, target_type, target_id, lang, title, body, tsv, embedding vector?)
```

### 16.2 Search storage
- Phase 1: Postgres full-text search (`tsvector`, `unaccent`, `pg_trgm` for fuzzy) on a denormalized `search_documents` table, one row per item *and* per transcript paragraph, so results can point to a sentence.
- Phase 3: `pgvector` embeddings on the same table for meaning search.
- If scale or speed demand it, a dedicated engine (Meilisearch/Typesense) can be fed from the same table without changing the site.

---

## 17. Technical architecture

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + React + TypeScript** | Already used in the repo; server rendering for SEO; Vercel-native |
| Styling | **Tailwind CSS v4 + shadcn/ui (Radix)** | Clean, accessible components; matches the request for shadcn-style UI |
| Database | **Neon Postgres** (production + preview branches per pull request) | As requested; branches give safe testing on real data copies |
| ORM / migrations | **Drizzle ORM** | Typed, light, works with Neon serverless driver |
| Auth | Self-hosted credentials auth (Better Auth or Auth.js credentials) with users/roles in Neon | Admin-created ID/password accounts, roles, 2FA |
| Rich text | **Tiptap** (stored as JSON + rendered HTML) | Custom verse/speaker blocks |
| Images & PDFs | Vercel Blob (or Cloudflare R2) + Next/Image optimization | Cheap, fast CDN |
| Audio | **External MP3 URLs** (existing hosting) | Not stored in DB, as requested |
| Video | YouTube embeds + YouTube Data API v3 sync | |
| Search | Postgres FTS + trigram + unaccent → pgvector later | One database, no extra service at start |
| i18n | Locale-prefixed routes, DB-backed translations, `next-intl` for UI strings | |
| Background jobs | Vercel Cron (YouTube sync, link-checker, sitemap, search reindex) | |
| Email | Resend | Invites, password reset |
| Analytics | Vercel Analytics / Plausible | Privacy-friendly |
| Monitoring | Vercel logs + Sentry | |
| Testing | Vitest (unit), Playwright (end-to-end, accessibility checks) | |
| CI | GitHub Actions: lint, typecheck, test, build; Neon branch per PR | |

**Rendering strategy:** public pages statically generated / incrementally revalidated (ISR) and revalidated on publish from the dashboard, so the public site is fast and cheap even under heavy traffic; dashboard pages are dynamic.

**Repository layout**
```
/app/(public)/[lang]/…      public site
/app/admin/…                dashboard
/app/api/…                  route handlers (search, sync, revalidate)
/components/ui              shadcn components
/components/site            public components (player, reader, blocks)
/components/admin           dashboard components
/db/schema.ts, /db/migrations
/lib (search, i18n, auth, permissions, citations, verse-parser)
/scripts/migrate-legacy     migration from taptajivanam.com
/docs                       this document and decisions
```

---

## 18. Migration from taptajivanam.com

### 18.1 Preferred source: database export
The current site is PHP + (likely) MySQL. **The cleanest, most complete migration is a database dump + the `custom_uploads/` folder from the current hosting** (Q5). Our automated web fetcher is blocked by the site's `robots.txt`, so a crawl must run with the site owners' permission (or robots rules relaxed temporarily).

### 18.2 What we migrate
All items in §3.2: 1,595 lectures (with audio URLs), 130 transcriptions, 112 topics, 44 quote categories and all quotes + images, all books/magazines/e-books/articles with publisher data, 29 letters, 4 memories, life description chapters, disciple list, image tags and all images, video references, news posts, home banners, graphics (`sp.png`, `ggs.png`, `leaf-divider.png`, `sign.png`), Thank List (verbatim), footer/contact data.

### 18.3 Migration steps
1. Export (DB dump or crawl) → raw JSON snapshot stored permanently (provenance).
2. Transform: parse legacy title codes (`960121 - The Mercy of Śrīla Prabhupāda - Bhubaneswar` → date, title, place), normalize places, detect scripture refs, split transcripts into paragraphs with speaker labels, map topics/categories to concepts.
3. Load into Neon (staging branch), keeping `legacy_id` on every row.
4. Validation report: counts per type match the old site; random sample of 50 items checked by a human; all audio URLs tested.
5. Editor review in the dashboard; then promote to production.

### 18.3a gourgovindaswami.org
All pages listed in §3A.1 are extracted (text, images, PDFs, embeds), tagged with source and author, merged with duplicates and reviewed by an editor before publishing. If that site is retired later, its page URLs can be redirected to the new pages as well.

### 18.4 URL continuity
Every old URL (`view-archive.php?…&a_id=1154`, `view-letters.php?l_id=6`, `view-category.php?id=166`, `view-images.php?img_key=…`, `view-book-details.php?id=12`, plus static `.php` pages) gets a **301 redirect** to its new URL, generated from `legacy_id`s. No existing link anywhere on the internet should break.

---

## 19. SEO, indexing and open access

- Server-rendered full text on every page (transcripts are crawlable).
- **Structured data (schema.org JSON-LD):** `Person` (Śrīla Gurudeva, with `sameAs` links), `AudioObject`/`PodcastEpisode` + `transcript` for lectures, `VideoObject`, `Book`/`Chapter`, `Quotation` with `spokenByCharacter`/`creator`, `ImageObject`, `Event` for timeline, `BreadcrumbList`, `WebSite` with `SearchAction` (sitelinks search box).
- **Sitemaps** split by type and language, auto-updated; `hreflang` alternates for every translated page; canonical URLs.
- Meaningful titles: "The Mercy of Śrīla Prabhupāda — Lecture by Śrīla Gour Govinda Swāmī, 21 Jan 1996, Bhubaneswar".
- Auto-generated Open Graph images per item (quote cards, lecture cards).
- **Podcast RSS feeds** (all lectures; per year; per scripture) so lectures appear in podcast apps.
- RSS for news, Daily Diary and new translations.
- **Open data:** read-only public JSON API (`/api/v1/lectures`, `/quotes`…) and downloadable dataset of metadata, so other devotee projects can build on it with attribution (Q6).
- Google Search Console + Bing Webmaster verification (the existing repo already has a verification tag).
- Wikidata/Wikipedia cross-links where appropriate.

---

## 20. Design system

### 20.1 Character
Keep the warmth and devotional character of Taptajīvanam (leaf dividers, Gurudeva's signature, the verse, portrait banners), refined to a calm, modern, library-like look. Generous whitespace, strong typography, gentle motion. Blocks and cards rather than menus.

### 20.2 Colour tokens (starting palette, to be finalised in the design phase)
| Token | Light | Dark | Use |
|---|---|---|---|
| `--saffron` | #C8641E | #E08A47 | primary actions, highlights |
| `--maroon` | #8C2044 | #C45A7A | headings accent, footer (from existing repo footer) |
| `--gold` | #C3A354 | #E8D08A | ornaments, dividers (from existing repo) |
| `--tulasi` | #2F5D3A | #7FB08A | success, nature accents (echo of existing #152515 green) |
| `--paper` | #FBF7EF | #14110E | page background |
| `--ink` | #231D17 | #EDE6DA | body text |
| Sepia theme | #F4ECD8 bg / #3B2F22 text | | reading mode |

All colour pairs must pass WCAG AA contrast.

### 20.3 Typography
- **Reading serif with full IAST diacritics:** the SCA Garamond family already in the repo (`SCAGRG/SCAGB/SCAGI/SCAGBI`), or a Google-hosted alternative with diacritic coverage (EB Garamond / Noto Serif).
- **Interface sans:** Inter or Google Sans (already in repo).
- **Indic scripts:** Noto Serif Devanagari, Noto Sans Oriya, Noto Serif Bengali; Cyrillic via Noto.
- Fonts subset and self-hosted for speed.

### 20.4 Components
Hub block (L/M/S), mega-panel, quote card, lecture row, facet sidebar, verse block, transcript paragraph with timestamp, mini-player, lightbox, timeline item, language tile with coverage bar, citation popover, breadcrumb, empty state, skeleton loaders.

### 20.5 Motion
Subtle: fade/slide on block entry, smooth expansion of blocks into pages (View Transitions API), lotus-petal loading indicator. All respect "reduce motion".

### 20.6 Design references
- Taptajīvanam graphics (to be reused)
- Vanipedia (organization depth), Vedabase (reader)
- **harinamamritavyakaranam.com** (the author's own work, to match his design language). *Our automated tools couldn't open this site (it blocks automated access), so its specific design cues still need to come in via screenshots or a quick walkthrough (Q7).*

---

## 21. Quality requirements

### 21.1 Performance
- Lighthouse ≥ 95 performance on mobile for key pages; LCP < 2.0 s on 4G; CLS < 0.05.
- Search results < 300 ms server time for typical queries.
- Works on low-end Android phones and slow networks (India, Africa, rural areas); data-saver mode.

### 21.2 Accessibility
- WCAG 2.2 AA: keyboard navigation everywhere, focus rings, screen-reader labels, captions/transcripts for media, adjustable text, colour contrast.

### 21.3 Security
- OWASP top-10 protections; CSRF protection; strict Content-Security-Policy; rate limiting on login and search API; least-privilege DB roles; secrets only in Vercel env vars; dependency updates (Dependabot); dashboard behind auth on every server action (permission checks server-side, never only in the UI).

### 21.4 Privacy
- No tracking cookies by default; privacy-friendly analytics; disciple data shown only as admins allow; GDPR-style privacy page; contact form with spam protection (Turnstile).

### 21.5 Preservation (protecting the legacy)
- Neon point-in-time restore + **nightly logical backups** to independent storage (e.g., R2/S3) kept for 1 year, monthly kept forever.
- Full content export in open formats (JSON + Markdown + CSV) generated monthly, downloadable by Super Admin.
- Original image files and audio URL list + checksums archived; the link-checker detects lost audio.
- Every change versioned; nothing permanently deleted without Super Admin.
- Optional mirror of public audio on Internet Archive (Q8).

---

## 22. Delivery phases and acceptance criteria

### Phase 0: Foundation (this document)
- [x] Research current site, Vanipedia, Vedabase
- [ ] Approval of this document and answers to open questions (§24)

### Phase 1: Platform and migration (MVP launch)
- Clean repo; Next.js + TypeScript + Tailwind + shadcn; Neon + Drizzle schema; CI.
- Auth, users, roles, permissions, audit log.
- Dashboard: lectures, transcripts, quotes, books, letters, memories, gallery, pages, news, home builder, hubs, menus, footer, Thank List, redirects.
- Migration of all existing content + 301 redirects.
- Public: home, Gurudeva hub, Teachings hub, lecture pages with sticky player, transcripts, books, quotes, letters, gallery, search (full-text with diacritics insensitivity and facets), settings drawer (theme, font, size), English + interface translation framework.
- SEO basics: sitemaps, JSON-LD, OG images.
- **Acceptance:** every old-site item reachable at a new URL; every old URL redirects; counts match; Lighthouse targets met; an editor with no training can publish a quote, a lecture and a photo.

### Phase 2: Organization depth
- Tattva-kośa tree + concept pages; scripture/verse index with auto-detection; compilations (nectar drops, analogies, stories, Q&A); timeline + on-this-day; places map; YouTube sync + Daily Diary; Translations hub + translation workflow; first languages (Hindi, Odia, Bahasa, Dutch, Russian); side-by-side reader; podcast feeds.

### Phase 3: Intelligence and personal features
- Transcript ↔ audio timestamp alignment tooling (and automatic alignment); meaning (semantic) search; AI-assisted tag/verse suggestions (always human-approved); reader accounts with bookmarks/notes/history; public open-data API; PWA offline reading of saved items.

### Phase 4: Scale
- Additional languages, volunteer-translator onboarding at scale, more transcriptions (workflow for transcribing remaining ~1,465 lectures), performance tuning, dedicated search engine if needed.

---

## 23. What we will NOT build

- No storage of MP3 audio in the database (links only).
- No public comment sections or forums (moderation burden; preserves the archive's dignity).
- No user-generated content on the public site without editorial review.
- No unreviewed machine translation or AI-generated text presented as Gurudeva's words.
- No advertising, no third-party tracking.
- No deep dropdown navigation; hubs are block pages.
- No wiki-style public editing.
- No copying of Vanipedia's names, text or design; we only learn from its organization.

---

## 24. Open questions

| # | Question | Default if no answer |
|---|---|---|
| Q1 | Inside verbatim transcripts, keep the original speaker label ("Śrī Śrīmad Gour Govinda Swāmī Mahārāja:") or normalise it to "Śrīla Gurudeva:"? | Keep verbatim in the text; site UI says "Śrīla Gurudeva". |
| Q2 | Name for the topic treasury ("Tattva-kośa" or another), and should it be a top-menu item or inside His Teachings? | "Tattva-kośa", top menu. |
| Q3 | Site name and domain: stay "Taptajīvanam" on taptajivanam.com? | Yes. |
| Q4 | Gopāl Jiu Diary: what form does it take today (book, YouTube, notes) and where is it? | Generic diary collection, filled by editors. |
| Q5 | Can we get the current site's database dump and `custom_uploads/` folder from the host? | Crawl with owners' permission. |
| Q6 | May metadata be offered as open data / public API for other devotee projects? | Read-only metadata API, with attribution. |
| Q7 | Screenshots or a walkthrough of harinamamritavyakaranam.com to carry its design ideas over? | Design from Taptajīvanam + this spec. |
| Q8 | Mirror public audio on Internet Archive as an extra preservation copy? | No, until approved. |
| Q9 | YouTube channel ID/handle of HH Haladhara Swāmī Mahārāja for the Daily Diary Shorts? | Configured in the dashboard by admin. |
| Q10 | Which publishers allow full online reading or PDF of their books? | Metadata + buy link; full text only where permission is recorded. |
| Q11 | Disciple list: which fields may be public? | Name only. |
| Q12 | Do the Ānanda Sambāda / gourgovindaswami.org maintainers agree to their content moving into the new site? Does their site stay online, or will it redirect to ours? | Bring everything in with full credit; their site stays online. |
| Q13 | Donations and appeals (e.g., Janmasthān project): show contacts only, or accept online donations? | Contacts and bank details only; no payment system. |
