import type { SpecContent, SpecPoint, SpecSection } from './types';

const p = (name: string, know: string, separate?: boolean): SpecPoint => (separate ? { name, know, separate } : { name, know });
const one = (name: string, points: SpecPoint[]): SpecSection[] => [{ name, points }];

const content: SpecContent = {
  source: 'Pearson Edexcel GCSE Chemistry (1CH0)', url: 'https://qualifications.pearson.com/en/qualifications/edexcel-gcses/sciences-2016.html',
  topics: [
    one('Key concepts in chemistry', [
      p('Formulae, equations and hazards', 'Chemical formulae, balanced and ionic equations, state symbols, and hazard symbols with how to reduce risk.'),
      p('Atomic structure', 'How the Dalton model changed as subatomic particles were discovered; protons, neutrons and electrons, their charges and masses; atomic number, mass number and isotopes; relative atomic mass.'),
      p('The periodic table and electron configuration', 'How Mendeleev arranged and predicted elements, why atomic number orders the table, and electron configurations linked to group and period.'),
      p('Ionic bonding', 'Ions form by electron transfer; dot and cross diagrams; formulae of ionic compounds; giant ionic lattices.'),
      p('Covalent bonding', 'Shared pairs of electrons, molecules, and their typical size.'),
      p('Types of substance', 'Properties of ionic, simple molecular, giant covalent and metallic substances; diamond, graphite, fullerenes and graphene; polymers; limits of models.'),
      p('Calculations involving masses', 'Relative formula mass, percentage by mass, empirical formulae, conservation of mass, concentration in g dm⁻³. Higher: moles, the Avogadro constant, and balancing equations from reacting masses.'),
    ]),
    one('States of matter and mixtures', [
      p('States of matter', 'Arrangement, movement and energy of particles in solids, liquids and gases, and changes of state.'),
      p('Pure substances and mixtures', 'What pure means in chemistry, and using melting points to judge purity.'),
      p('Separating mixtures', 'Filtration, crystallisation, simple and fractional distillation, and choosing a method.'),
      p('Chromatography', 'Paper chromatography and Rf values. Core practical: investigating ink composition.'),
      p('Drinking water', 'How waste, ground and salt water are made potable, and why distilled water is used in analysis.'),
    ]),
    one('Chemical changes', [
      p('Acids and the pH scale', 'Acids give H⁺, alkalis give OH⁻; indicators; pH and hydrogen ion concentration; strong and weak, concentrated and dilute acids. Core practical: pH change on adding calcium oxide or hydroxide.'),
      p('Neutralisation and salts', 'Acids with metals, bases, alkalis and carbonates; tests for hydrogen and CO2; preparing soluble salts. Core practical: making copper sulfate crystals.'),
      p('Solubility', 'Solubility rules and making insoluble salts by precipitation.'),
      p('Electrolysis', 'Electrolytes, movement of ions, products at each electrode, and half equations at Higher. Core practical: electrolysis of copper sulfate solution.'),
    ]),
    one('Extracting metals and equilibria', [
      p('Reactivity of metals', 'The reactivity series from reactions with water, acids and salt solutions; displacement as a redox reaction.'),
      p('Extracting metals', 'Ores, reduction with carbon, electrolysis for reactive metals, and biological methods (phytoextraction, bioleaching) at Higher.'),
      p('Recycling and life-cycle assessment', 'Advantages of recycling metals and evaluating life-cycle assessments.'),
      p('Reversible reactions and equilibria', 'Reversible reactions, dynamic equilibrium and the Haber process. Higher: how temperature, pressure and concentration shift the position of equilibrium.'),
    ]),
    one('Groups in the periodic table', [
      p('Group 1', 'Alkali metals’ reactions with water and how reactivity increases down the group, explained by electron configuration.'),
      p('Group 7', 'Colours and states of the halogens, their reactions with metals and hydrogen, displacement reactions, and reactivity falling down the group.'),
      p('Group 0', 'Why noble gases are unreactive, their uses, and trends in their properties.'),
    ]),
    one('Rates of reaction and energy changes', [
      p('Rates of reaction', 'Measuring rates, collision theory, and the effects of temperature, concentration, surface area and catalysts; reading rate graphs. Core practical: changing conditions and rate.'),
      p('Catalysts and enzymes', 'Catalysts lower activation energy; enzymes are biological catalysts.'),
      p('Heat energy changes', 'Exothermic and endothermic reactions, measuring temperature changes, reaction profiles, and bond energy calculations at Higher.'),
    ]),
    one('Fuels and Earth science', [
      p('Crude oil and fractions', 'Hydrocarbons, fractional distillation, the main fractions and their uses, and homologous series.'),
      p('Combustion', 'Complete and incomplete combustion, carbon monoxide, soot, and pollutants such as sulfur dioxide and nitrogen oxides causing acid rain.'),
      p('Cracking and fuels', 'Cracking to make useful alkanes and alkenes; hydrogen and petrol as fuels compared.'),
      p('The atmosphere', 'How the early atmosphere formed and changed, and the test for oxygen.'),
      p('Greenhouse gases and climate change', 'How greenhouse gases trap heat, human activities that add them, evidence and uncertainty, and ways to reduce emissions.'),
    ]),
    [
      { name: 'Separate chemistry 1', points: [
        p('Transition metals, alloys and corrosion', 'Properties of transition metals, rusting and how to prevent it, electroplating, and alloys and their uses.', true),
        p('Quantitative analysis', 'Percentage yield, atom economy, concentration in mol dm⁻³, titrations, and molar gas volume. Core practical: acid–alkali titration.', true),
        p('Dynamic equilibria', 'The Haber process conditions and making fertilisers.', true),
        p('Chemical cells and fuel cells', 'Chemical cells produce a voltage; hydrogen–oxygen fuel cells, their pros and cons.', true),
      ] },
      { name: 'Separate chemistry 2', points: [
        p('Qualitative analysis', 'Flame tests, flame photometry, and tests for metal ions, carbonates, sulfates and halides. Core practical: identifying ions.', true),
        p('Hydrocarbons', 'Alkanes and alkenes compared, addition reactions and the bromine water test.', true),
        p('Polymers', 'Addition and condensation polymers, natural polymers such as DNA, starch and proteins, and problems with disposal.', true),
        p('Alcohols and carboxylic acids', 'Alcohols and their oxidation, making ethanol by fermentation, and carboxylic acids. Core practical: heat of combustion of alcohols.', true),
        p('Bulk and surface properties', 'Nanoparticles and their uses and risks; ceramics, polymers, composites and metals compared.', true),
      ] },
    ],
  ],
};

export default content;
