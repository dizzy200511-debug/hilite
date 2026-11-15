/**
 * Exam catalogue: qualifications, boards, specifications, papers and topics.
 *
 * Dates for summer 2027 come from the boards' own timetables:
 *  - AQA GCSE: provisional timetable v1.0 (January 2026), aqa.org.uk
 *  - Pearson Edexcel GCSE: final summer 2027 timetable
 *  - OCR GCSE: final examination timetable, June 2027 (edition dated June 2026), ocr.org.uk
 *  - A-level: AQA timetable v1.2, Pearson Edexcel GCE summer 2027 (final), OCR AS and A Level June 2027 (final)
 * Refresh this file every autumn when the next timetable is published.
 * Wednesday 23 June 2027 is the contingency day for every board.
 */

export type Board = 'AQA' | 'Edexcel' | 'OCR';
export type Qual = 'GCSE' | 'A-level';

export interface Sitting { date: string; session: 'AM' | 'PM' }
export interface Paper {
  id: string;
  code: string;
  name: string;
  mins: number;
  marks: number | null;
  topics?: number[];
  sitting?: Sitting;
}
export interface Spec {
  id: string;
  qual: Qual;
  board: Board;
  subject: string;
  code: string;
  tiered: boolean;
  firstExam: number;
  november?: boolean;
  papers: Paper[];
  topics: string[];
  note?: string;
}

export const BOARDS: Record<Board, { name: string; pastPapers: string; timetableSource: string }> = {
  AQA: {
    name: 'AQA',
    pastPapers: 'https://www.aqa.org.uk/find-past-papers-and-mark-schemes',
    timetableSource: 'AQA timetables, June 2027 (GCSE provisional v1.0; A-level v1.2)',
  },
  Edexcel: {
    name: 'Pearson Edexcel',
    pastPapers: 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html',
    timetableSource: 'Pearson Edexcel GCSE and GCE timetables, summer 2027 (final)',
  },
  OCR: {
    name: 'OCR',
    pastPapers: 'https://www.ocr.org.uk/qualifications/past-paper-finder/',
    timetableSource: 'OCR final examination timetables, June 2027',
  },
};

export const TIMETABLE_YEAR = 2027;
/** The day every board keeps free in case exams are disrupted. Students must stay available until then. */
export const CONTINGENCY_DAY = '2027-06-23';
const d = (day: number, month: 5 | 6, session: 'AM' | 'PM'): Sitting => ({ date: '2027-' + (month === 5 ? '05' : '06') + '-' + (day < 10 ? '0' : '') + day, session });

const BIO_AQA = ['Cell biology', 'Organisation', 'Infection and response', 'Bioenergetics', 'Homeostasis and response', 'Inheritance, variation and evolution', 'Ecology'];
const CHEM_AQA = ['Atomic structure and the periodic table', 'Bonding, structure and the properties of matter', 'Quantitative chemistry', 'Chemical changes', 'Energy changes', 'The rate and extent of chemical change', 'Organic chemistry', 'Chemical analysis', 'Chemistry of the atmosphere', 'Using resources'];
const PHYS_AQA = ['Energy', 'Electricity', 'Particle model of matter', 'Atomic structure', 'Forces', 'Waves', 'Magnetism and electromagnetism', 'Space physics'];
// OCR Gateway (A) science chapters. The practical skills chapter is tested across both papers, so it isn't listed.
const BIO_OCR = ['Cell level systems', 'Scaling up', 'Organism level systems', 'Community level systems', 'Genes, inheritance and variation', 'Global challenges'];
const CHEM_OCR = ['Particles', 'Elements, compounds and mixtures', 'Chemical reactions', 'Predicting and identifying reactions and products', 'Monitoring and controlling chemical reactions', 'Global challenges'];
const PHYS_OCR = ['Matter', 'Forces', 'Electricity', 'Magnetism and magnetic fields', 'Waves in matter', 'Radioactivity', 'Energy', 'Global challenges'];
// A-level maths content, the same for AQA, Edexcel and OCR.
const MATHS_AL = ['Proof', 'Algebra and functions', 'Coordinate geometry', 'Sequences and series', 'Trigonometry', 'Exponentials and logarithms', 'Differentiation', 'Integration', 'Numerical methods', 'Vectors', 'Statistics', 'Mechanics'];
const MATHS = ['Number', 'Algebra', 'Ratio, proportion and rates of change', 'Geometry and measures', 'Probability', 'Statistics'];
const BIO_EDX = ['Key concepts in biology', 'Cells and control', 'Genetics', 'Natural selection and genetic modification', 'Health, disease and the development of medicines', 'Plant structures and their functions', 'Animal coordination, control and homeostasis', 'Exchange and transport in animals', 'Ecosystems and material cycles'];
const CHEM_EDX = ['Key concepts in chemistry', 'States of matter and mixtures', 'Chemical changes', 'Extracting metals and equilibria', 'Groups in the periodic table', 'Rates of reaction and energy changes', 'Fuels and Earth science', 'Separate chemistry'];
const PHYS_EDX = ['Key concepts of physics', 'Motion and forces', 'Conservation of energy', 'Waves', 'Light and the electromagnetic spectrum', 'Radioactivity', 'Astronomy', 'Energy: forces doing work', 'Forces and their effects', 'Electricity and circuits', 'Static electricity', 'Magnetism and the motor effect', 'Electromagnetic induction', 'Particle model', 'Forces and matter'];
// Themes from the 2024 Edexcel languages specifications (first exams 2026). Keep the first five in place: ratings are stored by index.
const LANG_TOPICS = ['Listening', 'Reading', 'Writing', 'Speaking', 'Grammar', 'My personal world', 'Lifestyle and wellbeing', 'My neighbourhood', 'Media and technology', 'Studying and my future', 'Travel and tourism'];
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

export const SPECS: Spec[] = [
  // ---------------- AQA GCSE ----------------
  { id: 'aqa-gcse-bio', qual: 'GCSE', board: 'AQA', subject: 'Biology', code: '8461', tiered: true, firstExam: 2018, topics: BIO_AQA,
    papers: [
      { id: 'p1', code: '8461/1', name: 'Paper 1', mins: 105, marks: 100, topics: range(0, 3), sitting: d(11, 5, 'AM') },
      { id: 'p2', code: '8461/2', name: 'Paper 2', mins: 105, marks: 100, topics: range(4, 6), sitting: d(10, 6, 'AM') },
    ] },
  { id: 'aqa-gcse-chem', qual: 'GCSE', board: 'AQA', subject: 'Chemistry', code: '8462', tiered: true, firstExam: 2018, topics: CHEM_AQA,
    papers: [
      { id: 'p1', code: '8462/1', name: 'Paper 1', mins: 105, marks: 100, topics: range(0, 4), sitting: d(17, 5, 'AM') },
      { id: 'p2', code: '8462/2', name: 'Paper 2', mins: 105, marks: 100, topics: range(5, 9), sitting: d(15, 6, 'AM') },
    ] },
  { id: 'aqa-gcse-phys', qual: 'GCSE', board: 'AQA', subject: 'Physics', code: '8463', tiered: true, firstExam: 2018, topics: PHYS_AQA,
    papers: [
      { id: 'p1', code: '8463/1', name: 'Paper 1', mins: 105, marks: 100, topics: range(0, 3), sitting: d(25, 5, 'AM') },
      { id: 'p2', code: '8463/2', name: 'Paper 2', mins: 105, marks: 100, topics: range(4, 7), sitting: d(18, 6, 'AM') },
    ] },
  { id: 'aqa-gcse-trilogy', qual: 'GCSE', board: 'AQA', subject: 'Combined Science: Trilogy', code: '8464', tiered: true, firstExam: 2018,
    topics: BIO_AQA.map((t) => 'Biology: ' + t).concat(CHEM_AQA.map((t) => 'Chemistry: ' + t), PHYS_AQA.slice(0, 7).map((t) => 'Physics: ' + t)),
    papers: [
      { id: 'b1', code: '8464/B/1', name: 'Biology Paper 1', mins: 75, marks: 70, topics: range(0, 3), sitting: d(11, 5, 'AM') },
      { id: 'c1', code: '8464/C/1', name: 'Chemistry Paper 1', mins: 75, marks: 70, topics: range(7, 11), sitting: d(17, 5, 'AM') },
      { id: 'ph1', code: '8464/P/1', name: 'Physics Paper 1', mins: 75, marks: 70, topics: range(17, 20), sitting: d(25, 5, 'AM') },
      { id: 'b2', code: '8464/B/2', name: 'Biology Paper 2', mins: 75, marks: 70, topics: range(4, 6), sitting: d(10, 6, 'AM') },
      { id: 'c2', code: '8464/C/2', name: 'Chemistry Paper 2', mins: 75, marks: 70, topics: range(12, 16), sitting: d(15, 6, 'AM') },
      { id: 'ph2', code: '8464/P/2', name: 'Physics Paper 2', mins: 75, marks: 70, topics: range(21, 23), sitting: d(18, 6, 'AM') },
    ] },
  { id: 'aqa-gcse-maths', qual: 'GCSE', board: 'AQA', subject: 'Mathematics', code: '8300', tiered: true, firstExam: 2017, november: true, topics: MATHS,
    papers: [
      { id: 'p1', code: '8300/1', name: 'Paper 1 (non-calculator)', mins: 90, marks: 80, sitting: d(14, 5, 'AM') },
      { id: 'p2', code: '8300/2', name: 'Paper 2 (calculator)', mins: 90, marks: 80, sitting: d(27, 5, 'AM') },
      { id: 'p3', code: '8300/3', name: 'Paper 3 (calculator)', mins: 90, marks: 80, sitting: d(14, 6, 'AM') },
    ] },
  { id: 'aqa-gcse-englang', qual: 'GCSE', board: 'AQA', subject: 'English Language', code: '8700', tiered: false, firstExam: 2017, november: true,
    topics: ['Reading fiction', 'Descriptive or narrative writing', 'Reading non-fiction', 'Writing to present a viewpoint', 'Spoken language'],
    papers: [
      { id: 'p1', code: '8700/1', name: 'Paper 1: Explorations in creative reading and writing', mins: 105, marks: 80, topics: [0, 1], sitting: d(24, 5, 'AM') },
      { id: 'p2', code: '8700/2', name: 'Paper 2: Writers’ viewpoints and perspectives', mins: 105, marks: 80, topics: [2, 3], sitting: d(8, 6, 'AM') },
    ] },
  { id: 'aqa-gcse-englit', qual: 'GCSE', board: 'AQA', subject: 'English Literature', code: '8702', tiered: false, firstExam: 2017,
    topics: ['Shakespeare', 'The 19th-century novel', 'Modern prose or drama', 'Poetry anthology', 'Unseen poetry'],
    papers: [
      { id: 'p1', code: '8702/1', name: 'Paper 1: Shakespeare and the 19th-century novel', mins: 105, marks: 64, topics: [0, 1], sitting: d(12, 5, 'AM') },
      { id: 'p2', code: '8702/2', name: 'Paper 2: Modern texts and poetry', mins: 135, marks: 96, topics: [2, 3, 4], sitting: d(19, 5, 'AM') },
    ] },
  { id: 'aqa-gcse-cs', qual: 'GCSE', board: 'AQA', subject: 'Computer Science', code: '8525', tiered: false, firstExam: 2022,
    topics: ['Fundamentals of algorithms', 'Programming', 'Fundamentals of data representation', 'Computer systems', 'Fundamentals of computer networks', 'Cyber security', 'Relational databases and SQL', 'Ethical, legal and environmental impacts'],
    papers: [
      { id: 'p1', code: '8525/1', name: 'Paper 1: Computational thinking and programming skills', mins: 120, marks: 90, topics: [0, 1], sitting: d(10, 5, 'AM') },
      { id: 'p2', code: '8525/2', name: 'Paper 2: Computing concepts', mins: 105, marks: 90, topics: range(2, 7), sitting: d(19, 5, 'PM') },
    ] },
  { id: 'aqa-gcse-geog', qual: 'GCSE', board: 'AQA', subject: 'Geography', code: '8035', tiered: false, firstExam: 2018,
    topics: ['The challenge of natural hazards', 'The living world', 'Physical landscapes in the UK', 'Urban issues and challenges', 'The changing economic world', 'The challenge of resource management', 'Issue evaluation', 'Fieldwork'],
    papers: [
      { id: 'p1', code: '8035/1', name: 'Paper 1: Living with the physical environment', mins: 90, marks: 88, topics: [0, 1, 2], sitting: d(18, 5, 'AM') },
      { id: 'p2', code: '8035/2', name: 'Paper 2: Challenges in the human environment', mins: 90, marks: 88, topics: [3, 4, 5], sitting: d(26, 5, 'PM') },
      { id: 'p3', code: '8035/3', name: 'Paper 3: Geographical applications', mins: 90, marks: 76, topics: [6, 7], sitting: d(10, 6, 'PM') },
    ] },
  { id: 'aqa-gcse-hist', qual: 'GCSE', board: 'AQA', subject: 'History', code: '8145', tiered: false, firstExam: 2018,
    topics: ['Period study', 'Wider world depth study', 'Thematic study', 'British depth study and historic environment'],
    papers: [
      { id: 'p1', code: '8145/1', name: 'Paper 1: Understanding the modern world', mins: 120, marks: 84, topics: [0, 1], sitting: d(20, 5, 'AM') },
      { id: 'p2', code: '8145/2', name: 'Paper 2: Shaping the nation', mins: 120, marks: 84, topics: [2, 3], sitting: d(28, 5, 'AM') },
    ] },
  { id: 'aqa-gcse-psych', qual: 'GCSE', board: 'AQA', subject: 'Psychology', code: '8182', tiered: false, firstExam: 2019,
    topics: ['Memory', 'Perception', 'Development', 'Research methods', 'Social influence', 'Language, thought and communication', 'Brain and neuropsychology', 'Psychological problems'],
    papers: [
      { id: 'p1', code: '8182/1', name: 'Paper 1: Cognition and behaviour', mins: 105, marks: 100, topics: [0, 1, 2, 3], sitting: d(10, 5, 'PM') },
      { id: 'p2', code: '8182/2', name: 'Paper 2: Social context and behaviour', mins: 105, marks: 100, topics: [4, 5, 6, 7], sitting: d(17, 5, 'PM') },
    ] },
  { id: 'aqa-gcse-rs', qual: 'GCSE', board: 'AQA', subject: 'Religious Studies A', code: '8062', tiered: false, firstExam: 2018,
    topics: ['Religion 1: beliefs and teachings', 'Religion 1: practices', 'Religion 2: beliefs and teachings', 'Religion 2: practices', 'Relationships and families', 'Religion and life', 'Religion, peace and conflict', 'Religion, crime and punishment'],
    papers: [
      { id: 'p1', code: '8062/1', name: 'Paper 1: The study of religions', mins: 105, marks: null, topics: [0, 1, 2, 3], sitting: d(13, 5, 'AM') },
      { id: 'p2', code: '8062/2', name: 'Paper 2: Thematic studies', mins: 105, marks: null, topics: [4, 5, 6, 7], sitting: d(21, 5, 'AM') },
    ] },
  { id: 'aqa-gcse-bus', qual: 'GCSE', board: 'AQA', subject: 'Business', code: '8132', tiered: false, firstExam: 2019,
    topics: ['Business in the real world', 'Influences on business', 'Business operations', 'Human resources', 'Marketing', 'Finance'],
    papers: [
      { id: 'p1', code: '8132/1', name: 'Paper 1: Influences of operations and HRM', mins: 105, marks: 90, topics: [0, 1, 2, 3], sitting: d(12, 5, 'PM') },
      { id: 'p2', code: '8132/2', name: 'Paper 2: Influences of marketing and finance', mins: 105, marks: 90, topics: [0, 1, 4, 5], sitting: d(21, 5, 'PM') },
    ] },
  { id: 'aqa-gcse-soc', qual: 'GCSE', board: 'AQA', subject: 'Sociology', code: '8192', tiered: false, firstExam: 2019,
    topics: ['The sociological approach', 'Families', 'Education', 'Crime and deviance', 'Social stratification', 'Research methods'],
    papers: [
      { id: 'p1', code: '8192/1', name: 'Paper 1: Families and education', mins: 105, marks: 100, topics: [0, 1, 2, 5], sitting: d(11, 5, 'PM') },
      { id: 'p2', code: '8192/2', name: 'Paper 2: Crime and deviance, social stratification', mins: 105, marks: 100, topics: [0, 3, 4, 5], sitting: d(18, 5, 'PM') },
    ] },

  // ---------------- Pearson Edexcel GCSE ----------------
  { id: 'edx-gcse-maths', qual: 'GCSE', board: 'Edexcel', subject: 'Mathematics', code: '1MA1', tiered: true, firstExam: 2017, november: true, topics: MATHS,
    papers: [
      { id: 'p1', code: '1MA1/1', name: 'Paper 1 (non-calculator)', mins: 90, marks: 80, sitting: d(14, 5, 'AM') },
      { id: 'p2', code: '1MA1/2', name: 'Paper 2 (calculator)', mins: 90, marks: 80, sitting: d(27, 5, 'AM') },
      { id: 'p3', code: '1MA1/3', name: 'Paper 3 (calculator)', mins: 90, marks: 80, sitting: d(14, 6, 'AM') },
    ] },
  { id: 'edx-gcse-hist', qual: 'GCSE', board: 'Edexcel', subject: 'History', code: '1HI0', tiered: false, firstExam: 2018,
    topics: ['Thematic study and historic environment', 'Period study', 'British depth study', 'Modern depth study'],
    papers: [
      { id: 'p1', code: '1HI0/1', name: 'Paper 1: Thematic study and historic environment', mins: 80, marks: 52, topics: [0], sitting: d(20, 5, 'AM') },
      { id: 'p2', code: '1HI0/2', name: 'Paper 2: Period study and British depth study', mins: 110, marks: 64, topics: [1, 2], sitting: d(28, 5, 'AM') },
      { id: 'p3', code: '1HI0/3', name: 'Paper 3: Modern depth study', mins: 90, marks: 52, topics: [3], sitting: d(9, 6, 'PM') },
    ] },
  { id: 'edx-gcse-englit', qual: 'GCSE', board: 'Edexcel', subject: 'English Literature', code: '1ET0', tiered: false, firstExam: 2017,
    topics: ['Shakespeare', 'Post-1914 British play or novel', '19th-century novel', 'Poetry anthology', 'Unseen poetry'],
    papers: [
      { id: 'p1', code: '1ET0/01', name: 'Paper 1: Shakespeare and post-1914 literature', mins: 105, marks: 80, topics: [0, 1], sitting: d(12, 5, 'AM') },
      { id: 'p2', code: '1ET0/02', name: 'Paper 2: 19th-century novel and poetry since 1789', mins: 135, marks: 80, topics: [2, 3, 4], sitting: d(19, 5, 'AM') },
    ] },
  { id: 'edx-gcse-englang', qual: 'GCSE', board: 'Edexcel', subject: 'English Language', code: '1EN0', tiered: false, firstExam: 2017, november: true,
    topics: ['Reading 19th-century fiction', 'Imaginative writing', 'Reading non-fiction', 'Transactional writing', 'Spoken language'],
    papers: [
      { id: 'p1', code: '1EN0/01', name: 'Paper 1: Fiction and imaginative writing', mins: 105, marks: 64, topics: [0, 1], sitting: d(24, 5, 'AM') },
      { id: 'p2', code: '1EN0/02', name: 'Paper 2: Non-fiction and transactional writing', mins: 125, marks: 96, topics: [2, 3], sitting: d(8, 6, 'AM') },
    ] },
  { id: 'edx-gcse-bio', qual: 'GCSE', board: 'Edexcel', subject: 'Biology', code: '1BI0', tiered: true, firstExam: 2018, topics: BIO_EDX,
    papers: [
      { id: 'p1', code: '1BI0/1', name: 'Paper 1', mins: 105, marks: 100, topics: range(0, 4), sitting: d(11, 5, 'AM') },
      { id: 'p2', code: '1BI0/2', name: 'Paper 2', mins: 105, marks: 100, topics: [0].concat(range(5, 8)), sitting: d(10, 6, 'AM') },
    ] },
  { id: 'edx-gcse-chem', qual: 'GCSE', board: 'Edexcel', subject: 'Chemistry', code: '1CH0', tiered: true, firstExam: 2018, topics: CHEM_EDX,
    papers: [
      { id: 'p1', code: '1CH0/1', name: 'Paper 1', mins: 105, marks: 100, topics: [0, 1, 2, 3, 7], sitting: d(17, 5, 'AM') },
      { id: 'p2', code: '1CH0/2', name: 'Paper 2', mins: 105, marks: 100, topics: [0, 4, 5, 6, 7], sitting: d(15, 6, 'AM') },
    ] },
  { id: 'edx-gcse-phys', qual: 'GCSE', board: 'Edexcel', subject: 'Physics', code: '1PH0', tiered: true, firstExam: 2018, topics: PHYS_EDX,
    papers: [
      { id: 'p1', code: '1PH0/1', name: 'Paper 1', mins: 105, marks: 100, topics: range(0, 7), sitting: d(25, 5, 'AM') },
      { id: 'p2', code: '1PH0/2', name: 'Paper 2', mins: 105, marks: 100, topics: [0].concat(range(8, 14)), sitting: d(18, 6, 'AM') },
    ] },
  { id: 'edx-gcse-combined', qual: 'GCSE', board: 'Edexcel', subject: 'Combined Science', code: '1SC0', tiered: true, firstExam: 2018,
    topics: BIO_EDX.map((t) => 'Biology: ' + t).concat(CHEM_EDX.slice(0, 7).map((t) => 'Chemistry: ' + t), PHYS_EDX.slice(0, 6).concat(PHYS_EDX.slice(7, 9), PHYS_EDX.slice(9, 10), PHYS_EDX.slice(11, 15)).map((t) => 'Physics: ' + t)),
    papers: [
      { id: 'b1', code: '1SC0/1B', name: 'Paper 1: Biology 1', mins: 70, marks: 60, sitting: d(11, 5, 'AM') },
      { id: 'c1', code: '1SC0/1C', name: 'Paper 2: Chemistry 1', mins: 70, marks: 60, sitting: d(17, 5, 'AM') },
      { id: 'ph1', code: '1SC0/1P', name: 'Paper 3: Physics 1', mins: 70, marks: 60, sitting: d(25, 5, 'AM') },
      { id: 'b2', code: '1SC0/2B', name: 'Paper 4: Biology 2', mins: 70, marks: 60, sitting: d(10, 6, 'AM') },
      { id: 'c2', code: '1SC0/2C', name: 'Paper 5: Chemistry 2', mins: 70, marks: 60, sitting: d(15, 6, 'AM') },
      { id: 'ph2', code: '1SC0/2P', name: 'Paper 6: Physics 2', mins: 70, marks: 60, sitting: d(18, 6, 'AM') },
    ] },
  { id: 'edx-gcse-geoga', qual: 'GCSE', board: 'Edexcel', subject: 'Geography A', code: '1GA0', tiered: false, firstExam: 2018,
    topics: ['The changing landscapes of the UK', 'Weather hazards and climate change', 'Ecosystems, biodiversity and management', 'Changing cities', 'Global development', 'Resource management', 'Geographical investigations: fieldwork', 'UK challenges'],
    papers: [
      { id: 'p1', code: '1GA0/01', name: 'Paper 1: The physical environment', mins: 105, marks: null, topics: [0, 1, 2], sitting: d(18, 5, 'AM') },
      { id: 'p2', code: '1GA0/02', name: 'Paper 2: The human environment', mins: 90, marks: null, topics: [3, 4, 5], sitting: d(26, 5, 'PM') },
      { id: 'p3', code: '1GA0/03', name: 'Paper 3: Fieldwork and UK challenges', mins: 90, marks: null, topics: [6, 7], sitting: d(10, 6, 'PM') },
    ] },
  { id: 'edx-gcse-geogb', qual: 'GCSE', board: 'Edexcel', subject: 'Geography B', code: '1GB0', tiered: false, firstExam: 2018,
    topics: ['Hazardous Earth', 'Development dynamics', 'Challenges of an urbanising world', 'The UK’s evolving physical landscape', 'The UK’s evolving human landscape', 'Geographical investigations', 'People and the biosphere', 'Forests under threat', 'Consuming energy resources'],
    papers: [
      { id: 'p1', code: '1GB0/01', name: 'Paper 1: Global geographical issues', mins: 90, marks: null, topics: [0, 1, 2], sitting: d(18, 5, 'AM') },
      { id: 'p2', code: '1GB0/02', name: 'Paper 2: UK geographical issues', mins: 105, marks: null, topics: [3, 4, 5], sitting: d(26, 5, 'PM') },
      { id: 'p3', code: '1GB0/03', name: 'Paper 3: People and environment issues', mins: 90, marks: null, topics: [6, 7, 8], sitting: d(10, 6, 'PM') },
    ] },
  { id: 'edx-gcse-bus', qual: 'GCSE', board: 'Edexcel', subject: 'Business', code: '1BS0', tiered: false, firstExam: 2019,
    topics: ['Enterprise and entrepreneurship', 'Spotting a business opportunity', 'Putting a business idea into practice', 'Making the business effective', 'Understanding external influences on business', 'Growing the business', 'Making marketing decisions', 'Making operational decisions', 'Making financial decisions', 'Making human resource decisions'],
    papers: [
      { id: 'p1', code: '1BS0/01', name: 'Paper 1: Investigating small business', mins: 105, marks: 90, topics: range(0, 4), sitting: d(12, 5, 'PM') },
      { id: 'p2', code: '1BS0/02', name: 'Paper 2: Building a business', mins: 105, marks: 90, topics: range(5, 9), sitting: d(21, 5, 'PM') },
    ] },
  { id: 'edx-gcse-french', qual: 'GCSE', board: 'Edexcel', subject: 'French', code: '1FR1', tiered: true, firstExam: 2026, topics: LANG_TOPICS,
    note: 'Speaking (Paper 1) is done at school before the written exams, so it isn’t in the timetable.',
    papers: [
      { id: 'p2', code: '1FR1/2', name: 'Paper 2: Listening', mins: 60, marks: null, topics: [0], sitting: d(26, 5, 'AM') },
      { id: 'p3', code: '1FR1/3', name: 'Paper 3: Reading', mins: 60, marks: null, topics: [1], sitting: d(8, 6, 'PM') },
      { id: 'p4', code: '1FR1/4', name: 'Paper 4: Writing', mins: 80, marks: null, topics: [2, 4], sitting: d(14, 6, 'PM') },
    ] },
  { id: 'edx-gcse-spanish', qual: 'GCSE', board: 'Edexcel', subject: 'Spanish', code: '1SP1', tiered: true, firstExam: 2026, topics: LANG_TOPICS,
    note: 'Speaking (Paper 1) is done at school before the written exams, so it isn’t in the timetable.',
    papers: [
      { id: 'p2', code: '1SP1/2', name: 'Paper 2: Listening', mins: 60, marks: null, topics: [0], sitting: d(9, 6, 'AM') },
      { id: 'p3', code: '1SP1/3', name: 'Paper 3: Reading', mins: 60, marks: null, topics: [1], sitting: d(16, 6, 'PM') },
      { id: 'p4', code: '1SP1/4', name: 'Paper 4: Writing', mins: 80, marks: null, topics: [2, 4], sitting: d(17, 6, 'PM') },
    ] },
  { id: 'edx-gcse-german', qual: 'GCSE', board: 'Edexcel', subject: 'German', code: '1GN1', tiered: true, firstExam: 2026, topics: LANG_TOPICS,
    note: 'Speaking (Paper 1) is done at school before the written exams, so it isn’t in the timetable.',
    papers: [
      { id: 'p2', code: '1GN1/2', name: 'Paper 2: Listening', mins: 60, marks: null, topics: [0], sitting: d(10, 5, 'PM') },
      { id: 'p3', code: '1GN1/3', name: 'Paper 3: Reading', mins: 60, marks: null, topics: [1], sitting: d(18, 5, 'PM') },
      { id: 'p4', code: '1GN1/4', name: 'Paper 4: Writing', mins: 80, marks: null, topics: [2, 4], sitting: d(20, 5, 'PM') },
    ] },

  // ---------------- OCR GCSE ----------------
  // Tiered OCR papers have separate Foundation and Higher codes, sat at the same time.
  { id: 'ocr-gcse-cs', qual: 'GCSE', board: 'OCR', subject: 'Computer Science', code: 'J277', tiered: false, firstExam: 2022,
    topics: ['Systems architecture', 'Memory and storage', 'Computer networks, connections and protocols', 'Network security', 'Systems software', 'Ethical, legal, cultural and environmental impacts', 'Algorithms', 'Programming fundamentals', 'Producing robust programs', 'Boolean logic', 'Programming languages and IDEs'],
    papers: [
      { id: 'p1', code: 'J277/01', name: 'Paper 1: Computer systems', mins: 90, marks: 80, topics: range(0, 5), sitting: d(10, 5, 'AM') },
      { id: 'p2', code: 'J277/02', name: 'Paper 2: Computational thinking, algorithms and programming', mins: 90, marks: 80, topics: range(6, 10), sitting: d(19, 5, 'PM') },
    ] },
  { id: 'ocr-gcse-maths', qual: 'GCSE', board: 'OCR', subject: 'Mathematics', code: 'J560', tiered: true, firstExam: 2017, november: true, topics: MATHS,
    papers: [
      { id: 'p1', code: 'J560/01 or 04', name: 'Paper 1 (calculator)', mins: 90, marks: 100, sitting: d(14, 5, 'AM') },
      { id: 'p2', code: 'J560/02 or 05', name: 'Paper 2 (non-calculator)', mins: 90, marks: 100, sitting: d(27, 5, 'AM') },
      { id: 'p3', code: 'J560/03 or 06', name: 'Paper 3 (calculator)', mins: 90, marks: 100, sitting: d(14, 6, 'AM') },
    ] },
  { id: 'ocr-gcse-bio', qual: 'GCSE', board: 'OCR', subject: 'Biology A (Gateway)', code: 'J247', tiered: true, firstExam: 2018, topics: BIO_OCR,
    papers: [
      { id: 'p1', code: 'J247/01 or 03', name: 'Paper 1', mins: 105, marks: 90, topics: range(0, 2), sitting: d(11, 5, 'AM') },
      { id: 'p2', code: 'J247/02 or 04', name: 'Paper 2', mins: 105, marks: 90, topics: range(3, 5), sitting: d(10, 6, 'AM') },
    ] },
  { id: 'ocr-gcse-chem', qual: 'GCSE', board: 'OCR', subject: 'Chemistry A (Gateway)', code: 'J248', tiered: true, firstExam: 2018, topics: CHEM_OCR,
    papers: [
      { id: 'p1', code: 'J248/01 or 03', name: 'Paper 1', mins: 105, marks: 90, topics: range(0, 2), sitting: d(17, 5, 'AM') },
      { id: 'p2', code: 'J248/02 or 04', name: 'Paper 2', mins: 105, marks: 90, topics: range(3, 5), sitting: d(15, 6, 'AM') },
    ] },
  { id: 'ocr-gcse-phys', qual: 'GCSE', board: 'OCR', subject: 'Physics A (Gateway)', code: 'J249', tiered: true, firstExam: 2018, topics: PHYS_OCR,
    papers: [
      { id: 'p1', code: 'J249/01 or 03', name: 'Paper 1', mins: 105, marks: 90, topics: range(0, 3), sitting: d(25, 5, 'AM') },
      { id: 'p2', code: 'J249/02 or 04', name: 'Paper 2', mins: 105, marks: 90, topics: range(4, 7), sitting: d(18, 6, 'AM') },
    ] },
  { id: 'ocr-gcse-combined', qual: 'GCSE', board: 'OCR', subject: 'Combined Science A (Gateway)', code: 'J250', tiered: true, firstExam: 2018,
    topics: BIO_OCR.map((t) => 'Biology: ' + t).concat(CHEM_OCR.map((t) => 'Chemistry: ' + t), ['Matter', 'Forces', 'Electricity and magnetism', 'Waves and radioactivity', 'Energy', 'Global challenges'].map((t) => 'Physics: ' + t)),
    papers: [
      { id: 'b1', code: 'J250/01 or 07', name: 'Paper 1: Biology', mins: 70, marks: 60, topics: range(0, 2), sitting: d(11, 5, 'AM') },
      { id: 'c1', code: 'J250/03 or 09', name: 'Paper 3: Chemistry', mins: 70, marks: 60, topics: range(6, 8), sitting: d(17, 5, 'AM') },
      { id: 'ph1', code: 'J250/05 or 11', name: 'Paper 5: Physics', mins: 70, marks: 60, topics: range(12, 14), sitting: d(25, 5, 'AM') },
      { id: 'b2', code: 'J250/02 or 08', name: 'Paper 2: Biology', mins: 70, marks: 60, topics: range(3, 5), sitting: d(10, 6, 'AM') },
      { id: 'c2', code: 'J250/04 or 10', name: 'Paper 4: Chemistry', mins: 70, marks: 60, topics: range(9, 11), sitting: d(15, 6, 'AM') },
      { id: 'ph2', code: 'J250/06 or 12', name: 'Paper 6: Physics', mins: 70, marks: 60, topics: range(15, 17), sitting: d(18, 6, 'AM') },
    ] },
  { id: 'ocr-gcse-englang', qual: 'GCSE', board: 'OCR', subject: 'English Language', code: 'J351', tiered: false, firstExam: 2017, november: true,
    topics: ['Reading non-fiction', 'Writing for information and ideas', 'Reading literary fiction', 'Imaginative writing', 'Spoken language'],
    papers: [
      { id: 'p1', code: 'J351/01', name: 'Paper 1: Communicating information and ideas', mins: 120, marks: 80, topics: [0, 1], sitting: d(24, 5, 'AM') },
      { id: 'p2', code: 'J351/02', name: 'Paper 2: Exploring effects and impact', mins: 120, marks: 80, topics: [2, 3], sitting: d(8, 6, 'AM') },
    ] },
  { id: 'ocr-gcse-englit', qual: 'GCSE', board: 'OCR', subject: 'English Literature', code: 'J352', tiered: false, firstExam: 2017,
    topics: ['Modern prose or drama', '19th-century prose', 'Poetry anthology', 'Unseen poetry', 'Shakespeare'],
    papers: [
      { id: 'p1', code: 'J352/01', name: 'Paper 1: Exploring modern and literary heritage texts', mins: 120, marks: 80, topics: [0, 1], sitting: d(12, 5, 'AM') },
      { id: 'p2', code: 'J352/02', name: 'Paper 2: Exploring poetry and Shakespeare', mins: 120, marks: 80, topics: [2, 3, 4], sitting: d(19, 5, 'AM') },
    ] },
  { id: 'ocr-gcse-hista', qual: 'GCSE', board: 'OCR', subject: 'History A (Explaining the Modern World)', code: 'J410', tiered: false, firstExam: 2018,
    topics: ['Period study', 'Non-British depth study', 'Thematic study', 'British depth study', 'Historic environment'],
    papers: [
      { id: 'p1', code: 'J410/01–07', name: 'Paper 1: Period study with non-British depth study', mins: 105, marks: null, topics: [0, 1], sitting: d(20, 5, 'AM') },
      { id: 'p2', code: 'J410/08–10', name: 'Paper 2: Thematic study', mins: 60, marks: null, topics: [2], sitting: d(28, 5, 'AM') },
      { id: 'p3', code: 'J410/11–13', name: 'Paper 3: British depth study with the historic environment', mins: 75, marks: null, topics: [3, 4], sitting: d(9, 6, 'PM') },
    ] },
  { id: 'ocr-gcse-histb', qual: 'GCSE', board: 'OCR', subject: 'History B (Schools History Project)', code: 'J411', tiered: false, firstExam: 2018,
    topics: ['British thematic study', 'British depth study', 'History around us', 'World period study', 'World depth study'],
    papers: [
      { id: 'p1', code: 'J411/11–19', name: 'Paper 1: British thematic study and depth study', mins: 105, marks: null, topics: [0, 1], sitting: d(28, 5, 'AM') },
      { id: 'p2', code: 'J411/21', name: 'Paper 2: History around us', mins: 60, marks: null, topics: [2], sitting: d(20, 5, 'AM') },
      { id: 'p3', code: 'J411/31–39', name: 'Paper 3: World period study and depth study', mins: 105, marks: null, topics: [3, 4], sitting: d(9, 6, 'PM') },
    ] },
  { id: 'ocr-gcse-geoga', qual: 'GCSE', board: 'OCR', subject: 'Geography A (Geographical Themes)', code: 'J383', tiered: false, firstExam: 2018,
    topics: ['Landscapes of the UK', 'People of the UK', 'UK environmental challenges', 'Ecosystems of the planet', 'People of the planet', 'Environmental threats to our planet', 'Geographical skills and fieldwork'],
    papers: [
      { id: 'p1', code: 'J383/01', name: 'Paper 1: Living in the UK today', mins: 60, marks: null, topics: [0, 1, 2], sitting: d(18, 5, 'AM') },
      { id: 'p2', code: 'J383/02', name: 'Paper 2: The world around us', mins: 60, marks: null, topics: [3, 4, 5], sitting: d(26, 5, 'PM') },
      { id: 'p3', code: 'J383/03', name: 'Paper 3: Geographical skills', mins: 90, marks: null, topics: [6], sitting: d(10, 6, 'PM') },
    ] },
  { id: 'ocr-gcse-geogb', qual: 'GCSE', board: 'OCR', subject: 'Geography B (Geography for Enquiring Minds)', code: 'J384', tiered: false, firstExam: 2018,
    topics: ['Global hazards', 'Changing climate', 'Distinctive landscapes', 'Sustaining ecosystems', 'Urban futures', 'Dynamic development', 'UK in the 21st century', 'Resource reliance', 'Fieldwork', 'Geographical exploration'],
    papers: [
      { id: 'p1', code: 'J384/01', name: 'Paper 1: Our natural world', mins: 90, marks: null, topics: [0, 1, 2, 3, 8], sitting: d(18, 5, 'AM') },
      { id: 'p2', code: 'J384/02', name: 'Paper 2: People and society', mins: 90, marks: null, topics: [4, 5, 6, 7, 8], sitting: d(26, 5, 'PM') },
      { id: 'p3', code: 'J384/03', name: 'Paper 3: Geographical exploration', mins: 90, marks: null, topics: [9], sitting: d(10, 6, 'PM') },
    ] },
  { id: 'ocr-gcse-rs', qual: 'GCSE', board: 'OCR', subject: 'Religious Studies', code: 'J625', tiered: false, firstExam: 2018,
    note: 'You sit two of the religion papers (J625/01–05), one after the other on the morning of 13 May.',
    topics: ['Religion 1: beliefs and teachings', 'Religion 1: practices', 'Religion 2: beliefs and teachings', 'Religion 2: practices', 'Relationships and families', 'The existence of God', 'Religion, peace and conflict', 'Dialogue between religious and non-religious beliefs'],
    papers: [
      { id: 'p1', code: 'J625/01–05', name: 'Religion 1: beliefs, teachings and practices', mins: 60, marks: null, topics: [0, 1], sitting: d(13, 5, 'AM') },
      { id: 'p2', code: 'J625/01–05', name: 'Religion 2: beliefs, teachings and practices', mins: 60, marks: null, topics: [2, 3], sitting: d(13, 5, 'AM') },
      { id: 'p3', code: 'J625/06–10', name: 'Religion, philosophy and ethics in the modern world', mins: 120, marks: null, topics: [4, 5, 6, 7], sitting: d(21, 5, 'AM') },
    ] },
  { id: 'ocr-gcse-psych', qual: 'GCSE', board: 'OCR', subject: 'Psychology', code: 'J203', tiered: false, firstExam: 2019,
    topics: ['Criminal psychology', 'Development', 'Psychological problems', 'Social influence', 'Memory', 'Sleep and dreaming', 'Research methods'],
    papers: [
      { id: 'p1', code: 'J203/01', name: 'Paper 1: Studies and applications in psychology 1', mins: 90, marks: null, topics: [0, 1, 2, 6], sitting: d(10, 5, 'PM') },
      { id: 'p2', code: 'J203/02', name: 'Paper 2: Studies and applications in psychology 2', mins: 90, marks: null, topics: [3, 4, 5, 6], sitting: d(17, 5, 'PM') },
    ] },
  { id: 'ocr-gcse-bus', qual: 'GCSE', board: 'OCR', subject: 'Business', code: 'J204', tiered: false, firstExam: 2019,
    topics: ['Business activity', 'Marketing', 'People', 'Operations', 'Finance', 'Influences on business', 'The interdependent nature of business'],
    papers: [
      { id: 'p1', code: 'J204/01', name: 'Paper 1: Business activity, marketing and people', mins: 90, marks: 80, topics: [0, 1, 2], sitting: d(12, 5, 'PM') },
      { id: 'p2', code: 'J204/02', name: 'Paper 2: Operations, finance and influences on business', mins: 90, marks: 80, topics: [3, 4, 5, 6], sitting: d(21, 5, 'PM') },
    ] },
  { id: 'ocr-gcse-econ', qual: 'GCSE', board: 'OCR', subject: 'Economics', code: 'J205', tiered: false, firstExam: 2019,
    topics: ['Introduction to economics', 'The role of markets and money', 'Economic objectives and the role of government', 'International trade and the global economy'],
    papers: [
      { id: 'p1', code: 'J205/01', name: 'Paper 1: Introduction to economics', mins: 90, marks: 80, topics: [0, 1], sitting: d(13, 5, 'PM') },
      { id: 'p2', code: 'J205/02', name: 'Paper 2: National and international economics', mins: 90, marks: 80, topics: [2, 3], sitting: d(25, 5, 'PM') },
    ] },
  { id: 'ocr-gcse-pe', qual: 'GCSE', board: 'OCR', subject: 'Physical Education', code: 'J587', tiered: false, firstExam: 2018,
    note: 'Practical performance and analysis is assessed at school, so it isn’t in the timetable.',
    topics: ['Applied anatomy and physiology', 'Physical training', 'Socio-cultural influences', 'Sports psychology', 'Health, fitness and well-being'],
    papers: [
      { id: 'p1', code: 'J587/01', name: 'Paper 1: Physical factors affecting performance', mins: 60, marks: 60, topics: [0, 1], sitting: d(13, 5, 'PM') },
      { id: 'p2', code: 'J587/02', name: 'Paper 2: Socio-cultural issues and sports psychology', mins: 60, marks: 60, topics: [2, 3, 4], sitting: d(20, 5, 'PM') },
    ] },
  // ================= A-level =================
  // Dates: AQA A-level timetable May/June 2027 (v1.2), Pearson Edexcel GCE summer 2027 (final),
  // OCR AS and A Level final examination timetable June 2027. Where a paper has options sat at the
  // same time, the code shows the range.

  // ---------------- AQA A-level ----------------
  { id: 'aqa-al-bio', qual: 'A-level', board: 'AQA', subject: 'Biology', code: '7402', tiered: false, firstExam: 2017,
    note: 'The practical endorsement is assessed at school, so it isn’t in the timetable.',
    topics: ['Biological molecules', 'Cells', 'Organisms exchange substances with their environment', 'Genetic information, variation and relationships between organisms', 'Energy transfers in and between organisms', 'Organisms respond to changes in their environments', 'Genetics, populations, evolution and ecosystems', 'The control of gene expression'],
    papers: [
      { id: 'p1', code: '7402/1', name: 'Paper 1', mins: 120, marks: 91, topics: range(0, 3), sitting: d(7, 6, 'PM') },
      { id: 'p2', code: '7402/2', name: 'Paper 2', mins: 120, marks: 91, topics: range(4, 7), sitting: d(14, 6, 'PM') },
      { id: 'p3', code: '7402/3', name: 'Paper 3', mins: 120, marks: 78, topics: range(0, 7), sitting: d(18, 6, 'AM') },
    ] },
  { id: 'aqa-al-chem', qual: 'A-level', board: 'AQA', subject: 'Chemistry', code: '7405', tiered: false, firstExam: 2017,
    note: 'The practical endorsement is assessed at school, so it isn’t in the timetable.',
    topics: ['Physical chemistry', 'Inorganic chemistry', 'Organic chemistry'],
    papers: [
      { id: 'p1', code: '7405/1', name: 'Paper 1: Inorganic and physical chemistry', mins: 120, marks: 105, topics: [0, 1], sitting: d(28, 5, 'AM') },
      { id: 'p2', code: '7405/2', name: 'Paper 2: Organic and physical chemistry', mins: 120, marks: 105, topics: [0, 2], sitting: d(10, 6, 'AM') },
      { id: 'p3', code: '7405/3', name: 'Paper 3', mins: 120, marks: 90, topics: [0, 1, 2], sitting: d(17, 6, 'AM') },
    ] },
  { id: 'aqa-al-phys', qual: 'A-level', board: 'AQA', subject: 'Physics', code: '7408', tiered: false, firstExam: 2017,
    note: 'The practical endorsement is assessed at school, so it isn’t in the timetable.',
    topics: ['Measurements and their errors', 'Particles and radiation', 'Waves', 'Mechanics and materials', 'Electricity', 'Further mechanics and thermal physics', 'Fields and their consequences', 'Nuclear physics', 'Option: astrophysics, medical, engineering, turning points or electronics'],
    papers: [
      { id: 'p1', code: '7408/1', name: 'Paper 1', mins: 120, marks: 85, topics: range(0, 5), sitting: d(21, 5, 'AM') },
      { id: 'p2', code: '7408/2', name: 'Paper 2', mins: 120, marks: 85, topics: range(5, 7), sitting: d(27, 5, 'PM') },
      { id: 'p3', code: '7408/3', name: 'Paper 3: Practical skills, data analysis and option', mins: 120, marks: 80, topics: [0, 8], sitting: d(8, 6, 'AM') },
    ] },
  { id: 'aqa-al-maths', qual: 'A-level', board: 'AQA', subject: 'Mathematics', code: '7357', tiered: false, firstExam: 2019, topics: MATHS_AL,
    papers: [
      { id: 'p1', code: '7357/1', name: 'Paper 1: Pure', mins: 120, marks: 100, topics: range(0, 9), sitting: d(26, 5, 'PM') },
      { id: 'p2', code: '7357/2', name: 'Paper 2: Pure and mechanics', mins: 120, marks: 100, topics: range(0, 9).concat(11), sitting: d(9, 6, 'PM') },
      { id: 'p3', code: '7357/3', name: 'Paper 3: Pure and statistics', mins: 120, marks: 100, topics: range(0, 10), sitting: d(16, 6, 'PM') },
    ] },
  { id: 'aqa-al-fmaths', qual: 'A-level', board: 'AQA', subject: 'Further Mathematics', code: '7367', tiered: false, firstExam: 2019,
    topics: ['Proof', 'Complex numbers', 'Matrices', 'Further algebra and functions', 'Further calculus', 'Further vectors', 'Polar coordinates', 'Hyperbolic functions', 'Differential equations', 'Option: mechanics, statistics or discrete'],
    papers: [
      { id: 'p1', code: '7367/1', name: 'Paper 1', mins: 120, marks: 100, topics: range(0, 8), sitting: d(20, 5, 'PM') },
      { id: 'p2', code: '7367/2', name: 'Paper 2', mins: 120, marks: 100, topics: range(0, 8), sitting: d(25, 5, 'PM') },
      { id: 'p3', code: '7367/3D, 3M or 3S', name: 'Paper 3: Discrete, mechanics or statistics', mins: 120, marks: 100, topics: [9], sitting: d(10, 6, 'PM') },
    ] },
  { id: 'aqa-al-psych', qual: 'A-level', board: 'AQA', subject: 'Psychology', code: '7182', tiered: false, firstExam: 2017,
    topics: ['Social influence', 'Memory', 'Attachment', 'Psychopathology', 'Approaches in psychology', 'Biopsychology', 'Research methods', 'Issues and debates', 'Option 1: relationships, gender or cognition and development', 'Option 2: schizophrenia, eating behaviour or stress', 'Option 3: aggression, forensic psychology or addiction'],
    papers: [
      { id: 'p1', code: '7182/1', name: 'Paper 1: Introductory topics in psychology', mins: 120, marks: 96, topics: range(0, 3), sitting: d(18, 5, 'AM') },
      { id: 'p2', code: '7182/2', name: 'Paper 2: Psychology in context', mins: 120, marks: 96, topics: [4, 5, 6], sitting: d(25, 5, 'AM') },
      { id: 'p3', code: '7182/3', name: 'Paper 3: Issues and options in psychology', mins: 120, marks: 96, topics: [7, 8, 9, 10], sitting: d(9, 6, 'AM') },
    ] },
  { id: 'aqa-al-soc', qual: 'A-level', board: 'AQA', subject: 'Sociology', code: '7192', tiered: false, firstExam: 2017,
    topics: ['Education', 'Theory and methods', 'Families and households', 'Beliefs in society', 'Crime and deviance', 'Other topics: culture and identity, health, work, the media, stratification, global development'],
    papers: [
      { id: 'p1', code: '7192/1', name: 'Paper 1: Education with theory and methods', mins: 120, marks: 80, topics: [0, 1], sitting: d(14, 5, 'PM') },
      { id: 'p2', code: '7192/2', name: 'Paper 2: Topics in sociology', mins: 120, marks: 80, topics: [2, 3, 5], sitting: d(21, 5, 'AM') },
      { id: 'p3', code: '7192/3', name: 'Paper 3: Crime and deviance with theory and methods', mins: 120, marks: 80, topics: [4, 1], sitting: d(10, 6, 'AM') },
    ] },
  { id: 'aqa-al-englit', qual: 'A-level', board: 'AQA', subject: 'English Literature A', code: '7712', tiered: false, firstExam: 2017,
    note: 'The independent critical study is coursework, so it isn’t in the timetable.',
    topics: ['Love through the ages: Shakespeare', 'Love through the ages: poetry', 'Love through the ages: prose', 'Texts in shared contexts', 'Unseen prose and poetry', 'Independent critical study (coursework)'],
    papers: [
      { id: 'p1', code: '7712/1', name: 'Paper 1: Love through the ages', mins: 180, marks: 75, topics: [0, 1, 2, 4], sitting: d(13, 5, 'AM') },
      { id: 'p2', code: '7712/2A or 2B', name: 'Paper 2: Texts in shared contexts', mins: 150, marks: 75, topics: [3, 4], sitting: d(20, 5, 'AM') },
    ] },
  { id: 'aqa-al-englang', qual: 'A-level', board: 'AQA', subject: 'English Language', code: '7702', tiered: false, firstExam: 2017,
    note: 'Language in action is coursework, so it isn’t in the timetable.',
    topics: ['Textual variations and representations', 'Children’s language development', 'Language diversity', 'Language change', 'Language in action (coursework)'],
    papers: [
      { id: 'p1', code: '7702/1', name: 'Paper 1: Language, the individual and society', mins: 150, marks: 100, topics: [0, 1], sitting: d(10, 5, 'AM') },
      { id: 'p2', code: '7702/2', name: 'Paper 2: Language diversity and change', mins: 150, marks: 100, topics: [2, 3], sitting: d(17, 5, 'AM') },
    ] },
  { id: 'aqa-al-hist', qual: 'A-level', board: 'AQA', subject: 'History', code: '7042', tiered: false, firstExam: 2017,
    note: 'Your school chooses one breadth study (1A–1L) and one depth study (2A–2T). The historical investigation is coursework.',
    topics: ['Breadth study', 'Depth study', 'Historical investigation (coursework)'],
    papers: [
      { id: 'p1', code: '7042/1A–1L', name: 'Component 1: Breadth study', mins: 150, marks: 80, topics: [0], sitting: d(19, 5, 'PM') },
      { id: 'p2', code: '7042/2A–2T', name: 'Component 2: Depth study', mins: 150, marks: 80, topics: [1], sitting: d(26, 5, 'AM') },
    ] },
  { id: 'aqa-al-geog', qual: 'A-level', board: 'AQA', subject: 'Geography', code: '7037', tiered: false, firstExam: 2018,
    note: 'The fieldwork investigation is coursework, so it isn’t in the timetable.',
    topics: ['Water and carbon cycles', 'Coastal systems or glacial systems', 'Hazards', 'Ecosystems under stress', 'Global systems and global governance', 'Changing places', 'Contemporary urban environments', 'Population and the environment', 'Resource security', 'Fieldwork investigation (coursework)'],
    papers: [
      { id: 'p1', code: '7037/1', name: 'Paper 1: Physical geography', mins: 150, marks: 120, topics: [0, 1, 2, 3], sitting: d(11, 5, 'AM') },
      { id: 'p2', code: '7037/2', name: 'Paper 2: Human geography', mins: 150, marks: 120, topics: [4, 5, 6, 7, 8], sitting: d(20, 5, 'PM') },
    ] },
  { id: 'aqa-al-econ', qual: 'A-level', board: 'AQA', subject: 'Economics', code: '7136', tiered: false, firstExam: 2017,
    topics: ['Individuals, firms, markets and market failure', 'The national and international economy', 'Economic methodology and the economic problem'],
    papers: [
      { id: 'p1', code: '7136/1', name: 'Paper 1: Markets and market failure', mins: 120, marks: 80, topics: [0, 2], sitting: d(10, 5, 'AM') },
      { id: 'p2', code: '7136/2', name: 'Paper 2: National and international economy', mins: 120, marks: 80, topics: [1, 2], sitting: d(17, 5, 'PM') },
      { id: 'p3', code: '7136/3', name: 'Paper 3: Economic principles and issues', mins: 120, marks: 80, topics: [0, 1, 2], sitting: d(7, 6, 'AM') },
    ] },
  { id: 'aqa-al-bus', qual: 'A-level', board: 'AQA', subject: 'Business', code: '7132', tiered: false, firstExam: 2017,
    topics: ['What is business?', 'Managers, leadership and decision making', 'Improving marketing performance', 'Improving operational performance', 'Improving financial performance', 'Improving human resource performance', 'Analysing the strategic position of a business', 'Choosing strategic direction', 'Strategic methods', 'Managing strategic change'],
    papers: [
      { id: 'p1', code: '7132/1', name: 'Paper 1: Business 1', mins: 120, marks: 100, sitting: d(13, 5, 'PM') },
      { id: 'p2', code: '7132/2', name: 'Paper 2: Business 2', mins: 120, marks: 100, sitting: d(19, 5, 'AM') },
      { id: 'p3', code: '7132/3', name: 'Paper 3: Business 3', mins: 120, marks: 100, sitting: d(8, 6, 'PM') },
    ] },
  { id: 'aqa-al-cs', qual: 'A-level', board: 'AQA', subject: 'Computer Science', code: '7517', tiered: false, firstExam: 2017,
    note: 'Paper 1 is on screen in the language your school chose. The project is coursework.',
    topics: ['Fundamentals of programming', 'Fundamentals of data structures', 'Fundamentals of algorithms', 'Theory of computation', 'Fundamentals of data representation', 'Fundamentals of computer systems', 'Computer organisation and architecture', 'Consequences of uses of computing', 'Communication and networking', 'Fundamentals of databases', 'Big Data', 'Functional programming', 'Systematic approach to problem solving', 'Non-exam assessment (coursework)'],
    papers: [
      { id: 'p1', code: '7517/1A–1E', name: 'Paper 1 (on screen)', mins: 150, marks: 100, topics: [0, 1, 2, 3, 12], sitting: d(7, 6, 'PM') },
      { id: 'p2', code: '7517/2', name: 'Paper 2', mins: 150, marks: 100, topics: range(4, 11), sitting: d(15, 6, 'AM') },
    ] },
  { id: 'aqa-al-pol', qual: 'A-level', board: 'AQA', subject: 'Politics', code: '7152', tiered: false, firstExam: 2019,
    topics: ['Government of the UK', 'Politics of the UK', 'Government of the USA', 'Politics of the USA', 'Comparative politics', 'Political ideas: liberalism, conservatism and socialism', 'Political ideas: optional ideology'],
    papers: [
      { id: 'p1', code: '7152/1', name: 'Paper 1: Government and politics of the UK', mins: 120, marks: 77, topics: [0, 1], sitting: d(12, 5, 'AM') },
      { id: 'p2', code: '7152/2', name: 'Paper 2: Government and politics of the USA', mins: 120, marks: 77, topics: [2, 3, 4], sitting: d(24, 5, 'PM') },
      { id: 'p3', code: '7152/3', name: 'Paper 3: Political ideas', mins: 120, marks: 77, topics: [5, 6], sitting: d(15, 6, 'PM') },
    ] },
  { id: 'aqa-al-rs', qual: 'A-level', board: 'AQA', subject: 'Religious Studies', code: '7062', tiered: false, firstExam: 2018,
    topics: ['Philosophy of religion', 'Ethics and religion', 'Study of religion', 'Dialogues between religion and philosophy, and religion and ethics'],
    papers: [
      { id: 'p1', code: '7062/1', name: 'Paper 1: Philosophy of religion and ethics', mins: 180, marks: 100, topics: [0, 1], sitting: d(27, 5, 'AM') },
      { id: 'p2', code: '7062/2A–2E', name: 'Paper 2: Study of religion and dialogues', mins: 180, marks: 100, topics: [2, 3], sitting: d(8, 6, 'AM') },
    ] },

  // ---------------- Pearson Edexcel A-level ----------------
  { id: 'edx-al-maths', qual: 'A-level', board: 'Edexcel', subject: 'Mathematics', code: '9MA0', tiered: false, firstExam: 2018, topics: MATHS_AL,
    papers: [
      { id: 'p1', code: '9MA0/01', name: 'Paper 1: Pure mathematics 1', mins: 120, marks: 100, topics: range(0, 9), sitting: d(26, 5, 'PM') },
      { id: 'p2', code: '9MA0/02', name: 'Paper 2: Pure mathematics 2', mins: 120, marks: 100, topics: range(0, 9), sitting: d(9, 6, 'PM') },
      { id: 'p3', code: '9MA0/03', name: 'Paper 3: Statistics and mechanics', mins: 120, marks: 100, topics: [10, 11], sitting: d(16, 6, 'PM') },
    ] },
  { id: 'edx-al-fmaths', qual: 'A-level', board: 'Edexcel', subject: 'Further Mathematics', code: '9FM0', tiered: false, firstExam: 2019,
    note: 'You sit two option papers from 3A–3D and 4A–4D. Ignore the dates for the options you don’t take.',
    topics: ['Core pure mathematics', 'Further pure mathematics', 'Further statistics', 'Further mechanics', 'Decision mathematics'],
    papers: [
      { id: 'p1', code: '9FM0/01', name: 'Paper 1: Core pure mathematics 1', mins: 90, marks: 75, topics: [0], sitting: d(12, 5, 'PM') },
      { id: 'p2', code: '9FM0/02', name: 'Paper 2: Core pure mathematics 2', mins: 90, marks: 75, topics: [0], sitting: d(20, 5, 'PM') },
      { id: 'p3c', code: '9FM0/3C', name: 'Paper 3C: Further mechanics 1', mins: 90, marks: 75, topics: [3], sitting: d(25, 5, 'PM') },
      { id: 'p3b', code: '9FM0/3B', name: 'Paper 3B: Further statistics 1', mins: 90, marks: 75, topics: [2], sitting: d(10, 6, 'PM') },
      { id: 'p3d', code: '9FM0/3D', name: 'Paper 3D: Decision mathematics 1', mins: 90, marks: 75, topics: [4], sitting: d(15, 6, 'PM') },
      { id: 'p3a', code: '9FM0/3A', name: 'Paper 3A: Further pure mathematics 1', mins: 90, marks: 75, topics: [1], sitting: d(18, 6, 'PM') },
      { id: 'p4', code: '9FM0/4A–4D', name: 'Paper 4: second option', mins: 90, marks: 75, topics: [1, 2, 3, 4], sitting: d(21, 6, 'PM') },
    ] },
  { id: 'edx-al-bioa', qual: 'A-level', board: 'Edexcel', subject: 'Biology A (Salters-Nuffield)', code: '9BN0', tiered: false, firstExam: 2017,
    topics: ['Lifestyle, health and risk', 'Genes and health', 'Voice of the genome', 'Biodiversity and natural resources', 'On the wild side', 'Immunity, infection and forensics', 'Run for your life', 'Grey matter'],
    papers: [
      { id: 'p1', code: '9BN0/01', name: 'Paper 1: The natural environment and species survival', mins: 120, marks: 100, topics: range(0, 5), sitting: d(7, 6, 'PM') },
      { id: 'p2', code: '9BN0/02', name: 'Paper 2: Energy, exercise and co-ordination', mins: 120, marks: 100, topics: [0, 1, 2, 3, 6, 7], sitting: d(14, 6, 'PM') },
      { id: 'p3', code: '9BN0/03', name: 'Paper 3: General and practical applications in biology', mins: 120, marks: 100, topics: range(0, 7), sitting: d(18, 6, 'AM') },
    ] },
  { id: 'edx-al-biob', qual: 'A-level', board: 'Edexcel', subject: 'Biology B', code: '9BI0', tiered: false, firstExam: 2017,
    topics: ['Biological molecules', 'Cells, viruses and reproduction of living things', 'Classification and biodiversity', 'Exchange and transport', 'Energy for biological processes', 'Microbiology and pathogens', 'Modern genetics', 'Origins of genetic variation', 'Control systems', 'Ecosystems'],
    papers: [
      { id: 'p1', code: '9BI0/01', name: 'Paper 1: Advanced biochemistry, microbiology and genetics', mins: 105, marks: 100, topics: range(0, 6), sitting: d(7, 6, 'PM') },
      { id: 'p2', code: '9BI0/02', name: 'Paper 2: Advanced physiology, evolution and ecology', mins: 105, marks: 100, topics: [0, 1, 2, 3, 4, 7, 8, 9], sitting: d(14, 6, 'PM') },
      { id: 'p3', code: '9BI0/03', name: 'Paper 3: General and practical principles in biology', mins: 150, marks: 120, topics: range(0, 9), sitting: d(18, 6, 'AM') },
    ] },
  { id: 'edx-al-chem', qual: 'A-level', board: 'Edexcel', subject: 'Chemistry', code: '9CH0', tiered: false, firstExam: 2017,
    topics: ['Atomic structure and the periodic table', 'Bonding and structure', 'Redox', 'Inorganic chemistry and the periodic table', 'Formulae, equations and amounts of substance', 'Organic chemistry', 'Modern analytical techniques', 'Energetics', 'Kinetics', 'Equilibrium and acid-base equilibria', 'Transition metals'],
    papers: [
      { id: 'p1', code: '9CH0/01', name: 'Paper 1: Advanced inorganic and physical chemistry', mins: 105, marks: 90, topics: [0, 1, 2, 3, 4, 7, 9, 10], sitting: d(28, 5, 'AM') },
      { id: 'p2', code: '9CH0/02', name: 'Paper 2: Advanced organic and physical chemistry', mins: 105, marks: 90, topics: [1, 4, 5, 6, 8, 9], sitting: d(10, 6, 'AM') },
      { id: 'p3', code: '9CH0/03', name: 'Paper 3: General and practical principles in chemistry', mins: 150, marks: 120, topics: range(0, 10), sitting: d(17, 6, 'AM') },
    ] },
  { id: 'edx-al-phys', qual: 'A-level', board: 'Edexcel', subject: 'Physics', code: '9PH0', tiered: false, firstExam: 2017,
    topics: ['Working as a physicist', 'Mechanics', 'Electric circuits', 'Materials', 'Waves and the particle nature of light', 'Further mechanics', 'Electric and magnetic fields', 'Nuclear and particle physics', 'Thermodynamics', 'Space', 'Nuclear radiation', 'Gravitational fields', 'Oscillations'],
    papers: [
      { id: 'p1', code: '9PH0/01', name: 'Paper 1: Advanced physics I', mins: 105, marks: 90, topics: [0, 1, 2, 5, 6, 7], sitting: d(21, 5, 'AM') },
      { id: 'p2', code: '9PH0/02', name: 'Paper 2: Advanced physics II', mins: 105, marks: 90, topics: [0, 3, 4, 8, 9, 10, 11, 12], sitting: d(27, 5, 'PM') },
      { id: 'p3', code: '9PH0/03', name: 'Paper 3: General and practical principles in physics', mins: 150, marks: 120, topics: range(0, 12), sitting: d(8, 6, 'AM') },
    ] },
  { id: 'edx-al-econ', qual: 'A-level', board: 'Edexcel', subject: 'Economics A', code: '9EC0', tiered: false, firstExam: 2017,
    topics: ['Introduction to markets and market failure', 'The UK economy: performance and policies', 'Business behaviour and the labour market', 'A global perspective'],
    papers: [
      { id: 'p1', code: '9EC0/01', name: 'Paper 1: Markets and business behaviour', mins: 120, marks: 100, topics: [0, 2], sitting: d(10, 5, 'AM') },
      { id: 'p2', code: '9EC0/02', name: 'Paper 2: The national and global economy', mins: 120, marks: 100, topics: [1, 3], sitting: d(17, 5, 'PM') },
      { id: 'p3', code: '9EC0/03', name: 'Paper 3: Microeconomics and macroeconomics', mins: 120, marks: 100, topics: [0, 1, 2, 3], sitting: d(7, 6, 'AM') },
    ] },
  { id: 'edx-al-bus', qual: 'A-level', board: 'Edexcel', subject: 'Business', code: '9BS0', tiered: false, firstExam: 2017,
    topics: ['Marketing and people', 'Managing business activities', 'Business decisions and strategy', 'Global business'],
    papers: [
      { id: 'p1', code: '9BS0/01', name: 'Paper 1: Marketing, people and global businesses', mins: 120, marks: 100, topics: [0, 3], sitting: d(13, 5, 'PM') },
      { id: 'p2', code: '9BS0/02', name: 'Paper 2: Business activities, decisions and strategy', mins: 120, marks: 100, topics: [1, 2], sitting: d(19, 5, 'AM') },
      { id: 'p3', code: '9BS0/03', name: 'Paper 3: Investigating business in a competitive environment', mins: 120, marks: 100, topics: [0, 1, 2, 3], sitting: d(8, 6, 'PM') },
    ] },
  { id: 'edx-al-hist', qual: 'A-level', board: 'Edexcel', subject: 'History', code: '9HI0', tiered: false, firstExam: 2017,
    note: 'Your school chooses the options for each paper. Coursework is assessed separately.',
    topics: ['Breadth study with historical interpretations', 'Depth study', 'Themes in breadth with aspects in depth', 'Coursework'],
    papers: [
      { id: 'p1', code: '9HI0/1A–1H', name: 'Paper 1: Breadth study with interpretations', mins: 135, marks: 60, topics: [0], sitting: d(19, 5, 'PM') },
      { id: 'p2', code: '9HI0/2A–2H', name: 'Paper 2: Depth study', mins: 90, marks: 40, topics: [1], sitting: d(26, 5, 'AM') },
      { id: 'p3', code: '9HI0/30–39', name: 'Paper 3: Themes in breadth with aspects in depth', mins: 135, marks: 60, topics: [2], sitting: d(14, 6, 'AM') },
    ] },
  { id: 'edx-al-geog', qual: 'A-level', board: 'Edexcel', subject: 'Geography', code: '9GE0', tiered: false, firstExam: 2018,
    topics: ['Tectonic processes and hazards', 'Landscape systems, processes and change', 'The water cycle and water insecurity', 'The carbon cycle and energy security', 'Globalisation', 'Shaping places', 'Superpowers', 'Global development and connections', 'Synoptic investigation'],
    papers: [
      { id: 'p1', code: '9GE0/01', name: 'Paper 1', mins: 135, marks: 105, topics: [0, 1, 2, 3], sitting: d(11, 5, 'AM') },
      { id: 'p2', code: '9GE0/02', name: 'Paper 2', mins: 135, marks: 105, topics: [4, 5, 6, 7], sitting: d(20, 5, 'PM') },
      { id: 'p3', code: '9GE0/03', name: 'Paper 3', mins: 135, marks: 70, topics: [8], sitting: d(10, 6, 'PM') },
    ] },
  { id: 'edx-al-psych', qual: 'A-level', board: 'Edexcel', subject: 'Psychology', code: '9PS0', tiered: false, firstExam: 2017,
    topics: ['Social psychology', 'Cognitive psychology', 'Biological psychology', 'Learning theories', 'Clinical psychology', 'Option: criminological, child or health psychology', 'Psychological skills: methods and issues'],
    papers: [
      { id: 'p1', code: '9PS0/01', name: 'Paper 1: Foundations in psychology', mins: 135, marks: 90, topics: [0, 1, 2, 3], sitting: d(18, 5, 'AM') },
      { id: 'p2', code: '9PS0/02', name: 'Paper 2: Applications of psychology', mins: 135, marks: 90, topics: [4, 5], sitting: d(25, 5, 'AM') },
      { id: 'p3', code: '9PS0/03', name: 'Paper 3: Psychological skills', mins: 120, marks: 80, topics: [6], sitting: d(9, 6, 'AM') },
    ] },
  { id: 'edx-al-pol', qual: 'A-level', board: 'Edexcel', subject: 'Politics', code: '9PL0', tiered: false, firstExam: 2019,
    topics: ['UK politics', 'Core political ideas', 'UK government', 'Non-core political ideas', 'Comparative politics: USA or global'],
    papers: [
      { id: 'p1', code: '9PL0/01', name: 'Paper 1: UK politics and core political ideas', mins: 120, marks: 84, topics: [0, 1], sitting: d(12, 5, 'AM') },
      { id: 'p2', code: '9PL0/02', name: 'Paper 2: UK government and non-core political ideas', mins: 120, marks: 84, topics: [2, 3], sitting: d(24, 5, 'PM') },
      { id: 'p3', code: '9PL0/3A or 3B', name: 'Paper 3: Comparative politics', mins: 120, marks: 84, topics: [4], sitting: d(15, 6, 'PM') },
    ] },
  { id: 'edx-al-englit', qual: 'A-level', board: 'Edexcel', subject: 'English Literature', code: '9ET0', tiered: false, firstExam: 2017,
    note: 'Coursework is assessed separately, so it isn’t in the timetable.',
    topics: ['Drama', 'Prose', 'Poetry', 'Coursework'],
    papers: [
      { id: 'p1', code: '9ET0/01', name: 'Paper 1: Drama', mins: 135, marks: 60, topics: [0], sitting: d(13, 5, 'AM') },
      { id: 'p2', code: '9ET0/02', name: 'Paper 2: Prose', mins: 75, marks: 40, topics: [1], sitting: d(20, 5, 'AM') },
      { id: 'p3', code: '9ET0/03', name: 'Paper 3: Poetry', mins: 135, marks: 60, topics: [2], sitting: d(28, 5, 'AM') },
    ] },
  { id: 'edx-al-englang', qual: 'A-level', board: 'Edexcel', subject: 'English Language', code: '9EN0', tiered: false, firstExam: 2017,
    note: 'Crafting language is coursework, so it isn’t in the timetable.',
    topics: ['Language variation', 'Child language', 'Investigating language', 'Crafting language (coursework)'],
    papers: [
      { id: 'p1', code: '9EN0/01', name: 'Paper 1: Language variation', mins: 135, marks: 80, topics: [0], sitting: d(10, 5, 'AM') },
      { id: 'p2', code: '9EN0/02', name: 'Paper 2: Child language', mins: 75, marks: 40, topics: [1], sitting: d(17, 5, 'AM') },
      { id: 'p3', code: '9EN0/03', name: 'Paper 3: Investigating language', mins: 105, marks: 50, topics: [2], sitting: d(26, 5, 'PM') },
    ] },
  { id: 'edx-al-rs', qual: 'A-level', board: 'Edexcel', subject: 'Religious Studies', code: '9RS0', tiered: false, firstExam: 2018,
    topics: ['Philosophy of religion', 'Religion and ethics', 'New Testament studies', 'Study of religion'],
    papers: [
      { id: 'p1', code: '9RS0/01', name: 'Paper 1: Philosophy of religion', mins: 120, marks: 80, topics: [0], sitting: d(27, 5, 'AM') },
      { id: 'p2', code: '9RS0/02', name: 'Paper 2: Religion and ethics', mins: 120, marks: 80, topics: [1], sitting: d(8, 6, 'AM') },
      { id: 'p3', code: '9RS0/03', name: 'Paper 3: New Testament studies', mins: 120, marks: 80, topics: [2], sitting: d(16, 6, 'AM') },
      { id: 'p4', code: '9RS0/4A–4F', name: 'Paper 4: Study of religion', mins: 120, marks: 80, topics: [3], sitting: d(21, 6, 'PM') },
    ] },

  // ---------------- OCR A-level ----------------
  { id: 'ocr-al-maths', qual: 'A-level', board: 'OCR', subject: 'Mathematics A', code: 'H240', tiered: false, firstExam: 2018, topics: MATHS_AL,
    papers: [
      { id: 'p1', code: 'H240/01', name: 'Paper 1: Pure mathematics', mins: 120, marks: 100, topics: range(0, 9), sitting: d(26, 5, 'PM') },
      { id: 'p2', code: 'H240/02', name: 'Paper 2: Pure mathematics and statistics', mins: 120, marks: 100, topics: range(0, 10), sitting: d(9, 6, 'PM') },
      { id: 'p3', code: 'H240/03', name: 'Paper 3: Pure mathematics and mechanics', mins: 120, marks: 100, topics: range(0, 9).concat(11), sitting: d(16, 6, 'PM') },
    ] },
  { id: 'ocr-al-bio', qual: 'A-level', board: 'OCR', subject: 'Biology A', code: 'H420', tiered: false, firstExam: 2017,
    topics: ['Development of practical skills', 'Foundations in biology', 'Exchange and transport', 'Biodiversity, evolution and disease', 'Communication, homeostasis and energy', 'Genetics, evolution and ecosystems'],
    papers: [
      { id: 'p1', code: 'H420/01', name: 'Paper 1: Biological processes', mins: 135, marks: 100, topics: [0, 1, 2, 4], sitting: d(7, 6, 'PM') },
      { id: 'p2', code: 'H420/02', name: 'Paper 2: Biological diversity', mins: 135, marks: 100, topics: [0, 1, 3, 5], sitting: d(14, 6, 'PM') },
      { id: 'p3', code: 'H420/03', name: 'Paper 3: Unified biology', mins: 90, marks: 70, topics: range(0, 5), sitting: d(18, 6, 'AM') },
    ] },
  { id: 'ocr-al-chem', qual: 'A-level', board: 'OCR', subject: 'Chemistry A', code: 'H432', tiered: false, firstExam: 2017,
    topics: ['Development of practical skills', 'Foundations in chemistry', 'Periodic table and energy', 'Core organic chemistry', 'Physical chemistry and transition elements', 'Organic chemistry and analysis'],
    papers: [
      { id: 'p1', code: 'H432/01', name: 'Paper 1: Periodic table, elements and physical chemistry', mins: 135, marks: 100, topics: [0, 1, 2, 4], sitting: d(28, 5, 'AM') },
      { id: 'p2', code: 'H432/02', name: 'Paper 2: Synthesis and analytical techniques', mins: 135, marks: 100, topics: [0, 1, 3, 5], sitting: d(10, 6, 'AM') },
      { id: 'p3', code: 'H432/03', name: 'Paper 3: Unified chemistry', mins: 90, marks: 70, topics: range(0, 5), sitting: d(17, 6, 'AM') },
    ] },
  { id: 'ocr-al-phys', qual: 'A-level', board: 'OCR', subject: 'Physics A', code: 'H556', tiered: false, firstExam: 2017,
    topics: ['Development of practical skills', 'Foundations of physics', 'Forces and motion', 'Electrons, waves and photons', 'Newtonian world and astrophysics', 'Particles and medical physics'],
    papers: [
      { id: 'p1', code: 'H556/01', name: 'Paper 1: Modelling physics', mins: 135, marks: 100, topics: [0, 1, 2, 4], sitting: d(21, 5, 'AM') },
      { id: 'p2', code: 'H556/02', name: 'Paper 2: Exploring physics', mins: 135, marks: 100, topics: [0, 1, 3, 5], sitting: d(27, 5, 'PM') },
      { id: 'p3', code: 'H556/03', name: 'Paper 3: Unified physics', mins: 90, marks: 70, topics: range(0, 5), sitting: d(8, 6, 'AM') },
    ] },
  { id: 'ocr-al-cs', qual: 'A-level', board: 'OCR', subject: 'Computer Science', code: 'H446', tiered: false, firstExam: 2017,
    note: 'The programming project is coursework, so it isn’t in the timetable.',
    topics: ['The characteristics of contemporary processors', 'Software and software development', 'Exchanging data', 'Data types, data structures and algorithms', 'Legal, moral, cultural and ethical issues', 'Elements of computational thinking', 'Problem solving and programming', 'Algorithms', 'Programming project (coursework)'],
    papers: [
      { id: 'p1', code: 'H446/01', name: 'Paper 1: Computer systems', mins: 150, marks: 140, topics: range(0, 4), sitting: d(7, 6, 'PM') },
      { id: 'p2', code: 'H446/02', name: 'Paper 2: Algorithms and programming', mins: 150, marks: 140, topics: [5, 6, 7], sitting: d(15, 6, 'AM') },
    ] },
  { id: 'ocr-al-psych', qual: 'A-level', board: 'OCR', subject: 'Psychology', code: 'H567', tiered: false, firstExam: 2017,
    topics: ['Research methods', 'Core studies', 'Approaches and perspectives', 'Issues and debates', 'Issues in mental health', 'Option: child, criminal, environmental, or sport and exercise psychology'],
    papers: [
      { id: 'p1', code: 'H567/01', name: 'Paper 1: Research methods', mins: 120, marks: 90, topics: [0], sitting: d(18, 5, 'AM') },
      { id: 'p2', code: 'H567/02', name: 'Paper 2: Psychological themes through core studies', mins: 120, marks: 105, topics: [1, 2, 3], sitting: d(25, 5, 'AM') },
      { id: 'p3', code: 'H567/03', name: 'Paper 3: Applied psychology', mins: 120, marks: 105, topics: [4, 5], sitting: d(9, 6, 'AM') },
    ] },
  { id: 'ocr-al-hist', qual: 'A-level', board: 'OCR', subject: 'History A', code: 'H505', tiered: false, firstExam: 2017,
    note: 'Your school chooses one unit from each group. The topic-based essay is coursework.',
    topics: ['British period study', 'Enquiry', 'Non-British period study', 'Thematic study', 'Historical interpretations', 'Topic-based essay (coursework)'],
    papers: [
      { id: 'p3', code: 'Y301–Y321', name: 'Unit group 3: Thematic study and historical interpretations', mins: 150, marks: 80, topics: [3, 4], sitting: d(19, 5, 'PM') },
      { id: 'p1', code: 'Y101–Y113', name: 'Unit group 1: British period study and enquiry', mins: 90, marks: 50, topics: [0, 1], sitting: d(26, 5, 'AM') },
      { id: 'p2', code: 'Y201–Y224', name: 'Unit group 2: Non-British period study', mins: 60, marks: 30, topics: [2], sitting: d(14, 6, 'AM') },
    ] },
  { id: 'ocr-al-englit', qual: 'A-level', board: 'OCR', subject: 'English Literature', code: 'H472', tiered: false, firstExam: 2017,
    note: 'Literature post-1900 is coursework, so it isn’t in the timetable.',
    topics: ['Shakespeare', 'Drama and poetry pre-1900', 'Comparative and contextual study', 'Literature post-1900 (coursework)'],
    papers: [
      { id: 'p1', code: 'H472/01', name: 'Paper 1: Drama and poetry pre-1900', mins: 150, marks: 60, topics: [0, 1], sitting: d(13, 5, 'AM') },
      { id: 'p2', code: 'H472/02', name: 'Paper 2: Comparative and contextual study', mins: 150, marks: 60, topics: [2], sitting: d(20, 5, 'AM') },
    ] },
  { id: 'ocr-al-econ', qual: 'A-level', board: 'OCR', subject: 'Economics', code: 'H460', tiered: false, firstExam: 2017,
    topics: ['Microeconomics', 'Macroeconomics', 'Themes in economics'],
    papers: [
      { id: 'p1', code: 'H460/01', name: 'Paper 1: Microeconomics', mins: 120, marks: 80, topics: [0], sitting: d(10, 5, 'AM') },
      { id: 'p2', code: 'H460/02', name: 'Paper 2: Macroeconomics', mins: 120, marks: 80, topics: [1], sitting: d(17, 5, 'PM') },
      { id: 'p3', code: 'H460/03', name: 'Paper 3: Themes in economics', mins: 120, marks: 80, topics: [0, 1, 2], sitting: d(7, 6, 'AM') },
    ] },
  { id: 'ocr-al-geog', qual: 'A-level', board: 'OCR', subject: 'Geography', code: 'H481', tiered: false, firstExam: 2018,
    note: 'The investigative geography project is coursework, so it isn’t in the timetable.',
    topics: ['Landscape systems', 'Earth’s life support systems', 'Changing spaces; making places', 'Global connections', 'Geographical debates', 'Investigative geography (coursework)'],
    papers: [
      { id: 'p1', code: 'H481/01', name: 'Paper 1: Physical systems', mins: 90, marks: 66, topics: [0, 1], sitting: d(11, 5, 'AM') },
      { id: 'p2', code: 'H481/02', name: 'Paper 2: Human interactions', mins: 90, marks: 66, topics: [2, 3], sitting: d(20, 5, 'PM') },
      { id: 'p3', code: 'H481/03', name: 'Paper 3: Geographical debates', mins: 150, marks: 108, topics: [4], sitting: d(10, 6, 'PM') },
    ] },
  { id: 'ocr-al-rs', qual: 'A-level', board: 'OCR', subject: 'Religious Studies', code: 'H573', tiered: false, firstExam: 2018,
    topics: ['Philosophy of religion', 'Religion and ethics', 'Developments in religious thought'],
    papers: [
      { id: 'p1', code: 'H573/01', name: 'Paper 1: Philosophy of religion', mins: 120, marks: 120, topics: [0], sitting: d(27, 5, 'AM') },
      { id: 'p2', code: 'H573/02', name: 'Paper 2: Religion and ethics', mins: 120, marks: 120, topics: [1], sitting: d(8, 6, 'AM') },
      { id: 'p3', code: 'H573/03–07', name: 'Paper 3: Developments in religious thought', mins: 120, marks: 120, topics: [2], sitting: d(16, 6, 'AM') },
    ] },
  { id: 'ocr-al-soc', qual: 'A-level', board: 'OCR', subject: 'Sociology', code: 'H580', tiered: false, firstExam: 2017,
    topics: ['Socialisation, culture and identity', 'Researching and understanding social inequalities', 'Debates in contemporary society'],
    papers: [
      { id: 'p1', code: 'H580/01', name: 'Paper 1: Socialisation, culture and identity', mins: 90, marks: 90, topics: [0], sitting: d(14, 5, 'PM') },
      { id: 'p2', code: 'H580/02', name: 'Paper 2: Researching and understanding social inequalities', mins: 135, marks: 105, topics: [1], sitting: d(21, 5, 'AM') },
      { id: 'p3', code: 'H580/03', name: 'Paper 3: Debates in contemporary society', mins: 135, marks: 105, topics: [2], sitting: d(10, 6, 'AM') },
    ] },
];

export const specById = (id: string) => SPECS.find((s) => s.id === id);
export const subjectsFor = (qual: Qual, board: Board) => SPECS.filter((s) => s.qual === qual && s.board === board);
export const specLabel = (s: Spec) => s.board + ' ' + s.qual + ' ' + s.subject;
/** URL slug for a spec's public pages, e.g. aqa-gcse-biology. */
export const specSlug = (s: Spec) => (s.board + ' ' + s.qual + ' ' + s.subject).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Exam series with papers, newest first. Boards keep the latest two or so private. */
export function pastSeries(spec: Spec): { year: number; series: 'June' | 'November'; isPublic: boolean }[] {
  const out: { year: number; series: 'June' | 'November'; isPublic: boolean }[] = [];
  const lastSat = 2026;
  for (let y = lastSat; y >= spec.firstExam; y--) {
    if (y === 2020 || y === 2021) continue;
    const isPublic = y <= lastSat - 2;
    out.push({ year: y, series: 'June', isPublic });
    if (spec.november && y !== 2026) out.push({ year: y, series: 'November', isPublic });
  }
  return out;
}

const GRADES_GCSE = ['9', '8', '7', '6', '5', '4', '3', '2', '1'];
export const gradeScale = (q: Qual) => (q === 'GCSE' ? GRADES_GCSE : ['A*', 'A', 'B', 'C', 'D', 'E']);
