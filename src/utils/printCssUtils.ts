/**
 * Brace-balanced CSS preprocessor for scoping and isolating custom HTML print styles
 * inside PrintPreviewModal (.custom-rendered-sheet) and PrintService (.custom-report-content)
 * so embedded template styles never leak onto the host UI or toolbar, and always render consistently.
 */

export interface SanitizeCustomCssOptions {
  /** Selector to scope all normal rules under (e.g. '.custom-rendered-sheet' or '.custom-report-content') */
  scopeSelector: string;
  /** Whether to strip @media print blocks (true for screen preview modal) */
  stripMediaPrint?: boolean;
  /** Whether to strip @media screen blocks */
  stripMediaScreen?: boolean;
  /** Whether to strip @page and @import rules */
  stripPageAndImport?: boolean;
}

function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Split a comma-separated selector list safely (ignoring commas inside (...) or [...]). */
function splitSelectors(selectorList: string): string[] {
  const result: string[] = [];
  let current = '';
  let parenDepth = 0;
  let bracketDepth = 0;
  let quote: string | null = null;

  for (let i = 0; i < selectorList.length; i++) {
    const ch = selectorList[i];
    if (quote) {
      current += ch;
      if (ch === quote && selectorList[i - 1] !== '\\') {
        quote = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === '(') parenDepth++;
    else if (ch === ')' && parenDepth > 0) parenDepth--;
    else if (ch === '[') bracketDepth++;
    else if (ch === ']' && bracketDepth > 0) bracketDepth--;
    else if (ch === ',' && parenDepth === 0 && bracketDepth === 0) {
      if (current.trim()) result.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

function shouldStripSelector(sel: string): boolean {
  return /(^|[\s>+~])#toolbar\b/i.test(sel);
}

function scopeSingleSelector(sel: string, scopeSelector: string): string {
  const trimmed = sel.trim();
  if (!trimmed) return '';

  // Direct root/body equivalents become the scope container itself
  if (/^(:root|html|body|#body)$/i.test(trimmed)) {
    return scopeSelector;
  }

  // Descendant selectors starting with root/body/#body (e.g. "body .title", "#body .pcard")
  if (/^(:root|html|body|#body)(?=[\s>+~.:[#])/i.test(trimmed)) {
    return trimmed.replace(/^(:root|html|body|#body)/i, scopeSelector);
  }

  // Universal selector *
  if (trimmed === '*') {
    return `${scopeSelector}, ${scopeSelector} *`;
  }

  // Any other selector is scoped inside scopeSelector
  return `${scopeSelector} ${trimmed}`;
}

function processCssChunk(css: string, options: SanitizeCustomCssOptions): string {
  const { scopeSelector, stripMediaPrint, stripMediaScreen, stripPageAndImport } = options;
  let out = '';
  let i = 0;
  const len = css.length;

  while (i < len) {
    // Skip whitespace
    while (i < len && /\s/.test(css[i])) {
      out += css[i];
      i++;
    }
    if (i >= len) break;

    // Read prelude up to '{' or ';' (respecting quotes/parens)
    let preludeStart = i;
    let quote: string | null = null;
    let parenDepth = 0;
    let delimiter: '{' | ';' | null = null;

    while (i < len) {
      const ch = css[i];
      if (quote) {
        if (ch === quote && css[i - 1] !== '\\') quote = null;
        i++;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        i++;
        continue;
      }
      if (ch === '(') parenDepth++;
      else if (ch === ')' && parenDepth > 0) parenDepth--;
      else if (parenDepth === 0 && (ch === '{' || ch === ';')) {
        delimiter = ch;
        break;
      }
      i++;
    }

    const prelude = css.slice(preludeStart, i).trim();

    if (delimiter === ';') {
      i++; // consume ';'
      if (stripPageAndImport && /^@(import|charset|namespace)\b/i.test(prelude)) {
        continue;
      }
      if (prelude) {
        out += `${prelude};`;
      }
      continue;
    }

    if (delimiter !== '{') {
      // Trailing unclosed fragment
      break;
    }

    // Consume '{' and find matching '}'
    i++;
    const bodyStart = i;
    let braceDepth = 1;
    quote = null;

    while (i < len && braceDepth > 0) {
      const ch = css[i];
      if (quote) {
        if (ch === quote && css[i - 1] !== '\\') quote = null;
        i++;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        i++;
        continue;
      }
      if (ch === '{') braceDepth++;
      else if (ch === '}') braceDepth--;
      i++;
    }

    const body = css.slice(bodyStart, Math.max(bodyStart, i - 1));

    if (!prelude) continue;

    // Handle at-rules
    if (prelude.startsWith('@')) {
      if (stripPageAndImport && /^@page\b/i.test(prelude)) {
        continue;
      }
      if (stripMediaPrint && /^@media\b[\s\S]*\bprint\b/i.test(prelude)) {
        continue;
      }
      if (stripMediaScreen && /^@media\b[\s\S]*\bscreen\b/i.test(prelude)) {
        continue;
      }
      if (/^@(font-face|keyframes|-webkit-keyframes)\b/i.test(prelude)) {
        out += `${prelude} {${body}}`;
        continue;
      }
      if (/^@(media|supports|layer)\b/i.test(prelude)) {
        const inner = processCssChunk(body, options);
        if (inner.trim()) {
          out += `${prelude} {\n${inner}\n}`;
        }
        continue;
      }
      out += `${prelude} {${body}}`;
      continue;
    }

    // Normal CSS selector rule
    const selectors = splitSelectors(prelude).filter(s => !shouldStripSelector(s));
    if (selectors.length === 0) continue;

    const scopedSelectors = selectors
      .map(s => scopeSingleSelector(s, scopeSelector))
      .filter(Boolean);

    if (scopedSelectors.length === 0) continue;

    out += `${scopedSelectors.join(', ')} {${body}}`;
  }

  return out;
}

export function sanitizeCustomCss(rawCss: string, options: SanitizeCustomCssOptions): string {
  if (!rawCss || !rawCss.trim()) return '';
  const cleaned = stripCssComments(rawCss);
  return processCssChunk(cleaned, options);
}
