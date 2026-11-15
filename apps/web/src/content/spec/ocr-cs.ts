import type { SpecContent, SpecPoint, SpecSection } from './types';

const p = (name: string, know: string): SpecPoint => ({ name, know });
const one = (name: string, points: SpecPoint[]): SpecSection[] => [{ name, points }];

const content: SpecContent = {
  source: 'OCR GCSE Computer Science (J277)', url: 'https://www.ocr.org.uk/qualifications/gcse/computer-science-j277-from-2020/specification-at-a-glance/',
  topics: [
    one('1.1 Systems architecture', [
      p('1.1.1 Architecture of the CPU', 'The purpose of the CPU and fetch–execute cycle; the ALU, control unit, cache and registers (MAR, MDR, program counter, accumulator); von Neumann architecture.'),
      p('1.1.2 CPU performance', 'How clock speed, cache size and number of cores affect performance.'),
      p('1.1.3 Embedded systems', 'What embedded systems are, with examples such as washing machines and cars.'),
    ]),
    one('1.2 Memory and storage', [
      p('1.2.1 Primary storage', 'Why computers need primary storage; RAM and ROM compared; virtual memory.'),
      p('1.2.2 Secondary storage', 'Why it’s needed; optical, magnetic and solid state compared by capacity, speed, portability, durability, reliability and cost.'),
      p('1.2.3 Units', 'Bit, nibble, byte, KB to PB; why data is stored in binary; calculating capacity needed for sound, images and text files.'),
      p('1.2.4 Data storage', 'Binary, denary and hexadecimal conversions, binary addition and overflow, binary shifts; characters (ASCII, Unicode); images (pixels, colour depth, resolution, metadata); sound (sample rate, duration, bit depth).'),
      p('1.2.5 Compression', 'Why compress files; lossy and lossless compression compared.'),
    ]),
    one('1.3 Computer networks, connections and protocols', [
      p('1.3.1 Networks and topologies', 'LANs and WANs, factors affecting performance, client–server and peer-to-peer, the hardware needed (routers, switches, NICs, transmission media), the internet, DNS, hosting and the cloud; star and mesh topologies.'),
      p('1.3.2 Wired and wireless networks, protocols and layers', 'Ethernet, Wi-Fi and Bluetooth; encryption; IP and MAC addressing; standards; protocols such as TCP/IP, HTTP, HTTPS, FTP, POP, IMAP and SMTP; the concept of layers.'),
    ]),
    one('1.4 Network security', [
      p('1.4.1 Threats to computer systems and networks', 'Malware, social engineering including phishing, brute-force attacks, denial of service, data interception and theft, and SQL injection.'),
      p('1.4.2 Identifying and preventing vulnerabilities', 'Penetration testing, anti-malware, firewalls, user access levels, passwords, encryption and physical security.'),
    ]),
    one('1.5 Systems software', [
      p('1.5.1 Operating systems', 'The user interface, memory management and multitasking, peripheral management and drivers, user management and file management.'),
      p('1.5.2 Utility software', 'Encryption software, defragmentation and data compression.'),
    ]),
    one('1.6 Ethical, legal, cultural and environmental impacts', [
      p('1.6.1 Impacts of digital technology', 'Ethical, legal, cultural, environmental and privacy issues, and the Data Protection Act 2018, Computer Misuse Act 1990, Copyright Designs and Patents Act 1988, and software licences (open source and proprietary).'),
    ]),
    one('2.1 Algorithms', [
      p('2.1.1 Computational thinking', 'Abstraction, decomposition and algorithmic thinking.'),
      p('2.1.2 Designing, creating and refining algorithms', 'Inputs, processes and outputs; structure diagrams; pseudocode, flowcharts and OCR Exam Reference Language; finding and fixing errors; trace tables.'),
      p('2.1.3 Searching and sorting algorithms', 'Binary and linear search; bubble, merge and insertion sort.'),
    ]),
    one('2.2 Programming fundamentals', [
      p('2.2.1 Programming fundamentals', 'Variables, constants, operators, inputs, outputs and assignments; sequence, selection and iteration; arithmetic, comparison and Boolean operators.'),
      p('2.2.2 Data types', 'Integer, real, Boolean, character and string, and casting between them.'),
      p('2.2.3 Additional programming techniques', 'String manipulation, file handling, records, SQL to search data, 1D and 2D arrays, subroutines (functions and procedures) and random numbers.'),
    ]),
    one('2.3 Producing robust programs', [
      p('2.3.1 Defensive design', 'Anticipating misuse, input validation, authentication, and maintainability through comments, indentation and sensible names.'),
      p('2.3.2 Testing', 'Iterative and final testing; syntax and logic errors; normal, boundary, invalid and erroneous test data; refining algorithms.'),
    ]),
    one('2.4 Boolean logic', [
      p('2.4.1 Boolean logic', 'AND, OR and NOT gates, truth tables, combining gates into circuits, and applying logic to problems.'),
    ]),
    one('2.5 Programming languages and IDEs', [
      p('2.5.1 Languages', 'High-level and low-level languages; why programs are translated; compilers compared with interpreters.'),
      p('2.5.2 The IDE', 'Editors, error diagnostics, run-time environment and translators.'),
    ]),
  ],
};

export default content;
