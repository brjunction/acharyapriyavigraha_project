import { revalidatePath } from "next/cache";
/** After any change in the Studio: every page is rebuilt on its next visit, so the website shows the change at once. */
export const freshSite = () => { revalidatePath("/", "layout"); };
