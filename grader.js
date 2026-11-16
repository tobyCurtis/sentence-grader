(function (root) {
  'use strict';

  const ABBREVIATIONS = new Set([
    'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'st', 'vs', 'etc',
    'e.g', 'i.e', 'a.m', 'p.m', 'u.s', 'u.k'
  ]);

  function analyze(text) {
    const original = String(text || '').trim();
    if (!original) return { count: 0, score: 3, confident: false, warnings: ['Empty answer — review manually'] };

    const warnings = [];
    let normalized = original.replace(/\r\n?/g, '\n');
    if (/(?:^|\n)\s*(?:[•*\-]\s+|\d+[.)]\s+)/m.test(normalized)) warnings.push('List-style answer — inspect each item');

    // Hide punctuation that is not a sentence boundary, retaining each character's position.
    normalized = normalized.replace(/(\d)\.(\d)/g, '$1\uE000$2');
    normalized = normalized.replace(/\b(?:[A-Za-z]\.){2,}/g, match => match.replace(/\./g, '\uE000'));
    normalized = normalized.replace(/\b(?:[A-Za-z]+\.)/g, match => {
      const key = match.slice(0, -1).toLowerCase();
      return ABBREVIATIONS.has(key) ? match.slice(0, -1) + '\uE000' : match;
    });
    // Also protect abbreviations containing internal dots.
    normalized = normalized.replace(/\b(?:e\uE000g|i\uE000e|a\uE000m|p\uE000m)\./gi, match => match.slice(0, -1) + '\uE000');

    // Each nonempty line may contain one or more sentences. A final unpunctuated
    // span counts as a sentence, including at the end of the entire response.
    // Ellipses separate sentences; repeated ! and ? remain one boundary.
    let count = 0;
    const spans = [];
    for (const line of normalized.split(/\n+/).map(s => s.trim()).filter(Boolean)) {
      const boundaries = /(?:\.{3,}|…|[.!?]+)["'”’\])}]*/g;
      let match;
      let cursor = 0;
      while ((match = boundaries.exec(line))) {
        const span = line.slice(cursor, match.index).trim();
        if (span) { count++; spans.push(span); }
        cursor = boundaries.lastIndex;
      }
      const tail = line.slice(cursor).trim();
      if (tail) { count++; spans.push(tail); }
    }

    // An unpunctuated run containing obvious new subject starts might actually
    // have several sentences. Preserve the counted span but require review.
    if (spans.some(span => /\b[a-z][a-z,'’]*\s+(?:I|We|They|He|She|My|Our|The|Then|It)\s+[a-z]/.test(span))) {
      warnings.push('Possible missing punctuation between sentences');
    }
    // Clear examples of fragments; more sophisticated grammar checks require
    // a different engine and must never be represented as definitive.
    if (spans.some(span => /^(?:Because|Although|When|If|While)\b/i.test(span) ||
      /^(?:Very\s+\w+|Lots of\s+\w+|The\s+\w+\s+\w+)$/i.test(span))) {
      warnings.push('Possible sentence fragment');
    }
    if (spans.some(span => span.replace(/\uE000/g, '.').split(/\s+/).length === 1)) {
      warnings.push('One-word statement — teacher decision');
    }

    return {
      count,
      score: Math.max(3, Math.min(6, count)),
      confident: warnings.length === 0,
      warnings
    };
  }

  root.SentenceGrader = { analyze };
})(typeof globalThis !== 'undefined' ? globalThis : this);
