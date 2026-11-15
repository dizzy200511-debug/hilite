import type { SpecContent, SpecPoint, SpecSection } from './types';

const p = (name: string, know: string): SpecPoint => ({ name, know });
const s = (name: string, points: SpecPoint[]): SpecSection => ({ name, points });
const one = (name: string, points: SpecPoint[]): SpecSection[] => [s(name, points)];

// You study two religions; each "Religion" topic shows all of them so you can open the two you’re taking.
const BELIEFS: SpecSection[] = [
  s('Christianity', [
    p('The nature of God', 'God as omnipotent, loving and just; the Trinity; the problem of evil and suffering.'),
    p('Creation', 'Genesis 1–3 and John 1, and the role of the Word and the Spirit.'),
    p('Jesus Christ', 'The incarnation, crucifixion, resurrection and ascension.'),
    p('Salvation', 'Sin, law, grace and the Spirit; the role of Christ in salvation and atonement.'),
    p('The afterlife', 'Resurrection, judgement, heaven and hell.'),
  ]),
  s('Islam', [
    p('Key beliefs', 'The six articles of faith in Sunni Islam and the five roots of Usul ad-Din in Shi’a Islam; Tawhid.'),
    p('The nature of God', 'Omnipotence, beneficence, mercy, fairness and justice; immanence and transcendence.'),
    p('Angels and predestination', 'Jibril and Mika’il, and predestination and human freedom.'),
    p('Akhirah (life after death)', 'Judgement, heaven and hell.'),
    p('Authority', 'Risalah and prophets including Adam, Ibrahim and Muhammad; the holy books; the Imamate in Shi’a Islam.'),
  ]),
  s('Judaism', [
    p('The nature of God', 'God as one, creator, lawgiver and judge; the Shekhinah.'),
    p('Life after death and the Messiah', 'Different Jewish views on life after death and the Messiah.'),
    p('The covenant', 'The covenants with Abraham and Moses, and the Ten Commandments.'),
    p('Key moral principles', 'Sanctity of life, pikuach nefesh, free will and the 613 mitzvot.'),
  ]),
  s('Buddhism', [
    p('The Buddha and the Dhamma', 'The Buddha’s life and enlightenment, and the Dhamma.'),
    p('The Three Marks of Existence', 'Anicca (impermanence), anatta (no fixed self) and dukkha (suffering).'),
    p('The Four Noble Truths', 'Dukkha, samudaya, nirodha and magga, and the Eightfold Path.'),
    p('Human personality and paths', 'The five aggregates; Theravada and Mahayana ideals (arhat and bodhisattva); Buddha-nature and Pure Land.'),
  ]),
  s('Hinduism', [
    p('Brahman and the deities', 'Brahman, the Trimurti, and deities and avatars such as Vishnu, Shiva and Krishna.'),
    p('The self and rebirth', 'Atman, karma, samsara and moksha.'),
    p('Dharma', 'Duty, the stages of life and varnashrama, and ahimsa.'),
  ]),
  s('Sikhism', [
    p('The nature of God', 'Ik Onkar, the Mool Mantar, and God as creator.'),
    p('The Gurus', 'Guru Nanak and the ten Gurus, and the Guru Granth Sahib.'),
    p('Key beliefs', 'Karma, rebirth and mukti; haumai and the five vices; gurmukh and manmukh; sewa and equality.'),
  ]),
];

const PRACTICES: SpecSection[] = [
  s('Christianity', [
    p('Worship and prayer', 'Liturgical, non-liturgical, informal and private worship; the Lord’s Prayer.'),
    p('Sacraments', 'Baptism and Holy Communion, and different views of them.'),
    p('Pilgrimage and festivals', 'Pilgrimage such as Lourdes and Iona; Christmas and Easter.'),
    p('The church in the community and the world', 'Food banks and street pastors; mission, evangelism, church growth, reconciliation, persecution, and charities such as Christian Aid.'),
  ]),
  s('Islam', [
    p('The Five Pillars', 'Shahadah, salah, sawm, zakah and hajj, and the Ten Obligatory Acts in Shi’a Islam, including khums.'),
    p('Jihad', 'Greater and lesser jihad and the conditions for lesser jihad.'),
    p('Festivals', 'Id-ul-Adha, Id-ul-Fitr and Ashura.'),
  ]),
  s('Judaism', [
    p('Worship', 'The synagogue, public acts of worship, the Tenakh and Talmud, and prayer including the Amidah.'),
    p('Shabbat and festivals', 'Shabbat at home and in the synagogue; Rosh Hashanah, Yom Kippur and Pesach.'),
    p('Rituals and daily life', 'Brit Milah, Bar and Bat Mitzvah, marriage, mourning, and dietary laws.'),
  ]),
  s('Buddhism', [
    p('Places and forms of worship', 'Temples, shrines and monasteries; puja and devotional practices.'),
    p('Meditation', 'Samatha, vipassana and zazen.'),
    p('Ceremonies and festivals', 'Death and mourning rituals; Wesak and Parinirvana Day.'),
    p('Ethics', 'Kamma and rebirth, compassion (karuna), loving-kindness (metta), the five precepts and the six perfections.'),
  ]),
  s('Hinduism', [
    p('Worship', 'Puja at home and in the mandir, and different forms of worship.'),
    p('Festivals and pilgrimage', 'Diwali and Holi; pilgrimage to places such as Varanasi and the Kumbh Mela.'),
    p('Rites of passage', 'Samskaras through life, and what they show about Hindu beliefs.'),
  ]),
  s('Sikhism', [
    p('The gurdwara and worship', 'The gurdwara, the Guru Granth Sahib in worship, and the langar.'),
    p('The Khalsa', 'The Khalsa, the 5Ks and the Amrit ceremony.'),
    p('Ceremonies, festivals and pilgrimage', 'Naming ceremonies, Vaisakhi and Divali, and the Harmandir Sahib.'),
  ]),
];

const content: SpecContent = {
  source: 'AQA GCSE Religious Studies A (8062)', url: 'https://www.aqa.org.uk/subjects/religious-studies/gcse/religious-studies-a-8062/specification',
  note: 'You study two religions: open the two your school teaches. Catholic Christianity follows the Christian beliefs and practices shown here.',
  topics: [
    BELIEFS, PRACTICES, BELIEFS, PRACTICES,
    one('Relationships and families', [
      p('Sex, marriage and divorce', 'Views on sexuality, sex before and outside marriage, contraception, the purpose of marriage, same-sex marriage, cohabitation, divorce and remarriage.'),
      p('Families and gender equality', 'The nature and purpose of families, roles of men and women, and gender prejudice and discrimination.'),
    ]),
    one('Religion and life', [
      p('Origins and value of the universe', 'Religious and scientific views of the origin of the universe, stewardship and dominion, and the environment.'),
      p('Animals and the origins of life', 'Evolution and religious views, and the use of animals for food and experiments.'),
      p('Abortion and euthanasia', 'Sanctity and quality of life, and views on abortion and euthanasia.'),
      p('Death and the afterlife', 'Religious beliefs about death and life after death.'),
    ]),
    one('Religion, peace and conflict', [
      p('Peace and justice', 'Peace, justice, forgiveness and reconciliation.'),
      p('Violence, terrorism and war', 'Reasons for war (greed, self-defence, retaliation), violent protest and terrorism.'),
      p('Just war, holy war and pacifism', 'Just war theory, holy war, and pacifism, with religion as a cause of war.'),
      p('Weapons and peacemaking', 'Nuclear weapons and weapons of mass destruction; religious peacemaking and helping victims of war.'),
    ]),
    one('Religion, crime and punishment', [
      p('Crime and its causes', 'Good and evil intentions, poverty, upbringing, mental illness, addiction, greed, hate and opposition to unjust laws.'),
      p('Punishment', 'Aims of punishment (retribution, deterrence, reformation), prison, corporal and community service.'),
      p('Treatment of criminals and forgiveness', 'Treatment of criminals and religious ideas of forgiveness.'),
      p('The death penalty', 'Arguments and religious views for and against the death penalty.'),
    ]),
  ],
};

export default content;
