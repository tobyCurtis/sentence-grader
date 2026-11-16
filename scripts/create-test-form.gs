/**
 * Sentence Grader: fictional Google Forms test fixture.
 *
 * Run setupSentenceGraderTest() from a standalone Google Apps Script project.
 * It creates (or reuses) a dedicated quiz and adds only missing test cases.
 * No real classroom form or student information is accessed.
 */

const SENTENCE_GRADER_TEST = {
  propertyKey: 'SENTENCE_GRADER_PUBLIC_TEST_FORM_ID_V1',
  title: 'Sentence Grader - Extension Test',
  idQuestion: 'Test student ID',
  writingQuestion: 'Describe a place you enjoy visiting. Write at least six complete sentences.'
};

const SENTENCE_GRADER_CASES = [
  { id: 'S01', scenario: 'Six ordinary sentences', answer: 'I visited the beach. The sand felt cool. I watched the waves. A dog ran nearby. The sky was blue. I went home happy.' },
  { id: 'S02', scenario: 'Three sentences', answer: 'The park is peaceful. I like the trees. I visit often.' },
  { id: 'S03', scenario: 'Four sentences', answer: 'We walked downtown. We found a cafe. The food was delicious. We went home.' },
  { id: 'S04', scenario: 'Five sentences', answer: 'I woke up early. I made breakfast. I walked to school. I met my friends. We started our project.' },
  { id: 'S05', scenario: 'Seven sentences', answer: 'The trail was quiet. Birds sang above us. We crossed a bridge. I took a picture. The clouds moved quickly. We rested under a tree. Then we continued.' },
  { id: 'S06', scenario: 'Abbreviation and decimal', answer: 'Dr. Lee visited us. We spent $3.50 on snacks. It was a lovely day. We laughed together. Then we left. I hope to return.' },
  { id: 'S07', scenario: 'Questions, exclamations, and quotes', answer: 'Where is the trail? Look over there! I saw a sign. My friend said, "This is great!" We kept walking. It was fun.' },
  { id: 'S08', scenario: 'One sentence per line', answer: 'I like the beach\nI like the park\nI like the forest\nI like the mountains\nI like the river\nI like the lake' },
  { id: 'S09', scenario: 'Missing punctuation between sentences', answer: 'I went to the beach I found a shell My friend saw a bird We built a sandcastle The tide moved closer We walked home together' },
  { id: 'S10', scenario: 'Ellipsis', answer: 'I opened the old box... and found a letter. It had no name on it. I wondered who had written it. Then I put it away.' },
  { id: 'S11', scenario: 'Unpunctuated final sentence', answer: 'I love visiting the garden. The flowers are colorful. The bees are busy. The pond is peaceful. We sit on the bench. Then we walk home' },
  { id: 'S12', scenario: 'Fragments and short statements', answer: 'The beautiful beach. Lots of sunshine. Very peaceful. Yes. No. I smiled.' }
];

function setupSentenceGraderTest() {
  const properties = PropertiesService.getScriptProperties();
  const priorId = properties.getProperty(SENTENCE_GRADER_TEST.propertyKey);
  let form;

  if (priorId) {
    try {
      form = FormApp.openById(priorId);
      console.log('Reusing existing Sentence Grader test form.');
    } catch (error) {
      console.log('Saved test form was not accessible; creating a new one.');
    }
  }
  if (!form) {
    form = FormApp.create(SENTENCE_GRADER_TEST.title);
    properties.setProperty(SENTENCE_GRADER_TEST.propertyKey, form.getId());
    console.log('Created new Sentence Grader test form.');
  }

  form.setIsQuiz(true);
  form.setAcceptingResponses(true);

  const idItem = form.getItems(FormApp.ItemType.TEXT)
    .find(item => item.getTitle() === SENTENCE_GRADER_TEST.idQuestion);
  const studentItem = idItem
    ? idItem.asTextItem()
    : form.addTextItem().setTitle(SENTENCE_GRADER_TEST.idQuestion).setRequired(true);
  // Don't call studentItem.setPoints(0): Google Forms defaults a new TextItem to zero.

  const writing = form.getItems(FormApp.ItemType.PARAGRAPH_TEXT)
    .find(item => item.getTitle() === SENTENCE_GRADER_TEST.writingQuestion);
  const writingItem = writing
    ? writing.asParagraphTextItem()
    : form.addParagraphTextItem().setTitle(SENTENCE_GRADER_TEST.writingQuestion).setRequired(true);
  writingItem.setPoints(6);

  const submitted = new Set();
  for (const response of form.getResponses()) {
    const matching = response.getItemResponses().find(
      itemResponse => itemResponse.getItem().getId() === studentItem.getId()
    );
    if (matching) submitted.add(String(matching.getResponse()));
  }

  let added = 0;
  for (const testCase of SENTENCE_GRADER_CASES) {
    if (submitted.has(testCase.id)) continue;
    form.createResponse()
      .withItemResponse(studentItem.createResponse(testCase.id))
      .withItemResponse(writingItem.createResponse(testCase.answer))
      .submit();
    added++;
  }

  console.log('New fictional submissions: ' + added);
  console.log('Total responses: ' + form.getResponses().length);
  console.log('FORM EDIT URL: ' + form.getEditUrl());
  console.log('FORM RESPONDENT URL: ' + form.getPublishedUrl());
  for (const testCase of SENTENCE_GRADER_CASES) {
    console.log(testCase.id + ' | ' + testCase.scenario);
  }
  return form.getEditUrl();
}

/** Create a separate new test form without deleting the previous one. */
function createFreshSentenceGraderTest() {
  PropertiesService.getScriptProperties().deleteProperty(SENTENCE_GRADER_TEST.propertyKey);
  return setupSentenceGraderTest();
}
