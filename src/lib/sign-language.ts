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
