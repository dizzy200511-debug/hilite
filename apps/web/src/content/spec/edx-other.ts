import type { SpecContent, SpecPoint, SpecSection } from './types';

const p = (name: string, know: string): SpecPoint => ({ name, know });
const s = (name: string, points: SpecPoint[]): SpecSection => ({ name, points });
const one = (name: string, points: SpecPoint[]): SpecSection[] => [s(name, points)];

export const geographyA: SpecContent = {
  source: 'Pearson Edexcel GCSE Geography A (1GA0)', url: 'https://qualifications.pearson.com/en/qualifications/edexcel-gcses/geography-a-2016.html',
  note: 'Where the spec gives a choice, your school picks which options you study.',
  topics: [
    [
      s('The UK’s varied landscapes', [p('UK physical landscape', 'How geology, past processes and human activity shape the UK’s upland and lowland landscapes.')]),
      s('Two of: coastal, river or glaciated upland landscapes', [
        p('Processes and landforms', 'Weathering, erosion, transportation and deposition, and the landforms they create.'),
        p('Human activity and management', 'How people change the landscape and how it is managed, with examples.'),
      ]),
    ],
    one('Weather hazards and climate change', [
      p('Global circulation', 'How the global atmospheric circulation and ocean currents shape weather and climate.'),
      p('Climate change', 'Natural and human causes of climate change, evidence, and its effects.'),
      p('Tropical cyclones', 'How they form, their hazards and impacts, and how countries prepare and respond.'),
      p('Drought', 'Causes and effects of drought in a developed and a developing country.'),
    ]),
    one('Ecosystems, biodiversity and management', [
      p('Global ecosystems', 'Where the main biomes are and what controls them; the UK’s ecosystems.'),
      p('Tropical rainforests', 'Characteristics, biodiversity, threats and sustainable management.'),
      p('Deciduous woodlands', 'Characteristics, values, threats and management.'),
    ]),
    one('Changing cities', [
      p('Urbanisation', 'Global urban trends and differences between developed and developing countries.'),
      p('A UK city', 'A case study: its context, how it is changing, and ways of making it more sustainable.'),
      p('A city in a developing or emerging country', 'A case study: rapid growth, quality of life, and top-down and bottom-up strategies.'),
    ]),
    one('Global development', [
      p('Measuring development', 'Economic, social and political indicators, and the causes of uneven development.'),
      p('Reducing inequality', 'Approaches to development, including theories, aid and trade.'),
      p('A developing or emerging country', 'A case study of its development and the impacts of globalisation.'),
    ]),
    one('Resource management', [
      p('Natural resources', 'How resources are distributed and used, and the UK’s food, water and energy.'),
      p('Energy or water (one option)', 'Global supply and demand, impacts of extraction or use, and how it can be managed sustainably.'),
    ]),
    one('Geographical investigations: fieldwork', [
      p('Physical and human fieldwork', 'Two enquiries: the question, methods, data presentation, analysis, conclusions and evaluation.'),
    ]),
    one('UK challenges', [
      p('Decision-making', 'Using a resource booklet and your wider knowledge to evaluate options on UK issues such as population, resources and climate.'),
    ]),
  ],
};

export const geographyB: SpecContent = {
  source: 'Pearson Edexcel GCSE Geography B (1GB0)', url: 'https://qualifications.pearson.com/en/qualifications/edexcel-gcses/geography-b-2016.html',
  topics: [
    one('Hazardous Earth', [
      p('Global circulation and climate change', 'The global atmospheric circulation and natural and human causes of climate change.'),
      p('Tropical cyclones', 'Formation, hazards, impacts and responses, compared in different countries.'),
      p('Tectonic hazards', 'Earth’s structure, plate boundaries, earthquakes and volcanoes, and their impacts and management.'),
    ]),
    one('Development dynamics', [
      p('Measuring development', 'Indicators and theories of development, such as Rostow’s model and dependency theory.'),
      p('An emerging country', 'A case study of an emerging country’s development, globalisation and its impacts.'),
    ]),
    one('Challenges of an urbanising world', [
      p('Urbanisation trends', 'Global trends and why cities grow at different rates.'),
      p('A megacity', 'A case study of a megacity in a developing or emerging country, its challenges and sustainable solutions.'),
    ]),
    one('The UK’s evolving physical landscape', [
      p('UK landscapes', 'How geology and processes shape the UK’s physical landscape.'),
      p('Coastal change and conflict', 'Coastal processes, landforms and management.'),
      p('River processes and pressures', 'River processes, landforms, flooding and management.'),
    ]),
    one('The UK’s evolving human landscape', [
      p('A changing UK', 'Population, economic change and links to the wider world.'),
      p('Dynamic UK cities', 'A case study of a major UK city and how it is changing.'),
    ]),
    one('Geographical investigations', [
      p('Fieldwork', 'One physical enquiry (coasts or rivers) and one human enquiry (urban or rural), from question to evaluation.'),
    ]),
    one('People and the biosphere', [
      p('The biosphere', 'The distribution of biomes, how people use the biosphere, and its value.'),
    ]),
    one('Forests under threat', [
      p('Tropical rainforests and the taiga', 'Characteristics, threats and sustainable management of both forests.'),
    ]),
    one('Consuming energy resources', [
      p('Energy', 'Renewable and non-renewable resources, energy security, and sustainable energy use.'),
    ]),
  ],
};

export const edxBusiness: SpecContent = {
  source: 'Pearson Edexcel GCSE Business (1BS0)', url: 'https://qualifications.pearson.com/en/qualifications/edexcel-gcses/business-2017.html',
  topics: [
    one('Enterprise and entrepreneurship', [
      p('The dynamic nature of business', 'Why new business ideas come about and how they come about.'),
      p('Risk and reward', 'The risks and rewards of starting a business.'),
      p('The role of business enterprise', 'What businesses do and the qualities of entrepreneurs.'),
    ]),
    one('Spotting a business opportunity', [
      p('Customer needs', 'Identifying and understanding what customers want.'),
      p('Market research', 'Primary and secondary, qualitative and quantitative research.'),
      p('Market segmentation and mapping', 'Segmenting markets and using market maps.'),
      p('The competitive environment', 'Strengths and weaknesses of competitors and the impact of competition.'),
    ]),
    one('Putting a business idea into practice', [
      p('Aims and objectives', 'Financial and non-financial aims and objectives.'),
      p('Revenue, costs and profit', 'Calculating revenue, fixed and variable costs, profit and break-even.'),
      p('Cash and cash flow', 'Why cash matters and how to read a cash flow forecast.'),
      p('Sources of finance', 'Short- and long-term sources for a small business.'),
    ]),
    one('Making the business effective', [
      p('Business ownership', 'Sole traders, partnerships, private limited companies and franchises; limited liability.'),
      p('Location', 'Factors that affect where a business locates.'),
      p('The marketing mix', 'How price, product, promotion and place work together.'),
      p('Business plans', 'The role and content of a business plan.'),
    ]),
    one('Understanding external influences on business', [
      p('Stakeholders', 'Who stakeholders are and how they affect a business.'),
      p('Technology and legislation', 'The impact of technology, consumer law and employment law.'),
      p('The economy', 'Consumer income, inflation, interest rates, exchange rates and unemployment.'),
    ]),
    one('Growing the business', [
      p('Business growth', 'Organic and external growth, and public limited companies.'),
      p('Changing aims and objectives', 'Why and how aims change as a business grows.'),
      p('Globalisation', 'Imports, exports, multinationals and trade barriers.'),
      p('Ethics and the environment', 'Ethical and environmental considerations and pressure groups.'),
    ]),
    one('Making marketing decisions', [
      p('Product', 'The design mix, product life cycle and extension strategies.'),
      p('Price', 'Pricing strategies and what influences them.'),
      p('Promotion', 'Promotion strategies and the role of technology.'),
      p('Place', 'Methods of distribution, including e-commerce.'),
    ]),
    one('Making operational decisions', [
      p('Business operations', 'Job, batch and flow production and the role of technology.'),
      p('Working with suppliers', 'Stock control, procurement and bar gate stock graphs.'),
      p('Managing quality', 'Quality control and quality assurance.'),
      p('The sales process', 'Product knowledge, customer service and engagement.'),
    ]),
    one('Making financial decisions', [
      p('Business calculations', 'Gross and net profit, profit margins and average rate of return.'),
      p('Understanding performance', 'Using graphs, charts and financial data to judge performance.'),
    ]),
    one('Making human resource decisions', [
      p('Organisational structures', 'Hierarchical and flat structures, centralised and decentralised.'),
      p('Recruitment', 'Job roles, recruitment documents and methods.'),
      p('Training and motivation', 'Training, development, and financial and non-financial motivation.'),
    ]),
  ],
};

// The 2024 languages specification (first exams 2026) is the same shape for French, Spanish and German.
const LANG_SKILLS: SpecSection[][] = [
  one('Listening', [
    p('Paper 2: Listening', 'Understanding spoken passages on the themes, including dictation of short sentences, at Foundation or Higher tier.'),
  ]),
  one('Reading', [
    p('Paper 3: Reading', 'Understanding written texts, including literary texts, and translating sentences into English.'),
  ]),
  one('Writing', [
    p('Paper 4: Writing', 'Short and extended writing on the themes, using a range of tenses and structures, plus translation into the language.'),
  ]),
  one('Speaking', [
    p('Paper 1: Speaking', 'A read-aloud task, a role play, and a picture-based task with conversation, done at school before the written exams.'),
  ]),
  one('Grammar', [
    p('Tenses and structures', 'Present, past and future time frames, and the grammar listed in the specification for your tier.'),
    p('Vocabulary list', 'The specification’s word list, about 1,200 words at Foundation and 1,700 at Higher. Learn it with flashcards.'),
  ]),
];
const THEMES: [string, string][] = [
  ['My personal world', 'Family, friends, relationships, and equality.'],
  ['Lifestyle and wellbeing', 'Physical and mental wellbeing, food and drink, and sports.'],
  ['My neighbourhood', 'Your local area, places in town, the natural world and the environment.'],
  ['Media and technology', 'Music, TV and film, social media and gaming, and technology.'],
  ['Studying and my future', 'School life, future plans and the world of work.'],
  ['Travel and tourism', 'Holidays, transport, accommodation, tourist attractions and festivals.'],
];
const language = (name: string, code: string, path: string): SpecContent => ({
  source: 'Pearson Edexcel GCSE ' + name + ' (' + code + ')', url: 'https://qualifications.pearson.com/en/qualifications/edexcel-gcses/' + path + '.html',
  note: 'Words and grammar in the specification’s lists are what you can be tested on.',
  topics: [...LANG_SKILLS, ...THEMES.map(([t, k]) => one(t, [p(t, k + ' Learn the vocabulary for this theme and practise talking and writing about it in different tenses.')]))],
});
export const french = language('French', '1FR1', 'french-2024');
export const spanish = language('Spanish', '1SP1', 'spanish-2024');
export const german = language('German', '1GN1', 'german-2024');
