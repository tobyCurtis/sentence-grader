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
  assert.ok(result.issues.length > 0);
  assert.match('I went to the beach I found a shell My friend saw a bird We built a sandcastle'.slice(result.issues[0].start, result.issues[0].end), /I found/);
});
test('fragments count as written, without grammar flags', () => {
  const result = analyze('The beautiful beach. Lots of sunshine. Very peaceful.');
  assert.equal(result.count, 3);
  assert.equal(result.confident, true);
});
test('run-on sentence counts as one', () => {
  assert.equal(analyze('I went outside and I saw a bird and we played soccer and then we went home.').count, 1);
});
test('numbered list entries count by their text', () => {
  const result = analyze('1. The beach\n2. The mountains');
  assert.equal(result.count, 2);
  assert.equal(result.confident, true);
});
test('repeated punctuation counts once', () => {
  assert.equal(analyze('It was amazing!!! I loved it!!').count, 2);
});
test('parenthetical punctuation does not add a sentence', () => {
  assert.equal(analyze('I went to the beach (my favorite place). We swam.').count, 2);
});
test('one-word statements count without judgment', () => {
  const result = analyze('Yes. No. Okay. Fine.');
  assert.equal(result.count, 4);
  assert.equal(result.confident, true);
});
test('quoted punctuation ends a sentence without phantom quote sentences', () => {
  assert.equal(analyze('She whispered, “Go now.” We left.').count, 2);
});
test('punctuation inside parentheses does not create extra sentences', () => {
  assert.equal(analyze('I liked the museum (it was busy. Lots of people). We left.').count, 2);
});
test('long natural descriptions remain eligible for fill', () => {
  const answer = 'Last Saturday my family and I visited the beach near our house, and we brought snacks, towels, sunscreen, and a big blue umbrella because we planned to stay until the afternoon. When we arrived, the tide was low enough that I could walk along the wet sand and look into little pools of water where tiny crabs and colorful shells were hiding. My younger brother wanted to build the biggest sandcastle anyone had ever seen, so we spent a long time collecting buckets of water and decorating the towers with pebbles.';
  assert.equal(analyze(answer).count, 3);
  assert.equal(analyze(answer).confident, true);
});
test('empty answer is flagged', () => {
  assert.equal(analyze(' ').confident, false);
});
test('teacher can disable the missing punctuation review gate', () => {
  const text = 'I went to the beach I found a shell My friend saw a bird We built a sandcastle';
  assert.equal(analyze(text).confident, false);
  const relaxed = analyze(text, { reviewMissingPunctuation: false });
  assert.equal(relaxed.count, 1);
  assert.equal(relaxed.confident, true);
  assert.deepEqual(relaxed.issues, []);
});
test('teacher can choose whether nonempty lines separate sentences', () => {
  const text = 'I walked outside\nI saw a bird';
  assert.equal(analyze(text).count, 2);
  assert.equal(analyze(text, { lineBreaks: false, reviewMissingPunctuation: false }).count, 1);
});
test('teacher can choose whether ellipses separate sentences', () => {
  const text = 'I waited... and waited. We finally left.';
  assert.equal(analyze(text).count, 3);
  assert.equal(analyze(text, { ellipses: false }).count, 2);
});
test('a long multiline answer still identifies ambiguity if Forms collapses its newlines', () => {
  const collapsed = 'I like visiting the aquarium because I can watch jellyfish without having bones My favorite exhibit has a huge window where sharks swim Last time I went we listened to a guide We spent a long time at the touch pool Before we left I bought a postcard I hope to return';
  const analysis = analyze(collapsed);
  assert.equal(analysis.count, 1);
  assert.ok(analysis.issues.length > 0);
  const issue = analysis.issues[0];
  assert.ok(issue.end > issue.start);
  assert.match(collapsed.slice(issue.start, issue.end), /My favorite|Last time|We spent/);
});
