import type { SpecContent, SpecPoint, SpecSection } from './types';

// History options vary by school, so each topic lists every option as its own section.
const p = (name: string, know: string): SpecPoint => ({ name, know });
const s = (name: string, points: SpecPoint[]): SpecSection => ({ name, points });

export const aqaHistory: SpecContent = {
  source: 'AQA GCSE History (8145)', url: 'https://www.aqa.org.uk/subjects/history/gcse/history-8145/specification',
  note: 'Your school chooses one option in each section: open the one you study.',
  topics: [
    [
      s('America, 1840–1895: Expansion and consolidation', [
        p('Expansion', 'The Great Plains, Plains Indians, early settlers, the Mormons and the gold rush.'),
        p('Conflict', 'The Civil War and its causes, reconstruction, and the wars with the Plains Indians.'),
        p('Consolidation', 'The end of the Indian Wars, reservations, the Dawes Act and the closing of the frontier.'),
      ]),
      s('Germany, 1890–1945: Democracy and dictatorship', [
        p('Kaiser Wilhelm and the First World War', 'The Kaiser’s Germany, militarism, and the impact of the war and defeat.'),
        p('Weimar Germany', 'The Weimar Constitution, the Treaty of Versailles, the 1923 crisis, the Stresemann years and the Depression.'),
        p('The Nazi experience', 'How Hitler gained and consolidated power, life in Nazi Germany, the police state, persecution and the war economy.'),
      ]),
      s('Russia, 1894–1945: Tsardom and communism', [
        p('The end of Tsardom', 'Nicholas II, the 1905 revolution, the First World War and the February 1917 revolution.'),
        p('Lenin’s new society', 'The Bolshevik revolution, civil war, war communism and the New Economic Policy.'),
        p('Stalin’s USSR', 'Stalin’s rise, collectivisation, the five-year plans, the purges, and the Great Patriotic War.'),
      ]),
      s('America, 1920–1973: Opportunity and inequality', [
        p('The 1920s', 'The boom, social and cultural change, Prohibition and inequality.'),
        p('Depression and the New Deal', 'The Wall Street Crash, Roosevelt and the New Deal, and the Second World War.'),
        p('Post-war America', 'The civil rights movement, Kennedy and Johnson, and the women’s movement.'),
      ]),
    ],
    [
      s('Conflict and tension, 1894–1918', [
        p('Causes of the First World War', 'Alliances, the arms and naval race, imperial rivalries, and the outbreak of war in 1914.'),
        p('The war', 'The Schlieffen Plan, stalemate, the Somme, new technology, and the end of the war.'),
      ]),
      s('Conflict and tension, 1918–1939', [
        p('Peacemaking', 'The Treaty of Versailles, and the aims and reactions of the Big Three.'),
        p('The League of Nations', 'Its structure, successes and failures, including Manchuria and Abyssinia.'),
        p('The origins of the Second World War', 'Hitler’s aims, appeasement, the Nazi–Soviet Pact and the invasion of Poland.'),
      ]),
      s('Conflict and tension between East and West, 1945–1972', [
        p('The origins of the Cold War', 'Yalta, Potsdam, the Truman Doctrine, Marshall Plan and Berlin Blockade.'),
        p('The development of the Cold War', 'The Korean War, the arms race, the Hungarian uprising and the Berlin Wall.'),
        p('Transformation of the Cold War', 'The Cuban Missile Crisis, Czechoslovakia and moves towards détente.'),
      ]),
      s('Conflict and tension in Asia, 1950–1975', [
        p('The Korean War', 'Causes, events and outcomes.'),
        p('Escalation in Vietnam', 'French withdrawal, US involvement and the Gulf of Tonkin.'),
        p('The end of the Vietnam War', 'Tactics, opposition to the war, and US withdrawal.'),
      ]),
      s('Conflict and tension in the Gulf and Afghanistan, 1990–2009', [
        p('The Gulf War', 'The Iraqi invasion of Kuwait and the international response.'),
        p('Afghanistan', 'The Taliban, 9/11 and the war in Afghanistan.'),
        p('The Iraq War', 'Causes, the invasion and its consequences.'),
      ]),
    ],
    [
      s('Britain: Health and the people, c1000 to the present day', [
        p('Medicine stands still', 'Medieval ideas, the Church, hospitals, and the Black Death.'),
        p('The beginnings of change', 'The Renaissance, Vesalius, Harvey, and Jenner’s vaccination.'),
        p('A revolution in medicine', 'Germ theory, Pasteur and Koch, anaesthetics and antiseptics, and public health reforms.'),
        p('Modern medicine', 'Penicillin, the NHS, modern treatments and public health.'),
      ]),
      s('Britain: Power and the people, c1170 to the present day', [
        p('Challenging authority', 'Magna Carta, the first Parliament and the Peasants’ Revolt.'),
        p('Challenging royal authority', 'The Pilgrimage of Grace, the English Revolution and the American Revolution.'),
        p('Reform and reformers', 'The abolition of slavery, the Chartists and the Great Reform Act.'),
        p('Equality and rights', 'Women’s suffrage, trade unions and minority rights.'),
      ]),
      s('Britain: Migration, empires and the people, c790 to the present day', [
        p('Conquered and conquerors', 'Vikings, Normans and the impact on England.'),
        p('Looking west', 'Early empire, the Americas and the slave trade.'),
        p('Expansion and empire', 'India, Africa and the British Empire’s peak.'),
        p('Britain in the 20th century', 'Decolonisation, the Windrush generation and migration since 1945.'),
      ]),
    ],
    [
      s('Norman England, c1066–c1100', [
        p('The Normans: conquest and control', 'The succession crisis, the Battle of Hastings, revolts, castles and the feudal system.'),
        p('Life under the Normans', 'Domesday Book, law and order, and village life.'),
        p('The Norman Church and monasticism', 'Lanfranc, the Church and monasteries.'),
        p('The historic environment', 'A specific site, set each year by AQA.'),
      ]),
      s('Medieval England: the reign of Edward I, 1272–1307', [
        p('Government and law', 'Edward’s rule and Parliament.'),
        p('Life in medieval England', 'Towns, trade and religion.'),
        p('Edward’s wars', 'Wales and Scotland.'),
        p('The historic environment', 'A specific site, set each year by AQA.'),
      ]),
      s('Elizabethan England, c1568–1603', [
        p('Elizabeth’s court and Parliament', 'Elizabeth’s background, her court, Parliament and the marriage question.'),
        p('Life in Elizabethan times', 'The Golden Age, poverty, and exploration and voyages.'),
        p('Troubles at home and abroad', 'Catholic plots, Mary Queen of Scots, the Spanish Armada and Puritans.'),
        p('The historic environment', 'A specific site, set each year by AQA.'),
      ]),
      s('Restoration England, 1660–1685', [
        p('Crown, Parliament, plots and court life', 'Charles II’s restoration and his relationship with Parliament.'),
        p('Life in Restoration England', 'Plague, the Great Fire and London.'),
        p('Religion and foreign affairs', 'Religious tensions and wars with the Dutch.'),
        p('The historic environment', 'A specific site, set each year by AQA.'),
      ]),
    ],
  ],
};

export const edxHistory: SpecContent = {
  source: 'Pearson Edexcel GCSE History (1HI0)', url: 'https://qualifications.pearson.com/en/qualifications/edexcel-gcses/history-2016.html',
  note: 'Your school chooses one option in each paper: open the one you study.',
  topics: [
    [
      s('Medicine in Britain, c1250–present', [
        p('Medieval medicine', 'Ideas about cause (the four humours, religion), treatment, and the Black Death.'),
        p('The Renaissance', 'Vesalius, Harvey, Sydenham, and the Great Plague.'),
        p('18th and 19th centuries', 'Germ theory, Jenner, Pasteur, Koch, Snow, and public health.'),
        p('Modern medicine', 'Penicillin, the NHS, lung cancer and modern treatment.'),
        p('The British sector of the Western Front, 1914–18', 'Trench conditions, wounds and illnesses, the chain of evacuation, and using sources.'),
      ]),
      s('Crime and punishment in Britain, c1000–present', [
        p('Medieval England', 'Crimes, law enforcement and punishments.'),
        p('Early modern England', 'Heresy, witchcraft and changing punishments.'),
        p('18th and 19th centuries', 'The Bloody Code, transportation, prison reform and the police.'),
        p('Modern Britain', 'New crimes, policing and punishment today.'),
        p('Whitechapel, c1870–c1900', 'Policing, living conditions and Jack the Ripper, and using sources.'),
      ]),
      s('Warfare and British society, c1250–present', [
        p('Medieval warfare', 'Armies, weapons and battles.'),
        p('Early modern warfare', 'Gunpowder and the Civil War.'),
        p('18th and 19th centuries', 'Waterloo, the Crimea and new technology.'),
        p('Modern warfare', 'The world wars and modern conflicts.'),
        p('London and the Second World War, 1939–45', 'The Blitz, evacuation and civilian life, and using sources.'),
      ]),
    ],
    [
      s('Superpower relations and the Cold War, 1941–91', [
        p('The origins of the Cold War', 'The Grand Alliance, Truman Doctrine, Marshall Plan and Berlin crisis.'),
        p('Cold War crises', 'Berlin, Cuba and Czechoslovakia.'),
        p('The end of the Cold War', 'Détente, Afghanistan, Reagan and Gorbachev, and the collapse of the Soviet Union.'),
      ]),
      s('The American West, c1835–c1895', [
        p('Early settlement', 'Plains Indians, migration and early settlers.'),
        p('Development of the Plains', 'Homesteaders, railroads, cattle ranching and conflict.'),
        p('Conflicts and conquest', 'The Indian Wars, reservations and the end of the frontier.'),
      ]),
      s('Other period studies', [
        p('Spain and the ‘New World’, c1490–c1555', 'Columbus, conquest of the Americas and Spanish rule.'),
        p('British America, 1713–83', 'Colonial life, the road to revolution and American independence.'),
        p('Conflict in the Middle East, 1945–95', 'The creation of Israel, the Arab–Israeli wars and the peace process.'),
      ]),
    ],
    [
      s('Early Elizabethan England, 1558–88', [
        p('Queen, government and religion', 'Elizabeth’s position, the religious settlement and challenges to it.'),
        p('Challenges at home and abroad', 'Plots, Mary Queen of Scots and conflict with Spain.'),
        p('Society in the Age of Discovery', 'Education, leisure, poverty and exploration.'),
      ]),
      s('Anglo-Saxon and Norman England, c1060–88', [
        p('Anglo-Saxon England and the Norman Conquest', 'The succession crisis and the Battle of Hastings.'),
        p('William I in power', 'Securing the kingdom, castles and the Harrying of the North.'),
        p('Norman England', 'The feudal system, the Church and Domesday Book.'),
      ]),
      s('Other British depth studies', [
        p('Richard I and John, 1189–1216', 'Government, the Crusades and Magna Carta.'),
        p('Henry VIII and his ministers, 1509–40', 'Wolsey, Cromwell, the break with Rome and the dissolution of the monasteries.'),
      ]),
    ],
    [
      s('Weimar and Nazi Germany, 1918–39', [
        p('The Weimar Republic', 'Origins, the 1923 crisis and the Stresemann recovery.'),
        p('Hitler’s rise to power', 'The early Nazi Party, the Depression and becoming chancellor.'),
        p('Nazi control and dictatorship', 'Creating the dictatorship, the police state and propaganda.'),
        p('Life in Nazi Germany', 'Women, young people, employment and persecution of minorities.'),
      ]),
      s('Other modern depth studies', [
        p('Russia and the Soviet Union, 1917–41', 'Revolution, Lenin, Stalin, collectivisation and the purges.'),
        p('Mao’s China, 1945–76', 'The Communist victory, the Great Leap Forward and the Cultural Revolution.'),
        p('The USA, 1954–75: conflict at home and abroad', 'Civil rights and the Vietnam War.'),
      ]),
    ],
  ],
};
