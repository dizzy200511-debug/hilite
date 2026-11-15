import type { SpecContent, SpecPoint, SpecSection } from './types';

const p = (name: string, know: string): SpecPoint => ({ name, know });
const one = (name: string, points: SpecPoint[]): SpecSection[] => [{ name, points }];

const content: SpecContent = {
  source: 'AQA GCSE Computer Science (8525)', url: 'https://www.aqa.org.uk/subjects/computer-science/gcse/computer-science-8525/specification',
  topics: [
    one('Fundamentals of algorithms', [
      p('Representing algorithms', 'Decomposition and abstraction; write and read algorithms in pseudocode, flowcharts and program code; trace tables; work out what an algorithm does.'),
      p('Efficiency of algorithms', 'More than one algorithm can solve a problem; compare them by how long they take, in simple terms.'),
      p('Searching algorithms', 'How linear search and binary search work, and when to use each (binary search needs sorted data).'),
      p('Sorting algorithms', 'How merge sort and bubble sort work, and their pros and cons.'),
    ]),
    one('Programming', [
      p('Data types', 'Integer, real, Boolean, character and string, and choosing the right one.'),
      p('Programming concepts', 'Variables and constants, assignment, sequence, selection and iteration (definite and indefinite), and nesting.'),
      p('Arithmetic operations', 'Addition, subtraction, multiplication, real and integer division, and modulus (DIV and MOD).'),
      p('Relational operations', 'Equal to, not equal to, less than, greater than, and their "or equal to" forms.'),
      p('Boolean operations', 'NOT, AND and OR in conditions.'),
      p('Data structures', 'One- and two-dimensional arrays and records, and why to use them.'),
      p('Input and output', 'Getting input from the keyboard and showing output on screen.'),
      p('String handling', 'Length, position, substrings, concatenation, character codes, and converting between strings and numbers.'),
      p('Random numbers', 'Generating random numbers in a program.'),
      p('Subroutines', 'Procedures and functions, parameters, return values, local and global variables, and why structured programming helps.'),
      p('Robust and secure programming', 'Data validation, simple authentication, testing with normal, boundary and erroneous data, and fixing syntax and logic errors.'),
    ]),
    one('Fundamentals of data representation', [
      p('Number bases', 'Decimal (base 10), binary (base 2) and hexadecimal (base 16), and why computers use binary.'),
      p('Converting between bases', 'Convert between binary, decimal and hexadecimal, up to 8-bit or 255.'),
      p('Units of information', 'Bits, nibbles and bytes, and kB, MB, GB and TB in powers of 1000.'),
      p('Binary arithmetic', 'Add up to three binary numbers and apply binary shifts.'),
      p('Character encoding', 'ASCII and Unicode, and why Unicode was introduced.'),
      p('Representing images', 'Pixels, resolution and colour depth; calculate bitmap file sizes.'),
      p('Representing sound', 'Sampling rate and sample resolution; calculate sound file sizes.'),
      p('Data compression', 'Why we compress data; Huffman coding and run length encoding.'),
    ]),
    one('Computer systems', [
      p('Hardware and software', 'The difference between hardware and software.'),
      p('Boolean logic', 'NOT, AND, OR and XOR gates, truth tables, logic circuits and Boolean expressions.'),
      p('Software classification', 'System software (operating systems and utilities) compared with application software; what an operating system does.'),
      p('Languages and translators', 'Low-level (machine code, assembly) and high-level languages; compilers, interpreters and assemblers.'),
      p('Systems architecture', 'The CPU and its parts, the fetch–execute cycle, clock speed, cores and cache; RAM, ROM, secondary storage (magnetic, optical, solid state), cloud storage and embedded systems.'),
    ]),
    one('Fundamentals of computer networks', [
      p('Networks', 'LANs, WANs and PANs; wired and wireless; star and bus topologies; protocols including Ethernet, Wi-Fi, TCP, UDP, IP, HTTP, HTTPS, SMTP and IMAP; the four-layer TCP/IP model; network security such as firewalls, MAC address filtering and encryption.'),
    ]),
    [
      { name: 'Fundamentals of cyber security', points: [p('What cyber security is', 'Protecting networks, computers, programs and data from attack, damage or unauthorised access.')] },
      { name: 'Cyber security threats', points: [
        p('Threats and weaknesses', 'Weak passwords, misconfigured access rights, removable media and unpatched software.'),
        p('Social engineering', 'Blagging, phishing and shouldering, and how to protect against them.'),
        p('Malicious code (malware)', 'Viruses, trojans and spyware, and how they spread.'),
      ] },
      { name: 'Detecting and preventing threats', points: [p('Prevention', 'Penetration testing, biometrics, passwords, CAPTCHA, email confirmation and automatic software updates.')] },
    ],
    one('Relational databases and SQL', [
      p('Relational databases', 'Tables, records, fields, primary and foreign keys, and why linked tables reduce redundancy and inconsistency.'),
      p('SQL', 'Write SELECT queries with WHERE and ORDER BY across one or two tables, and use INSERT, UPDATE and DELETE.'),
    ]),
    one('Ethical, legal and environmental impacts', [
      p('Impacts of digital technology', 'Ethical, legal and environmental issues, privacy and cyber security, and laws such as data protection, in scenarios like wearables, autonomous vehicles and mobile phones.'),
    ]),
  ],
};

export default content;
