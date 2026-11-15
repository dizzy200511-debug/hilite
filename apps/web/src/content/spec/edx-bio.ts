import type { SpecContent, SpecPoint, SpecSection } from './types';

// Edexcel states content as numbered learning statements. Hilite groups related statements into sub-topics.
const p = (name: string, know: string, separate?: boolean): SpecPoint => (separate ? { name, know, separate } : { name, know });
const one = (name: string, points: SpecPoint[]): SpecSection[] => [{ name, points }];

const content: SpecContent = {
  source: 'Pearson Edexcel GCSE Biology (1BI0)', url: 'https://qualifications.pearson.com/en/qualifications/edexcel-gcses/sciences-2016.html',
  topics: [
    one('Key concepts in biology', [
      p('Cells and specialised cells', 'Sub-cellular structures of animal, plant and bacterial cells and what they do; how sperm, egg and ciliated epithelial cells are adapted.'),
      p('Microscopy', 'How light and electron microscopes have improved our understanding of cells; magnification calculations, units and standard form. Core practical: looking at specimens with a microscope.'),
      p('Enzymes', 'Active sites and specificity, denaturation, and how temperature, substrate concentration and pH affect activity; rate calculations; enzymes in building and breaking down carbohydrates, proteins and lipids. Core practical: pH and enzyme activity.'),
      p('Food tests and calorimetry', 'Testing for starch, reducing sugars, proteins and fats, and measuring the energy in food by calorimetry.', true),
      p('Transport into and out of cells', 'Diffusion, osmosis and active transport; percentage change in mass. Core practical: osmosis in potatoes.'),
    ]),
    one('Cells and control', [
      p('Mitosis and cancer', 'The cell cycle and stages of mitosis, its role in growth, repair and asexual reproduction, and cancer as uncontrolled division.'),
      p('Growth and differentiation', 'Growth by cell division and differentiation in animals and by elongation in plants; using percentile charts.'),
      p('Stem cells', 'Embryonic and adult stem cells and meristems, and the benefits and risks of stem cell treatments.'),
      p('The brain and spinal cord', 'Parts of the brain and what they do, why brain and spinal injuries are hard to treat, and how CT and PET scans help.', true),
      p('The nervous system and reflexes', 'Sensory, relay and motor neurones, synapses, and the reflex arc.'),
      p('The eye', 'How the eye works and how colour blindness, short and long sight and cataracts are caused and corrected.', true),
    ]),
    one('Genetics', [
      p('Reproduction and meiosis', 'Sexual and asexual reproduction compared, and the role of meiosis in making gametes.'),
      p('DNA and the genome', 'DNA as a double helix of nucleotides with complementary bases; the genome. Core practical: extracting DNA from fruit.'),
      p('Protein synthesis and mutations', 'Transcription and translation, and how mutations in genes and non-coding DNA affect proteins.', true),
      p('Mendel', 'Mendel’s work and why its importance wasn’t recognised at first.', true),
      p('Inheritance', 'Key terms such as allele, dominant and recessive, genotype and phenotype; Punnett squares, family pedigrees, sex determination and probability.'),
      p('Sex-linked inheritance and blood groups', 'Sex-linked disorders and inheritance of ABO blood groups with codominance.', true),
      p('Variation and the Human Genome Project', 'Genetic and environmental variation, most traits controlled by many genes, mutations, and what the Human Genome Project means for medicine.'),
    ]),
    one('Natural selection and genetic modification', [
      p('Evolution', 'Darwin’s theory of natural selection and how resistant bacteria support it.'),
      p('Evidence for human evolution', 'Fossils (Ardi, Lucy, Leakey’s finds) and stone tools as evidence, and how they are dated.'),
      p('The pentadactyl limb', 'The pentadactyl limb as evidence for evolution.', true),
      p('Classification', 'How genetic analysis led to the three-domain system replacing the five kingdoms.'),
      p('Selective breeding and tissue culture', 'Selective breeding of plants and animals; tissue culture in research and plant breeding.'),
      p('Genetic engineering', 'Modifying a genome with restriction enzymes, ligase, sticky ends and vectors; GM crops such as insect-resistant plants; benefits, risks and ethics in farming and medicine.'),
      p('Food security and biological control', 'Advantages and disadvantages of fertilisers and biological control, and GM to increase food production.', true),
    ]),
    one('Health, disease and the development of medicines', [
      p('Health and disease', 'Health as physical, mental and social wellbeing; communicable and non-communicable disease and how one disease raises the risk of another.'),
      p('Pathogens and infections', 'Bacteria, viruses, protists and fungi; cholera, tuberculosis, Chalara ash dieback, malaria, stomach ulcers and Ebola; how they spread and how spread is reduced.'),
      p('Virus life cycles', 'Lytic and lysogenic pathways.', true),
      p('Sexually transmitted infections', 'How chlamydia and HIV spread and how spread is reduced.'),
      p('Plant defences and plant disease', 'Physical and chemical defences of plants, and how plant diseases are identified.', true),
      p('Human defences and immunisation', 'Physical and chemical barriers, lymphocytes, antibodies and memory cells, and how immunisation works.'),
      p('Immunisation pros and cons, and monoclonal antibodies', 'Advantages and disadvantages of immunisation; how monoclonal antibodies are made and used in diagnosis and treatment.', true),
      p('Antibiotics and new medicines', 'Antibiotics only work on bacteria; stages of developing new medicines, including preclinical and clinical trials.'),
      p('Antiseptics and antibiotics practical', 'Core practical: the effect of antiseptics, antibiotics or plant extracts on microbial cultures.', true),
      p('Non-communicable diseases', 'Lifestyle factors such as diet, exercise, alcohol and smoking; BMI and waist:hip ratio; treatments for cardiovascular disease.'),
    ]),
    one('Plant structures and their functions', [
      p('Photosynthesis', 'Photosynthesis as an endothermic reaction; limiting factors of temperature, light and CO2; light intensity and the inverse square law. Core practical: light intensity and rate.'),
      p('Transport in plants', 'Root hair cells, xylem and phloem, transpiration and translocation; how light, air movement and temperature affect water uptake; rate calculations.'),
      p('Leaf structure and extreme environments', 'How the leaf is adapted for photosynthesis and gas exchange, and plant adaptations to extreme environments.', true),
      p('Plant hormones', 'Auxins in phototropism and gravitropism, and commercial uses of auxins, gibberellins and ethene.', true),
    ]),
    one('Animal coordination, control and homeostasis', [
      p('Hormones', 'Endocrine glands and their hormones; adrenalin and thyroxine, and negative feedback.'),
      p('Reproductive hormones', 'The menstrual cycle and the hormones controlling it; hormonal and barrier contraception; assisted reproductive technology.'),
      p('Homeostasis', 'Why a constant internal environment matters.'),
      p('Thermoregulation', 'Controlling body temperature through the skin and the hypothalamus.', true),
      p('Blood glucose and diabetes', 'Insulin and glucagon, the causes and control of type 1 and type 2 diabetes, and BMI.'),
      p('Osmoregulation and the kidneys', 'How the kidney and nephron filter blood, ADH, and treatments for kidney failure.', true),
    ]),
    one('Exchange and transport in animals', [
      p('Exchange surfaces', 'Why multicellular organisms need exchange surfaces and transport systems; surface area to volume ratio; alveoli.'),
      p('Blood and blood vessels', 'Red and white blood cells, plasma and platelets; arteries, veins and capillaries.'),
      p('The heart', 'Structure of the heart and circulation; cardiac output = stroke volume × heart rate.'),
      p('Respiration', 'Aerobic and anaerobic respiration compared. Core practical: rate of respiration.'),
    ]),
    one('Ecosystems and material cycles', [
      p('Ecosystems and interdependence', 'Levels of organisation, abiotic and biotic factors, interdependence, parasitism and mutualism.'),
      p('Fieldwork', 'Estimating populations with quadrats and belt transects. Core practical: organisms and their environment.'),
      p('Energy transfer and pyramids', 'Energy lost between trophic levels and pyramids of biomass.', true),
      p('Biodiversity', 'Effects of fish farming, non-native species and eutrophication; conservation and reforestation.'),
      p('Material cycles', 'The carbon, water (including desalination) and nitrogen cycles.'),
      p('Decomposition and indicator species', 'Factors affecting decomposition, food preservation, and indicator species of pollution.', true),
    ]),
  ],
};

export default content;
