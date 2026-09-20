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
 *   iv-james-v1    C1687    215.9 -> 241.4     why he is staying
 *
 * A fifth man sat that day — a friend of Harrison's, not a student; his
 * sitting is a conversation, not a testimony, so he is not in the row.
 */
export type Interview = { id: string; name: string; role: string; quote: string };

/* `name` and `role` are each one short line that cannot wrap (a tile is ~90px
   of text at its narrowest): a name, and one word for what he does. */
export const INTERVIEWS: Interview[] = [
  { id: 'iv-john-v1', name: 'John, 55', role: 'Consultant', quote: 'He’s 29, I’m 55, and I find that we vibe very well.' },
  { id: 'iv-andrew-v1', name: 'Andrew', role: 'Drummer', quote: 'Makes me happier, makes me calmer.' },
  { id: 'iv-james-v1', name: 'James', role: 'Construction', quote: 'I’m just fully committed and determined to keep going.' },
  { id: 'iv-jake-v1', name: 'Jake', role: 'Musician', quote: 'I can just do a soft exhale and heaps of that’s gone.' },
];
