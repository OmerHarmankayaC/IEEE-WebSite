import sanitizeHtml from "sanitize-html";

/** Only the markup the editor can produce survives. */
export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "h2", "h3", "strong", "em", "u", "s", "a", "ul", "ol", "li", "blockquote", "img", "hr", "code", "pre"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
    },
    allowedSchemes: ["https", "http", "mailto"],
    allowedSchemesByTag: { img: ["https"] },
    transformTags: {
      a: (tagName, attribs) => {
        const external = /^https?:\/\//.test(attribs.href ?? "");
        return {
          tagName,
          attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs,
        };
      },
    },
  });
}

/** True when the HTML has no visible text and no images. */
export function isEmptyHtml(html: string | null | undefined): boolean {
  if (!html) return true;
  return !/<img\b/i.test(html) && html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim() === "";
}
