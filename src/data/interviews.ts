/**
 * The interview row (InterviewRow.astro): one extract per man, from the
 * 9 Sep 2026 testimonial shoot (Production Day 2, Nathan's angle).
 *
 * Every `quote` is a fragment of the extract, word for word, and every `who`
 * is something the man says about himself on camera. First names only — the
 * shoot's own plan ("first name only on screen unless they agree to more").
 * The cut list (clip, in, out, crop) and the transcripts the extracts were
 * chosen from are in D:\CLIENTS\HARRISON\_day2-interview-row (extracts.json,
 * transcripts/); cut.py rebuilds the files.
 *
 *   id             clip     in -> out (s)      what he is saying
 *   iv-andrew-v1   C1665    418.6 -> 447.7     what training gave him day to day
 *   iv-john-v1     C1662    441.3 -> 463.7     21 kilos, and the part he did not expect
 *   iv-jake-v1     C1670    481.4 -> 507.5     letting tension go with a soft exhale
 *   iv-james-v2    C1687    385.0 -> 410.0     what he does now when emotions rise
 *                  (v1, 215.9 -> 241.4, "fully committed… to keep going", was the first cut: only
 *                   six minutes of his sitting had been transcribed when it was chosen)
 *
 * A fifth man sat that day — a friend of Harrison's, not a student; his
 * sitting is a conversation, not a testimony, so he is not in the row.
 */
export type Interview = {
  id: string;
  name: string;
  role: string;
  /** the fragment on the tile */
  quote: string;
  /** what he actually said around it, word for word off the transcript —
      the source of truth anything quoting him must be found inside */
  said: string[];
};

/* `name` and `role` are each one short line that cannot wrap (a tile is ~90px
   of text at its narrowest): a name, and one word for what he does. */
export const INTERVIEWS: Interview[] = [
  {
    id: 'iv-john-v1', name: 'John', role: 'Consultant, 55', quote: 'He’s 29, I’m 55, and I find that we vibe very well.',
    said: [
      'it’s improved my ability to not only perform during karate but even people outside of my karate environment have noticed that difference of me being a lot more calmer as a person. The ability to hone in and be present, so maybe in the past I’ll be listening but I’m thinking of other things',
      'the ability now to basically stay present and even be probably more than present, it’s be more deliberate and choose how I want to interact, and that’s something that I’ve really been able to fine tune that skill working with Harrison',
      'I’ve lost 21 kilos, I move a lot better, I don’t wake up in the morning with aches and pains',
      'He’s 29, I’m 55, and I find that we vibe very well',
    ],
  },
  {
    id: 'iv-andrew-v1', name: 'Andrew', role: 'Drummer', quote: 'Makes me happier, makes me calmer.',
    said: [
      'Just taking my time, being more aware, being more self-aware, I guess. Not being so reactive and I guess not focusing or worrying too much about the outcome',
      'how I use that in my day to day, makes me happier, makes me calmer, I think it makes me a better person',
    ],
  },
  {
    id: 'iv-james-v2', name: 'James', role: 'Construction', quote: 'You can pause… and just not let it disrupt you.',
    said: [
      'emotions rise, just being aware that that’s happening and kind of being not removed from it but just not letting it affect you, in the same way that a fist coming towards your head — you know you can pause, kind of take action and just not let it disrupt you or upset you',
    ],
  },
  {
    id: 'iv-jake-v1', name: 'Jake', role: 'Musician', quote: 'I can just do a soft exhale and heaps of that’s gone.',
    said: [
      'sometimes I can feel that and then I can just do a soft exhale and heaps of that’s gone, doesn’t have to be a big popping of a balloon',
    ],
  },
  /* Not from the 9 Sep shoot: filmed by himself on his phone and sent to
     Harrison (Drive: "2026-09-XX - Testimonies - Harrisons Clients",
     "Jeremy Yap testimony.mp4", 16 s; transcript by Whisper, checked by ear,
     29 Sep 2026). First name only on the wall. No tile in the interview row. */
  {
    id: 'iv-jeremy-v1', name: 'Jeremy Yap', role: 'Karate', quote: 'I’m more calm, I’m more focused on my breathing and I’m more intentional.',
    said: [
      'Harrison has been coaching me martial arts for quite a few years now. He’s taught me to handle stressful situations much better such as during sparring. I’m more calm, I’m more focused on my breathing and I’m more intentional.',
    ],
  },
  /* 1 Oct 2026: the clients' own phone testimonies, now named (Drive
     "2026-09-10 - Testimonies - Harrisons Clients"), plus Alex Wei's 20-minute
     interview with Dion (9 Sep). Transcribed with Whisper medium (small for
     Alex), in D:\CLIENTS\HARRISON\_testimonies-drive\named\transcripts.md.
     `said` is the transcript, lightly cleaned of filler; every wall line must
     be found inside it. */
  {
    id: 'iv-nico-v1', name: 'Nico Roudier', role: 'Martial arts', quote: 'Surrender to the pain.',
    said: [
      'the first thing that comes into my mind when I think about what Harrison taught me, it was probably the day he told me surrender to the pain. It’s something he used to tell me a lot. At first I thought it was only about martial arts, staying calm, controlling my breathing and pushing through discomfort, but I realized it was about life too. Facing the pain, accepting it, breathing through it and finding the peace on the other side. And this lesson will stay with me far beyond the gym.',
    ],
  },
  {
    id: 'iv-shehab-v1', name: 'Shehab Khan', role: 'Martial arts', quote: 'A loving soul.',
    said: [
      'The most important lesson Harrison taught me was to confront my delusions and face reality. And if I was to describe Harrison in three words, I would use a loving soul.',
    ],
  },
  {
    id: 'iv-aiden-v1', name: 'Aiden Jacobs', role: 'Martial arts', quote: 'Grounded, patient, and encouraging.',
    said: [
      'Within my time in Shinbukan, I learned that you can’t master something in a day. You can’t master something in a week. You might not even be able to master something in a year. It’s all about discipline, and it’s all about trusting yourself. Three words I would use to describe Harrison would be grounded, patient, and encouraging.',
    ],
  },
  {
    id: 'iv-lorenzo-v1', name: 'Lorenzo Ambrose', role: 'Martial arts', quote: 'Real strength comes from calm.',
    said: ['One thing Harrison has taught me is that real strength comes from calm, not from tension'],
  },
  {
    id: 'iv-maksim-v1', name: 'Maksim Belchenko', role: 'Martial arts', quote: 'Calm when it matters most.',
    said: ['Harrison told me how to be calm when it matters most.'],
  },
  {
    id: 'iv-harshil-v1', name: 'Harshil Dave', role: 'Martial arts', quote: 'How you do anything is how you do everything.',
    said: [
      'He’s helped me understand how important balance is and more importantly he’s helped me understand and realize that it can be achieved. He’s also helped me realize that, how he always says this, how you do anything is how you do everything, and over time that sentence has had new meanings for me, which has helped me navigate through difficult times and gave me clarity in times of uncertainty.',
      'He’s such a genuine human being and he’s a really, really good teacher. He is very considerate of others and the most important thing I think that resonates with me for why I like his teaching is that he speaks from experience. He has a deep yearning to help people and that is reflected very much through the way he speaks to you, the way he guides you and the sessions you have with him.',
    ],
  },
  {
    id: 'iv-alex-v1', name: 'Alex Wei', role: 'Navy officer', quote: 'It has genuinely changed my life.',
    said: [
      'I didn’t realize how much of an importance later on was breath, breath training, breathwork, even sitting on my knees for long periods of time and meditation. Those things I really didn’t understand how much of an effect that would have on my life.',
      'the training that Harrison gave me in particular, when it came to breathwork, really made these sorts of scenarios a lot more approachable and I could push through a lot easier. It was hard, but it was doable.',
      'It has genuinely changed my life, and for the positive. It has had a hugely constructive impact on my life. It has helped me in a lot of hard times in my life too.',
      'his teachings also come out of experience. They come out of a sincereness that I think is really unique to Harrison. I cannot think of anyone else that has any similar level of influence or meaning or power in their words.',
      'I was a lot more secure in myself after starting the dojo.',
      'Warm, very warm. Understanding, patient.',
      'Strong body, sharp mind, soft heart.',
    ],
  },
];
