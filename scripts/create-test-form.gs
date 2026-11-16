/**
 * Sentence Grader: fictional Google Forms test fixture.
 *
 * Run setupSentenceGraderTest() from a standalone Google Apps Script project.
 * It creates (or reuses) a dedicated quiz and adds only missing test cases.
 * No real classroom form or student information is accessed.
 */

const SENTENCE_GRADER_TEST = {
  propertyKey: 'SENTENCE_GRADER_LONG_TEST_FORM_ID_V2',
  title: 'Sentence Grader - Long Response Test',
  idQuestion: 'Test student ID',
  writingQuestion: 'Describe a place you enjoy visiting. Write at least six complete sentences.'
};

const SENTENCE_GRADER_CASES = [
  { id: 'S01', scenario: 'Long six-sentence response (beach)', answer: [
    'Last Saturday my family and I visited the beach near our house, and we brought snacks, towels, sunscreen, and a big blue umbrella because we planned to stay until the afternoon.',
    'When we arrived, the tide was low enough that I could walk along the wet sand and look into little pools of water where tiny crabs and colorful shells were hiding.',
    'My younger brother wanted to build the biggest sandcastle anyone had ever seen, so we spent a long time collecting buckets of water and decorating the towers with pebbles.',
    'After lunch I sat on my towel and watched people flying kites while the waves made a steady sound that helped me relax even though the beach was crowded.',
    'Before we left, my mom took a picture of our sandcastle and I noticed that the water had started creeping closer to the walls we worked so hard to build.',
    'I hope we can visit again next weekend because being outside with my family is one of my favorite ways to spend a sunny day.'
  ].join(' ') },
  { id: 'S02', scenario: 'Long three-sentence response (park)', answer: [
    'The park near my grandmother’s house is my favorite place because it has a walking trail that goes around a small lake, a playground with tall swings, and a grassy hill where everyone brings blankets for picnics.',
    'One afternoon I spent almost two hours there watching ducks swim across the water and helping my cousin learn to ride a bicycle without training wheels while our grandparents cheered us on.',
    'I always feel peaceful when I visit that park, especially when the sun starts going down and the trees make long shadows on the path.'
  ].join(' ') },
  { id: 'S03', scenario: 'Long four-sentence response (museum)', answer: [
    'My class took a field trip to the science museum, and I was excited because our teacher said we would get to touch some of the exhibits instead of only looking at pictures in a book.',
    'The first room had a giant model of the solar system hanging from the ceiling, and a volunteer explained how long it would take to travel between the planets if we could ride a spaceship.',
    'Later we tried an experiment with magnets, built a small bridge out of wooden blocks, and watched a machine launch colorful balls into the air.',
    'The museum was so interesting that I asked my family if we could go back on a weekend and spend more time in the space room.'
  ].join(' ') },
  { id: 'S04', scenario: 'Five sentences', answer: 'I woke up early. I made breakfast. I walked to school. I met my friends. We started our project.' },
  { id: 'S05', scenario: 'Long seven-sentence response (hike)', answer: [
    'During spring break I went hiking with my uncle on a trail that started behind a visitor center and climbed slowly into the hills.',
    'We carried bottles of water and a bag of trail mix because he told me the hike would take several hours if we stopped to explore.',
    'Near the beginning we saw a deer standing quietly beside a fallen tree, and I tried to take a photo without making any noise.',
    'Farther up the trail, we crossed a wooden bridge over a creek that was flowing much faster than I expected after all the rain.',
    'My legs got tired when the path became steep, but my uncle encouraged me to keep going until we reached a lookout point.',
    'From the top we could see the ocean in the distance, and the clouds cast enormous moving shadows over the green fields below.',
    'I felt proud when we finally made it back to the car because I had never completed a hike that long before.'
  ].join(' ') },
  { id: 'S06', scenario: 'Abbreviation and decimal', answer: 'Dr. Lee visited us. We spent $3.50 on snacks. It was a lovely day. We laughed together. Then we left. I hope to return.' },
  { id: 'S07', scenario: 'Questions, exclamations, and quotes', answer: 'Where is the trail? Look over there! I saw a sign. My friend said, "This is great!" We kept walking. It was fun.' },
  { id: 'S08', scenario: 'Long response with one sentence per line', answer: [
    'I like visiting the aquarium because I can watch the jellyfish drift through the water and learn how they move without having bones',
    'My favorite exhibit has a huge window where sharks and rays swim past slowly while everyone stands together and points at them',
    'Last time I went there with my dad we listened to a guide explain how people can protect the animals that live in the ocean',
    'We spent a long time at the touch pool because I wanted to understand why the starfish felt different from the smooth shells nearby',
    'Before we left I bought a postcard with a sea turtle on it so I could remember what we learned during our visit',
    'I hope to return with my class one day because there are still several rooms that I did not have enough time to explore'
  ].join('\n') },
  { id: 'S09', scenario: 'Missing punctuation between sentences', answer: 'I went to the beach I found a shell My friend saw a bird We built a sandcastle The tide moved closer We walked home together' },
  { id: 'S10', scenario: 'Ellipsis', answer: 'I opened the old box... and found a letter. It had no name on it. I wondered who had written it. Then I put it away.' },
  { id: 'S11', scenario: 'Long response with unpunctuated final sentence', answer: [
    'The botanical garden is a place I enjoy visiting because every season brings different flowers, trees, and insects to look at along the winding paths.',
    'My mother showed me a section filled with plants from dry deserts, and I was surprised by how many shapes and colors the cactus plants had.',
    'We stopped beside a pond where dragonflies were flying close to the surface and small fish were hiding under the water lilies.',
    'After that we walked through a greenhouse that felt warm and humid, even though the weather outside was cool and windy.',
    'I took notes about some of the plants because I wanted to draw them later in my sketchbook at home.',
    'The next time we visit I want to bring my friend so I can show her the greenhouse and the pond where we saw the dragonflies'
  ].join(' ') },
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
  console.log('FORM RESPONDENT URL: ' + form.getPublishedUrl());
  for (const testCase of SENTENCE_GRADER_CASES) {
    console.log(testCase.id + ' | ' + testCase.scenario);
  }
  // Keep this last, on its own line: Apps Script can display a bare URL as a link.
  // If the execution log does not hyperlink it, copy/paste the URL into a tab.
  console.log('Open your test form in edit mode:');
  console.log(form.getEditUrl());
  return form.getEditUrl();
}

/** Create a separate new test form without deleting the previous one. */
function createFreshSentenceGraderTest() {
  PropertiesService.getScriptProperties().deleteProperty(SENTENCE_GRADER_TEST.propertyKey);
  return setupSentenceGraderTest();
}
