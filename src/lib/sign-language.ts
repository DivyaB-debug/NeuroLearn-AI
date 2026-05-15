// ASL fingerspelling alphabet — handshape descriptions sourced from standard ASL references.
// v1 uses descriptive cards + animated fingerspelling player. Full lexical signs (verbs, nouns)
// require a 3D avatar or video dictionary — planned for a later release.

export type SignLetter = {
  letter: string;
  shape: string;       // short handshape description
  motion?: string;     // motion cue if any (J and Z have motion)
};

export const ASL_ALPHABET: SignLetter[] = [
  { letter: "A", shape: "Closed fist, thumb resting along the side of the index finger." },
  { letter: "B", shape: "Flat palm facing forward, fingers together and straight, thumb folded across the palm." },
  { letter: "C", shape: "Curl fingers and thumb to form the shape of a C." },
  { letter: "D", shape: "Index finger up; thumb touches the tips of the middle, ring and pinky fingers (forming a circle)." },
  { letter: "E", shape: "Curl all four fingers down to touch the thumb; thumb tucks under the fingertips." },
  { letter: "F", shape: "Thumb and index touch in a circle; middle, ring and pinky extended upward." },
  { letter: "G", shape: "Index finger and thumb extended horizontally and parallel, like pinching the air sideways." },
  { letter: "H", shape: "Index and middle fingers extended together horizontally; other fingers folded." },
  { letter: "I", shape: "Pinky extended upward; rest of the fingers folded into the palm with thumb across them." },
  { letter: "J", shape: "Start in the I shape; trace the letter J in the air with the pinky.", motion: "Draw a J" },
  { letter: "K", shape: "Index up, middle finger out at an angle, thumb pressed between them." },
  { letter: "L", shape: "Index finger up, thumb out — forming an L shape." },
  { letter: "M", shape: "Thumb tucked under the first three fingers, which fold over it." },
  { letter: "N", shape: "Thumb tucked under the first two fingers, which fold over it." },
  { letter: "O", shape: "All fingers and thumb curve to touch tips, forming an O." },
  { letter: "P", shape: "Like K, but rotated so the palm faces down and the middle finger points down." },
  { letter: "Q", shape: "Like G, but rotated so index and thumb point downward." },
  { letter: "R", shape: "Index and middle fingers crossed, other fingers folded." },
  { letter: "S", shape: "Closed fist with the thumb wrapped across the front of the fingers." },
  { letter: "T", shape: "Fist with the thumb tucked between the index and middle fingers." },
  { letter: "U", shape: "Index and middle fingers extended together upward; others folded." },
  { letter: "V", shape: "Index and middle fingers extended in a V shape; others folded." },
  { letter: "W", shape: "Index, middle and ring fingers extended upward; thumb holds down the pinky." },
  { letter: "X", shape: "Index finger bent into a hook; other fingers folded with thumb across them." },
  { letter: "Y", shape: "Thumb and pinky extended (hang-loose shape); other fingers folded." },
  { letter: "Z", shape: "Index finger extended; trace the letter Z in the air.", motion: "Draw a Z" },
];

export const SIGN_TIPS = [
  "Keep your dominant hand at chest height, palm generally facing the person you're signing to.",
  "Pause briefly between letters — clarity beats speed when you're learning.",
  "Double letters (like 'LL') are usually signed by a small bounce or slide rather than two full signs.",
  "Mouth the word silently as you fingerspell it — it helps the reader follow along.",
];

/**
 * Curated dictionary of common ASL lexical signs (whole-word signs, not fingerspelling).
 * Descriptions follow standard ASL references (Lifeprint / Gallaudet / Handspeak conventions).
 *
 * `handshapes` lets the player echo any letter handshapes used inside the sign so it can
 * still illustrate the dominant shape using the alphabet renderer.
 */
export type SignWord = {
  word: string;
  category: "Greetings" | "People" | "Feelings" | "Daily" | "Questions" | "Responses" | "Actions";
  description: string;
  handshapes?: string[]; // letter handshapes used (for visual reference)
};

export const COMMON_SIGNS: SignWord[] = [
  // Greetings
  { word: "HELLO", category: "Greetings", description: "Open flat hand at the forehead (like a salute), then move it forward and slightly down — as if tipping a hat.", handshapes: ["B"] },
  { word: "GOODBYE", category: "Greetings", description: "Raise your open hand and wave the fingers down toward the palm a few times — the same as a casual wave.", handshapes: ["B"] },
  { word: "THANK YOU", category: "Greetings", description: "Touch the fingertips of a flat hand to your chin, then move the hand forward and down toward the person, palm up.", handshapes: ["B"] },
  { word: "PLEASE", category: "Greetings", description: "Flat hand on the chest, circle it clockwise (from your view) a few times over the heart.", handshapes: ["B"] },
  { word: "SORRY", category: "Greetings", description: "Make an 'A' fist on your chest and rub it in a circular motion over the heart.", handshapes: ["A"] },
  { word: "WELCOME", category: "Greetings", description: "Open hand to the side, palm up; sweep it inward toward your body as if inviting someone in.", handshapes: ["B"] },
  { word: "NICE TO MEET YOU", category: "Greetings", description: "Sign NICE (right flat hand slides across left flat palm), then MEET (two index-finger '1' hands come together upright), then point to YOU.", handshapes: ["B", "D"] },

  // People & pronouns
  { word: "I", category: "People", description: "Point your index finger or 'I' handshape (pinky up) to your own chest.", handshapes: ["I"] },
  { word: "YOU", category: "People", description: "Point your index finger directly at the person you're addressing.", handshapes: ["D"] },
  { word: "WE", category: "People", description: "Touch the index finger of the 'D' hand to one shoulder, arc it across, touch the other shoulder.", handshapes: ["D"] },
  { word: "MOTHER", category: "People", description: "Open '5' hand, thumb taps the chin twice (the lower face = female).", handshapes: ["B"] },
  { word: "FATHER", category: "People", description: "Open '5' hand, thumb taps the forehead twice (the upper face = male).", handshapes: ["B"] },
  { word: "FRIEND", category: "People", description: "Hook the index fingers together one way, then flip and hook them the other way — like locked friendship.", handshapes: ["X"] },
  { word: "TEACHER", category: "People", description: "Both flat-O hands at the temples flick forward (TEACH), then both flat hands move down the sides of the body (PERSON marker).", handshapes: ["O", "B"] },

  // Feelings
  { word: "HAPPY", category: "Feelings", description: "Flat hand brushes upward on the chest in two small circular motions — joy rising.", handshapes: ["B"] },
  { word: "SAD", category: "Feelings", description: "Both open '5' hands in front of the face, fingers spread; slowly drag them down the face — features falling.", handshapes: ["B"] },
  { word: "LOVE", category: "Feelings", description: "Cross both fists over your heart, hugging yourself.", handshapes: ["S"] },
  { word: "ANGRY", category: "Feelings", description: "Claw '5' hand in front of your face; pull it sharply away from the face, fingers tensing.", handshapes: ["C"] },
  { word: "TIRED", category: "Feelings", description: "Both bent hands touch the chest, fingertips up; rotate downward as the shoulders sag.", handshapes: ["B"] },

  // Daily things
  { word: "EAT", category: "Daily", description: "Flat-O hand (pinched fingertips) taps the lips a few times — bringing food to mouth.", handshapes: ["O"] },
  { word: "DRINK", category: "Daily", description: "'C' handshape at the mouth, tipped up like raising a cup to drink.", handshapes: ["C"] },
  { word: "WATER", category: "Daily", description: "'W' handshape (three middle fingers up); index finger taps the chin twice.", handshapes: ["W"] },
  { word: "HOME", category: "Daily", description: "Flat-O hand touches the corner of the mouth, then moves up to touch the cheek.", handshapes: ["O"] },
  { word: "WORK", category: "Daily", description: "Two 'S' fists; the dominant fist taps the back of the other a couple of times.", handshapes: ["S"] },
  { word: "SCHOOL", category: "Daily", description: "Both flat hands; the dominant palm claps down on the non-dominant palm twice — like a teacher clapping for attention.", handshapes: ["B"] },
  { word: "BOOK", category: "Daily", description: "Two flat hands together palm-to-palm, then open them like opening a book.", handshapes: ["B"] },
  { word: "LEARN", category: "Daily", description: "Open '5' hand picks information off the non-dominant palm and brings it up to the forehead, closing into a flat-O.", handshapes: ["B", "O"] },

  // Questions & responses
  { word: "WHAT", category: "Questions", description: "Both palms up, hands shake slightly side to side; eyebrows furrowed.", handshapes: ["B"] },
  { word: "WHO", category: "Questions", description: "'L' handshape at the chin; the index finger bends in and out (the bent index 'X' shape) — eyebrows furrowed.", handshapes: ["L", "X"] },
  { word: "WHERE", category: "Questions", description: "Index finger '1' shakes side to side in front of you — eyebrows furrowed.", handshapes: ["D"] },
  { word: "WHY", category: "Questions", description: "Open '5' hand at the temple; pull away from the head and change to the 'Y' handshape.", handshapes: ["B", "Y"] },
  { word: "HOW", category: "Questions", description: "Both bent hands knuckle-to-knuckle in front of the chest; rotate forward so the palms turn up.", handshapes: ["B"] },
  { word: "YES", category: "Responses", description: "'S' fist nods up and down at the wrist — like a head nodding 'yes'.", handshapes: ["S"] },
  { word: "NO", category: "Responses", description: "Index and middle fingers tap the thumb closed once — the hand 'says' no.", handshapes: ["H"] },
  { word: "GOOD", category: "Responses", description: "Flat hand touches the chin then moves down to land in the open palm of the other hand.", handshapes: ["B"] },
  { word: "BAD", category: "Responses", description: "Flat hand fingertips touch the chin, then flip the hand down so the palm faces the ground.", handshapes: ["B"] },

  // Actions
  { word: "GO", category: "Actions", description: "Both index fingers point up, then both flick forward together in the direction of going.", handshapes: ["D"] },
  { word: "COME", category: "Actions", description: "Both index fingers point out, then curl in toward your body in a small arc — calling someone over.", handshapes: ["D"] },
  { word: "STOP", category: "Actions", description: "Edge of the dominant flat hand chops down sharply onto the non-dominant flat palm.", handshapes: ["B"] },
  { word: "HELP", category: "Actions", description: "'A' fist of the dominant hand sits on the open flat palm of the other; lift both together upward.", handshapes: ["A", "B"] },
  { word: "UNDERSTAND", category: "Actions", description: "'S' fist near the temple; flick the index finger up to a '1' shape — the lightbulb moment.", handshapes: ["S", "D"] },
  { word: "PLAY", category: "Actions", description: "Both 'Y' handshapes (thumb and pinky out); twist them at the wrists from side to side.", handshapes: ["Y"] },
];

