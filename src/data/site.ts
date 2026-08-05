/**
 * Single source of truth for site content.
 *
 * Every string here was lifted verbatim from the legacy Manus build at
 * harrisonsaito.com.au (see docs/MIGRATION.md). Copy was the one genuinely
 * strong asset of the old site, so it is preserved exactly; only structure,
 * infrastructure and metadata changed.
 */

export const SITE = {
  name: 'Harrison Saito',
  domain: 'https://www.harrisonsaito.com.au',
  tagline: 'Educator · Martial Artist · Coach',
  locality: 'Chatswood',
  region: 'NSW',
  regionName: 'New South Wales',
  country: 'AU',
  postcode: '2067',
  phone: '+61424657548',
  phoneDisplay: '+61 424 657 548',
  email: 'hello@harrisonsaito.com.au',
  whatsapp: '61424657548',
  instagram: 'https://www.instagram.com/harrison_saito/',
  youtube: 'https://www.youtube.com/@Harrison_saito',
  founded: '2015',
} as const;

/** Pre-filled WhatsApp deep links. The legacy site's IG-attribution variant is kept. */
export function whatsappLink(message: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP = {
  general: whatsappLink("Hi Harrison, I'd like to book a chat."),
  instagram: whatsappLink(
    'Hi Harrison, I found Return to Self through Instagram and would like to learn more about the 12-week program.'
  ),
  coaching: whatsappLink("Hi Harrison, I'd like to talk about 1:1 life coaching."),
  hsc: whatsappLink('Hi Harrison, I’d like to ask about HSC and youth mentoring.'),
} as const;

/* ------------------------------------------------------------------ nav */

export const NAV = [
  { label: "Men's Coaching", href: '/mens-coaching' },
  { label: 'HSC & Youth', href: '/hsc-tutoring' },
  { label: 'About', href: '/about' },
  { label: 'Media', href: '/media' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'Contact', href: '/contact' },
] as const;

/* --------------------------------------------------------------- offers */

export type Offer = {
  id: string;
  number: string;
  name: string;
  price: string;
  unit: string;
  priceValue: number;
  description: string;
  cta: string;
  href: string;
  audience: 'adults' | 'youth';
};

export const OFFERS: Offer[] = [
  {
    id: 'life-coaching',
    number: '01',
    name: '1:1 Life Coaching',
    price: '$150',
    unit: '/ hour',
    priceValue: 150,
    description:
      'Using Karate and Buddhist philosophy for inner work, nervous system regulation, and breaking the people-pleasing pattern. Session-based, at your pace.',
    cta: 'Book a Discovery Chat',
    href: '/book',
    audience: 'adults',
  },
  {
    id: 'return-to-self',
    number: '02',
    name: 'Return to Self',
    price: '$3,600',
    unit: '/ 12 weeks',
    priceValue: 3600,
    description:
      '12 weeks. Three phases: Separate, Return, Integrate. A structured programme using martial arts, Buddhism, and honest inner work.',
    cta: 'Apply',
    href: '/apply',
    audience: 'adults',
  },
  {
    id: 'hsc-mentoring',
    number: '03',
    name: '1:1 HSC & Youth Mentoring',
    price: '$120',
    unit: '/ hour',
    priceValue: 120,
    description:
      'English tutoring, mindset coaching, and mentoring for students navigating the pressures of the HSC and adolescence. Confidence, clarity, and performance under pressure.',
    cta: 'Book a Session',
    href: '/book?service=hsc',
    audience: 'youth',
  },
];

/* ------------------------------------------------------- the 12-week arc */

export type Phase = {
  number: string;
  weeks: string;
  weekList: string[];
  name: string;
  /** Classical budo learning model — 守破離 — mapped to the programme's arc. */
  kanji: string;
  romaji: string;
  kanjiMeaning: string;
  blurb: string;
  aim: string;
  selfTrust: string;
  image: string;
  imageAlt: string;
};

export const PHASES: Phase[] = [
  {
    number: '01',
    weeks: 'Weeks 1–4',
    weekList: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    name: 'Separate',
    kanji: '守',
    romaji: 'Shu',
    kanjiMeaning: 'to keep, to hold the form',
    blurb:
      'See the pattern for what it is. Identify the inherited programmes running your life: the people-pleasing, the performing, the suppressed anger. Begin to separate your authentic self from the survival strategies you built as a child.',
    aim: 'See the patterns without rejecting yourself.',
    selfTrust:
      'Self-trust begins when you can tell the difference between an inherited reaction and what you genuinely think, feel and value.',
    image: 'karate-training',
    imageAlt:
      'Harrison Saito training karate in a dojo, mid-stance, in a white gi with a black belt',
  },
  {
    number: '02',
    weeks: 'Weeks 5–8',
    weekList: ['Week 5', 'Week 6', 'Week 7', 'Week 8'],
    name: 'Return',
    kanji: '破',
    romaji: 'Ha',
    kanjiMeaning: 'to break, to depart from the form',
    blurb:
      'Go back to the origin. Understand where the patterns came from: your father, your family system, your culture. Process the grief, the anger, the loss. This is where the real work happens. Not intellectually. In your body.',
    aim: 'Meet what is underneath the performance.',
    selfTrust:
      'Self-trust deepens when you can stay present with grief, anger, vulnerability and compassion without abandoning or overruling yourself.',
    image: 'phase-return',
    imageAlt: 'A quiet, contemplative moment during the Return phase of the programme',
  },
  {
    number: '03',
    weeks: 'Weeks 9–12',
    weekList: ['Week 9', 'Week 10', 'Week 11', 'Week 12'],
    name: 'Integrate',
    kanji: '離',
    romaji: 'Ri',
    kanjiMeaning: 'to leave, to transcend the form',
    blurb:
      "The shell and the self become one. Build a daily practice that sustains the work. Set boundaries without guilt. Speak your truth without performing. The discipline stays. The strength stays. But now there's a man behind it. Not just a performance.",
    aim: 'Turn insight into choices you can stand behind.',
    selfTrust:
      'Self-trust becomes behavioural through decisions, boundaries, kept commitments, chosen responses under pressure and honest repair.',
    image: 'phase-integrate',
    imageAlt: 'Harrison Saito during the Integrate phase, composed and still',
  },
];

/** The repeating practice inside every phase. */
export const RETURN_LOOP = ['Pause', 'Recognise', 'Separate', 'Choose', 'Practise'];

/* --------------------------------------------------------- testimonials */

export type Testimonial = {
  name: string;
  context: string;
  category: 'adults' | 'youth';
  avatar: string | null;
  quote: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Matt Halpin',
    context: "Return to Self — Men's Coaching",
    category: 'adults',
    avatar: 'avatar-matt-halpin',
    quote:
      "I met Harrison after years of searching for a martial arts teacher who could balance the traditions of Japan with a modern framework, and for something harder to name. What I was really seeking was the true mind, body, and soul connection within Karate training. As a teacher, coach, and sensei, Harrison helped me remove the mask, calm the mind, and move with intention rather than just speed, power, and grit. His approach seamlessly blends traditional and modern principles, encouraging effortless movement and the discovery of personal flow. He doesn't just train the body. He guides you to confront and unlock the mental barriers that limit both martial and psychological growth.",
  },
  {
    name: 'James Bolton',
    context: "Return to Self — Men's Coaching",
    category: 'adults',
    avatar: 'avatar-james-bolton',
    quote:
      'To sum up my experience with Harrison I\'ll provide this quote by Albert Schweitzer: "Sometimes our light goes out, but is blown again into instant flame by an encounter with another human being. We should all be thankful for those people who rekindle the inner spirit."',
  },
  {
    name: 'Kai Bennetts',
    context: 'HSC Student — Cammeraygal 2023',
    category: 'youth',
    avatar: null,
    quote:
      "Harrison Saito is a man who doesn't stop at anything to find truth within himself. His relentless pursuit for understanding the life we live in is one that I've never seen before and has inspired me to look deeper within myself. He instilled within me the importance of English as a subject, not just in my schooling experience but in being able to expand on my ability to understand the complexity within situations. On a more personal level, Harrison has been one of my greatest mentors.",
  },
  {
    name: 'Harshil Dave',
    context: 'Martial Arts',
    category: 'adults',
    avatar: null,
    quote:
      "I was very intrigued with how he taught karate. I learned how to be calm by being in a state of panic: I learned to finish to the end of the line by stopping halfway over and over again: I learned to be free by imposing restrictions on myself. Harrison has taught me many things about the art of fighting and myself through his training. He has a comforting yet firm voice that is a constant reminder for me to 'be decisive.' I will forever be grateful for such a presence in my life.",
  },
  {
    name: 'Lance Perez',
    context: 'HSC Student',
    category: 'youth',
    avatar: 'avatar-lance-perez',
    quote:
      "He was a positive influence in helping me realise the reality of the HSC — that it is only 'a test' and a 'pathway to university' which did not define myself as a human being. He raised an emphasis on focusing on the progression of my abilities and skills rather than results. Overall, it has really made a productive impact on managing my expectations and relieving myself from the burden to attain high marks. As a result, I actually experienced more academic success which has persisted into my tertiary studies.",
  },
  {
    name: 'Alex Wei',
    context: 'Martial Arts — 3+ Years Training',
    category: 'adults',
    avatar: 'avatar-alex-wei',
    quote:
      'I have consistently trained with Harrison for over 3 years. Harrison is wise beyond his years but still provides hospitality and a humbleness that encourages others to forge their own path. I highly recommend Harrison Saito as a tutor in Karate as the lessons I have learnt have far exceeded the realms I thought were possible from learning a martial art.',
  },
  {
    name: 'Kei Yomoda',
    context: 'HSC Student — Chatswood High',
    category: 'youth',
    avatar: null,
    quote:
      'Tutoring being something I always dreaded, I quickly found myself looking forward to these lessons as it was like no ordinary tutoring I have had before. Through his views and advice, not only did it allow me to produce meaningful compositions but also truly inspired me to strive to become like Harrison who showed genuine sense of empathy for people around him. From someone who I expected to be just an English tutor, became such a prominent figure in my life and ultimately becoming someone I can confidently say a mentor has sincerely changed me positively as a person.',
  },
  {
    name: 'Shoaland Griffiths',
    context: 'HSC Student — St Pius X',
    category: 'youth',
    avatar: null,
    quote:
      'I cannot express how grateful I am for the invaluable life lessons and experiences that you have shared with me over the years. Your guidance and support has helped me through my teenage years and schooling, and I have grown because of your influence. Through your example, I have learned the importance of hard work, determination, and resilience. More than anything, you have taught me to experience life fully and to appreciate all of its ups and downs. Your mentorship and brotherhood has made a profound difference on life.',
  },
  {
    name: 'Marissa Wong',
    context: 'HSC Student — Chatswood High',
    category: 'youth',
    avatar: null,
    quote:
      "Before being taught by Harrison, I struggled with the subject and was getting Cs and Bs average but since our regular lessons by year 12, I became rank 1 in my grade and I felt more confident when it came to tests and assignments. While Harrison's teachings and guidance helped me when it came to improving my grades, more importantly he made sure our lessons were always enjoyable as well as productive. Thanks to Harrison's continual guidance, support and encouragement, I was able to achieve the ATAR I was aiming for, but also gained a better understanding of myself.",
  },
  {
    name: 'Meg Rolfe',
    context: 'HSC Student — Brigidine College St Ives',
    category: 'youth',
    avatar: null,
    quote:
      'Harrison was my English tutor during year 12 and is one of few people who has made a profound impact on my life. Tutoring with Harrison was way more than just doing what needed to be done to get good marks but were also lessons on life. When I first met Harrison, I was a shy girl unsure of herself, however, by the end of year 12 I had developed a confidence within myself and my abilities. I truly believe had I not met Harrison, I would not be the person I am today.',
  },
  {
    name: 'Scott & Lisa Bignold',
    context: 'Parents — Covey & Lochie (Youth Martial Arts)',
    category: 'youth',
    avatar: null,
    quote:
      "Harrison is a deep thinker, an excellent teacher and a caring and humble soul. Harrison's lessons are a safe place for the children to connect, learn about themselves, their lives and the world around them. He is patient and takes the time necessary to develop basic skills, while still motivating and encouraging the children to develop their confidence and humility. Harrison's teaching style and individual personality are also influencing our parenting in positive ways.",
  },
];

/* ----------------------------------------------------------------- media */

export type MediaItem = {
  id: string;
  label: string;
  title: string;
  description?: string;
  featured?: boolean;
};

export const MEDIA: MediaItem[] = [
  {
    id: 'YnHlcZLzu50',
    label: 'As Seen On',
    title: 'SBS World News',
    description: 'SBS World News interview about youth and adult mental health.',
    featured: true,
  },
  { id: 'm-r7VUuoBfc', label: 'Featured', title: 'A father & son talk & heal' },
  { id: 'XJ5Xjqmdvo8', label: 'Guided Practice', title: '5 Minute Guided Chakra Meditation' },
  { id: 'gYdUjZLQzWc', label: 'Poetry', title: 'Trauma, love and beyond' },
  { id: '8vj462byS5w', label: 'Father & Son', title: 'My father and I' },
  { id: 'yLh_R1g5uks', label: 'Short Film', title: 'I dream of schools valuing...' },
  { id: 'nR62SogKKA0', label: 'Vision', title: 'My vision for the youth (made in 2024)' },
];

export const VIDEO_IDS = {
  sbsWorldNews: 'YnHlcZLzu50',
  dream: 'yLh_R1g5uks',
  poemTrauma: 'gYdUjZLQzWc',
  visionYouth: 'nR62SogKKA0',
  fatherSon: '8vj462byS5w',
  fatherSonShort: 'm-r7VUuoBfc',
  chakra: 'XJ5Xjqmdvo8',
} as const;

/* ------------------------------------------------------------ credentials */

export const CREDENTIALS = [
  { value: '10+', label: 'Years Coaching' },
  { value: '2nd Dan', label: 'Black Belt' },
  { value: 'M.Teach', label: '(Secondary)' },
  { value: 'B.Com', label: 'Commerce' },
];

/* ------------------------------------------------- calligraphy vocabulary */

/**
 * The faded background wash. Kanji are drawn from the actual vocabulary of the
 * work — budo, Zen, and Harrison's own copy — never decorative filler.
 */
export type Glyph = { char: string; romaji: string; meaning: string };

export const CALLIGRAPHY: Record<string, Glyph[]> = {
  hero: [
    { char: '道', romaji: 'dō', meaning: 'the way' },
    { char: '心', romaji: 'kokoro', meaning: 'heart-mind' },
  ],
  story: [
    { char: '継承', romaji: 'keishō', meaning: 'inheritance' },
    { char: '傷', romaji: 'kizu', meaning: 'wound' },
    { char: '父', romaji: 'chichi', meaning: 'father' },
  ],
  adults: [
    { char: '仮面', romaji: 'kamen', meaning: 'the mask' },
    { char: '静', romaji: 'sei', meaning: 'stillness' },
  ],
  programme: [
    { char: '守', romaji: 'shu', meaning: 'keep the form' },
    { char: '破', romaji: 'ha', meaning: 'break the form' },
    { char: '離', romaji: 'ri', meaning: 'transcend the form' },
  ],
  youth: [
    { char: '声', romaji: 'koe', meaning: 'voice' },
    { char: '育', romaji: 'iku', meaning: 'to raise, to nurture' },
  ],
  close: [
    { char: '円', romaji: 'en', meaning: 'circle, wholeness' },
    { char: '空', romaji: 'kū', meaning: 'emptiness' },
  ],
};

/** English drift words, pulled from Harrison's own copy. */
export const DRIFT_WORDS = [
  'DISCIPLINE',
  'PERFORMANCE',
  'RAGE',
  'GRIEF',
  'BOUNDARY',
  'PRESENCE',
  'INHERITANCE',
  'SILENCE',
  'REPAIR',
];
