import type { SpecContent, SpecPoint, SpecSection } from './types';

// English is skills and set texts rather than facts, so each topic says what's assessed and how to revise it.
const p = (name: string, know: string): SpecPoint => ({ name, know });
const one = (name: string, points: SpecPoint[]): SpecSection[] => [{ name, points }];

export const aqaLanguage: SpecContent = {
  source: 'AQA GCSE English Language (8700)', url: 'https://www.aqa.org.uk/subjects/english/gcse/english-language-8700/specification',
  topics: [
    one('Paper 1, Section A: reading fiction', [
      p('Question 1: retrieval', 'List four things from a short section. Quick marks: take them straight from the lines given.'),
      p('Question 2: language', 'Analyse how the writer uses words, phrases, language features and sentence forms, with precise subject terms and their effect.'),
      p('Question 3: structure', 'How the whole extract is structured: openings, shifts in focus, and how it develops and ends.'),
      p('Question 4: evaluation', 'Respond to a statement about the extract: agree or disagree, with evidence and analysis of the writer’s methods.'),
    ]),
    one('Paper 1, Section B: descriptive or narrative writing', [
      p('Content and organisation', 'Plan a clear structure, engage the reader, and vary paragraphs and structural features.'),
      p('Technical accuracy', 'Varied sentences, accurate punctuation and spelling, and ambitious vocabulary. Proofread every answer.'),
    ]),
    one('Paper 2, Section A: reading non-fiction', [
      p('Question 1: true or false', 'Pick the four true statements from a section of Source A.'),
      p('Question 2: summary', 'Summarise differences or similarities between the two sources, with inferences.'),
      p('Question 3: language', 'Analyse how one writer uses language for effect.'),
      p('Question 4: comparing perspectives', 'Compare the writers’ viewpoints and how they convey them across both sources.'),
    ]),
    one('Paper 2, Section B: writing to present a viewpoint', [
      p('Writing for purpose and audience', 'Write an article, letter, speech or essay that argues or persuades, matching form, purpose and audience.'),
      p('Technical accuracy', 'Structure your argument, use rhetorical devices with control, and keep spelling and punctuation accurate.'),
    ]),
    one('Spoken language', [
      p('Spoken language endorsement', 'A presentation assessed by your teacher and reported separately as Pass, Merit or Distinction.'),
    ]),
  ],
};

export const aqaLiterature: SpecContent = {
  source: 'AQA GCSE English Literature (8702)', url: 'https://www.aqa.org.uk/subjects/english/gcse/english-literature-8702/specification',
  note: 'Closed book: you need quotes from memory. Use the memoriser for a short, flexible quote bank for each text.',
  topics: [
    one('Shakespeare', [
      p('The question', 'An extract plus the whole play. Write about the extract and the rest of the play, with spelling, punctuation and grammar marks available.'),
      p('Set plays', 'Macbeth, Romeo and Juliet, The Tempest, The Merchant of Venice, Much Ado About Nothing or Julius Caesar.'),
      p('What to revise', 'Plot, characters, themes, key quotes, Shakespeare’s methods, and context such as Jacobean beliefs about kingship and the supernatural.'),
    ]),
    one('The 19th-century novel', [
      p('The question', 'An extract plus the whole novel.'),
      p('Set novels', 'The Strange Case of Dr Jekyll and Mr Hyde, A Christmas Carol, Great Expectations, Jane Eyre, Frankenstein, Pride and Prejudice or The Sign of Four.'),
      p('What to revise', 'Plot, characters, themes, key quotes, structure, and Victorian or Regency context linked to the writer’s ideas.'),
    ]),
    one('Modern prose or drama', [
      p('The question', 'A choice of two essay questions on your text, with spelling, punctuation and grammar marks available. No extract.'),
      p('Set texts', 'Plays such as An Inspector Calls, Blood Brothers and The History Boys, or novels such as Lord of the Flies, Animal Farm and Never Let Me Go.'),
      p('What to revise', 'Characters and themes across the whole text, the writer’s purpose and methods, and context.'),
    ]),
    one('Poetry anthology', [
      p('The question', 'Compare one named poem with another from your cluster.'),
      p('Clusters', 'Love and relationships or Power and conflict, 15 poems each.'),
      p('What to revise', 'Each poem’s ideas, a few key quotes, form and structure, context, and which poems compare well.'),
    ]),
    one('Unseen poetry', [
      p('The questions', 'Analyse one unseen poem, then compare it with a second.'),
      p('Method', 'Read twice, work out what it’s about and the speaker’s feelings, then analyse two or three methods closely.'),
    ]),
  ],
};

export const edxLanguage: SpecContent = {
  source: 'Pearson Edexcel GCSE English Language (1EN0)', url: 'https://qualifications.pearson.com/en/qualifications/edexcel-gcses/english-language-2015.html',
  topics: [
    one('Reading 19th-century fiction', [
      p('Short questions', 'Retrieval and explaining short sections of the extract.'),
      p('Language and structure', 'Analyse how the writer uses language and structure to create effects, with subject terminology.'),
      p('Evaluation', 'Evaluate how successfully the writer achieves an effect, with evidence.'),
    ]),
    one('Imaginative writing', [
      p('The task', 'A choice of two imaginative writing tasks, one with an image prompt.'),
      p('Assessment', 'Communication and organisation, plus vocabulary, sentence structure, spelling and punctuation.'),
    ]),
    one('Reading non-fiction', [
      p('Two 20th- and 21st-century texts', 'Questions on each text, including language and structure analysis and evaluating the writer’s ideas.'),
      p('Synthesis and comparison', 'Combine information from both texts, and compare the writers’ ideas and perspectives.'),
    ]),
    one('Transactional writing', [
      p('The task', 'A choice of two tasks, such as an article, letter, speech or review, for a given purpose and audience.'),
      p('Assessment', 'Form, purpose and audience, structure, and technical accuracy.'),
    ]),
    one('Spoken language', [
      p('Spoken language endorsement', 'A presentation assessed by your teacher and reported separately.'),
    ]),
  ],
};

export const edxLiterature: SpecContent = {
  source: 'Pearson Edexcel GCSE English Literature (1ET0)', url: 'https://qualifications.pearson.com/en/qualifications/edexcel-gcses/english-literature-2015.html',
  note: 'Closed book: you need quotes from memory. Use the memoriser for a short, flexible quote bank for each text.',
  topics: [
    one('Shakespeare', [
      p('The questions', 'One question on an extract and a second on the whole play.'),
      p('Set plays', 'Macbeth, The Tempest, Romeo and Juliet, Much Ado About Nothing, Twelfth Night or The Merchant of Venice.'),
      p('What to revise', 'Plot, characters, themes, key quotes, Shakespeare’s methods and context.'),
    ]),
    one('Post-1914 British play or novel', [
      p('The question', 'An essay question on your text, with context assessed and spelling, punctuation and grammar marks available.'),
      p('Set texts', 'Texts such as An Inspector Calls, Hobson’s Choice, Blood Brothers, Journey’s End, Animal Farm, Lord of the Flies, Anita and Me and The Woman in Black.'),
      p('What to revise', 'Characters, themes, the writer’s methods and purpose, and context.'),
    ]),
    one('19th-century novel', [
      p('The question', 'An extract question plus a question on the whole novel.'),
      p('Set novels', 'Jane Eyre, Great Expectations, The Strange Case of Dr Jekyll and Mr Hyde, A Christmas Carol, Pride and Prejudice, Silas Marner or Frankenstein.'),
      p('What to revise', 'Plot, characters, themes, key quotes, and the novel’s context.'),
    ]),
    one('Poetry anthology', [
      p('The question', 'Compare a named poem with one you choose from the same collection.'),
      p('Collections', 'One collection from the Pearson anthology, such as Relationships, Conflict, Time and Place, or Belonging.'),
      p('What to revise', 'Each poem’s ideas, key quotes, form and structure, context, and good pairings for comparison.'),
    ]),
    one('Unseen poetry', [
      p('The questions', 'Analyse one unseen poem, then compare two unseen poems.'),
      p('Method', 'Read twice, find the main idea and tone, then analyse a few methods in depth.'),
    ]),
  ],
};
