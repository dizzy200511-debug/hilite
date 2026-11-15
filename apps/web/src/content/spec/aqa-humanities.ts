import type { SpecContent, SpecPoint, SpecSection } from './types';

// AQA geography, psychology, sociology and business. Each export is one spec.
const p = (name: string, know: string): SpecPoint => ({ name, know });
const s = (name: string, points: SpecPoint[]): SpecSection => ({ name, points });
const one = (name: string, points: SpecPoint[]): SpecSection[] => [s(name, points)];

export const geography: SpecContent = {
  source: 'AQA GCSE Geography (8035)', url: 'https://www.aqa.org.uk/subjects/geography/gcse/geography-8035/specification',
  note: 'Where the spec gives a choice, your school picks which options you study.',
  topics: [
    [
      s('Natural hazards', [p('Hazard risk', 'What natural hazards are and the factors that affect hazard risk.')]),
      s('Tectonic hazards', [
        p('Plate tectonics', 'Plate margins (destructive, constructive, conservative) and why earthquakes and volcanoes happen there.'),
        p('Effects and responses', 'Primary and secondary effects and immediate and long-term responses, compared in a richer and a poorer country.'),
        p('Living with tectonic hazards', 'Why people live in hazard zones, and how monitoring, prediction, protection and planning reduce risk.'),
      ]),
      s('Weather hazards', [
        p('Global atmospheric circulation', 'Pressure belts, surface winds and how they shape world weather.'),
        p('Tropical storms', 'Where and how they form, their structure, how climate change may affect them, and a case study of effects and responses.'),
        p('UK weather hazards', 'Types of extreme weather in the UK, a recent extreme weather event, and evidence that UK weather is getting more extreme.'),
      ]),
      s('Climate change', [
        p('Causes and evidence', 'Evidence for climate change since the Quaternary, and natural and human causes.'),
        p('Managing climate change', 'Mitigation (alternative energy, carbon capture, planting trees, international agreements) and adaptation.'),
      ]),
    ],
    [
      s('Ecosystems', [p('Small-scale ecosystems', 'Producers, consumers, food chains and webs, nutrient cycling, and how a UK ecosystem changes; the distribution of global ecosystems.')]),
      s('Tropical rainforests', [
        p('Rainforest characteristics', 'Climate, soils, interdependence, and how plants and animals are adapted.'),
        p('Deforestation', 'Causes and impacts of deforestation in a case study rainforest.'),
        p('Sustainable management', 'Selective logging, conservation, ecotourism, education and international agreements.'),
      ]),
      s('Hot deserts or cold environments (one option)', [
        p('Characteristics and adaptations', 'Physical characteristics, and how plants, animals and people are adapted.'),
        p('Opportunities and challenges', 'Development opportunities and challenges in a case study, and how the environment can be managed sustainably, including desertification or protecting wilderness areas.'),
      ]),
    ],
    [
      s('UK physical landscapes', [p('The UK’s relief', 'Where upland, lowland and glaciated areas and major rivers are.')]),
      s('Two of: coasts, rivers or glacial landscapes', [
        p('Processes', 'Weathering, mass movement, erosion, transportation and deposition in your chosen landscapes.'),
        p('Landforms', 'How distinctive landforms form, such as headlands and bays, spits, waterfalls, meanders, levees, corries and drumlins, with a named example.'),
        p('Management', 'Hard and soft engineering, flood risk and management schemes, or land use and tourism in glaciated areas, with a case study.'),
      ]),
    ],
    one('Urban issues and challenges', [
      p('Urbanisation', 'Global patterns of urban change, push and pull factors, natural increase, and the growth of megacities.'),
      p('A city in a lower-income or newly emerging country', 'A case study city: its importance, causes of growth, opportunities, challenges such as squatter settlements, and an urban planning scheme.'),
      p('A major UK city', 'A case study city: its location and importance, migration, opportunities and challenges, and an urban regeneration project.'),
      p('Sustainable urban living', 'Water and energy conservation, waste recycling, green space, and traffic management.'),
    ]),
    one('The changing economic world', [
      p('Measuring development', 'Economic and social indicators, the Demographic Transition Model, and causes of uneven development.'),
      p('Reducing the development gap', 'Investment, aid, fair trade, debt relief, tourism, microfinance and intermediate technology.'),
      p('A newly emerging economy', 'A case study such as Nigeria: its importance, industry, TNCs, aid, environmental impacts and quality of life.'),
      p('The changing UK economy', 'Deindustrialisation, the post-industrial economy, science parks, transport improvements, the north–south divide and rural changes.'),
    ]),
    [
      s('Resource management', [p('Resources in the UK', 'Global inequality in food, water and energy, and changing demand and supply of each in the UK.')]),
      s('Food, water or energy (one option)', [
        p('Global supply and demand', 'Where supply is low or high, rising consumption, and the impacts of insecurity.'),
        p('Increasing supply', 'Strategies such as irrigation, water transfers or renewable energy, with an example of a large-scale scheme.'),
        p('Sustainable supply', 'A local scheme in a lower-income country, and sustainable approaches such as conservation or appropriate technology.'),
      ]),
    ],
    one('Issue evaluation', [
      p('The pre-release resource', 'A booklet released 12 weeks before Paper 3. Study it, link it to what you know, and practise making a justified decision.'),
    ]),
    one('Fieldwork', [
      p('Your two enquiries', 'One physical and one human enquiry: the question, methods, data presentation, analysis, conclusions and evaluation.'),
      p('Geographical skills', 'Map, graph, numerical and statistical skills used across all papers.'),
    ]),
  ],
};

export const psychology: SpecContent = {
  source: 'AQA GCSE Psychology (8182)', url: 'https://www.aqa.org.uk/subjects/psychology/gcse/psychology-8182/specification',
  topics: [
    one('Memory', [
      p('Processes and types of memory', 'Encoding, storage and retrieval; episodic, semantic and procedural memory.'),
      p('The multi-store model', 'Sensory, short-term and long-term memory, their capacity, duration and coding, and Murdock’s serial position study.'),
      p('Memory as reconstruction', 'Bartlett’s War of the Ghosts study and schema theory.'),
      p('Factors affecting accuracy', 'Interference, context and false memories.'),
    ]),
    one('Perception', [
      p('Sensation and perception', 'The difference between them, and depth cues, including monocular and binocular cues.'),
      p('Visual illusions', 'Ambiguous figures, fictions, size constancy and misinterpreted depth cues, with examples like the Müller-Lyer and Ponzo illusions.'),
      p('Theories of perception', 'Gibson’s direct theory compared with Gregory’s constructivist theory.'),
      p('Factors affecting perception', 'Culture, motivation, emotion and expectation, with studies such as Bruner and Minturn.'),
    ]),
    one('Development', [
      p('Early brain development', 'How the brain develops from before birth into childhood.'),
      p('Piaget’s stage theory', 'The four stages, conservation and egocentrism, and studies that challenged him; the role of education.'),
      p('Learning and mindsets', 'Dweck’s mindset theory, Willingham’s learning theory, and criticisms of learning styles.'),
    ]),
    one('Research methods', [
      p('Designing research', 'Hypotheses, variables, sampling methods, experimental designs, and controlling extraneous variables.'),
      p('Research methods', 'Experiments, interviews, questionnaires, observations, case studies and correlations, with strengths and weaknesses.'),
      p('Ethics', 'Consent, deception, confidentiality, withdrawal and protection from harm.'),
      p('Data handling', 'Quantitative and qualitative, primary and secondary data; averages, range, percentages, standard form, graphs and the normal distribution.'),
    ]),
    one('Social influence', [
      p('Conformity', 'Asch’s study, and situational and dispositional factors.'),
      p('Obedience', 'Milgram’s study, situational factors, and Adorno’s authoritarian personality.'),
      p('Prosocial behaviour', 'Piliavin’s subway study and the bystander effect.'),
      p('Crowd and collective behaviour', 'Deindividuation and factors affecting crowd behaviour.'),
    ]),
    one('Language, thought and communication', [
      p('Language and thought', 'Piaget’s view and the Sapir-Whorf hypothesis.'),
      p('Human and animal communication', 'How they differ, with von Frisch’s bee study.'),
      p('Non-verbal communication', 'Eye contact, body language and personal space, and explanations including Darwin’s evolutionary theory.'),
    ]),
    one('Brain and neuropsychology', [
      p('The nervous system', 'Central and peripheral nervous systems, the fight or flight response, and the James-Lange theory of emotion.'),
      p('Neurons and synapses', 'Types of neuron, synaptic transmission, and Hebb’s theory of learning.'),
      p('The brain', 'The lobes and localisation of function, and Penfield’s study.'),
      p('Cognitive neuroscience', 'CT, PET and fMRI scans, and Tulving’s memory study.'),
    ]),
    one('Psychological problems', [
      p('Mental health', 'What mental health is, cultural variations, and why problems are increasing.'),
      p('Depression', 'Characteristics, biological and psychological explanations, and treatments such as antidepressants and CBT.'),
      p('Addiction', 'Characteristics, genetic and peer influence explanations, and interventions such as aversion therapy and self-management.'),
    ]),
  ],
};

export const sociology: SpecContent = {
  source: 'AQA GCSE Sociology (8192)', url: 'https://www.aqa.org.uk/subjects/sociology/gcse/sociology-8192/specification',
  topics: [
    one('The sociological approach', [
      p('Key ideas', 'Socialisation, norms, values, roles, status, culture and identity, and the nature–nurture debate.'),
      p('Perspectives', 'Functionalism, Marxism, feminism and interactionism, and how each sees society.'),
      p('Key thinkers', 'The named sociologists in the spec and the main idea of each, such as Durkheim, Marx and Weber.'),
    ]),
    one('Families', [
      p('Functions of families', 'Functionalist, Marxist and feminist views of what families do.'),
      p('Family forms', 'Nuclear, extended, lone-parent, reconstituted, same-sex and beanpole families, and why they are changing.'),
      p('Conjugal roles and relationships', 'Segregated and joint roles, the domestic division of labour, and changing relationships between parents and children.'),
      p('Divorce and criticisms of families', 'Reasons for rising divorce and criticisms of the family, such as the dark side of family life.'),
    ]),
    one('Education', [
      p('Roles and functions', 'Functionalist and Marxist views of education and its link to the economy.'),
      p('Achievement', 'How social class, gender and ethnicity affect achievement, from inside and outside school.'),
      p('Processes within schools', 'Streaming, setting, labelling, the self-fulfilling prophecy, the hidden curriculum and pupil subcultures.'),
      p('Policy', 'Changes such as comprehensives, marketisation, academies and free schools.'),
    ]),
    one('Crime and deviance', [
      p('Social construction of crime', 'The difference between crime and deviance and how both change across time and place.'),
      p('Social control', 'Formal and informal social control.'),
      p('Explaining crime', 'Functionalist, Marxist, interactionist and feminist explanations, and links to class, gender, ethnicity and age.'),
      p('Measuring crime', 'Official statistics, victim surveys and self-report studies, and the dark figure of crime.'),
    ]),
    one('Social stratification', [
      p('Theories of stratification', 'Functionalist, Marxist and Weberian views.'),
      p('Social class and life chances', 'Socio-economic class, social mobility and how class affects life chances.'),
      p('Poverty', 'Absolute and relative poverty, the underclass debate, and explanations of poverty.'),
      p('Power and other inequalities', 'Power and authority, and inequalities by gender, ethnicity, age and disability.'),
    ]),
    one('Research methods', [
      p('Research design', 'Choosing topics, hypotheses, pilot studies, sampling, and practical, ethical and theoretical issues.'),
      p('Methods', 'Questionnaires, interviews, observation, and official statistics and other secondary sources.'),
      p('Data', 'Qualitative and quantitative data, reliability, validity and representativeness.'),
    ]),
  ],
};

export const business: SpecContent = {
  source: 'AQA GCSE Business (8132)', url: 'https://www.aqa.org.uk/subjects/business/gcse/business-8132/specification',
  topics: [
    one('Business in the real world', [
      p('Purpose and nature of business', 'Why businesses exist, the factors of production, enterprise, and business sectors.'),
      p('Business ownership', 'Sole traders, partnerships, private and public limited companies, and not-for-profit organisations; limited and unlimited liability.'),
      p('Aims, objectives and stakeholders', 'Setting aims and objectives, and stakeholders’ interests and influence.'),
      p('Location and planning', 'Factors affecting location, and the purpose and content of a business plan.'),
      p('Expanding a business', 'Organic and external growth, economies and diseconomies of scale.'),
    ]),
    one('Influences on business', [
      p('Technology', 'E-commerce, digital communication and their effects on business.'),
      p('Ethics and the environment', 'Ethical and environmental considerations and their costs and benefits.'),
      p('The economic climate', 'Unemployment, consumer income, inflation and interest rates.'),
      p('Globalisation', 'Imports and exports, multinationals, exchange rates and barriers to trade.'),
      p('Legislation and competition', 'Employment and consumer law, and how competition affects decisions.'),
    ]),
    one('Business operations', [
      p('Production processes', 'Job, batch and flow production, lean production and just-in-time.'),
      p('Procurement', 'Choosing suppliers, managing stock, and the effect of logistics and supply decisions.'),
      p('Quality', 'Quality control and quality assurance, and why quality matters.'),
      p('Customer service', 'Good customer service, product knowledge and the sales process.'),
    ]),
    one('Human resources', [
      p('Organisational structures', 'Hierarchies, chain of command, span of control, centralisation and delegation, and ways of working.'),
      p('Recruitment and selection', 'Job descriptions, person specifications, internal and external recruitment, and selection methods.'),
      p('Motivation', 'Financial and non-financial methods of motivating staff.'),
      p('Training', 'Formal and informal training, self-learning, and target setting and appraisal.'),
    ]),
    one('Marketing', [
      p('Customers and segmentation', 'Identifying and understanding customers, and segmenting markets.'),
      p('Market research', 'Primary and secondary, qualitative and quantitative research, and sampling.'),
      p('The marketing mix', 'Price, product, promotion and place, the product life cycle, and how the mix works together.'),
    ]),
    one('Finance', [
      p('Sources of finance', 'Internal and external sources for start-ups and established businesses.'),
      p('Cash flow', 'Cash flow forecasts and managing cash flow problems.'),
      p('Financial terms and calculations', 'Revenue, costs, profit, break-even, average rate of return, and gross and net profit margins.'),
      p('Analysing performance', 'Reading income statements and statements of financial position.'),
    ]),
  ],
};
