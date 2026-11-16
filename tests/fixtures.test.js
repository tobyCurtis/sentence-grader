const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

require('../grader.js');

const source = fs.readFileSync(path.join(__dirname, '../scripts/create-test-form.gs'), 'utf8');
const cases = vm.runInNewContext(`${source}\nSENTENCE_GRADER_CASES`, {});

test('activism test form includes 14 fictional submissions', () => {
  assert.equal(cases.length, 14);
  assert.equal(new Set(cases.map(c => c.id)).size, cases.length);
});

const expectedCounts = [6, 5, 4, 3, 7, 6, 6, 6, 1, 7, 6, 6, 6, 1];
cases.forEach((testCase, index) => {
  test(`fixture ${testCase.id} counts ${expectedCounts[index]} sentence(s)`, () => {
    const result = globalThis.SentenceGrader.analyze(testCase.answer);
    assert.equal(result.count, expectedCounts[index]);
    assert.equal(result.confident, testCase.id !== 'S09');
  });
});
