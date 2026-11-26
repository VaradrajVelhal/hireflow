import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "code",
  "pre",
  "hr",
  "div",
  "span",
];

const ALLOWED_ATTR = ["href", "target", "rel"];

// Detect actual HTML element tags (avoids false positives on math like "3 < 5")
const HTML_TAG_REGEX = /<\/?[a-z][a-z0-9]*(?:\s[^>]*)?>/i;

// Detect HTML-encoded tags (e.g., &lt;p&gt;, &lt;div class=&quot;h3&quot;&gt;, &#60;br&#62;)
const ENCODED_HTML_TAG_REGEX =
  /&lt;\/?[a-z][a-z0-9]*(?:\s[\s\S]*?)?\/?&gt;|&#0*60;\/?[a-z]|&#x0*3c;\/?[a-z]/i;

const HTML_ENTITY_REGEX = /&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]+);/i;

let hookRegistered = false;

function ensurePurifyHooks() {
  if (hookRegistered) return;
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      const href = node.getAttribute("href") || "";
      const isSafeUrl = /^(https?:\/\/|mailto:)/i.test(href.trim());
      if (!isSafeUrl) {
        node.removeAttribute("href");
        node.removeAttribute("target");
        node.removeAttribute("rel");
      } else {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    }
  });
  hookRegistered = true;
}

/**
 * Decodes HTML entities exactly once via an RCDATA <textarea> element so
 * literal `<` characters (e.g. "Experience <3 years") are never parsed as tags
 * and scripts are never executed.
 */
function decodeHtmlEntitiesOnce(input) {
  if (!input || !HTML_ENTITY_REGEX.test(input)) {
    return input;
  }
  const textarea = document.createElement("textarea");
  textarea.innerHTML = input.replace(/</g, "&lt;");
  return textarea.value;
}

/**
 * Removes empty spacer blocks (e.g. `<p>&nbsp;</p>`, empty `<div>`s) so job
 * cards and detail views don't start or pad with blank lines.
 */
function removeEmptyBlockElements(root) {
  const blocks = root.querySelectorAll("p, div");
  blocks.forEach((el) => {
    const text = (el.textContent || "").replace(/\u00a0/g, "").trim();
    const hasMeaningfulChildren = el.querySelector(
      "a, code, pre, hr, ul, ol, li, h1, h2, h3, h4, h5, h6"
    );
    if (!text && !hasMeaningfulChildren) {
      el.remove();
    }
  });
}

/**
 * Prepares a raw job description string (raw HTML, HTML-encoded HTML, or plain text)
 * for safe rendering in React. Performs at most one entity-decoding step and one
 * DOMPurify sanitization step.
 *
 * @param {string | null | undefined} rawDescription
 * @returns {{ mode: "empty" | "html" | "text", content: string }}
 */
export function prepareJobDescription(rawDescription) {
  if (!rawDescription || typeof rawDescription !== "string") {
    return { mode: "empty", content: "" };
  }

  const trimmed = rawDescription.trim();
  if (!trimmed) {
    return { mode: "empty", content: "" };
  }

  const hasRawHtml = HTML_TAG_REGEX.test(trimmed);
  const hasEncodedHtml = !hasRawHtml && ENCODED_HTML_TAG_REGEX.test(trimmed);

  // Plain text (neither raw HTML tags nor HTML-encoded tags)
  if (!hasRawHtml && !hasEncodedHtml) {
    return {
      mode: "text",
      content: decodeHtmlEntitiesOnce(trimmed),
    };
  }

  // Decode once only when the markup itself is HTML-encoded
  const htmlInput = hasEncodedHtml ? decodeHtmlEntitiesOnce(trimmed) : trimmed;

  ensurePurifyHooks();
  const cleanBody = DOMPurify.sanitize(htmlInput, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    RETURN_DOM: true,
  });

  removeEmptyBlockElements(cleanBody);
  const sanitizedHtml = cleanBody.innerHTML.trim();

  if (!sanitizedHtml) {
    return { mode: "empty", content: "" };
  }

  return {
    mode: "html",
    content: sanitizedHtml,
  };
}
