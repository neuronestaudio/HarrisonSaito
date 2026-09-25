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
];
