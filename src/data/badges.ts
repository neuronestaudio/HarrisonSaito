/**
 * "Who This Is For" badge sets — the audience test on the hero's pause.
 *
 * From the badge-sets artifact (18 Sep 2026, claude.ai/artifact/HFxJACikTMB2uWdyViBrxc), built on the
 * audience diagnostic v1.2. Each set swaps only the headline, the lede and the badges, so every version
 * reads as the same page speaking to a different man. The home page runs `core` ("our version", Dion
 * 18 Sep); every set also has its own landing page at /lp/<id> (src/pages/lp/[set].astro) for its ad set.
 *
 * Every line keeps where it came from: his (Harrison's words or a close paraphrase), team (board and
 * strategy docs), site (live before), new (written for the test). The artifact's rule: NEW LINES NEED
 * HARRISON'S OK before they go live — see newLines().
 */
export type Kind = 'his' | 'team' | 'site' | 'new';
export type Badge = { icon: string; text: string; emphasis: string; kind: Kind; source: string; tag?: string };
export type BadgeSet = {
  id: string;
  name: string;
  kicker: string;
  band: string;
  title: string;
  lede: string;
  cta: { label: string; href: string };
  tests: string;
  where: string;
  judge: string;
  watch: string;
  badges: Badge[];
};

/* Sells without selling (Dion, 18 Sep): not "Book a discovery chat". */
const CTA = { label: 'Let me walk with you', href: '/book' };

export const BADGE_SETS: BadgeSet[] = [
  {
    id: "control",
    name: "Live now",
    kicker: "Control · live on the site",
    band: "02",
    title: "You built the life that looks right. <mark>It does not feel like yours.</mark>",
    lede: "If more than one of these lands, you are in the right place. They tend to travel together.",
    cta: CTA,
    tests: "The high-functioning man, broadly. This is the site’s current default.",
    where: "Home page beat (live now)",
    judge: "Discovery-chat clicks from the beat. Every other set is measured against this one.",
    watch: "",
    badges: [
      { icon: "mask", text: "They call you solid,", emphasis: "you feel like a fraud.", kind: "site", source: "Live site" },
      { icon: "saidmeant", text: "You say yes when you mean no,", emphasis: "then call it keeping the peace.", kind: "site", source: "Live site" },
      { icon: "loop", text: "You chase an approval", emphasis: "you never actually feel.", kind: "site", source: "Live site" },
      { icon: "ember", text: "There is an anger underneath", emphasis: "you cannot name.", kind: "site", source: "Live site" },
      { icon: "bar", text: "You still meet a standard", emphasis: "someone else set.", kind: "site", source: "Live site" },
      { icon: "distance", text: "You want to be close,", emphasis: "and keep everyone at arm’s length.", kind: "site", source: "Live site" },
    ],
  },
  {
    id: "core",
    name: "Our version",
    kicker: "Recommended default · the diagnosis in six badges",
    band: "01–02",
    title: "You hold it all together. <mark>Nobody sees what it costs.</mark>",
    lede: "Most men who end up here recognise three or more. They tend to travel together.",
    cta: CTA,
    tests: "The composite man from the diagnosis: the man everyone leans on, who only feels worth something when he’s useful. One symptom, one pattern, the core, one relationship, one cost.",
    where: "Home page beat, and the main landing page for ads",
    judge: "Clicks from the beat against the control, on the same traffic split.",
    watch: "This set is the whole diagnosis in one panel, so it borrows lines from the test sets. If it beats the control, it becomes the new default.",
    badges: [
      { icon: "pillar", text: "Everyone leans on you.", emphasis: "No one asks how you are.", kind: "new", source: "New, from ‘the capable one’ (programme table, Week 1)" },
      { icon: "comment", text: "One comment", emphasis: "takes your whole day.", kind: "his", source: "Harrison, consultation cut 03: “Why can one comment ruin your day”" },
      { icon: "saidmeant", text: "You say yes when you mean no,", emphasis: "then call it keeping the peace.", kind: "site", source: "Live site" },
      { icon: "checklist", text: "You only feel worth something", emphasis: "when you’ve been useful.", kind: "new", source: "New, the diagnosis’s core line. Echoes his note: “a man gains self worth from this need”" },
      { icon: "homeguard", text: "You love them,", emphasis: "and can’t stand who you become around them.", kind: "team", source: "Board, paid round 1 (Static 5)" },
      { icon: "battery", text: "You’re exhausted,", emphasis: "and you call it normal.", kind: "team", source: "Board question list: “How long have you been treating exhaustion as normal?”" },
    ],
  },
  {
    id: "burnout",
    name: "Burnt out",
    kicker: "Test · the symptom door",
    band: "01",
    title: "Tired in a way <mark>sleep doesn’t fix.</mark>",
    lede: "If two or more of these were true this week, keep walking.",
    cta: CTA,
    tests: "Burnt-out men: the widest door, and the ‘burnt out men’ line from the 12 Sep bio draft. Symptoms only, nothing to confess.",
    where: "Landing page for cold ads",
    judge: "Clicks from the beat and scroll-through. Expect the widest reach and the loosest fit.",
    watch: "Symptom words travel; they don’t qualify. Pair this set with an application or form that does the sorting.",
    badges: [
      { icon: "comment", text: "One comment", emphasis: "takes your whole day.", kind: "his", source: "Harrison, consultation cut 03" },
      { icon: "battery", text: "You’re exhausted,", emphasis: "and you call it normal.", kind: "team", source: "Board question list" },
      { icon: "switch", text: "You can’t switch off,", emphasis: "even when there’s nothing left to do.", kind: "his", source: "Paraphrased from his note: “can’t be present as noise in head trying to think of what to do next”" },
      { icon: "braced", text: "Your jaw is tight", emphasis: "before you’ve said a word.", kind: "new", source: "New. Body words (jaw, chest, tension) reach widest on his account, 1.68×" },
      { icon: "bolt", text: "You snap at home,", emphasis: "then apologise later.", kind: "his", source: "Paraphrased from his note on being “frustrated and irritable” with family and partner" },
      { icon: "moon", text: "You lie awake", emphasis: "replaying the conversation.", kind: "new", source: "New" },
    ],
  },
  {
    id: "worth",
    name: "Self-worth",
    kicker: "Test · the 12 Sep pillar",
    band: "02",
    title: "Your worth <mark>shouldn’t need earning every day.</mark>",
    lede: "Low self-worth rarely looks like low confidence. It usually looks like this.",
    cta: CTA,
    tests: "The self-worth pillar agreed on 12 Sep, from people-pleaser to self-led. It reads each protector as a way of earning worth.",
    where: "Landing page for the self-worth ads (pairs with Static Set v2, Self-worth)",
    judge: "Clicks from the beat against the control.",
    watch: "Harrison raised self-worth himself and is comfortable in it. This is the set most likely to sound like him on camera.",
    badges: [
      { icon: "checklist", text: "You measure your worth", emphasis: "in what you got done today.", kind: "new", source: "New" },
      { icon: "scale", text: "Praise doesn’t land.", emphasis: "Criticism never leaves.", kind: "new", source: "New" },
      { icon: "hands", text: "You need to be needed,", emphasis: "and it’s wearing you out.", kind: "his", source: "Paraphrased from his note: “A man is often needed … this alone can lead to burnout”" },
      { icon: "star", text: "A compliment lands,", emphasis: "and you’re already back at work.", kind: "his", source: "His note: “when people compliment us, we get back to work and brush it off”" },
      { icon: "pause", text: "Rest feels like something", emphasis: "you haven’t earned.", kind: "new", source: "New" },
      { icon: "loop", text: "You chase an approval", emphasis: "you never actually feel.", kind: "site", source: "Live site" },
    ],
  },
  {
    id: "protectors",
    name: "Which one runs you?",
    kicker: "Test · Week 2’s protectors",
    band: "02",
    title: "Which one <mark>runs you?</mark>",
    lede: "Harrison calls these protectors. Everyone has one that steps in first. Most men recognise two.",
    cta: CTA,
    tests: "Week 2’s five protectors plus escape: which one pulls hardest. This is the segmentation test from the board, run on the page.",
    where: "Quiz-style landing page; pairs with Static 3 (the five protectors)",
    judge: "Which card gets tapped. Make each card a button that records the pick and pre-fills the form.",
    watch: "The small tags are Harrison’s names for patterns, not labels for the reader. Keep them small and keep the line doing the work.",
    badges: [
      { icon: "spotlight", text: "You’re only as good", emphasis: "as your last result.", kind: "new", source: "New · Performer", tag: "PERFORMER" },
      { icon: "level", text: "Good enough never is.", emphasis: "You call it standards.", kind: "new", source: "New · Perfectionist", tag: "PERFECTIONIST" },
      { icon: "explain", text: "You explain yourself every time,", emphasis: "even when no one asked.", kind: "his", source: "Harrison, consultation cut 04: “Why do you explain yourself every time”", tag: "PEOPLE PLEASER" },
      { icon: "hands", text: "You feel responsible", emphasis: "for everyone and everything.", kind: "his", source: "His note: “do you feel like you’re responsible for everyone and everything?”", tag: "CARETAKER" },
      { icon: "shield", text: "You step in", emphasis: "before anyone else gets hurt.", kind: "his", source: "Paraphrased from his tape: “white-knight syndrome” (26 Aug)", tag: "PROTECTOR" },
      { icon: "exit", text: "When it goes quiet,", emphasis: "you reach for the screen, the drink, the bet.", kind: "his", source: "Paraphrased from his note: “gaming, substance abuse, gambling”", tag: "ESCAPE" },
    ],
  },
  {
    id: "closest",
    name: "The people closest",
    kicker: "Test · the relationship door",
    band: "02",
    title: "It’s the people you love <mark>who set you off.</mark>",
    lede: "If home is where you’re most on guard, you’re in the right place.",
    cta: CTA,
    tests: "Relationships, the lead angle from the 6 Sep call: people whose problem is another person (market B, the largest).",
    where: "Landing page for relationship ads; pairs with Static 5 and the rewritten paid round 1",
    judge: "Clicks from the beat, and which ‘talk about’ topic leads pick on the form.",
    watch: "Keep partners, kids and parents all in the set. Leading with parents alone narrows it back to the old caretaker angle.",
    badges: [
      { icon: "homeguard", text: "You love them,", emphasis: "and can’t stand who you become around them.", kind: "team", source: "Board, paid round 1 (Static 5)" },
      { icon: "eye", text: "One look from your partner", emphasis: "and you’re already defending yourself.", kind: "new", source: "New" },
      { icon: "cycle", text: "Same argument,", emphasis: "different week.", kind: "new", source: "New" },
      { icon: "saidmeant", text: "You fold the moment", emphasis: "someone you love is disappointed.", kind: "team", source: "Programme table, Week 10" },
      { icon: "distance", text: "You want to be close,", emphasis: "and keep everyone at arm’s length.", kind: "site", source: "Live site" },
      { icon: "family", text: "You swore your kids", emphasis: "would never feel what you felt.", kind: "team", source: "Board question: “What are you determined not to pass on to your children?”" },
    ],
  },
  {
    id: "performing",
    name: "Doing well, not feeling it",
    kicker: "Test · the 25–35 core",
    band: "01–02",
    title: "Doing well. <mark>Not feeling it.</mark>",
    lede: "From the outside it all looks fine. That’s the part nobody questions.",
    cta: CTA,
    tests: "The high-functioning 25–35 core. It describes the high performer without ever calling him one.",
    where: "Landing page for the 25–35 ad sets, and the VSL page",
    judge: "Clicks from the beat, read by age bracket.",
    watch: "Never write “high performer” on this page. On 12 Sep the label read as imposter-ish; the description does the job instead.",
    badges: [
      { icon: "mask", text: "They call you solid,", emphasis: "you feel like a fraud.", kind: "site", source: "Live site" },
      { icon: "trophy", text: "You hit the goal", emphasis: "and felt nothing.", kind: "team", source: "Board, men 25–40 table: “buying a house/car and feeling no different”" },
      { icon: "spotlight", text: "If nobody was impressed,", emphasis: "would you still want this life?", kind: "team", source: "Programme table, Week 4 hook" },
      { icon: "lock", text: "Discipline has become", emphasis: "the place you hide.", kind: "team", source: "Board hook list: “If discipline has become your hiding place”" },
      { icon: "stairs", text: "You avoid anything", emphasis: "you’re not already good at.", kind: "team", source: "Programme table, Week 11" },
      { icon: "mirror", text: "You talk to yourself", emphasis: "like you’d never talk to a friend.", kind: "team", source: "Programme table, Week 7" },
    ],
  },
  {
    id: "held",
    name: "Held it together",
    kicker: "Test · the 40–55 end",
    band: "01–02",
    title: "You’ve held it together <mark>for a long time.</mark>",
    lede: "Twenty years of being the reliable one leaves a mark. You don’t have to keep carrying it the same way.",
    cta: CTA,
    tests: "The 40–55 end of the age band decided on 18 Sep: longer careers, ageing parents, grown habits.",
    where: "Landing page for the 40–55 ad sets, with an older client’s testimonial above the panel",
    judge: "Meta’s age breakdown, and applications from men aged 40–55.",
    watch: "This is where the trust gap lives. The page needs an older man’s testimonial before this panel, and Harrison’s father story on it.",
    badges: [
      { icon: "vessel", text: "Twenty years of holding it together,", emphasis: "and it’s starting to show.", kind: "new", source: "New" },
      { icon: "summit", text: "You got what you set out to get.", emphasis: "It isn’t what you wanted.", kind: "team", source: "Board, men 25–40 table: the “Is this it?” phase" },
      { icon: "phone", text: "When something goes wrong,", emphasis: "you’re the one everyone calls.", kind: "new", source: "New" },
      { icon: "cycle", text: "Your parents are getting older.", emphasis: "The old dynamic isn’t.", kind: "new", source: "New" },
      { icon: "calendar", text: "You keep saying next year,", emphasis: "and have for about ten years.", kind: "new", source: "New" },
      { icon: "unseen", text: "You’re caring for your parents,", emphasis: "and still waiting to be seen by them.", kind: "team", source: "ICP ladder, level 1 (carers of ageing parents)" },
    ],
  },
  {
    id: "home",
    name: "Started at home",
    kicker: "Test · the origin · warm traffic only",
    band: "03–04",
    title: "Some of it <mark>started at home.</mark>",
    lede: "Nothing here asks you to blame anyone. Love and hurt can sit side by side.",
    cta: { label: "Apply when you’re ready", href: '/apply' },
    tests: "The father origin: the closest sentences in the funnel. For men who already know Harrison.",
    where: "Application page and retargeting only. Never a cold page.",
    judge: "Applications started and finished, not clicks. Most of it arrives unattributed.",
    watch: "Band 04 has no ask. The button here is a door, not a pitch, and it never runs in front of cold traffic.",
    badges: [
      { icon: "chair", text: "You’re still proving something", emphasis: "to someone who isn’t in the room.", kind: "team", source: "Programme table, Week 6 hook" },
      { icon: "echo", text: "His voice still makes", emphasis: "some of your decisions.", kind: "team", source: "Board hook list: “If your father’s voice still makes decisions for you”" },
      { icon: "eye", text: "You learned to read the room", emphasis: "before you learned to read.", kind: "his", source: "Paraphrased from his note: “I learnt how, when, what, why, who makes [him] angry”" },
      { icon: "hourglass", text: "He may never change.", emphasis: "You’re tired of waiting.", kind: "his", source: "Paraphrased from Harrison, cut 09: “Your dad may never be the father you wanted”" },
      { icon: "footsteps", text: "You swore you’d be different,", emphasis: "then caught yourself doing what he did.", kind: "new", source: "New" },
      { icon: "heartcrack", text: "You love him,", emphasis: "and something still hurt.", kind: "team", source: "Programme table, Week 6: “You don’t have to hate your father to admit something hurt”" },
    ],
  },
];

export const DEFAULT_SET = 'core';

export function setById(id: string | undefined): BadgeSet {
  return BADGE_SETS.find((s) => s.id === id) ?? BADGE_SETS.find((s) => s.id === DEFAULT_SET)!;
}

/** Lines written for the test that Harrison has not yet signed off. */
export function newLines(set: BadgeSet): Badge[] {
  return set.badges.filter((b) => b.kind === 'new');
}
