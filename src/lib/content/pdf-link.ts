/** Turn share links into direct file links (Google Drive, Dropbox). */
export function directPdf(u: string) {
  const d = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?.*id=)([\w-]{20,})/.exec(u); if (d) return `https://drive.usercontent.google.com/download?id=${d[1]}&export=download&confirm=t`;
  if (/dropbox\.com\//.test(u)) return u.replace(/[?&]dl=0/, "").replace(/(\?|$)/, (x) => (x ? "?dl=1&" : "?dl=1"));
  return u;
}
