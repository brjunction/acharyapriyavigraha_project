/** The founding account: it can never be removed, demoted or switched off, and only it can see itself in the users list. */
export const PROTECTED_EMAIL = "bhism108@gmail.com";
export const isProtected = (email?: string | null) => String(email || "").trim().toLowerCase() === PROTECTED_EMAIL;
