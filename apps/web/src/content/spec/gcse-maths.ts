import type { SpecContent, SpecPoint, SpecSection } from './types';

// GCSE maths content is set by the Department for Education and is the same for AQA, Edexcel and OCR.
// Codes (N1, A1…) are the DfE references the boards use. Higher-only parts are marked "Higher:".
const p = (name: string, know: string, higher?: boolean): SpecPoint => (higher ? { name, know, higher } : { name, know });
const s = (name: string, points: SpecPoint[]): SpecSection => ({ name, points });

const content: SpecContent = {
  source: 'GCSE mathematics subject content (DfE), used by AQA 8300, Edexcel 1MA1 and OCR J560',
  url: 'https://www.gov.uk/government/publications/gcse-mathematics-subject-content-and-assessment-objectives',
  note: 'Your board’s specification follows the same content, so the codes match.',
  topics: [
    [
      s('Structure and calculation', [
        p('N1 Ordering numbers', 'Order integers, decimals and fractions, including negatives, and use =, ≠, <, >, ≤ and ≥.'),
        p('N2 The four operations', 'Add, subtract, multiply and divide integers, decimals and fractions, including mixed numbers and negatives.'),
        p('N3 Order of operations', 'Use inverse operations, the order of operations (BIDMAS) and algebraic conventions.'),
        p('N4 Primes, factors and multiples', 'Factors, multiples, primes, HCF and LCM, and writing numbers as a product of prime factors.'),
        p('N5 Counting', 'List outcomes systematically. Higher: use the product rule for counting.'),
        p('N6 Powers and roots', 'Squares, cubes, square and cube roots, and positive integer powers. Higher: estimate powers and roots.'),
        p('N7 Index laws', 'Zero and negative indices and the laws of indices. Higher: fractional indices.'),
        p('N8 Exact answers and surds', 'Leave answers as fractions or in terms of π. Higher: simplify surds and rationalise denominators.'),
        p('N9 Standard form', 'Write and calculate with numbers in standard form, A × 10ⁿ.'),
      ]),
      s('Fractions, decimals and percentages', [
        p('N10 Converting', 'Convert between fractions, decimals and percentages. Higher: change recurring decimals into fractions.'),
        p('N11 Fractions of amounts', 'Write one quantity as a fraction of another and use fractions as multipliers.'),
        p('N12 Percentages as operators', 'Find percentages of amounts and use multipliers such as 1.15 for a 15% increase.'),
      ]),
      s('Measures and accuracy', [
        p('N13 Units', 'Standard units of length, mass, time and money, and compound units.'),
        p('N14 Estimating', 'Round to one significant figure to estimate answers and check calculations.'),
        p('N15 Rounding', 'Round to decimal places and significant figures, and write error intervals.'),
        p('N16 Limits of accuracy', 'Use upper and lower limits of a measurement. Higher: calculate upper and lower bounds of a calculation.'),
      ]),
    ],
    [
      s('Notation, vocabulary and manipulation', [
        p('A1 Algebraic notation', 'Write things like 3y, a², a/b and brackets correctly.'),
        p('A2 Substitution', 'Substitute numbers into expressions and formulae, including science formulae.'),
        p('A3 Vocabulary', 'Know the difference between an expression, equation, formula, identity, inequality, term and factor.'),
        p('A4 Simplifying and factorising', 'Collect like terms, expand brackets (Higher: three binomials) and factorise, including quadratics and the difference of two squares. Higher: factorise ax² + bx + c and simplify algebraic fractions.'),
        p('A5 Formulae', 'Use standard formulae and rearrange them to change the subject.'),
        p('A6 Identities and proof', 'Show that two expressions are equivalent. Higher: algebraic proof.'),
        p('A7 Functions', 'Think of expressions as functions with inputs and outputs. Higher: inverse and composite functions.'),
      ]),
      s('Graphs', [
        p('A8 Coordinates', 'Work with coordinates in all four quadrants.'),
        p('A9 Straight lines', 'Plot y = mx + c and find the equation of a line through two points or one point with a gradient. Higher: parallel and perpendicular lines.'),
        p('A10 Gradient and intercept', 'Find and interpret the gradient and y-intercept from a graph or equation.'),
        p('A11 Quadratic graphs', 'Find roots, intercepts and turning points of quadratics from graphs. Higher: find turning points by completing the square.'),
        p('A12 Graph shapes', 'Recognise and sketch linear, quadratic, cubic and reciprocal graphs. Higher: exponential and trigonometric graphs.'),
        p('A13 Transforming graphs', 'Sketch translations and reflections of a given function, such as y = f(x + a) and y = −f(x).', true),
        p('A14 Real-life graphs', 'Plot and interpret graphs in context, such as distance–time, velocity–time and financial graphs.'),
        p('A15 Gradients and areas under curves', 'Estimate gradients of curves and areas under graphs, and say what they mean, such as acceleration and distance travelled.', true),
        p('A16 Circles and tangents', 'Recognise x² + y² = r² and find the equation of a tangent at a point.', true),
      ]),
      s('Solving equations and inequalities', [
        p('A17 Linear equations', 'Solve linear equations, including unknowns on both sides, and find approximate solutions from graphs.'),
        p('A18 Quadratic equations', 'Solve quadratics by factorising. Higher: complete the square and use the quadratic formula.'),
        p('A19 Simultaneous equations', 'Solve two linear simultaneous equations. Higher: one linear and one quadratic.'),
        p('A20 Iteration', 'Find approximate solutions using iteration.', true),
        p('A21 Forming equations', 'Turn a worded problem into an equation, solve it and interpret the answer.'),
        p('A22 Inequalities', 'Solve linear inequalities and show them on a number line. Higher: quadratic inequalities, set notation and regions on graphs.'),
      ]),
      s('Sequences', [
        p('A23 Generating sequences', 'Find terms from a term-to-term or position-to-term rule.'),
        p('A24 Types of sequence', 'Square, cube and triangular numbers, arithmetic and Fibonacci-type sequences, quadratic and simple geometric sequences.'),
        p('A25 The nth term', 'Find the nth term of a linear sequence. Higher: of a quadratic sequence.'),
      ]),
    ],
    [
      s('Ratio, proportion and rates of change', [
        p('R1 Converting units', 'Change between standard units and compound units such as speed and rates of pay.'),
        p('R2 Scales and maps', 'Use scale factors, scale drawings and maps.'),
        p('R3 Fractions of quantities', 'Write one quantity as a fraction of another, including fractions above 1.'),
        p('R4 Ratio notation', 'Use ratio notation and simplify ratios.'),
        p('R5 Sharing in a ratio', 'Divide an amount in a given ratio and use part:part and part:whole ratios.'),
        p('R6 Ratios and fractions', 'Write a multiplicative relationship as a ratio or a fraction.'),
        p('R7 Proportion', 'Understand proportion as equal ratios.'),
        p('R8 Ratios and linear functions', 'Link ratios to fractions and straight-line graphs.'),
        p('R9 Percentages', 'Percentage increase and decrease, reverse percentages, and simple interest.'),
        p('R10 Direct and inverse proportion', 'Solve proportion problems with tables, graphs and equations.'),
        p('R11 Compound units', 'Use speed, unit pricing, density and pressure.'),
        p('R12 Similarity', 'Compare lengths, areas and volumes with ratios and scale factors. Higher: link to trigonometric ratios.'),
        p('R13 Proportion equations', 'Know that y inversely proportional to x means y is proportional to 1/x. Higher: form and use y = kx, y = k/x and similar.'),
        p('R14 Rate of change', 'Interpret the gradient of a straight line as a rate of change. Higher: recognise graphs of direct and inverse proportion.'),
        p('R15 Instantaneous rate of change', 'Interpret the gradient at a point on a curve, and average rates of change.', true),
        p('R16 Growth and decay', 'Compound interest, depreciation and repeated percentage change. Higher: iterative processes.'),
      ]),
    ],
    [
      s('Properties and constructions', [
        p('G1 Geometric language', 'Points, lines, vertices, edges, planes, parallel and perpendicular lines, polygons and symmetry.'),
        p('G2 Constructions and loci', 'Construct perpendicular bisectors, angle bisectors and perpendiculars with a ruler and compasses, and solve loci problems.'),
        p('G3 Angle facts', 'Angles at a point, on a straight line, vertically opposite, alternate and corresponding angles, and angle sums in polygons.'),
        p('G4 Quadrilaterals', 'Properties of squares, rectangles, parallelograms, trapeziums, kites and rhombuses.'),
        p('G5 Congruent triangles', 'Use SSS, SAS, ASA and RHS.'),
        p('G6 Geometric reasoning', 'Use angle facts, congruence and similarity to work out and explain results. Higher: geometric proof.'),
        p('G7 Transformations', 'Rotations, reflections, translations and enlargements, including fractional scale factors. Higher: negative scale factors.'),
        p('G8 Combining transformations', 'Describe the result of combining transformations and what stays the same.', true),
        p('G9 Parts of a circle', 'Centre, radius, chord, diameter, circumference, tangent, arc, sector and segment.'),
        p('G10 Circle theorems', 'Apply and prove the standard circle theorems.', true),
        p('G11 Geometry on axes', 'Solve geometry problems on coordinate axes.'),
        p('G12 3D shapes', 'Faces, edges and vertices of cubes, prisms, cylinders, pyramids, cones and spheres.'),
        p('G13 Plans and elevations', 'Draw and interpret plans and elevations of 3D shapes.'),
      ]),
      s('Mensuration and calculation', [
        p('G14 Units of measure', 'Length, area, volume, capacity, mass and time units, and converting between them.'),
        p('G15 Measuring and bearings', 'Measure lines and angles, use scale drawings, and work with bearings.'),
        p('G16 Area and volume formulae', 'Areas of triangles, parallelograms and trapeziums; volumes of cuboids and prisms, including cylinders.'),
        p('G17 Circles and composite shapes', 'Circumference and area of circles, perimeters and areas of composite shapes, and surface area and volume of spheres, pyramids and cones.'),
        p('G18 Arcs and sectors', 'Calculate arc lengths, angles and sector areas.'),
        p('G19 Similar shapes', 'Use similarity to find missing lengths. Higher: areas and volumes of similar shapes.'),
        p('G20 Pythagoras and trigonometry', 'Use Pythagoras’ theorem and sin, cos and tan in right-angled triangles. Higher: in 3D.'),
        p('G21 Exact trigonometric values', 'Know sin and cos of 0°, 30°, 45°, 60° and 90°, and tan of 0°, 30°, 45° and 60°.'),
        p('G22 Sine and cosine rules', 'Use the sine rule and cosine rule in any triangle.', true),
        p('G23 Area using sine', 'Use area = ½ab sin C.', true),
      ]),
      s('Vectors', [
        p('G24 Vectors and translations', 'Describe translations as column vectors.'),
        p('G25 Vector arithmetic', 'Add, subtract and multiply vectors by a scalar, in diagrams and as columns. Higher: vector proofs.'),
      ]),
    ],
    [
      s('Probability', [
        p('P1 Experiments', 'Record and analyse results of probability experiments with tables and frequency trees.'),
        p('P2 Expected outcomes', 'Use fairness and equally likely outcomes to work out expected results.'),
        p('P3 Relative frequency', 'Link relative frequency to theoretical probability on a 0 to 1 scale.'),
        p('P4 Probabilities summing to 1', 'Probabilities of all possible outcomes add up to 1; P(not A) = 1 − P(A).'),
        p('P5 Larger samples', 'Bigger samples give results closer to the theoretical probability.'),
        p('P6 Listing outcomes', 'Use tables, grids and Venn diagrams to list outcomes. Higher: tree diagrams.'),
        p('P7 Sample spaces', 'Draw sample spaces for one or two events and use them to find probabilities.'),
        p('P8 Combined events', 'Independent and dependent events, using tree diagrams.'),
        p('P9 Conditional probability', 'Work out conditional probabilities from two-way tables, tree diagrams and Venn diagrams.', true),
      ]),
    ],
    [
      s('Statistics', [
        p('S1 Sampling', 'Draw conclusions about a population from a sample, and know the limitations of sampling.'),
        p('S2 Charts and tables', 'Frequency tables, bar charts, pie charts, pictograms, vertical line charts and time series graphs, and when to use each.'),
        p('S3 Histograms and cumulative frequency', 'Draw and interpret histograms with unequal class widths and cumulative frequency graphs.', true),
        p('S4 Averages and spread', 'Mean, median, mode and range, including from grouped data and outliers. Higher: quartiles, interquartile range and box plots.'),
        p('S5 Describing a population', 'Use statistics to describe a population.'),
        p('S6 Scatter graphs', 'Plot scatter graphs, describe correlation (which isn’t causation), draw lines of best fit, and interpolate and extrapolate with care.'),
      ]),
    ],
  ],
};

export default content;
