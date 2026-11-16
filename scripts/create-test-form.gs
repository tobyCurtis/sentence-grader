/**
 * Sentence Grader: fictional Google Forms test fixture.
 *
 * Run setupSentenceGraderTest() from a standalone Google Apps Script project.
 * Every run creates a NEW fictional test form and 14 fresh submissions.
 * To resume the latest test form instead, run reuseLatestSentenceGraderTest().
 * No real classroom form or student information is accessed.
 */

const SENTENCE_GRADER_TEST = {
  propertyKey: 'SENTENCE_GRADER_ACTIVISM_TEST_FORM_ID_V3',
  title: 'Sentence Grader - Activism Test',
  idQuestion: 'Test student ID',
  writingQuestion: 'What does activism mean to you? Describe a cause you would stand up for. Write at least six sentences.'
};

const SENTENCE_GRADER_CASES = [
  { id: 'S01', scenario: 'Six long sentences about access to books', answer: [
    'I think activism is when people work together to change something unfair, even if the problem seems too large for one person to solve by themselves.',
    'A cause I would support is making sure every neighborhood has a public library with books, computers, and a safe place to do homework after school.',
    'Some students do not have internet at home or a quiet room for studying, which can make ordinary assignments much harder than they should be.',
    'If I wanted to help, I could attend community meetings, organize a book drive, and ask adults to explain how funding decisions are made.',
    'I know one book drive would not fix everything, but it could show local leaders that young people care about getting equal opportunities to learn.',
    'To me, speaking up for other students is worth doing because everyone deserves the chance to discover something new and follow their interests.'
  ].join(' ') },
  { id: 'S02', scenario: 'Five long sentences with lowercase start and no space after a period', answer: [
    'Activism can mean using your voice when someone is being treated differently because of who they are or where they come from.',
    'sometimes people make a difference just by listening carefully and helping others feel comfortable explaining what happened to them.',
    'I would like to support equal opportunities in sports because every student should get a fair chance to participate and feel like they belong on a team.',
    'When somebody tells a player they cannot join because of a stereotype, I think their classmates should speak up instead of pretending they never heard it.',
    'In the end I believe small decisions can change a school when enough people make those decisions together.'
  ].join(' ').replace('heard it. In the end', 'heard it.In the end') },
  { id: 'S03', scenario: 'Four long sentences about affordable school lunches', answer: [
    'If I could advocate for one thing at my school, I would try to make sure that nobody has to skip lunch because their family cannot afford it.',
    'I have seen people say they are not hungry when they really just do not want their friends to notice that they forgot money or do not have enough.',
    'I would ask the student council to talk with cafeteria workers and families about how a meal program could work without embarrassing the students who use it.',
    'Even though I am only one student, I think I could help by gathering ideas, listening to people, and sharing what I learn with the principal.'
  ].join(' ') },
  { id: 'S04', scenario: 'Three long sentences about protecting a creek', answer: [
    'I care about keeping our local creek clean because a lot of birds, fish, and other animals live near it, and I have noticed more litter on the path when I walk there with my family.',
    'Some people may think that picking up trash is too small to count as activism, but I think a community cleanup can help people notice a problem and start asking why it keeps happening.',
    'If we worked together to put more trash cans near the trail and reminded visitors to take care of the water, I believe our neighborhood could make the area safer for wildlife.'
  ].join(' ') },
  { id: 'S05', scenario: 'Seven long sentences about animal shelters', answer: [
    'Activism is important because it gives people a way to improve situations that they believe are unfair or harmful.',
    'One issue I care about is the number of dogs and cats that end up in animal shelters without anyone to take care of them.',
    'When my family adopted a cat, I learned that shelters need food, blankets, medicine, and volunteers who can spend time with nervous animals.',
    'I would like to organize a donation drive where students bring supplies and learn about the responsibilities that come with adopting a pet.',
    'We could also make posters explaining why people should think carefully before getting an animal and why pets need attention every day.',
    'My goal would be to help the shelter and encourage families to make good choices for the animals that depend on them.',
    'I know I could not rescue every pet by myself, but a group of people doing little things could still make a real difference.'
  ].join(' ') },
  { id: 'S06', scenario: 'Six sentences with an abbreviation and a decimal', answer: 'Dr. Rivera spoke to our class about food waste. Our club collected $3.50 from each volunteer for supplies. We used the money to start a small school garden. The vegetables will go to a community pantry. I think helping families find fresh food is a good cause. I would like to keep volunteering next year.' },
  { id: 'S07', scenario: 'Questions, exclamations, and quoted sentence endings', answer: 'What does fairness look like at school? I asked my friends about places where students feel left out. One person said, "Everyone deserves a seat at the table!" That made me think about how clubs choose new members. We decided to suggest a welcome day for new students. I hope everyone will feel more included.' },
  { id: 'S08', scenario: 'Six long lines with no final punctuation', answer: [
    'I believe activism means showing people that a problem is important even if nobody has talked about it in a long time',
    'My biggest concern is how much plastic trash gets left around the playground and the streets near our school',
    'Last week my friends and I counted bottles and wrappers while walking home and we were surprised by how many we found',
    'We could ask the principal for more recycling bins and make signs that explain where trash is supposed to go',
    'The project would take time because people need to remember to use the bins even when they are in a hurry',
    'I still want to try because a cleaner neighborhood would make the area nicer for the people and animals who live here'
  ].join('\n') },
  { id: 'S09', scenario: 'Missing punctuation between sentence starts', answer: 'I want safer crossings near school We walk past busy roads My little brother gets nervous The drivers do not always stop We should ask for better signs I hope the city listens to us' },
  { id: 'S10', scenario: 'Ellipses and parentheses', answer: 'I wanted to help the neighborhood... and then I had an idea. We could plant trees along the street. My friend agreed (she loves gardening). We asked our neighbors for advice. The first meeting went well. I think our project could grow.' },
  { id: 'S11', scenario: 'Six long sentences with an unpunctuated ending', answer: [
    'A cause that matters to me is making public parks easier for people with disabilities to use because everyone should be able to spend time outside with their friends.',
    'I noticed that some playground equipment has stairs and narrow spaces that might be difficult for a person who uses a wheelchair.',
    'I would start by asking people what changes would help instead of assuming that I already know what every visitor needs.',
    'Then I could work with other students to write a letter asking the city to consider more accessible paths and play areas.',
    'Even if our first letter did not change anything right away, it could start a conversation and encourage other families to share their experiences.',
    'I think the most important part of activism is being willing to listen and keep trying when a change will help people feel included'
  ].join(' ') },
  { id: 'S12', scenario: 'Fragments and short statements', answer: 'Equal chances for everybody. More kindness. Less bullying. A better school. Yes. We can help.' },
  { id: 'S13', scenario: 'Six ordinary sentences about donating supplies', answer: 'I want to help students who need school supplies. Some people run out of notebooks during the year. I could collect extra pencils from families. Our teacher could help us find a place to store them. We would give supplies to anyone who asks. That is a kind of activism I would feel proud to do.' },
  { id: 'S14', scenario: 'One long run-on with no end punctuation', answer: 'I want to stand up for better bus routes because some students have to leave home really early and it takes a long time to reach school and I think there should be more stops near neighborhoods where families do not have cars and it would help people get to their jobs too and my friends agree with me and we could write letters and ask the city about it' }
];

function setupSentenceGraderTest() {
  return buildSentenceGraderTest(false);
}

/** Reuse the most recently generated test form without duplicating submissions. */
function reuseLatestSentenceGraderTest() {
  return buildSentenceGraderTest(true);
}

function buildSentenceGraderTest(reuseExisting) {
  const properties = PropertiesService.getScriptProperties();
  const priorId = reuseExisting ? properties.getProperty(SENTENCE_GRADER_TEST.propertyKey) : null;
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
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    form = FormApp.create(SENTENCE_GRADER_TEST.title + ' ' + timestamp);
    properties.setProperty(SENTENCE_GRADER_TEST.propertyKey, form.getId());
    console.log('Created a NEW Sentence Grader test form.');
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

/** Backward-compatible alias. setupSentenceGraderTest() now does this too. */
function createFreshSentenceGraderTest() {
  return setupSentenceGraderTest();
}
