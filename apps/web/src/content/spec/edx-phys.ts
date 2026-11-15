import type { SpecContent, SpecPoint, SpecSection } from './types';

const p = (name: string, know: string, separate?: boolean): SpecPoint => (separate ? { name, know, separate } : { name, know });
const one = (name: string, points: SpecPoint[]): SpecSection[] => [{ name, points }];

const content: SpecContent = {
  source: 'Pearson Edexcel GCSE Physics (1PH0)', url: 'https://qualifications.pearson.com/en/qualifications/edexcel-gcses/sciences-2016.html',
  topics: [
    one('Key concepts of physics', [
      p('Units and measurement', 'SI units, prefixes from nano to giga, converting units such as hours to seconds, significant figures and standard form.'),
    ]),
    one('Motion and forces', [
      p('Scalars and vectors', 'The difference between scalar and vector quantities, with examples.'),
      p('Speed, velocity and acceleration', 'Distance–time and velocity–time graphs; speed = distance ÷ time; a = (v − u) ÷ t and v² − u² = 2ax; typical speeds; g = 10 m/s². Core practical: force, mass and acceleration.'),
      p('Newton’s laws', 'First, second and third laws; F = ma; weight = mg; inertial mass at Higher.'),
      p('Circular motion', 'Moving in a circle at constant speed means changing velocity, needing a centripetal force (Higher).'),
      p('Momentum', 'Momentum = mv; conservation of momentum; force = change in momentum ÷ time (Higher).'),
      p('Stopping distances', 'Thinking and braking distance, reaction times and what affects them, and the dangers of large decelerations.'),
    ]),
    one('Conservation of energy', [
      p('Energy stores and transfers', 'Calculating GPE (mgh) and kinetic energy (½mv²); energy transfer diagrams; conservation of energy in different situations.'),
      p('Efficiency and insulation', 'Dissipation, efficiency calculations, lubrication, and how thermal insulation and wall thickness reduce heat loss.'),
      p('Energy resources', 'Renewable and non-renewable resources, their reliability and impact, and trends in their use.'),
    ]),
    one('Waves', [
      p('Wave properties', 'Waves transfer energy, not matter; transverse and longitudinal waves; frequency, wavelength, amplitude and period; v = fλ and v = x ÷ t.'),
      p('Wave behaviour', 'Reflection, refraction, transmission and absorption at boundaries, and why refraction changes direction. Core practical: measuring wave speed in a ripple tank and on a string.'),
      p('Sound, ultrasound and seismic waves', 'How the ear hears, the range of human hearing, uses of ultrasound and infrasound, and P and S waves for exploring Earth’s structure.', true),
    ]),
    one('Light and the electromagnetic spectrum', [
      p('Reflection, refraction and total internal reflection', 'Ray diagrams, the law of reflection, refraction, total internal reflection and the critical angle.', true),
      p('Colour', 'Specular and diffuse reflection, colour of objects, and filters.', true),
      p('Lenses', 'Converging and diverging lenses, ray diagrams, real and virtual images, and lens power and focal length.', true),
      p('The electromagnetic spectrum', 'The order of the spectrum, all travelling at the same speed in a vacuum; emission and absorption of infrared. Core practical: infrared radiated from surfaces.'),
      p('Dangers and uses', 'Harmful effects of UV, X-rays and gamma; uses of every part of the spectrum; radio waves and circuits (Higher); changes in atoms and nuclei producing radiation.'),
    ]),
    one('Radioactivity', [
      p('Atoms and isotopes', 'Nucleus of protons and neutrons, electron orbits and energy levels, isotopes, and ions.'),
      p('Ionising radiation', 'Alpha, beta minus, beta plus (positron), gamma and neutron radiation; penetration and ionising power; background radiation and how it is detected.'),
      p('The atomic model', 'From the plum pudding model to Rutherford’s scattering and the nuclear model.'),
      p('Decay and half-life', 'Effects of each decay on atomic and mass numbers; balancing nuclear equations; activity in becquerels; half-life and its calculations.'),
      p('Dangers and precautions', 'Contamination compared with irradiation, and keeping people safe.'),
      p('Uses of radiation', 'Irradiating food, sterilising equipment, tracing and gauging, and diagnosis and treatment in medicine.', true),
      p('Fission and fusion', 'Chain reactions and nuclear power stations, fusion in stars, and why fusion is hard to achieve on Earth.', true),
    ]),
    one('Astronomy', [
      p('The solar system and orbits', 'Geocentric and heliocentric models, planets, moons, comets and satellites, and how gravity keeps orbits.', true),
      p('Life cycle of stars', 'How stars form and change depending on their mass.', true),
      p('The universe', 'Red-shift, the Big Bang and Steady State theories, and the evidence for each; observing the universe from Earth and space.', true),
    ]),
    one('Energy: forces doing work', [
      p('Work and energy', 'Energy stores and transfers in a closed system; work done = force × distance; calculating energy changes.'),
      p('Power and efficiency', 'Power as rate of energy transfer, watts, and efficiency calculations.'),
    ]),
    one('Forces and their effects', [
      p('Interacting forces', 'Contact and non-contact forces, pairs of forces, free body diagrams, and resultant forces. Higher: resolving forces with vector diagrams.'),
      p('Moments, levers and gears', 'Moments, the principle of moments, and how levers and gears transmit rotation.', true),
    ]),
    one('Electricity and circuits', [
      p('Circuits and charge', 'Circuit symbols, ammeters and voltmeters, current as rate of flow of charge (Q = It), and potential difference as energy per unit charge (E = QV).'),
      p('Resistance', 'V = IR; series and parallel circuits; I–V graphs for resistors, filament lamps and diodes; LDRs and thermistors. Core practical: I–V characteristics.'),
      p('Energy and power', 'E = IVt, P = IV and P = I²R; the heating effect and its uses and drawbacks.'),
      p('Mains electricity', 'Direct and alternating current, UK mains, the live, neutral and earth wires, fuses and circuit breakers.'),
    ]),
    one('Static electricity', [
      p('Static charge', 'Charging by friction and induction, sparks, and the dangers and uses of static.', true),
      p('Electric fields', 'Field patterns around charged objects.', true),
    ]),
    one('Magnetism and the motor effect', [
      p('Magnets and magnetic fields', 'Permanent and induced magnets, field patterns, Earth’s magnetic field and compasses.'),
      p('Electromagnetism', 'Fields around wires and solenoids, and electromagnets.'),
      p('The motor effect', 'Fleming’s left-hand rule, F = BIl, and how motors work.'),
    ]),
    one('Electromagnetic induction', [
      p('Induction and generators', 'Inducing a potential difference by moving a wire or magnet; alternators and dynamos.'),
      p('Microphones and loudspeakers', 'How they turn sound into electrical signals and back.', true),
      p('Transformers and the National Grid', 'Step-up and step-down transformers, why the grid uses high voltages, and VpIp = VsIs. Higher: the turns ratio equation.'),
    ]),
    one('Particle model', [
      p('Density and states of matter', 'ρ = m ÷ V; particle arrangement in each state; changes of state. Core practical: density.'),
      p('Internal energy', 'Specific heat capacity (ΔQ = mcΔθ) and specific latent heat (Q = mL); heating graphs. Core practical: specific heat capacity of water.'),
      p('Gas pressure', 'Gas pressure and temperature, absolute zero and the Kelvin scale. Higher: pV = constant and work done on a gas raising its temperature.'),
    ]),
    one('Forces and matter', [
      p('Stretching and elasticity', 'Elastic and inelastic distortion, F = kx, and energy stored = ½kx². Core practical: force and extension.'),
      p('Pressure in fluids', 'Pressure in liquids and gases, upthrust, why things float or sink, and atmospheric pressure.', true),
    ]),
  ],
};

export default content;
