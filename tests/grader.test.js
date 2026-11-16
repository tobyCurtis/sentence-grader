const test = require('node:test');
const assert = require('node:assert/strict');
require('../grader.js');
const { analyze } = globalThis.SentenceGrader;

const sentences = Array.from({ length: 7 }, (_, i) => `I like visiting place ${i + 1}.`);
for (const n of [1, 3, 4, 5, 6, 7]) {
  test(`${n} sentences score correctly`, () => {
    const result = analyze(sentences.slice(0, n).join(' '));
    assert.equal(result.count, n);
    assert.equal(result.score, Math.max(3, Math.min(6, n)));
    assert.equal(result.confident, true);
  });
}
test('abbreviations and decimals', () => {
  assert.equal(analyze('Dr. Smith paid $3.50. He went home.').count, 2);
});
test('question marks, exclamations, and quotes', () => {
  assert.equal(analyze('Was it fun? "Yes!" I loved it.').count, 3);
});
test('unpunctuated final sentence counts', () => {
  assert.equal(analyze('I went to the park. I played with friends').count, 2);
  assert.equal(analyze('I went to the park. I played with friends').confident, true);
});
test('unpunctuated lines count independently', () => {
  assert.equal(analyze('I like the beach\nI like the park\nI like the mountains').count, 3);
  assert.equal(analyze('I like the beach\nI like the park').confident, true);
});
test('ellipses are sentence boundaries', () => {
  assert.equal(analyze('I waited... Then I left.').count, 2);
  assert.equal(analyze('I waited... Then I left.').confident, true);
  assert.equal(analyze('I opened the old box... and found a letter. It had no name on it.').count, 3);
});
test('missing punctuation between sentences requires review', () => {
  const result = analyze('I went to the beach I found a shell My friend saw a bird We built a sandcastle');
  assert.equal(result.confident, false);
  assert.match(result.warnings.join(' '), /missing punctuation/);
});
test('possible fragments are flagged', () => {
  assert.equal(analyze('The beautiful beach. Lots of sunshine. Very peaceful.').confident, false);
});
test('run-on sentence counts as one', () => {
  assert.equal(analyze('I went outside and I saw a bird and we played soccer and then we went home.').count, 1);
});
test('numbered lists require review', () => {
  assert.equal(analyze('1. The beach\n2. The mountains').confident, false);
});
test('repeated punctuation counts once', () => {
  assert.equal(analyze('It was amazing!!! I loved it!!').count, 2);
});
test('parenthetical punctuation does not add a sentence', () => {
  assert.equal(analyze('I went to the beach (my favorite place). We swam.').count, 2);
});
test('one-word statements require teacher review', () => {
  assert.equal(analyze('Yes. No. Okay. Fine.').confident, false);
});
test('empty answer is flagged', () => {
  assert.equal(analyze(' ').confident, false);
});
