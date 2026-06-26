/**
 * Strict HTML character escaping filter to neutralize Cross-Site Scripting (XSS) injection vectors
 * @param unsafeRawString Loose user text coming directly from request bodies
 */
export const escapeHTML = (unsafeRawString: string): string => {
  return unsafeRawString
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;"); // Neutralizes closing tag paths completely
};