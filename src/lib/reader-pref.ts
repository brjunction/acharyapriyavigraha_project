/** Which book reader opens a book: Pāṭha (pages, the default) or the classic reader (scroll, chapter by chapter). Per device. */
export type ReaderKind = "patha" | "classic";
export const readerKind = (): ReaderKind => { try { return localStorage.getItem("tj_reader_kind") === "classic" ? "classic" : "patha"; } catch { return "patha"; } };
export const setReaderKind = (k: ReaderKind) => { try { localStorage.setItem("tj_reader_kind", k); } catch {} };
