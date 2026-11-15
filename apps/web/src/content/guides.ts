import type { SubjectKind } from '../lib/presets';

/**
 * Revision guides. Plain text only (never HTML), so nothing here can inject markup.
 * Method guides explain one technique and link to the Hilite tool that runs it.
 * Subject guides say which methods suit how that subject is examined, and which preset plan to pick.
 */
export type GuideKind = 'method' | 'subject' | 'technique';
export interface GuideSection { h: string; p?: string; steps?: string[]; list?: string[] }
export interface Guide {
  id: string; kind: GuideKind; title: string; summary: string; time?: string;
  sections: GuideSection[];
  /** [route, button label] for the tool that does this. */
  tool?: [string, string];
  related: string[];
  kinds?: SubjectKind[];
}

export const GUIDE_KINDS: Record<GuideKind, string> = { method: 'Revision methods', subject: 'Subject guides', technique: 'Exam technique' };

export const GUIDES: Guide[] = [
  // ---------------------------------------------------------------- methods
  {
    id: 'active-recall', kind: 'method', title: 'Active recall', time: 'Every session',
    summary: 'Pull information out of your memory instead of reading it again. It feels harder, and that’s why it works.',
    sections: [
      { h: 'Why it works', p: 'Rereading makes notes look familiar, which feels like learning but isn’t. Each time you force yourself to remember something without looking, the memory gets stronger and easier to find in the exam. Testing yourself also shows you exactly what you don’t know yet.' },
      { h: 'How to do it', steps: ['Close your notes before you start.', 'Ask yourself a question about the topic, or use a flashcard, a blank page or a past-paper question.', 'Answer fully, out loud or on paper, before you check anything.', 'Check against your notes or the mark scheme.', 'Mark what you got wrong or left out, and come back to those first next time.'] },
      { h: 'Ways to use it in Hilite', list: ['Flashcards in type or quiz mode.', 'Blurting a topic onto a blank page.', 'Covering your Cornell notes and answering the cue questions.', 'Retesting your mistake log.'] },
      { h: 'Common traps', list: ['Peeking at the answer after two seconds. Give yourself time to struggle.', 'Only testing the things you already know. Start with your red topics.', 'Highlighting and rereading and calling it revision.'] },
    ],
    tool: ['/tools/blurt', 'Try a blurt'], related: ['spaced-repetition', 'blurting', 'flashcards'],
  },
  {
    id: 'spaced-repetition', kind: 'method', title: 'Spaced repetition', time: 'A few minutes a day',
    summary: 'Revisit each topic just before you’d forget it, with the gaps getting longer each time.',
    sections: [
      { h: 'Why it works', p: 'You forget quickly after first learning something, then more slowly each time you remember it again. Spreading the same amount of revision over days and weeks gives much longer-lasting memory than cramming it into one evening.' },
      { h: 'How Hilite does it', list: ['Flashcards are scheduled for you. Cards you find hard come back sooner, easy ones later.', 'Your revision plan comes back to each topic after a few days, then a week or two, then a few weeks, using a different method each time.', 'Your mistake log retests each mistake after 1, 3 and 7 days.'] },
      { h: 'How to do it', steps: ['Do your due flashcards every day, even if it’s only ten minutes.', 'Follow the plan’s reviews even for topics that feel fine.', 'Grade cards honestly. Pressing Easy on a card you nearly forgot just means you’ll forget it later.'] },
      { h: 'Common traps', list: ['Skipping a few days and facing a huge pile. Little and often is the point.', 'Adding hundreds of new cards in one go. Keep to your new cards per day.'] },
    ],
    tool: ['/flashcards', 'Open flashcards'], related: ['flashcards', 'active-recall', 'interleaving'],
  },
  {
    id: 'blurting', kind: 'method', title: 'Blurting', time: '10 to 20 minutes',
    summary: 'Write down everything you know about a topic from memory, then check what you missed.',
    sections: [
      { h: 'Why it works', p: 'Blurting is active recall for a whole topic at once. It shows you quickly what you can remember unprompted, which is what most exam questions ask for. The gaps you find are your to-do list.' },
      { h: 'How to do it', steps: ['Pick one topic, or one part of a big topic.', 'Close everything. Set a timer for 5 to 15 minutes.', 'Write or type everything you remember: key terms, processes, examples, diagrams, dates, quotes.', 'When the timer ends, open your notes or revision guide and compare.', 'Write what you missed in a different colour, or in the gaps box in Hilite.', 'Blurt the same topic again in a few days and check the gaps are gone.'] },
      { h: 'Tips', list: ['Don’t worry about neat writing or order. Speed matters more.', 'Use the topic’s spec points or your Cornell cues as a checklist.', 'Turn anything you missed twice into a flashcard.'] },
    ],
    tool: ['/tools/blurt', 'Start a blurt'], related: ['active-recall', 'cornell', 'mind-maps'],
  },
  {
    id: 'flashcards', kind: 'method', title: 'Making good flashcards', time: '20 minutes per topic',
    summary: 'Short, specific cards that test one thing each, then reviewed on a schedule.',
    sections: [
      { h: 'What makes a good card', list: ['One fact or idea per card. If the answer is a paragraph, split it.', 'A real question on the front, not just a heading. “What does the mitochondria do?” rather than “Mitochondria”.', 'Your own words, not copied sentences.', 'Both directions for key terms: term to meaning and meaning to term.', 'Equations, definitions, dates and quotes all work well.'] },
      { h: 'How to do it', steps: ['Make one deck per topic and link it to that topic in Hilite, so the plan and coach know what it covers.', 'Paste a list with a dash between each question and answer to add lots at once.', 'Test yourself once straight after making them.', 'Then let the review schedule bring them back.'] },
      { h: 'Ready-made decks', p: 'Hilite has starter decks for physics equations, maths formulae, chemistry calculations, biology equations and exam command words. Add one from the new deck button.' },
    ],
    tool: ['/flashcards', 'Open flashcards'], related: ['spaced-repetition', 'active-recall', 'memorising'],
  },
  {
    id: 'feynman', kind: 'method', title: 'Teach it back (the Feynman method)', time: '15 minutes',
    summary: 'Explain a topic simply, as if teaching someone younger. Where you get stuck is what you don’t really understand.',
    sections: [
      { h: 'Why it works', p: 'You can recognise words in your notes without understanding them. Explaining in plain language, with an example and the reasons behind it, shows whether you actually understand. Exam questions that say “explain” test exactly this.' },
      { h: 'How to do it', steps: ['Pick a topic and close your notes.', 'Explain it out loud or in writing, as if to a Year 7 student. Avoid jargon unless you explain it too.', 'Give a real example.', 'Say why it happens or why it matters, and how it links to other topics.', 'Note every point where you got stuck, went vague or had to look something up.', 'Go back to your notes for just those points, then explain it again.'] },
      { h: 'Tips', list: ['Saying it out loud works better than thinking it.', 'Recording yourself on your phone and listening back is uncomfortable but useful.', 'Log the stuck points in your mistake log so they get retested.'] },
    ],
    tool: ['/tools/teach', 'Start a teach-back'], related: ['active-recall', 'command-words', 'mistake-log'],
  },
  {
    id: 'past-papers', kind: 'method', title: 'Past papers, done properly', time: '30 minutes to 2 hours',
    summary: 'Do the question, mark it with the real mark scheme, log what went wrong, then redo it later.',
    sections: [
      { h: 'Why it works', p: 'Past papers show you how topics are actually examined, which command words come up, and how marks are given. The real value is in the marking and the follow-up, not in the number of papers you get through.' },
      { h: 'How to do it', steps: ['Start with questions on topics you’ve revised, then whole papers closer to the exam.', 'Answer without notes. If you’re stuck, move on, as you would in the exam.', 'Mark with the official mark scheme, strictly. Read the examiner’s report too if there is one.', 'For every mark you lost, write down why in your mistake log: didn’t know it, forgot it, misread the question, technique, a slip, or time.', 'Redo the questions you got wrong a few days later without looking at the answer.', 'Log your score in Hilite to track your trend.'] },
      { h: 'Where to find them', p: 'Hilite links to the official board websites for your exact spec. The most recent series are kept private by the boards for a while, so your school may have those as mocks.' },
    ],
    tool: ['/papers', 'Open past papers'], related: ['mistake-log', 'timed-practice', 'command-words'],
  },
  {
    id: 'mistake-log', kind: 'method', title: 'Keeping a mistake log', time: '5 minutes after each paper',
    summary: 'Write down every mark you lose and why, then retest it until you get it right three times.',
    sections: [
      { h: 'Why it works', p: 'Most students repeat the same mistakes because they look at the mark, feel bad and move on. A mistake log turns every lost mark into a specific thing to fix, and shows you patterns, like always losing marks on units or misreading “explain”.' },
      { h: 'How to do it', steps: ['After marking any paper, quiz or blurt, add each mistake: the question, the right answer, and the type of mistake.', 'Hilite retests each one after 1, 3 and 7 days. Only say you got it when you did, without help.', 'Three correct retests in a row clears it.', 'Check the pattern chart. If one type keeps coming up, read the guide it links to.'] },
      { h: 'With Pro', p: 'The AI coach reads your open mistakes and weak topics, writes new questions that test the same ideas in different ways, and marks your answers. Anything you get wrong goes back into your log automatically.' },
    ],
    tool: ['/tools/mistakes', 'Open your mistake log'], related: ['past-papers', 'reading-questions', 'spaced-repetition'],
  },
  {
    id: 'interleaving', kind: 'method', title: 'Interleaving (mixed practice)', time: '20 to 30 minutes',
    summary: 'Mix questions from different topics instead of doing one topic at a time.',
    sections: [
      { h: 'Why it works', p: 'In the exam, questions don’t tell you which topic they’re from. Practising one topic in a block means you always know which method to use. Mixing topics makes you practise choosing the method too. It feels slower and harder, but results hold up better.' },
      { h: 'How to do it', steps: ['Once you’ve learnt a few topics, mix them.', 'Use Hilite’s mixed quiz to pull flashcards from several decks and subjects in a random order.', 'For maths and sciences, do a mixed set of past-paper questions rather than a single-topic worksheet.', 'Keep single-topic practice for when you first learn something.'] },
    ],
    tool: ['/tools/mixed', 'Start a mixed quiz'], related: ['spaced-repetition', 'worked-examples', 'past-papers'],
  },
  {
    id: 'cornell', kind: 'method', title: 'Cornell notes', time: '30 to 45 minutes per topic',
    summary: 'Condensed notes with cue questions alongside and a summary at the bottom, built for testing yourself.',
    sections: [
      { h: 'The layout', list: ['Notes: the main content, condensed into your own words. Bullet points, not paragraphs.', 'Cues: questions down the side that the notes answer, such as “What are the three stages of mitosis?”.', 'Summary: three or four sentences at the bottom that sum up the whole topic.'] },
      { h: 'How to do it', steps: ['Make the notes from your textbook or class notes, condensing as you go.', 'Write a cue question for each chunk.', 'Write the summary from memory.', 'To revise, cover the notes and answer each cue out loud. Hilite does this for you in test mode.'] },
      { h: 'Common traps', list: ['Copying the textbook word for word. If it’s not shorter, it’s not notes.', 'Making beautiful notes and never testing yourself on them. The cues are the point.'] },
    ],
    tool: ['/tools/notes', 'Make Cornell notes'], related: ['active-recall', 'blurting', 'mind-maps'],
  },
  {
    id: 'mind-maps', kind: 'method', title: 'Mind maps and dual coding', time: '20 minutes',
    summary: 'Show how a topic fits together, with the big idea in the middle and details on the branches.',
    sections: [
      { h: 'Why it works', p: 'Mind maps help with topics where the links matter: causes and consequences in history, themes and characters in literature, systems in biology. Adding simple diagrams alongside words (dual coding) gives you two ways to remember.' },
      { h: 'How to do it', steps: ['Put the topic in the middle.', 'Add a branch for each main part, then smaller branches for details and examples.', 'Do it from memory first, then check your notes and add what you missed in another colour.', 'Draw simple diagrams or symbols where they help. Neat isn’t the goal.'] },
      { h: 'In Hilite', p: 'Type an outline with indents and Hilite lays it out as a map. Use hide details to test whether you can rebuild each branch.' },
    ],
    tool: ['/tools/mindmap', 'Make a mind map'], related: ['blurting', 'cornell', 'english-literature'],
  },
  {
    id: 'memorising', kind: 'method', title: 'Memorising quotes, equations and definitions', time: '10 minutes a day',
    summary: 'Learn exact wording by hiding more of it each round until you can write it from nothing.',
    sections: [
      { h: 'How to do it', steps: ['Pick a small number of things to learn word for word: key quotes, equations, definitions, dates.', 'Read it once, then hide every few words and fill them in.', 'Hide more each round, then use only the first letter of each word.', 'Finish by writing the whole thing from a blank.', 'Come back to it the next day and in a few days. Spaced repetition matters here too.'] },
      { h: 'Tips', list: ['Fewer, flexible quotes beat lots you can’t use. Choose ones that work for several themes.', 'For equations, learn the words and the symbols, and practise rearranging them.', 'Say them out loud. Rhythm helps.'] },
    ],
    tool: ['/tools/memorise', 'Open the memoriser'], related: ['flashcards', 'english-literature', 'spaced-repetition'],
  },
  {
    id: 'timed-practice', kind: 'method', title: 'Timed practice and mocks', time: 'Full paper length',
    summary: 'Sit papers under real conditions so you practise pacing, stamina and staying calm.',
    sections: [
      { h: 'How to do it', steps: ['Use the real time limit. Hilite’s mock mode times it for you.', 'No notes, no phone, no breaks.', 'Use roughly a minute per mark and keep moving.', 'Mark it strictly, then log your mistakes, including any caused by running out of time.'] },
      { h: 'When', p: 'Mostly in the last few weeks, once you’ve learnt most of the content. Earlier on, untimed questions on single topics are a better use of time.' },
    ],
    tool: ['/papers', 'Start a mock'], related: ['timing', 'past-papers', 'exam-day'],
  },
  {
    id: 'worked-examples', kind: 'method', title: 'Worked examples', time: '20 to 40 minutes',
    summary: 'Study a fully worked solution step by step, then solve a similar problem yourself.',
    sections: [
      { h: 'Why it works', p: 'When a method is new, struggling with a hard problem mostly teaches you that you’re stuck. Studying a worked solution first, then trying a similar question, builds the method faster. Move on to unaided problems quickly.' },
      { h: 'How to do it', steps: ['Read a worked example and explain each step to yourself: why that step, why then.', 'Cover it and try the same question.', 'Try a similar question with different numbers.', 'Then try an exam question on the same topic without help.', 'Log any step you got wrong in your mistake log.'] },
    ],
    tool: ['/papers', 'Open past papers'], related: ['maths', 'interleaving', 'past-papers'],
  },
  {
    id: 'focus', kind: 'method', title: 'Focus sessions and breaks', time: '25 minutes on, 5 off',
    summary: 'Short, distraction-free blocks with proper breaks, so you can keep going for longer.',
    sections: [
      { h: 'How to do it', steps: ['Decide exactly what you’ll do in this block before you start the timer.', 'Phone in another room, or at least face down with notifications off.', 'Work for 25 minutes, then take 5 minutes away from the screen.', 'After four blocks take a longer break.', 'Use Hilite’s focus timer and pick the subject, so your progress page shows where your time goes.'] },
      { h: 'Tips', list: ['If 25 minutes is too long, start with 15 and build up.', 'Breaks should be a real rest: stretch, water, fresh air. Not scrolling.'] },
    ],
    tool: ['/focus', 'Start the focus timer'], related: ['stress-and-sleep', 'building-a-plan'],
  },
  {
    id: 'why-questions', kind: 'method', title: 'Asking why and how', time: '10 minutes',
    summary: 'Push past what happens to why it happens. It turns facts into understanding.',
    sections: [
      { h: 'How to do it', steps: ['Take a fact from your notes, such as “enzymes denature at high temperatures”.', 'Ask why. Answer it. Then ask why again.', 'Ask how it links to something else you know.', 'Check your explanation against your notes or textbook.'] },
      { h: 'Where it helps most', p: 'Science “explain” questions, history causes and consequences, and geography processes. It pairs well with teach-back.' },
    ],
    tool: ['/tools/teach', 'Start a teach-back'], related: ['feynman', 'command-words', 'sciences'],
  },

  // ---------------------------------------------------------------- subjects
  {
    id: 'maths', kind: 'subject', title: 'How to revise GCSE maths', kinds: ['maths'],
    summary: 'Maths is revised by doing maths. Worked examples to learn a method, then lots of mixed exam questions.',
    sections: [
      { h: 'What the exams reward', p: 'Three papers, one non-calculator. Marks come from choosing the right method, setting out working clearly and getting accurate answers. Method marks are available even when the final answer is wrong, so always show working.' },
      { h: 'Methods that work', list: ['Worked examples for new or forgotten methods.', 'Past-paper questions by topic, then mixed sets.', 'Flashcards for formulae you need to know by heart, using the ready-made maths deck.', 'A mistake log, because maths mistakes are very repeatable: signs, units, misreading, rounding.'] },
      { h: 'A good week', list: ['Three or four 30-minute sessions of exam questions.', 'One mixed practice session.', 'Ten minutes of formula flashcards a few times a week.', 'Redo last week’s mistakes.'] },
      { h: 'Preset to pick', p: 'Practice heavy. It’s what Auto picks for maths.' },
    ],
    tool: ['/papers', 'Open past papers'], related: ['worked-examples', 'interleaving', 'mistake-log'],
  },
  {
    id: 'sciences', kind: 'subject', title: 'How to revise GCSE sciences', kinds: ['science'],
    summary: 'Learn the content with recall, then practise applying it to unfamiliar exam questions, including required practicals and maths skills.',
    sections: [
      { h: 'What the exams reward', p: 'Recall of facts and processes, applying them to new situations, calculations, required practicals, and longer six-mark answers. Combined Science covers less content per subject but the same skills.' },
      { h: 'Methods that work', list: ['Flashcards for definitions, equations and key facts. Use the physics, chemistry and biology starter decks.', 'Blurting each topic, then checking against the spec.', 'Exam questions after every topic, marked strictly.', 'Explaining processes with why and how questions.', 'Practising six-mark answers with a plan.'] },
      { h: 'Don’t forget', list: ['Required practicals: method, variables, risks, and how to improve accuracy.', 'Maths in science: rearranging equations, units, standard form, graphs.'] },
      { h: 'Preset to pick', p: 'Practice heavy. It’s what Auto picks for the sciences.' },
    ],
    tool: ['/tools/blurt', 'Blurt a topic'], related: ['six-markers', 'flashcards', 'past-papers'],
  },
  {
    id: 'english-literature', kind: 'subject', title: 'How to revise English literature', kinds: ['english-lit'],
    summary: 'Know your texts, a set of flexible quotes, and how to build an argument about themes, characters and context.',
    sections: [
      { h: 'What the exams reward', p: 'A clear argument that answers the question, supported by well-chosen evidence, analysis of the writer’s methods, and relevant context. In closed-book exams, you need quotes from memory.' },
      { h: 'Methods that work', list: ['A quote bank of 10 to 15 short, flexible quotes per text, learnt with the memoriser.', 'Mind maps for each major theme and character, linking quotes to both.', 'Essay plans: five-minute plans for many past questions are more useful than a few full essays.', 'Timed essays closer to the exam, marked against the mark scheme.', 'Teach-back on themes and context.'] },
      { h: 'Poetry', p: 'For the anthology, know each poem’s key ideas, a few quotes, and which other poems compare well with it. For unseen poetry, practise the method: read twice, find the main idea, then analyse two or three methods closely.' },
      { h: 'Preset to pick', p: 'Essay subjects. It’s what Auto picks for English.' },
    ],
    tool: ['/tools/memorise', 'Learn quotes'], related: ['memorising', 'mind-maps', 'command-words'],
  },
  {
    id: 'english-language', kind: 'subject', title: 'How to revise English language', kinds: ['english-lang'],
    summary: 'There’s no content to learn, so revise the skills: each question type, timed, with feedback.',
    sections: [
      { h: 'What the exams reward', p: 'Reading questions that test retrieval, analysis of language and structure, comparison and evaluation, and a writing task marked on content and accuracy.' },
      { h: 'Methods that work', list: ['Learn what each question asks for and how many marks it’s worth.', 'Practise one question type at a time under time pressure, then mark it with the mark scheme’s level descriptors.', 'Keep a bank of vocabulary and techniques you can use in your own writing.', 'Proofread every practice answer. Spelling, punctuation and grammar marks are easy to lose.', 'Log technique mistakes in your mistake log.'] },
      { h: 'Preset to pick', p: 'Essay subjects, with extra exam-question sessions. Auto picks this.' },
    ],
    tool: ['/papers', 'Open past papers'], related: ['timing', 'command-words', 'mistake-log'],
  },
  {
    id: 'history', kind: 'subject', title: 'How to revise history', kinds: ['humanities'],
    summary: 'Precise knowledge, organised so you can use it to explain and judge, under real time pressure.',
    sections: [
      { h: 'What the exams reward', p: 'Accurate, specific detail (dates, names, statistics) used to explain causes, consequences, change and significance, and to reach a judgement. Source and interpretation questions test analysis.' },
      { h: 'Methods that work', list: ['Timelines and Cornell notes for each period.', 'Flashcards for key dates, people and terms.', 'Mind maps of causes and consequences, with links between factors.', 'Answer plans for many past questions, then timed full answers.', 'Learn the structure each question type needs.'] },
      { h: 'Preset to pick', p: 'Essay subjects. It’s what Auto picks for history.' },
    ],
    tool: ['/tools/notes', 'Make Cornell notes'], related: ['cornell', 'mind-maps', 'command-words'],
  },
  {
    id: 'geography', kind: 'subject', title: 'How to revise geography', kinds: ['humanities'],
    summary: 'Know your case studies in detail, learn the processes, and practise skills and longer answers.',
    sections: [
      { h: 'What the exams reward', p: 'Understanding of physical and human processes, detailed case studies with facts and figures, geographical skills such as map and graph reading, and extended answers that evaluate.' },
      { h: 'Methods that work', list: ['One Cornell note or mind map per case study, with five or six specific facts.', 'Flashcards for key terms and case study figures.', 'Blurting processes and sketching labelled diagrams from memory.', 'Skills practice from past papers.', 'Planning and writing the longer evaluate questions.'] },
      { h: 'Preset to pick', p: 'Essay subjects, or Balanced if you prefer. Auto picks Essay subjects.' },
    ],
    tool: ['/tools/mindmap', 'Map a case study'], related: ['mind-maps', 'cornell', 'blurting'],
  },
  {
    id: 'computer-science', kind: 'subject', title: 'How to revise computer science', kinds: ['cs'],
    summary: 'Theory by recall, programming and algorithms by doing.',
    sections: [
      { h: 'What the exams reward', p: 'Precise definitions and explanations for the theory topics, and the ability to read, write, trace and fix code and algorithms, including pseudocode and trace tables.' },
      { h: 'Methods that work', list: ['Flashcards for definitions: they’re often marked on exact key words.', 'Blurting each theory topic.', 'Writing short programs by hand, as you will in the exam.', 'Trace tables and algorithm questions from past papers.', 'Logging mistakes in code questions, which tend to repeat.'] },
      { h: 'Preset to pick', p: 'Practice heavy. It’s what Auto picks for computer science.' },
    ],
    tool: ['/flashcards', 'Open flashcards'], related: ['flashcards', 'past-papers', 'mistake-log'],
  },
  {
    id: 'languages', kind: 'subject', title: 'How to revise modern foreign languages', kinds: ['language'],
    summary: 'Vocabulary every day, grammar by practice, and lots of listening and reading.',
    sections: [
      { h: 'What the exams reward', p: 'Understanding spoken and written language on familiar topics, and producing accurate language in writing and speaking, using a range of tenses and structures.' },
      { h: 'Methods that work', list: ['Ten to fifteen minutes of vocabulary flashcards every day, both directions.', 'Learning sentences, not just single words.', 'Past listening and reading papers, then noting words you didn’t know as new cards.', 'Writing short answers using several tenses, checked against a mark scheme.', 'Preparing and practising speaking answers out loud.'] },
      { h: 'Preset to pick', p: 'Little and often. It’s what Auto picks for languages.' },
    ],
    tool: ['/flashcards', 'Open flashcards'], related: ['spaced-repetition', 'flashcards', 'memorising'],
  },
  {
    id: 'essay-subjects', kind: 'subject', title: 'How to revise RS, psychology, sociology and business', kinds: ['humanities'],
    summary: 'Learn the key terms, theories, studies and examples, then practise using them in structured answers.',
    sections: [
      { h: 'What the exams reward', p: 'Accurate key terms, knowledge of beliefs, theories, studies or case examples, and the ability to apply, analyse and evaluate them in longer answers.' },
      { h: 'Methods that work', list: ['Flashcards for key terms and definitions.', 'Cornell notes for each theory, belief or study, with strengths and weaknesses.', 'Mind maps that link arguments for and against.', 'Practising each question type, especially the evaluate questions.'] },
      { h: 'Preset to pick', p: 'Essay subjects. It’s what Auto picks.' },
    ],
    tool: ['/tools/notes', 'Make Cornell notes'], related: ['cornell', 'command-words', 'mind-maps'],
  },

  // ---------------------------------------------------------------- exam technique
  {
    id: 'command-words', kind: 'technique', title: 'Command words',
    summary: 'The first word of a question tells you what kind of answer gets the marks.',
    sections: [
      { h: 'Why it matters', p: 'Many lost marks come from giving the right content in the wrong form, such as describing when the question says explain. Underline the command word before you write anything.' },
      { h: 'The most common ones', list: ['State, give, name: a short answer, no explanation needed.', 'Describe: say what happens or what something is like. No reasons needed.', 'Explain: give reasons. Use “because” and “so”.', 'Compare: say how things are similar and different, using both in each point.', 'Evaluate: weigh up strengths and weaknesses, then give a judgement.', 'Suggest: apply what you know to an unfamiliar situation.', 'Calculate: work out a number. Show working and units.', 'Justify: support your answer with evidence or reasons.'] },
      { h: 'Practise them', p: 'The command words trainer has the full list with what each one asks for, and a quick quiz.' },
    ],
    tool: ['/tools/command-words', 'Practise command words'], related: ['six-markers', 'reading-questions', 'feynman'],
  },
  {
    id: 'six-markers', kind: 'technique', title: 'Longer answers (six markers)',
    summary: 'Plan for a minute, then write a logically ordered answer that covers what the question asks.',
    sections: [
      { h: 'How to do it', steps: ['Underline the command word and the key terms.', 'Jot a quick plan: the points you’ll make, in a logical order.', 'For a process, go step by step in order. For explain, link each point to a reason. For evaluate, cover both sides and finish with a judgement.', 'Use the correct scientific or subject terms.', 'Check you’ve answered the actual question.'] },
      { h: 'How they’re marked', p: 'Longer answers are usually marked by level: the examiner judges the overall quality, completeness and logic, not just a count of facts. A well-ordered answer with fewer points can beat a list of scattered facts.' },
    ],
    tool: ['/coach', 'Get AI feedback on an answer'], related: ['command-words', 'sciences', 'timing'],
  },
  {
    id: 'timing', kind: 'technique', title: 'Timing in the exam',
    summary: 'Use about a minute per mark, leave time to check, and move on when you’re stuck.',
    sections: [
      { h: 'The rule of thumb', p: 'Divide the time by the marks. Most GCSE papers give a little over a minute per mark. A 6-mark question deserves about 6 minutes, not 15.' },
      { h: 'How to do it', steps: ['Before the exam, work out the time per mark and when you should be halfway.', 'Note the time you should reach each section.', 'If you’re stuck, leave a gap, mark the question, and come back.', 'Save five minutes at the end to check.'] },
      { h: 'In Hilite', p: 'The exam timing planner works out minutes per mark and checkpoints for any of your papers.' },
    ],
    tool: ['/tools/timing', 'Plan your timing'], related: ['timed-practice', 'exam-day', 'reading-questions'],
  },
  {
    id: 'reading-questions', kind: 'technique', title: 'Reading the question and avoiding slips',
    summary: 'Most careless marks come from rushing the question or not checking the answer.',
    sections: [
      { h: 'Before you answer', list: ['Underline the command word and circle the key terms.', 'Check the number of marks: it tells you how many points to make.', 'Note any units, the number of examples asked for, and words like “two”, “not” and “other than”.', 'For data questions, read the axes and units before the numbers.'] },
      { h: 'After you answer', list: ['Does it answer the question that was asked?', 'Units, rounding and significant figures.', 'Copying numbers correctly from the question or your own working.', 'Spelling of key terms.'] },
      { h: 'Make it a habit', p: 'Log these mistakes as misreads or slips in your mistake log. When the pattern chart shows them coming up, practise this checklist on every question for a week.' },
    ],
    related: ['command-words', 'mistake-log', 'timing'],
  },
  {
    id: 'exam-day', kind: 'technique', title: 'The night before and exam day',
    summary: 'A short checklist so the day goes as planned.',
    sections: [
      { h: 'The night before', list: ['Light review only: flashcards, your summary notes, your mistake log.', 'Check the time, the room and your candidate number.', 'Pack your bag.', 'Get to sleep at your normal time.'] },
      { h: 'What to take', list: ['Several black pens, pencils, a ruler, an eraser and a sharpener, in a clear pencil case.', 'For maths and sciences: a calculator you know how to use, with working batteries, plus a protractor and compasses.', 'Water in a clear bottle with the label removed, if your school allows it.', 'No phone or smartwatch in the exam room.'] },
      { h: 'In the exam', list: ['Read the front cover instructions.', 'Skim the paper and start where you feel confident if that helps.', 'Keep to your timing plan.', 'If you get stuck, move on and come back.'] },
    ],
    related: ['timing', 'stress-and-sleep', 'timed-practice'],
  },
  {
    id: 'stress-and-sleep', kind: 'technique', title: 'Sleep, breaks and stress',
    summary: 'You remember more when you rest properly. Revision that wrecks your sleep is working against you.',
    sections: [
      { h: 'Sleep', p: 'Sleep is when memories are strengthened. Aim for a regular bedtime and stop revising at least half an hour before. An all-nighter before an exam usually costs more than it gains.' },
      { h: 'Breaks and rest days', p: 'Short breaks keep focus up. Rest days are optional in Hilite, but if you feel worn down, take one. A plan you can keep is better than a perfect one you can’t.' },
      { h: 'When it feels like too much', list: ['Break it down: you only need to do today’s sessions.', 'Talk to someone: a friend, family, a teacher or your school’s pastoral team.', 'If you’re struggling, Childline (0800 1111) and Young Minds have free, confidential support.'] },
    ],
    related: ['focus', 'building-a-plan', 'exam-day'],
  },
  {
    id: 'building-a-plan', kind: 'technique', title: 'Choosing a revision plan',
    summary: 'How Hilite’s preset plans work, and which one to pick.',
    sections: [
      { h: 'How the planner works', p: 'Hilite takes every topic in your specs, works backwards from each paper’s date, and schedules each topic several times using different active methods, spaced further apart each time. Red topics get extra time and green topics a little less.' },
      { h: 'The presets', list: ['Auto: matches each subject to the plan that suits how it’s examined. A good default.', 'Balanced: learn, review, exam questions, teach back.', 'Steady from now: for starting early, with long gaps and weekly mixed practice.', 'Final four weeks: mostly exam questions, timed practice and fixing mistakes.', 'Mock sprint: a tight two-week cycle.', 'Little and often: 20-minute sessions with breaks.', 'Practice heavy: for maths, sciences and computer science.', 'Essay subjects: notes, quotes, maps, plans and timed answers.'] },
      { h: 'Keeping it on track', list: ['Tick sessions off as you go.', 'If you miss some, rebuild: Hilite fits them back in before the exam and keeps what you’ve done.', 'Rate topics honestly in the checklist, then rebuild.', 'With Pro, the plan also adapts to your mistakes and coach results.'] },
    ],
    tool: ['/planner', 'Open your planner'], related: ['spaced-repetition', 'stress-and-sleep', 'focus'],
  },
];

export const guideById = (id: string) => GUIDES.find((g) => g.id === id);
