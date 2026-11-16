(function (root) {
  'use strict';

  const ABBREVIATIONS = new Set([
    'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'st', 'vs', 'etc',
    'e.g', 'i.e', 'a.m', 'p.m', 'u.s', 'u.k'
  ]);

  // Count sentences, not grammatical completeness. Track original offsets so
  // unusually ambiguous passages can be highlighted for a teacher to inspect.
  const DEFAULT_RULES = Object.freeze({
    lineBreaks: true,
    ellipses: true,
    reviewMissingPunctuation: true
  });

  function analyze(text, selectedRules = {}) {
    const rules = { ...DEFAULT_RULES, ...selectedRules };
    const original = String(text || '');
    if (!original.trim()) return {
      count: 0, score: 3, confident: false,
      warnings: ['Empty answer. Check this response.'], issues: []
    };

    const protectedDots = new Set();
    for (const match of original.matchAll(/\d\.\d/g)) protectedDots.add(match.index + 1);
    for (const match of original.matchAll(/\b(?:[A-Za-z]\.){2,}/g)) {
      for (let i = 0; i < match[0].length; i++) if (match[0][i] === '.') protectedDots.add(match.index + i);
    }
    for (const match of original.matchAll(/\b[A-Za-z]+\./g)) {
      if (ABBREVIATIONS.has(match[0].slice(0, -1).toLowerCase())) protectedDots.add(match.index + match[0].length - 1);
    }

    const spans = [];
    const addSpan = (from, to) => {
      const raw = original.slice(from, to);
      const meaningful = raw.replace(/^[\s•*\-]*(?:\d+[.)]\s*)?/, '').trim();
      if (meaningful && /[\p{L}\p{N}]/u.test(meaningful)) spans.push({ start: from, end: to, text: meaningful });
    };
    let start = 0;
    let parenDepth = 0;
    for (let i = 0; i < original.length; i++) {
      const char = original[i];
      if (char === '(' || char === '[') parenDepth++;
      if (char === ')' || char === ']') parenDepth = Math.max(0, parenDepth - 1);
      if (rules.lineBreaks && (char === '\n' || char === '\r')) {
        addSpan(start, i);
        while (i + 1 < original.length && /[\r\n]/.test(original[i + 1])) i++;
        start = i + 1;
        parenDepth = 0;
        continue;
      }
      if (parenDepth || !/[.!?…]/.test(char) || protectedDots.has(i)) continue;
      if (!rules.ellipses && (char === '…' ||
        (char === '.' && (original[i - 1] === '.' || original[i + 1] === '.')))) continue;
      // Repeated punctuation is a single boundary. A closing quote counts as
      // part of the same sentence, including e.g. "That's great!".
      let end = i + 1;
      while (end < original.length && /[.!?…]/.test(original[end]) && !protectedDots.has(end)) end++;
      while (end < original.length && /["'”’\])}]/.test(original[end])) end++;
      addSpan(start, end);
      start = end;
      i = end - 1;
    }
    addSpan(start, original.length); // The unpunctuated final sentence counts.

    // Only flag strong signals of multiple unpunctuated sentence starts.
    // Fragments, lists, short statements, run-ons and style aren't graded.
    const issues = [];
    for (const span of rules.reviewMissingPunctuation ? spans : []) {
      const starts = [...span.text.matchAll(/\b(?:I|We|They|He|She|My|Our|The|Then|It)\s+(?:[a-z][\w’'-]*\s+){0,2}[a-z][\w’'-]*/g)];
      const suspicious = starts.filter(m => {
        const before = span.text.slice(Math.max(0, m.index - 14), m.index);
        // A new subject after a comma or a connecting word is usually still
        // inside the same sentence. Do not make ordinary complex sentences
        // require manual review just because a student writes "I think I...".
        return m.index > 5 && !/[,;:]\s*$/.test(before) &&
          !/\b(?:and|but|because|when|while|so|that|if|as|although|though|what|who|which|where|since|unless|until)\s+$/i.test(before);
      });
      if (suspicious.length >= 2) {
        const offset = original.slice(span.start, span.end).indexOf(span.text);
        // Mark each possible new sentence start, not the entire passage
        // between the first and last clue. The latter covered whole lines
        // with squiggles and made the tooltip hard to place or read.
        for (const match of suspicious) {
          const shortPhrase = match[0].trim().split(/\s+/).slice(0, 2).join(' ');
          const from = span.start + Math.max(0, offset) + match.index;
          issues.push({
            start: from,
            end: from + shortPhrase.length,
            reason: 'Possible sentence break here. Check the punctuation.'
          });
        }
      }
    }

    return {
      count: spans.length,
      score: Math.max(3, Math.min(6, spans.length)),
      confident: issues.length === 0,
      warnings: issues.length ? ['Possible missing punctuation between sentences'] : [],
      issues
    };
  }

  root.SentenceGrader = { analyze, DEFAULT_RULES };
})(typeof globalThis !== 'undefined' ? globalThis : this);
