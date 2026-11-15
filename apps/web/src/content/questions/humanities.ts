import type { Bank, Question } from './types';
import { calc, long, mcq, short } from './make';

/**
 * Essay subjects: geography, history, RS, psychology, business, sociology, economics and PE.
 * Questions are written in themes, then given to every spec topic that covers that theme (see MAP).
 * Long answers are marked by what a top answer includes; Pro can have them marked by AI.
 */
const S: Record<string, Question[]> = {
  // ---------- Geography ----------
  hazards: [
    short('geo-haz-01', 3, 2, 'Explain why earthquakes happen at destructive plate margins.', ['The plates move towards each other', 'Friction makes them stick and pressure builds up', 'The pressure is released suddenly as an earthquake']),
    short('geo-haz-02', 4, 2, 'Explain how global atmospheric circulation creates hot deserts around 30° north and south of the equator.', ['Air rises at the equator, cools and moves towards the poles', 'It sinks at about 30°, creating high pressure', 'Sinking air warms, so clouds don’t form', 'Little rainfall, so deserts form']),
    long('geo-haz-03', 6, 3, 'Using named examples, compare the effects of a tectonic hazard in a higher-income country and a lower-income country.', ['Names two real events, such as Chile 2010 and Nepal 2015', 'Primary effects of each, such as deaths and buildings destroyed', 'Secondary effects of each, such as disease, homelessness or economic loss', 'Explains why effects differed: building quality, emergency services, wealth', 'Uses facts and figures', 'Makes direct comparisons throughout']),
    short('geo-haz-04', 2, 1, 'Give two ways tropical storms can be monitored or predicted.', ['Satellites track their path', 'Aircraft and weather stations measure wind speed and pressure, and computer models predict the track']),
  ],
  climate: [
    short('geo-cli-01', 2, 1, 'Give two pieces of evidence that the climate is changing.', ['Any two: rising global temperatures, melting ice sheets and glaciers, rising sea levels, ice cores, seasonal changes']),
    short('geo-cli-02', 4, 2, 'Explain two human causes of climate change.', ['Burning fossil fuels releases carbon dioxide', 'Which increases the greenhouse effect', 'Farming cattle and rice releases methane', 'Deforestation means less carbon dioxide is absorbed']),
    long('geo-cli-03', 6, 3, 'Evaluate mitigation and adaptation as ways of managing climate change.', ['Mitigation tackles the cause: renewable energy, carbon capture, planting trees, international agreements', 'Adaptation copes with the effects: flood defences, drought-resistant crops, water management', 'Mitigation needs global cooperation and is slow', 'Adaptation helps now but can be costly for poorer countries', 'Uses examples', 'Reaches a justified judgement']),
  ],
  ecosystems: [
    short('geo-eco-01', 2, 1, 'Give two characteristics of the climate in a tropical rainforest.', ['Hot all year, about 27 °C', 'High rainfall, over 2000 mm a year']),
    short('geo-eco-02', 2, 2, 'Explain one way plants are adapted to hot deserts.', ['Cacti store water in thick stems, or have long roots to reach water', 'Spines instead of leaves cut water loss']),
    long('geo-eco-03', 6, 3, 'Evaluate strategies for managing tropical rainforests sustainably.', ['Selective logging and replanting', 'Ecotourism brings money without destroying the forest', 'International agreements and debt reduction', 'Conservation and education', 'Considers how effective each is, with examples', 'Reaches a justified judgement']),
    short('geo-eco-04', 3, 2, 'Explain how nutrients are cycled in a tropical rainforest.', ['Leaves fall and decompose quickly in the hot, wet conditions', 'Nutrients go into the thin soil', 'Plants take them up quickly, so the soil stays poor']),
  ],
  landscapes: [
    short('geo-lan-01', 4, 2, 'Explain how a waterfall forms.', ['A band of hard rock lies over softer rock', 'The softer rock erodes faster, undercutting the hard rock', 'The overhang collapses', 'The waterfall retreats upstream, leaving a gorge']),
    short('geo-lan-02', 2, 1, 'Name two processes of coastal erosion.', ['Any two: hydraulic action, abrasion, attrition, solution']),
    long('geo-lan-03', 6, 3, 'Assess the costs and benefits of hard engineering as a way to manage coasts.', ['Examples such as sea walls, groynes and rock armour', 'Benefits: protect homes and businesses, last a long time', 'Costs: very expensive, sea walls can cost thousands of pounds a metre', 'Can increase erosion further along the coast', 'Can look unnatural and harm habitats', 'A balanced judgement, ideally with a named example']),
    short('geo-lan-04', 3, 2, 'Explain how a spit forms.', ['Longshore drift moves sediment along the coast', 'Where the coast changes direction, sediment is deposited', 'It builds out into the sea, and the end may curve']),
  ],
  urban: [
    short('geo-urb-01', 1, 1, 'What is urbanisation?', ['An increase in the proportion of people living in towns and cities']),
    short('geo-urb-02', 4, 2, 'Explain two reasons people migrate from rural areas to cities in lower-income countries.', ['Push: lack of jobs, poor services or natural disasters in rural areas', 'Pull: more jobs and higher wages in cities', 'Pull: better schools and healthcare', 'Explained with detail, not just listed']),
    long('geo-urb-03', 6, 2, 'Using a named UK city, explain how urban change has created opportunities and challenges.', ['Names a city, such as Bristol or Manchester', 'Opportunities: new jobs, culture, transport improvements', 'Challenges: inequality, housing shortages, dereliction', 'Environmental issues such as traffic and waste', 'Uses specific places and figures', 'Covers both opportunities and challenges']),
    short('geo-urb-04', 2, 1, 'Give two features of sustainable urban living.', ['Any two: renewable energy, water conservation, recycling, green space, public transport']),
  ],
  development: [
    short('geo-dev-01', 2, 1, 'Name two measures of development.', ['Any two: GNI per head, birth rate, death rate, infant mortality, life expectancy, literacy rate, HDI']),
    short('geo-dev-02', 4, 2, 'Explain two causes of uneven development.', ['Physical: poor climate, landlocked, few resources', 'Economic: reliance on primary products, debt', 'Historical: colonisation', 'Each explained with its effect on development']),
    long('geo-dev-03', 6, 3, 'Evaluate how far tourism can help a lower-income country to develop.', ['Brings jobs and foreign currency', 'Money can be spent on infrastructure and services', 'Jobs can be seasonal and low-paid', 'Profits may go to foreign companies (leakage)', 'Environmental damage', 'Named example and a judgement']),
  ],
  resources: [
    short('geo-res-01', 2, 1, 'Give two reasons the demand for water in the UK is increasing.', ['A growing population', 'More water-using appliances, and more use by industry and farming']),
    short('geo-res-02', 1, 1, 'What is food security?', ['When everyone has access to enough affordable, nutritious food']),
    long('geo-res-03', 6, 3, 'Evaluate a large-scale scheme to increase water, energy or food supply.', ['Names a scheme, such as a water transfer or dam', 'Benefits for people and the economy', 'Costs, including money and displaced people', 'Environmental effects', 'Who wins and who loses', 'A justified judgement']),
  ],
  fieldwork: [
    short('geo-fld-01', 2, 1, 'For your fieldwork, give one primary data source and one secondary data source you used.', ['Primary: data you collected yourself, such as a questionnaire or river measurements', 'Secondary: data from elsewhere, such as census data or maps']),
    short('geo-fld-02', 3, 2, 'Explain why you chose your sampling method in your fieldwork.', ['Names the method: random, systematic or stratified', 'Gives a reason linked to the enquiry, such as avoiding bias', 'Explains the effect on the reliability of results']),
    long('geo-fld-03', 6, 3, 'Evaluate how reliable your fieldwork conclusions were.', ['Refers to the actual enquiry and results', 'Sample size and timing', 'Errors or limits in equipment and methods', 'How the data could be improved', 'Whether conclusions follow from the data', 'A judgement on reliability']),
  ],
  decision: [
    long('geo-dec-01', 9, 3, 'A council must choose between building new homes on a greenfield site or on a brownfield site. Which option would you choose? Justify your decision.', ['Makes a clear choice', 'Considers social factors: housing need, services, community', 'Considers economic factors: cost, jobs, infrastructure', 'Considers environmental factors: habitats, traffic, flooding', 'Explains why the other option is weaker', 'Uses evidence and specific examples', 'Considers sustainability', 'Clear, balanced structure', 'Accurate spelling, punctuation and grammar']),
    short('geo-dec-02', 4, 2, 'Explain why decision makers need to consider social, economic and environmental factors.', ['Plans affect people, the economy and the environment differently', 'Benefits for one group can harm another', 'Sustainable plans balance all three', 'So a decision is fair and lasts']),
  ],
  // ---------- History (each question names its option) ----------
  germany: [
    short('his-ger-01', 4, 2, 'Germany, 1890–1945: Describe two problems the Weimar Republic faced in 1923.', ['Hyperinflation: money became worthless after printing to pay reparations', 'Supporting detail, such as savings wiped out', 'Occupation of the Ruhr by France and Belgium, or the Munich Putsch', 'Supporting detail']),
    long('his-ger-02', 12, 3, 'Germany, 1890–1945: Which was the more important reason for Hitler becoming Chancellor in 1933: the Depression, or Nazi propaganda? Explain your answer.', ['Depression: unemployment of about 6 million made people desperate', 'People lost faith in Weimar governments', 'Propaganda: Goebbels, rallies and simple promises', 'It targeted different groups', 'Other factors: backroom deals with von Papen and Hindenburg', 'Accurate knowledge throughout', 'Analyses how factors link', 'A sustained, justified judgement']),
    short('his-ger-03', 4, 2, 'Germany, 1890–1945: Explain how the Nazis controlled young people.', ['Hitler Youth and League of German Maidens', 'Schools taught Nazi ideas and racial theory', 'Other youth groups were banned', 'Explained with how each built loyalty']),
  ],
  conflict: [
    short('his-con-01', 4, 2, 'Conflict and tension, 1918–1939: Describe two weaknesses of the League of Nations.', ['The USA never joined', 'Supporting detail', 'No army of its own, or decisions had to be unanimous', 'Supporting detail']),
    long('his-con-02', 8, 3, 'Conflict and tension, 1918–1939: Write an account of how the Munich Agreement increased tension in Europe.', ['September 1938: Britain and France agreed to Germany taking the Sudetenland', 'Czechoslovakia was not consulted', 'Hitler saw that appeasement meant he would not be stopped', 'In March 1939 he took the rest of Czechoslovakia', 'Britain and France then guaranteed Poland', 'The USSR felt left out, leading to the Nazi-Soviet Pact', 'Events linked in a clear sequence', 'Accurate, specific knowledge']),
  ],
  health: [
    long('his-hea-01', 8, 3, 'Health and medicine in Britain: Explain the significance of Pasteur’s germ theory.', ['1861: showed microbes cause decay', 'Disproved spontaneous generation', 'Led to Koch identifying specific bacteria', 'Helped Lister develop antiseptics', 'Led to vaccines and public health measures', 'Explains short- and long-term significance']),
    long('his-hea-02', 16, 3, 'Health and medicine in Britain: “Science and technology have been the main factor in improving public health.” How far do you agree?', ['Science: germ theory, John Snow’s cholera map', 'Technology: sewers, vaccines', 'Government: Public Health Acts 1848 and 1875, NHS 1948', 'War and individuals as other factors', 'Uses examples from across the period', 'Analyses links between factors', 'A sustained, justified judgement', 'Accurate spelling, punctuation and grammar']),
    short('his-hea-03', 4, 2, 'Health and medicine in Britain: Describe two features of medieval ideas about the causes of disease.', ['The Four Humours: illness caused by imbalance', 'Supporting detail, such as bloodletting', 'Religious explanations: illness as punishment from God, or miasma', 'Supporting detail']),
  ],
  elizabeth: [
    short('his-eli-01', 4, 2, 'Elizabethan England: Describe two problems Elizabeth faced when she became queen in 1558.', ['Religion: divided between Catholics and Protestants', 'Supporting detail', 'Legitimacy, marriage and succession, or money', 'Supporting detail']),
    long('his-eli-02', 8, 3, 'Elizabethan England: Explain what was important about the defeat of the Spanish Armada in 1588.', ['Ended the immediate threat of invasion', 'Boosted Elizabeth’s reputation and English national pride', 'Seen as a sign of God’s support for Protestant England', 'War with Spain continued for years', 'Explains why each mattered']),
  ],
  coldwar: [
    long('his-cw-01', 8, 3, 'Superpower relations and the Cold War, 1941–91: Explain two consequences of the Berlin Blockade (1948–49).', ['Formation of NATO in 1949', 'Germany divided into two states: FRG and GDR', 'Increased tension and mistrust', 'Explains how each followed from the blockade']),
    short('his-cw-02', 4, 2, 'Superpower relations and the Cold War, 1941–91: Explain why the Berlin Wall was built in 1961.', ['Many skilled East Germans were fleeing to the West', 'This embarrassed the USSR and damaged the economy', 'Khrushchev wanted to stop the flow', 'Explained, not just listed']),
  ],
  // ---------- Religious studies ----------
  christianity: [
    mcq('rs-chr-01', 1, 'Which word means that God is all-powerful?', ['Omnipotent', 'Omniscient', 'Benevolent', 'Transcendent'], 0),
    short('rs-chr-02', 2, 1, 'Give two Christian beliefs about life after death.', ['Any two: resurrection, judgement, heaven, hell, purgatory (Catholic)']),
    long('rs-chr-03', 12, 3, '“The crucifixion is the most important event in Christianity.” Evaluate this statement.', ['Agrees: Jesus’ death atones for sin and makes salvation possible', 'Supports with teaching or scripture', 'Disagrees: the resurrection proves Jesus is God and defeats death', 'Considers other events, such as the incarnation', 'Different Christian views', 'A justified conclusion', 'Logical chains of reasoning', 'Accurate spelling, punctuation and grammar']),
  ],
  christianPractice: [
    short('rs-chp-01', 2, 1, 'Give two sacraments.', ['Any two: baptism, Eucharist (Holy Communion), confirmation, marriage, reconciliation, ordination, anointing of the sick']),
    long('rs-chp-02', 5, 2, 'Explain two reasons why prayer is important to Christians. Refer to sacred writings in your answer.', ['Builds a relationship with God', 'Developed', 'Following Jesus’ example, such as the Lord’s Prayer', 'Developed', 'Refers to scripture, such as Matthew 6:9–13']),
    long('rs-chp-03', 12, 3, '“Pilgrimage is not important for Christians today.” Evaluate this statement.', ['Agrees: not required, God is everywhere', 'Cost and time make it hard', 'Disagrees: strengthens faith, places such as Lourdes, Walsingham or Iona', 'Different Christian views', 'A justified conclusion', 'Logical reasoning', 'Accurate spelling, punctuation and grammar']),
  ],
  islam: [
    mcq('rs-isl-01', 1, 'What does Tawhid mean?', ['The oneness of God', 'Prophethood', 'Life after death', 'The angels'], 0),
    short('rs-isl-02', 2, 1, 'Name two angels in Islam.', ['Any two: Jibril, Mika’il, Izra’il, Israfil']),
    long('rs-isl-03', 5, 2, 'Explain two Muslim beliefs about predestination (al-Qadr). Refer to sacred writings in your answer.', ['Allah knows and has written everything that will happen', 'Developed', 'People still have free will and are responsible for their actions', 'Developed', 'Refers to the Qur’an or Hadith']),
  ],
  islamPractice: [
    short('rs-isp-01', 2, 1, 'Name two of the Five Pillars of Islam.', ['Any two: Shahadah, Salah, Zakah, Sawm, Hajj']),
    long('rs-isp-02', 4, 2, 'Explain two ways Muslims observe Ramadan.', ['Fasting (sawm) from dawn to sunset', 'Developed', 'Extra prayer and reading the Qur’an, or giving charity', 'Developed']),
    long('rs-isp-03', 12, 3, '“Hajj is the most important of the Five Pillars.” Evaluate this statement.', ['Agrees: once in a lifetime, unites the ummah, forgiveness of sins', 'Disagrees: Shahadah is the foundation; Salah is daily', 'Hajj is only required if able', 'Different Muslim views', 'A justified conclusion', 'Logical reasoning', 'Accurate spelling, punctuation and grammar']),
  ],
  relationships: [
    long('rs-rel-01', 4, 2, 'Explain two contrasting religious beliefs about divorce.', ['Catholic: marriage is a sacrament and can’t be dissolved', 'Developed', 'Many Protestants or Muslims: divorce is allowed as a last resort', 'Developed']),
    short('rs-rel-02', 2, 1, 'Give two purposes of marriage in religion.', ['Any two: companionship, having children, a lifelong commitment, a stable family, uniting before God']),
    long('rs-rel-03', 12, 3, '“Religious people should be allowed to use contraception.” Evaluate this statement.', ['Agrees: many Protestants accept it for responsible family planning', 'Disagrees: Catholic teaching opposes artificial contraception', 'Islamic views vary', 'Non-religious views', 'A justified conclusion', 'Logical reasoning', 'Accurate spelling, punctuation and grammar']),
  ],
  life: [
    long('rs-lif-01', 4, 2, 'Explain two contrasting beliefs about abortion.', ['Sanctity of life: life begins at conception, so abortion is wrong', 'Developed', 'Quality of life or the mother’s rights: allowed in some circumstances', 'Developed']),
    short('rs-lif-02', 2, 1, 'Give two religious beliefs about the origin of the universe.', ['God created the universe (Genesis or the Qur’an)', 'Some believers accept the Big Bang as how God created it']),
    long('rs-lif-03', 12, 3, '“Euthanasia should be legal.” Evaluate this statement.', ['Agrees: compassion, quality of life, personal choice', 'Disagrees: sanctity of life, only God should end life', 'Risk to vulnerable people', 'Religious and non-religious views', 'A justified conclusion', 'Logical reasoning', 'Accurate spelling, punctuation and grammar']),
  ],
  peace: [
    short('rs-pea-01', 2, 1, 'Give two conditions for a just war.', ['Any two: just cause, correct authority, right intention, last resort, proportional force, chance of success']),
    long('rs-pea-02', 4, 2, 'Explain two contrasting beliefs about pacifism.', ['Quakers: all war is wrong; Jesus taught love of enemies', 'Developed', 'Others: war can be justified (just war or lesser jihad)', 'Developed']),
    long('rs-pea-03', 12, 3, '“Religion is the main cause of war.” Evaluate this statement.', ['Agrees: some wars have religious causes', 'Disagrees: most wars are about land, resources or politics', 'Religion often works for peace', 'Examples', 'A justified conclusion', 'Logical reasoning', 'Accurate spelling, punctuation and grammar']),
  ],
  crime: [
    short('rs-cri-01', 2, 1, 'Give two aims of punishment.', ['Any two: retribution, deterrence, reformation, protection']),
    long('rs-cri-02', 4, 2, 'Explain two contrasting beliefs about the death penalty.', ['Against: sanctity of life, the chance to reform, risk of mistakes', 'Developed', 'For: some say scripture allows it for the worst crimes, or as retribution', 'Developed']),
    long('rs-cri-03', 12, 3, '“Religious believers should always forgive.” Evaluate this statement.', ['Agrees: Jesus taught forgiving seventy times seven', 'Allah is merciful', 'Disagrees: forgiveness doesn’t remove the need for justice or punishment', 'Some acts are very hard to forgive', 'A justified conclusion', 'Logical reasoning', 'Accurate spelling, punctuation and grammar']),
  ],
  god: [
    short('rs-god-01', 2, 1, 'Give two arguments for the existence of God.', ['Any two: design argument, first cause argument, miracles, religious experience']),
    long('rs-god-02', 12, 3, '“The existence of evil and suffering proves God does not exist.” Evaluate this statement.', ['Agrees: an all-powerful, all-loving God would prevent suffering', 'Disagrees: free will explains moral evil', 'Suffering can build character or test faith', 'Religious and non-religious views', 'A justified conclusion', 'Logical reasoning']),
  ],
  // ---------- Psychology ----------
  memory: [
    short('psy-mem-01', 3, 1, 'Name the three stores in the multi-store model of memory.', ['Sensory store', 'Short-term memory', 'Long-term memory']),
    short('psy-mem-02', 2, 2, 'Give the capacity and duration of short-term memory.', ['About 7 ± 2 items', 'About 18–30 seconds']),
    long('psy-mem-03', 6, 3, 'Evaluate the multi-store model of memory.', ['Strength: supported by research such as Murdock’s serial position curve', 'Strength: case studies like HM show separate stores', 'Weakness: too simple; STM and LTM have more than one type', 'Weakness: rehearsal is not the only way into LTM', 'Uses research evidence', 'A conclusion']),
  ],
  perception: [
    short('psy-per-01', 2, 1, 'What is the difference between sensation and perception?', ['Sensation: detecting information with the senses', 'Perception: making sense of that information']),
    short('psy-per-02', 2, 2, 'Name two visual illusions and say what they show.', ['Such as the Müller-Lyer or Ponzo illusion', 'Our brain uses cues like depth, which can mislead us']),
  ],
  childDev: [
    short('psy-dev-01', 4, 2, 'Describe Piaget’s stages of cognitive development.', ['Sensorimotor', 'Pre-operational', 'Concrete operational', 'Formal operational, with ages']),
    long('psy-dev-02', 6, 3, 'Evaluate Piaget’s theory of cognitive development.', ['Strength: influenced education, such as discovery learning', 'Strength: supported by studies such as conservation tasks', 'Weakness: may underestimate children (Hughes’ policeman study)', 'Weakness: small, unrepresentative samples', 'Uses evidence', 'A conclusion']),
  ],
  research: [
    short('psy-res-01', 2, 1, 'What is the difference between an independent and a dependent variable?', ['Independent variable: what the researcher changes', 'Dependent variable: what is measured']),
    short('psy-res-02', 2, 2, 'Give one strength and one weakness of a laboratory experiment.', ['Strength: high control, so cause and effect can be shown', 'Weakness: low ecological validity, artificial setting']),
    calc('psy-res-03', 2, 1, 'Scores in a memory test were 4, 6, 6, 7 and 12. Calculate the mean and the range.', ['Mean 7', 'Range 8']),
  ],
  social: [
    short('psy-soc-01', 2, 1, 'What is the difference between conformity and obedience?', ['Conformity: changing behaviour to fit in with a group', 'Obedience: following an order from an authority figure']),
    long('psy-soc-02', 4, 2, 'Describe Milgram’s study of obedience.', ['40 male volunteers told to give electric shocks to a learner', 'Shocks went up to 450 V; the learner was an actor', 'The experimenter used prods to keep them going', '65% went to 450 V']),
  ],
  language: [
    short('psy-lan-01', 2, 2, 'What is the Sapir-Whorf hypothesis?', ['Language determines or shapes how we think', 'So speakers of different languages think differently']),
  ],
  brain: [
    short('psy-bra-01', 2, 1, 'Name the two divisions of the nervous system.', ['Central nervous system', 'Peripheral nervous system']),
    short('psy-bra-02', 2, 2, 'Describe the function of the motor cortex and the visual cortex.', ['Motor cortex: controls voluntary movement', 'Visual cortex: processes information from the eyes']),
  ],
  problems: [
    short('psy-pro-01', 2, 1, 'Give two symptoms of clinical depression.', ['Any two: low mood, loss of interest, sleep or appetite changes, tiredness, feelings of worthlessness']),
    long('psy-pro-02', 6, 3, 'Evaluate the use of cognitive behavioural therapy (CBT) to treat depression.', ['Tackles negative thinking patterns', 'Strength: evidence it works and prevents relapse', 'Strength: no side effects of drugs', 'Weakness: needs motivation and time', 'Weakness: may not suit severe depression', 'A conclusion']),
  ],
  criminal: [
    short('psy-crm-01', 2, 2, 'Describe one biological explanation of criminal behaviour.', ['Such as genetic factors or brain differences', 'Some people inherit traits that make crime more likely']),
    long('psy-crm-02', 6, 3, 'Evaluate social learning theory as an explanation of criminal behaviour.', ['People copy role models who are rewarded (vicarious reinforcement)', 'Strength: Bandura’s Bobo doll research', 'Strength: explains why crime runs in families or peer groups', 'Weakness: ignores biological factors', 'Weakness: not everyone exposed to crime copies it', 'A conclusion']),
  ],
  sleep: [
    short('psy-slp-01', 2, 1, 'Name two stages of sleep.', ['Any two: light sleep stages, deep (slow-wave) sleep, REM sleep']),
    short('psy-slp-02', 2, 2, 'What is the role of the suprachiasmatic nucleus (SCN)?', ['An internal body clock in the brain', 'Uses light information to regulate the sleep–wake cycle']),
  ],
  // ---------- Business ----------
  realworld: [
    short('bus-rw-01', 2, 1, 'Give two reasons why people start businesses.', ['Any two: to make a profit, independence, to fill a gap in the market, to help others (social enterprise)']),
    short('bus-rw-02', 2, 2, 'What is the difference between a sole trader and a private limited company?', ['A sole trader has unlimited liability', 'A private limited company has limited liability and is a separate legal entity']),
    long('bus-rw-03', 6, 3, 'Analyse the advantages and disadvantages for a small business of becoming a franchise.', ['Advantage: an established brand and support', 'Advantage: lower risk of failure', 'Disadvantage: franchise fees and royalties reduce profit', 'Disadvantage: less control', 'Applied to the business', 'A judgement']),
  ],
  influences: [
    short('bus-inf-01', 2, 2, 'Explain one effect of a rise in interest rates on a business.', ['Loans become more expensive to repay', 'So the business may invest less, or customers spend less']),
    long('bus-inf-02', 6, 3, 'Evaluate whether a clothing retailer should focus on becoming more ethical.', ['Benefits: better reputation and customer loyalty', 'Can charge higher prices', 'Costs: higher supplier costs reduce profit', 'Competitors may be cheaper', 'Applied to clothing retail', 'A justified recommendation']),
  ],
  operations: [
    short('bus-ops-01', 2, 1, 'What is the difference between job and flow production?', ['Job: one-off, customised products', 'Flow: continuous production of identical products']),
    short('bus-ops-02', 2, 2, 'Explain one benefit of just-in-time stock control.', ['Less money tied up in stock and less storage space needed', 'Lower costs and less waste']),
  ],
  hr: [
    short('bus-hr-01', 2, 1, 'Give two methods of motivating staff that are not financial.', ['Any two: job rotation, job enrichment, praise, training, autonomy']),
    short('bus-hr-02', 2, 2, 'Give one advantage of internal recruitment.', ['Cheaper and quicker, and the person already knows the business']),
  ],
  marketing: [
    short('bus-mkt-01', 4, 1, 'Name the four parts of the marketing mix.', ['Product', 'Price', 'Place', 'Promotion']),
    short('bus-mkt-02', 2, 2, 'What is market segmentation? Give one way a market can be segmented.', ['Dividing a market into groups of customers with similar needs', 'By age, gender, income, location or lifestyle']),
    long('bus-mkt-03', 6, 3, 'Evaluate whether a new café should use social media or print adverts to promote itself.', ['Social media: cheap, targeted, easy to measure', 'Reaches younger customers', 'Print: reaches local and older customers', 'Costs more and is harder to measure', 'Applied to a café', 'A justified recommendation']),
  ],
  finance: [
    calc('bus-fin-01', 3, 2, 'A product sells for £12. Variable costs are £4 per unit and fixed costs are £2400. Calculate the break-even output.', ['Contribution per unit = 12 − 4 = £8', 'Fixed costs ÷ contribution', '300 units']),
    calc('bus-fin-02', 2, 2, 'Revenue was £50 000 and gross profit was £20 000. Calculate the gross profit margin.', ['20 000 ÷ 50 000 × 100', '40%']),
    calc('bus-fin-03', 3, 3, 'An investment of £40 000 makes a total profit of £10 000 over 5 years. Calculate the average rate of return.', ['Average annual profit = 10 000 ÷ 5 = £2000', '2000 ÷ 40 000 × 100', '5%']),
    short('bus-fin-04', 2, 1, 'Give two sources of finance for a new small business.', ['Any two: personal savings, loans from family, bank loan, crowdfunding, overdraft']),
  ],
  // ---------- Sociology ----------
  sociology: [
    short('soc-app-01', 2, 1, 'What is socialisation? Name one agent of socialisation.', ['The process of learning the norms and values of society', 'Family, school, peers, media or religion']),
    short('soc-app-02', 2, 2, 'What is the difference between functionalist and Marxist views of society?', ['Functionalists: society is based on shared values and every part has a useful function', 'Marxists: society is based on conflict between classes']),
  ],
  families: [
    short('soc-fam-01', 2, 1, 'Name two types of family.', ['Any two: nuclear, extended, lone-parent, reconstituted, same-sex']),
    long('soc-fam-02', 12, 3, 'Discuss how far roles within the family have become more equal.', ['Evidence for: Young and Willmott’s symmetrical family', 'More women in paid work', 'Evidence against: Oakley; women still do more housework', 'Dual burden and emotion work', 'Uses sociological studies', 'A justified conclusion']),
  ],
  education: [
    short('soc-edu-01', 2, 2, 'Explain one way social class can affect achievement in education.', ['Material deprivation: poorer pupils lack resources', 'Cultural capital, or labelling by teachers']),
    long('soc-edu-02', 12, 3, 'Discuss how far schools contribute to differences in achievement between social classes.', ['In-school: labelling, setting and streaming', 'Becker or Ball studies', 'Out-of-school: material and cultural deprivation', 'Bourdieu’s cultural capital', 'Weighs in-school against out-of-school factors', 'A justified conclusion']),
  ],
  crimeSoc: [
    short('soc-cri-01', 2, 1, 'What is the difference between crime and deviance?', ['Crime: breaking the law', 'Deviance: breaking social norms, which may not be illegal']),
    short('soc-cri-02', 2, 2, 'Give one reason official crime statistics may not be accurate.', ['Many crimes go unreported or unrecorded (the dark figure of crime)']),
  ],
  stratification: [
    short('soc-str-01', 2, 2, 'What is social mobility?', ['Movement up or down the social hierarchy', 'Between or within generations']),
    short('soc-str-02', 2, 2, 'Give two ways poverty can be measured.', ['Absolute poverty: lacking the basics to survive', 'Relative poverty: below the normal standard of living in that society']),
  ],
  methods: [
    short('soc-met-01', 2, 1, 'Give one strength and one weakness of questionnaires.', ['Strength: quick to reach many people and easy to compare', 'Weakness: little detail, and people may not answer truthfully']),
    short('soc-met-02', 2, 2, 'What is the difference between quantitative and qualitative data?', ['Quantitative: numbers and statistics', 'Qualitative: words and detailed descriptions']),
  ],
  // ---------- Economics ----------
  econIntro: [
    short('eco-int-01', 2, 1, 'What is the basic economic problem?', ['Resources are scarce', 'But wants are unlimited, so choices must be made']),
    short('eco-int-02', 2, 2, 'What is opportunity cost? Give an example.', ['The next best alternative given up when a choice is made', 'Such as giving up a job to study']),
  ],
  markets: [
    short('eco-mkt-01', 2, 2, 'Explain what happens to the price of a good when demand rises and supply stays the same.', ['There is a shortage at the old price', 'So the price rises']),
    short('eco-mkt-02', 2, 2, 'Give two functions of money.', ['Any two: medium of exchange, store of value, measure of value, means of deferred payment']),
  ],
  govt: [
    short('eco-gov-01', 2, 1, 'Name two macroeconomic objectives of the government.', ['Any two: economic growth, low unemployment, low and stable inflation, fair distribution of income']),
    long('eco-gov-02', 6, 3, 'Evaluate raising interest rates as a way to reduce inflation.', ['Borrowing costs more, so spending falls', 'Saving becomes more attractive', 'Lower demand reduces price rises', 'May raise unemployment and slow growth', 'Takes time to work', 'A judgement']),
  ],
  trade: [
    short('eco-trd-01', 2, 1, 'Give two benefits of international trade.', ['Any two: more choice, lower prices, bigger markets for firms, specialisation']),
    short('eco-trd-02', 2, 2, 'What is a tariff and why might a government use one?', ['A tax on imports', 'To protect home industries or raise revenue']),
  ],
  // ---------- PE ----------
  anatomy: [
    short('pe-ana-01', 2, 1, 'Give two functions of the skeleton.', ['Any two: support, protection, movement, blood cell production, mineral storage']),
    short('pe-ana-02', 2, 2, 'Explain the difference between aerobic and anaerobic exercise.', ['Aerobic: with oxygen, long-duration, low to moderate intensity', 'Anaerobic: without oxygen, short, high-intensity, produces lactic acid']),
  ],
  training: [
    short('pe-trn-01', 4, 2, 'Name the four principles of training (SPOR).', ['Specificity', 'Progressive overload', 'Overtraining (or Overload)', 'Reversibility']),
    calc('pe-trn-02', 2, 1, 'Estimate the maximum heart rate of a 16-year-old.', ['220 − age', '204 bpm']),
  ],
  sociocultural: [
    short('pe-soc-01', 2, 1, 'Give two reasons why participation in sport may be lower for some groups.', ['Any two: cost, lack of role models, discrimination, lack of facilities, time']),
    short('pe-soc-02', 2, 2, 'Give one positive and one negative effect of commercialisation on sport.', ['Positive: more money for facilities and players', 'Negative: fixtures changed for TV, or costs to fans rise']),
  ],
  sportpsych: [
    short('pe-psy-01', 2, 2, 'What is the difference between intrinsic and extrinsic motivation?', ['Intrinsic: from within, such as enjoyment', 'Extrinsic: from outside, such as trophies or praise']),
    short('pe-psy-02', 2, 2, 'Give two types of guidance a coach can use.', ['Any two: visual, verbal, manual, mechanical']),
  ],
  peHealth: [
    short('pe-hea-01', 2, 1, 'Give two health benefits of regular exercise.', ['Any two: lower risk of heart disease, healthy weight, better mental health, stronger bones']),
    short('pe-hea-02', 2, 1, 'What is a sedentary lifestyle and give one risk.', ['Little or no physical activity', 'Obesity, heart disease or type 2 diabetes']),
  ],
};

/** Each spec's topics, in catalogue order, mapped to themes. Empty means no questions yet. */
const MAP: Record<string, string[][]> = {
  'aqa-gcse-geog': [['hazards', 'climate'], ['ecosystems'], ['landscapes'], ['urban'], ['development'], ['resources'], ['decision'], ['fieldwork']],
  'edx-gcse-geoga': [['landscapes'], ['hazards', 'climate'], ['ecosystems'], ['urban'], ['development'], ['resources'], ['fieldwork'], ['decision']],
  'edx-gcse-geogb': [['hazards', 'climate'], ['development'], ['urban'], ['landscapes'], ['urban'], ['fieldwork'], ['ecosystems'], ['ecosystems'], ['resources']],
  'ocr-gcse-geoga': [['landscapes'], ['urban'], ['climate'], ['ecosystems'], ['development'], ['hazards', 'climate'], ['fieldwork']],
  'ocr-gcse-geogb': [['hazards'], ['climate'], ['landscapes'], ['ecosystems'], ['urban'], ['development'], ['urban'], ['resources'], ['fieldwork'], ['decision']],
  'aqa-gcse-hist': [['germany'], ['conflict'], ['health'], ['elizabeth']],
  'edx-gcse-hist': [['health'], ['coldwar'], ['elizabeth'], ['germany']],
  'ocr-gcse-hista': [['conflict'], ['germany'], [], ['elizabeth'], []],
  'ocr-gcse-histb': [['health'], ['elizabeth'], [], [], ['germany']],
  'aqa-gcse-rs': [['christianity'], ['christianPractice'], ['islam'], ['islamPractice'], ['relationships'], ['life'], ['peace'], ['crime']],
  'ocr-gcse-rs': [['christianity'], ['christianPractice'], ['islam'], ['islamPractice'], ['relationships'], ['god'], ['peace'], []],
  'aqa-gcse-psych': [['memory'], ['perception'], ['childDev'], ['research'], ['social'], ['language'], ['brain'], ['problems']],
  'ocr-gcse-psych': [['criminal'], ['childDev'], ['problems'], ['social'], ['memory'], ['sleep'], ['research']],
  'aqa-gcse-bus': [['realworld'], ['influences'], ['operations'], ['hr'], ['marketing'], ['finance']],
  'edx-gcse-bus': [['realworld'], ['marketing'], ['finance'], ['realworld'], ['influences'], ['influences'], ['marketing'], ['operations'], ['finance'], ['hr']],
  'ocr-gcse-bus': [['realworld'], ['marketing'], ['hr'], ['operations'], ['finance'], ['influences'], ['realworld']],
  'aqa-gcse-soc': [['sociology'], ['families'], ['education'], ['crimeSoc'], ['stratification'], ['methods']],
  'ocr-gcse-econ': [['econIntro'], ['markets'], ['govt'], ['trade']],
  'ocr-gcse-pe': [['anatomy'], ['training'], ['sociocultural'], ['sportpsych'], ['peHealth']],
};

const bank: Bank = {};
Object.entries(MAP).forEach(([specId, topics]) => topics.forEach((themes, i) => {
  bank[specId + ':' + i] = themes.flatMap((t) => S[t] ?? []);
}));
export default bank;
