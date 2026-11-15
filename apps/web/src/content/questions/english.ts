import type { Bank, Question } from './types';
import { long, short } from './make';

/**
 * English language and literature. Every extract and poem here was written for Hilite, so there is no
 * copyright text to worry about. Literature questions name set texts but quote only out-of-copyright works.
 */
const FOG = 'Read this extract.\n\n“The lighthouse keeper had stopped counting the days. Each morning the fog came in from the sea like a slow grey tide, swallowing the rocks, then the steps, then the bottom of the tower itself. He would stand at the window with his tea going cold, listening. Somewhere out there a bell was ringing, faint and uneven, as if the buoy that carried it had grown tired. On the fourth morning the bell stopped.”\n\n';
const ASHBY = 'Read this extract, written in a 19th-century style.\n\n“It was a raw November evening when Mr Ashby first came to the village, and the lamps of the inn had scarcely been lit before the whole of the parlour knew of it. He was a tall, spare gentleman, with a coat too thin for the season and a manner too fine for the company; and though he asked for nothing but a chair by the fire, every eye in the room followed him to it.”\n\n';
const BEACH = 'Read this extract from a newspaper article.\n\n“Every summer, thousands of us leave the city for a beach we already know will be crowded. We queue for parking, queue for ice cream, queue for a square of sand. And yet we go back, year after year. Why? Perhaps because the sea offers something the city cannot: a horizon. For a few hours, nothing is built in front of us.”\n\n';
const HANDS = 'Read this poem.\n\nHands\n\nMy grandmother’s hands\nwere maps of every winter\nshe had walked through:\nthe knuckles hills,\nthe veins small rivers\nrunning nowhere\nbut home.\n\n';

const WRITING_MARKS = ['Content: engaging, with a clear sense of purpose and audience', 'Ambitious, well-chosen vocabulary and deliberate language features', 'Organisation: a clear structure, with varied paragraphs and connected ideas', 'Technical accuracy: sentences correctly marked, a range of punctuation, varied sentence forms', 'Accurate spelling, including ambitious words'];
const LIT_MARKS = ['A clear, well-argued response to the question across the whole text', 'Well-chosen references and quotations', 'Analysis of language, structure and form, using subject terms', 'Links to context (when and why the text was written) that shape the argument', 'Accurate spelling, punctuation and grammar'];

const S: Record<string, Question[]> = {
  fiction: [
    short('eng-fic-01', 4, 1, FOG + 'List four things you learn about the keeper’s surroundings from the extract.', ['Any four: fog comes in from the sea; there are rocks; steps lead up to the tower; the keeper is in a tower (lighthouse) with a window; a bell rings on a buoy out at sea']),
    long('eng-fic-02', 8, 2, FOG + 'How does the writer use language to create a sense of unease?', ['Simile “like a slow grey tide” makes the fog seem relentless and unstoppable', 'The verb “swallowing” personifies the fog as something that consumes', 'The list “the rocks, then the steps, then the bottom of the tower” shows the threat moving closer', 'The tea “going cold” suggests he is distracted and alone', '“Faint and uneven” and the “tired” buoy create a sense of something failing', 'Uses subject terms and embedded quotations, with the effect on the reader explained']),
    long('eng-fic-03', 8, 3, FOG + 'How has the writer structured the extract to interest you as a reader?', ['Opens with a routine that has broken down: “stopped counting the days”', 'Focus moves from the sea, to the tower, to the keeper', 'Repetition of mornings builds a pattern', 'The short final sentence breaks the pattern and creates tension', 'Withholds explanation, making the reader want to know more', 'Analyses the effect of each structural choice']),
    long('eng-fic-04', 20, 3, FOG + 'A student said: “The writer makes the keeper seem completely alone.” To what extent do you agree?', ['Gives a clear personal judgement', 'Evaluates methods, such as isolation in the tower and the fog cutting him off', 'Considers the bell as his only contact, and what its stopping suggests', 'Well-chosen quotations', 'Explores alternative readings', 'Sustained critical evaluation']),
    short('eng-fic-05', 2, 1, ASHBY + 'Give two things you learn about Mr Ashby.', ['Any two: tall, spare (thin), a gentleman, wears a coat too thin for November, has a fine manner, asks only for a chair by the fire']),
    long('eng-fic-06', 6, 2, ASHBY + 'How does the writer use language and structure to show how the villagers react to Mr Ashby?', ['“The whole of the parlour knew of it” shows news spreads instantly', 'Contrast “too thin for the season” and “too fine for the company” marks him as an outsider', 'The long sentence builds to “every eye in the room followed him”', 'The semicolon balances how he looks against how people react', 'Uses subject terms and explains the effect']),
    long('eng-fic-07', 15, 3, ASHBY + 'In this extract, the writer presents Mr Ashby as a mysterious figure. Evaluate how successfully this is achieved.', ['A clear judgement', 'Evaluates the details withheld about why he came', 'Explores the contrast between his appearance and the setting', 'Considers the villagers’ reaction as a way of building mystery', 'Well-chosen references', 'Critical, sustained evaluation']),
  ],
  creative: [
    long('eng-cre-01', 40, 2, 'Write a description suggested by this idea: a harbour during a storm.', WRITING_MARKS),
    long('eng-cre-02', 40, 2, 'Write a story that begins: “Nobody noticed the door until the morning it was open.”', WRITING_MARKS),
    long('eng-cre-03', 40, 3, 'Write about a time when you, or someone you imagine, waited for news.', WRITING_MARKS),
  ],
  nonfiction: [
    short('eng-nf-01', 4, 1, BEACH + 'Give four things the writer says about trips to the beach.', ['Any four: thousands leave the city each summer; the beach is crowded; people queue for parking, ice cream and sand; people go back every year; the sea offers a horizon; nothing is built in front of you']),
    long('eng-nf-02', 12, 2, BEACH + 'How does the writer use language to suggest that the beach is worth the trouble?', ['Repetition of “queue” exaggerates the frustration, for humour', 'Direct address with “us” and “we” includes the reader', 'The rhetorical question “Why?” turns the argument', '“A horizon” is set apart after a colon, for emphasis', 'The final sentence contrasts the beach with the city', 'Subject terms and effects on the reader explained']),
  ],
  viewpoint: [
    long('eng-vp-01', 40, 2, '“Teenagers spend too much time on their phones.” Write an article for a newspaper in which you argue for or against this statement.', WRITING_MARKS.concat('Rhetorical devices used with purpose, such as counter-argument and direct address')),
    long('eng-vp-02', 40, 3, 'Write the text of a speech for a school assembly persuading students to volunteer in their community.', WRITING_MARKS.concat('Speech features: direct address, a strong opening and ending')),
  ],
  spoken: [
    short('eng-spk-01', 3, 1, 'Give three ways to make a spoken presentation engaging.', ['Eye contact with the audience', 'Varied tone, pace and volume', 'A clear structure, using Standard English and answering questions well']),
  ],
  shakespeare: [
    short('eng-shk-01', 4, 2, 'Macbeth: Lady Macbeth tells Macbeth to “look like th’innocent flower, / But be the serpent under’t.” Explain what she means and the effect of the imagery.', ['He must appear innocent and welcoming', 'While hiding a deadly purpose', 'The serpent links to the Devil in the Garden of Eden', 'Shows her manipulation and the play’s theme of appearance against reality']),
    long('eng-shk-02', 30, 3, 'Macbeth: How does Shakespeare present ambition in Macbeth?', LIT_MARKS.concat('Context: the divine right of kings, James I, and Jacobean fears about regicide')),
    long('eng-shk-03', 30, 3, 'Romeo and Juliet: How does Shakespeare present conflict in Romeo and Juliet?', LIT_MARKS.concat('Context: family honour, patriarchy, and Elizabethan ideas of fate')),
  ],
  novel: [
    short('eng-nov-01', 4, 2, 'A Christmas Carol: Give two ways the Victorian context helps explain Dickens’ message.', ['The Poor Law and workhouses punished the poor', 'Developed with an example from the novella', 'Dickens campaigned about child poverty, ignorance and want', 'Developed']),
    long('eng-nov-02', 30, 3, 'A Christmas Carol: How does Dickens present Scrooge’s transformation?', LIT_MARKS.concat('Context: Victorian attitudes to poverty and charity')),
    long('eng-nov-03', 30, 3, 'The Strange Case of Dr Jekyll and Mr Hyde: How does Stevenson present the idea of duality?', LIT_MARKS.concat('Context: Victorian respectability, science and Darwin')),
  ],
  modern: [
    short('eng-mod-01', 4, 2, 'An Inspector Calls: Explain why it matters that the play is set in 1912 but was first performed in 1945.', ['Dramatic irony: Birling’s confident claims about the Titanic and war are proved wrong', 'This makes the audience distrust his views', 'A 1945 audience had lived through two wars', 'Priestley wanted them to choose a fairer society after the war']),
    long('eng-mod-02', 30, 3, 'An Inspector Calls: How does Priestley use the Inspector to present ideas about responsibility?', LIT_MARKS.concat('Context: Priestley’s socialism and the 1945 welfare state')),
  ],
  anthology: [
    long('eng-ant-01', 30, 3, 'Power and conflict: Compare how poets present the effects of war in “Exposure” and one other poem from the anthology.', ['A comparative argument throughout', 'Well-chosen references from both poems', 'Analysis of language, structure and form', 'Context that informs the comparison', 'Comments on similarities and differences in method']),
    long('eng-ant-02', 30, 3, 'Love and relationships: Compare how poets present family relationships in two poems from the anthology.', ['A comparative argument throughout', 'Well-chosen references from both poems', 'Analysis of language, structure and form', 'Context that informs the comparison', 'Comments on similarities and differences in method']),
  ],
  unseen: [
    short('eng-uns-01', 2, 1, HANDS + 'Identify a metaphor in the poem and explain its effect.', ['Such as “hands were maps” or “the knuckles hills”', 'Shows her hands carry the story of her hard life']),
    long('eng-uns-02', 24, 3, HANDS + 'How does the poet present the grandmother in this poem?', ['Extended metaphor of maps and landscape: her hands record her life', '“Every winter” suggests hardship endured', 'Natural imagery: hills and rivers make her seem part of the land', 'Short lines and enjambment slow the reading, like tracing a map', 'The ending “running nowhere / but home” turns from hardship to warmth', 'A clear, sustained interpretation using subject terms']),
  ],
};

/** Each English spec's topics, in catalogue order, mapped to the sets above. */
const MAP: Record<string, string[][]> = {
  'aqa-gcse-englang': [['fiction'], ['creative'], ['nonfiction'], ['viewpoint'], ['spoken']],
  'edx-gcse-englang': [['fiction'], ['creative'], ['nonfiction'], ['viewpoint'], ['spoken']],
  'ocr-gcse-englang': [['nonfiction'], ['viewpoint'], ['fiction'], ['creative'], ['spoken']],
  'aqa-gcse-englit': [['shakespeare'], ['novel'], ['modern'], ['anthology'], ['unseen']],
  'edx-gcse-englit': [['shakespeare'], ['modern'], ['novel'], ['anthology'], ['unseen']],
  'ocr-gcse-englit': [['modern'], ['novel'], ['anthology'], ['unseen'], ['shakespeare']],
};

const bank: Bank = {};
Object.entries(MAP).forEach(([specId, topics]) => topics.forEach((sets, i) => { bank[specId + ':' + i] = sets.flatMap((k) => S[k]); }));
export default bank;
