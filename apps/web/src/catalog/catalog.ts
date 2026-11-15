/**
 * Exam catalogue: qualifications, boards, specifications, papers and topics.
 *
 * Dates for summer 2027 come from the boards' own timetables:
 *  - AQA GCSE: provisional timetable v1.0 (January 2026), aqa.org.uk
 *  - Pearson Edexcel GCSE: final summer 2027 timetable
 * Refresh this file every autumn when the next timetable is published.
 * OCR dates are not loaded yet, so students add their own (Hilite shows that clearly).
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
    timetableSource: 'AQA provisional timetable, June 2027 (v1.0, January 2026)',
  },
  Edexcel: {
    name: 'Pearson Edexcel',
    pastPapers: 'https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html',
    timetableSource: 'Pearson Edexcel GCSE timetable, summer 2027 (final)',
  },
  OCR: {
    name: 'OCR',
    pastPapers: 'https://www.ocr.org.uk/qualifications/past-paper-finder/',
    timetableSource: 'OCR summer 2027 dates are not in Hilite yet. Add your own from your school’s timetable.',
  },
};

export const TIMETABLE_YEAR = 2027;
const d = (day: number, month: 5 | 6, session: 'AM' | 'PM'): Sitting => ({ date: '2027-' + (month === 5 ? '05' : '06') + '-' + (day < 10 ? '0' : '') + day, session });

const BIO_AQA = ['Cell biology', 'Organisation', 'Infection and response', 'Bioenergetics', 'Homeostasis and response', 'Inheritance, variation and evolution', 'Ecology'];
const CHEM_AQA = ['Atomic structure and the periodic table', 'Bonding, structure and the properties of matter', 'Quantitative chemistry', 'Chemical changes', 'Energy changes', 'The rate and extent of chemical change', 'Organic chemistry', 'Chemical analysis', 'Chemistry of the atmosphere', 'Using resources'];
const PHYS_AQA = ['Energy', 'Electricity', 'Particle model of matter', 'Atomic structure', 'Forces', 'Waves', 'Magnetism and electromagnetism', 'Space physics'];
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

  // ---------------- OCR GCSE (dates not loaded yet) ----------------
  { id: 'ocr-gcse-cs', qual: 'GCSE', board: 'OCR', subject: 'Computer Science', code: 'J277', tiered: false, firstExam: 2022,
    topics: ['Systems architecture', 'Memory and storage', 'Computer networks, connections and protocols', 'Network security', 'Systems software', 'Ethical, legal, cultural and environmental impacts', 'Algorithms', 'Programming fundamentals', 'Producing robust programs', 'Boolean logic', 'Programming languages and IDEs'],
    papers: [
      { id: 'p1', code: 'J277/01', name: 'Paper 1: Computer systems', mins: 90, marks: 80, topics: range(0, 5) },
      { id: 'p2', code: 'J277/02', name: 'Paper 2: Computational thinking, algorithms and programming', mins: 90, marks: 80, topics: range(6, 10) },
    ] },
  { id: 'ocr-gcse-maths', qual: 'GCSE', board: 'OCR', subject: 'Mathematics', code: 'J560', tiered: true, firstExam: 2017, november: true, topics: MATHS,
    papers: [
      { id: 'p1', code: 'J560/1-3', name: 'Paper 1', mins: 90, marks: 100 },
      { id: 'p2', code: 'J560/2-5', name: 'Paper 2', mins: 90, marks: 100 },
      { id: 'p3', code: 'J560/3-6', name: 'Paper 3', mins: 90, marks: 100 },
    ] },
];

export const specById = (id: string) => SPECS.find((s) => s.id === id);
export const subjectsFor = (qual: Qual, board: Board) => SPECS.filter((s) => s.qual === qual && s.board === board);
export const specLabel = (s: Spec) => s.board + ' ' + s.qual + ' ' + s.subject;

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
