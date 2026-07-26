// Curated ASL word-sign vocabulary with movement scripts for the animated avatar.
//
// This is used by ConceptSigner to sign concepts the way Deaf ASL users actually
// communicate — with lexical WORD signs (not just letter-by-letter fingerspelling).
// Any word not in this dictionary is fingerspelled as a fallback.
//
// SVG coordinate system (matches SigningAvatar viewBox 300x340):
//   - Head center: (150, 78), r=32
//   - Right (dominant) hand REST: (215, 210)
//   - Left  (support)  hand REST: (85, 210)
//   - Chest center: (150, 175), heart: (135, 168)
//   - Chin: (150, 108), mouth: (150, 96), forehead: (150, 55), temple-R: (185, 65)
//
// Movement is an ORDERED sequence of poses that the avatar interpolates through
// while looping. Positions are absolute SVG coords; `r` is rotation in degrees.
// `handshape` names an SVG in /public/asl/ (A..Z) that is shown on the hand.

export type Pose = { x: number; y: number; r?: number };

export type SignMovement = {
  /** Right-hand pose sequence (absolute SVG coords). Loops through, holding the last briefly. */
  right?: Pose[];
  /** Left-hand pose sequence (optional — for two-handed signs). */
  left?: Pose[];
  /** ASL handshape letter shown on the right hand throughout this sign. */
  handshape: string;
  /** ASL handshape letter shown on the left hand for two-handed signs. */
  leftHandshape?: string;
  /** Duration of one repetition in ms. */
  duration: number;
  /** How many times the movement repeats before moving on. Default 2. */
  loops?: number;
};

export type Sign = {
  gloss: string;              // canonical ASL gloss (uppercase word)
  english: string;            // English label
  description: string;        // plain-language "how to sign it" description
  movement: SignMovement;
};

// Rest / neutral poses
const REST_R: Pose = { x: 215, y: 210, r: 0 };
const REST_L: Pose = { x: 85, y: 210, r: 0 };

// ── Movement primitives — reused across many signs ────────────────────────────

const tapForehead = (shape: string): SignMovement => ({
  handshape: shape,
  duration: 1200,
  right: [REST_R, { x: 150, y: 55, r: -10 }, { x: 150, y: 62, r: -10 }, { x: 150, y: 55, r: -10 }, REST_R],
});

const tapChin = (shape: string): SignMovement => ({
  handshape: shape,
  duration: 1200,
  right: [REST_R, { x: 150, y: 108, r: -8 }, { x: 150, y: 115, r: -8 }, { x: 150, y: 108, r: -8 }, REST_R],
});

const tapMouth = (shape: string): SignMovement => ({
  handshape: shape,
  duration: 1000,
  right: [REST_R, { x: 150, y: 96, r: -6 }, { x: 150, y: 103, r: -6 }, { x: 150, y: 96, r: -6 }, REST_R],
});

const chestCircle = (shape: string): SignMovement => ({
  handshape: shape,
  duration: 1600,
  right: [
    REST_R,
    { x: 150, y: 155, r: 0 },
    { x: 175, y: 170, r: 5 },
    { x: 165, y: 195, r: 10 },
    { x: 135, y: 195, r: -5 },
    { x: 125, y: 170, r: -10 },
    { x: 150, y: 155, r: 0 },
    REST_R,
  ],
});

const chestBrushUp = (shape: string): SignMovement => ({
  handshape: shape,
  duration: 1100,
  right: [REST_R, { x: 150, y: 200, r: -8 }, { x: 150, y: 150, r: -8 }, { x: 150, y: 200, r: -8 }, { x: 150, y: 150, r: -8 }, REST_R],
});

// Two-handed: both hands push forward (out of the page) — simulated with slight up + scale.
const bothForward = (shape: string): SignMovement => ({
  handshape: shape,
  leftHandshape: shape,
  duration: 1000,
  right: [REST_R, { x: 195, y: 190, r: 0 }, { x: 205, y: 175, r: -5 }, REST_R],
  left: [REST_L, { x: 105, y: 190, r: 0 }, { x: 95, y: 175, r: 5 }, REST_L],
});

const bothInward = (shape: string): SignMovement => ({
  handshape: shape,
  leftHandshape: shape,
  duration: 1100,
  right: [{ x: 245, y: 195, r: 0 }, { x: 175, y: 175, r: -15 }, { x: 165, y: 170, r: -20 }, { x: 245, y: 195, r: 0 }],
  left: [{ x: 55, y: 195, r: 0 }, { x: 125, y: 175, r: 15 }, { x: 135, y: 170, r: 20 }, { x: 55, y: 195, r: 0 }],
});

const bothCrossHeart = (shape: string): SignMovement => ({
  handshape: shape,
  leftHandshape: shape,
  duration: 1600,
  right: [REST_R, { x: 130, y: 170, r: -25 }, { x: 130, y: 170, r: -25 }, REST_R],
  left: [REST_L, { x: 170, y: 170, r: 25 }, { x: 170, y: 170, r: 25 }, REST_L],
});

const shakeIndexSide = (shape: string): SignMovement => ({
  handshape: shape,
  duration: 900,
  loops: 3,
  right: [{ x: 170, y: 165, r: -12 }, { x: 210, y: 165, r: 12 }, { x: 170, y: 165, r: -12 }],
});

const chopPalm = (): SignMovement => ({
  handshape: "B",
  leftHandshape: "B",
  duration: 1000,
  right: [REST_R, { x: 150, y: 130, r: -20 }, { x: 150, y: 175, r: -75 }, { x: 150, y: 175, r: -75 }, REST_R],
  left: [{ x: 150, y: 190, r: 90 }, { x: 150, y: 190, r: 90 }, { x: 150, y: 190, r: 90 }, { x: 150, y: 190, r: 90 }, { x: 150, y: 190, r: 90 }],
});

const fistOnPalmLift = (): SignMovement => ({
  handshape: "S",
  leftHandshape: "B",
  duration: 1400,
  right: [{ x: 150, y: 210, r: -15 }, { x: 150, y: 200, r: -15 }, { x: 150, y: 150, r: -15 }, { x: 150, y: 210, r: -15 }],
  left: [{ x: 150, y: 220, r: 60 }, { x: 150, y: 210, r: 60 }, { x: 150, y: 160, r: 60 }, { x: 150, y: 220, r: 60 }],
});

const clapDown = (): SignMovement => ({
  handshape: "B",
  leftHandshape: "B",
  duration: 900,
  right: [{ x: 170, y: 150, r: -30 }, { x: 150, y: 185, r: -70 }, { x: 170, y: 150, r: -30 }, { x: 150, y: 185, r: -70 }],
  left: [{ x: 150, y: 190, r: 90 }, { x: 150, y: 190, r: 90 }, { x: 150, y: 190, r: 90 }, { x: 150, y: 190, r: 90 }],
});

const bookOpen = (): SignMovement => ({
  handshape: "B",
  leftHandshape: "B",
  duration: 1100,
  right: [{ x: 175, y: 180, r: 0 }, { x: 210, y: 180, r: -35 }, { x: 175, y: 180, r: 0 }],
  left: [{ x: 125, y: 180, r: 0 }, { x: 90, y: 180, r: 35 }, { x: 125, y: 180, r: 0 }],
});

const wave = (): SignMovement => ({
  handshape: "B",
  duration: 900,
  loops: 3,
  right: [{ x: 220, y: 100, r: -15 }, { x: 220, y: 100, r: 15 }, { x: 220, y: 100, r: -15 }],
});

const salute = (): SignMovement => ({
  handshape: "B",
  duration: 1300,
  right: [REST_R, { x: 175, y: 65, r: -25 }, { x: 220, y: 80, r: 5 }, REST_R],
});

const chinForward = (): SignMovement => ({
  handshape: "B",
  duration: 1300,
  right: [REST_R, { x: 150, y: 108, r: -8 }, { x: 170, y: 155, r: 25 }, REST_R],
});

const pointSelf = (): SignMovement => ({
  handshape: "D",
  duration: 900,
  right: [REST_R, { x: 165, y: 170, r: -30 }, { x: 165, y: 170, r: -30 }, REST_R],
});

const pointOut = (): SignMovement => ({
  handshape: "D",
  duration: 900,
  right: [REST_R, { x: 250, y: 165, r: 15 }, { x: 250, y: 165, r: 15 }, REST_R],
});

const hookHands = (): SignMovement => ({
  handshape: "X",
  leftHandshape: "X",
  duration: 1400,
  right: [{ x: 165, y: 170, r: -30 }, { x: 165, y: 170, r: 30 }, { x: 165, y: 170, r: -30 }],
  left: [{ x: 135, y: 170, r: 30 }, { x: 135, y: 170, r: -30 }, { x: 135, y: 170, r: 30 }],
});

const templeFlick = (): SignMovement => ({
  handshape: "S",
  duration: 900,
  right: [REST_R, { x: 185, y: 65, r: -20 }, { x: 195, y: 55, r: -10 }, REST_R],
});

const yTwist = (): SignMovement => ({
  handshape: "Y",
  leftHandshape: "Y",
  duration: 900,
  loops: 3,
  right: [{ x: 190, y: 170, r: -20 }, { x: 190, y: 170, r: 20 }, { x: 190, y: 170, r: -20 }],
  left: [{ x: 110, y: 170, r: 20 }, { x: 110, y: 170, r: -20 }, { x: 110, y: 170, r: 20 }],
});

const nodFist = (): SignMovement => ({
  handshape: "S",
  duration: 800,
  right: [{ x: 195, y: 175, r: 0 }, { x: 195, y: 175, r: -30 }, { x: 195, y: 175, r: 0 }, { x: 195, y: 175, r: -30 }],
});

const closeH = (): SignMovement => ({
  handshape: "H",
  duration: 800,
  right: [{ x: 195, y: 165, r: 0 }, { x: 195, y: 165, r: -15 }, { x: 195, y: 165, r: 0 }],
});

const faceDown = (): SignMovement => ({
  handshape: "5",
  leftHandshape: "5",
  duration: 1500,
  right: [{ x: 175, y: 65, r: 0 }, { x: 175, y: 130, r: 0 }, { x: 175, y: 65, r: 0 }],
  left: [{ x: 125, y: 65, r: 0 }, { x: 125, y: 130, r: 0 }, { x: 125, y: 65, r: 0 }],
});

const pullAwayFace = (): SignMovement => ({
  handshape: "C",
  duration: 1000,
  right: [{ x: 175, y: 80, r: 0 }, { x: 215, y: 90, r: 20 }, { x: 175, y: 80, r: 0 }],
});

const cupTilt = (): SignMovement => ({
  handshape: "C",
  duration: 1000,
  right: [{ x: 165, y: 110, r: -20 }, { x: 165, y: 100, r: -50 }, { x: 165, y: 110, r: -20 }],
});

const welcomeIn = (): SignMovement => ({
  handshape: "B",
  duration: 1300,
  right: [{ x: 245, y: 175, r: -10 }, { x: 165, y: 175, r: -20 }, { x: 245, y: 175, r: -10 }],
});

// ── The dictionary ────────────────────────────────────────────────────────────

export const SIGN_DICT: Record<string, Sign> = {
  // Greetings & courtesy
  HELLO: { gloss: "HELLO", english: "hello", description: "Flat hand at the forehead like a salute, then move it forward and down.", movement: salute() },
  GOODBYE: { gloss: "GOODBYE", english: "goodbye", description: "Raise an open hand and wave the fingers toward the palm.", movement: wave() },
  "THANK-YOU": { gloss: "THANK-YOU", english: "thank you", description: "Flat fingertips touch the chin, then move forward and down toward the person.", movement: chinForward() },
  PLEASE: { gloss: "PLEASE", english: "please", description: "Flat hand circles on the chest over the heart.", movement: chestCircle("B") },
  SORRY: { gloss: "SORRY", english: "sorry", description: "A-fist circles over the heart on the chest.", movement: chestCircle("A") },
  WELCOME: { gloss: "WELCOME", english: "welcome", description: "Open hand out to the side, palm up, sweeps inward toward the body.", movement: welcomeIn() },
  YES: { gloss: "YES", english: "yes", description: "S-fist nods up and down at the wrist.", movement: nodFist() },
  NO: { gloss: "NO", english: "no", description: "Index and middle fingers snap closed onto the thumb.", movement: closeH() },
  GOOD: { gloss: "GOOD", english: "good", description: "Flat hand touches the chin then drops into the open palm of the other hand.", movement: { handshape: "B", leftHandshape: "B", duration: 1200, right: [REST_R, { x: 150, y: 108, r: -8 }, { x: 150, y: 190, r: -8 }, REST_R], left: [{ x: 150, y: 205, r: 90 }, { x: 150, y: 205, r: 90 }, { x: 150, y: 205, r: 90 }, { x: 150, y: 205, r: 90 }] } },
  BAD: { gloss: "BAD", english: "bad", description: "Flat fingertips at chin, then flip the hand palm-down and away.", movement: { handshape: "B", duration: 1100, right: [REST_R, { x: 150, y: 108, r: -8 }, { x: 210, y: 165, r: 80 }, REST_R] } },

  // Pronouns
  I: { gloss: "I", english: "I / me", description: "Point at your own chest.", movement: pointSelf() },
  ME: { gloss: "ME", english: "me", description: "Point at your own chest.", movement: pointSelf() },
  YOU: { gloss: "YOU", english: "you", description: "Point outward toward the person.", movement: pointOut() },
  WE: { gloss: "WE", english: "we", description: "Touch one shoulder, arc across, touch the other shoulder.", movement: { handshape: "D", duration: 1400, right: [REST_R, { x: 175, y: 130, r: -30 }, { x: 125, y: 130, r: 30 }, REST_R] } },
  IT: { gloss: "IT", english: "it", description: "Point outward at the referent (like YOU but neutral).", movement: pointOut() },

  // People
  MOTHER: { gloss: "MOTHER", english: "mother", description: "Open 5-hand, thumb taps the chin twice.", movement: tapChin("5") },
  FATHER: { gloss: "FATHER", english: "father", description: "Open 5-hand, thumb taps the forehead twice.", movement: tapForehead("5") },
  FRIEND: { gloss: "FRIEND", english: "friend", description: "Hook the two index fingers together one way, then flip and hook them the other way.", movement: hookHands() },
  TEACHER: { gloss: "TEACHER", english: "teacher", description: "Flat-O hands at the temples flick forward — teaching info out from the head.", movement: { handshape: "O", leftHandshape: "O", duration: 1200, right: [{ x: 190, y: 70, r: 0 }, { x: 215, y: 90, r: 10 }, { x: 190, y: 70, r: 0 }], left: [{ x: 110, y: 70, r: 0 }, { x: 85, y: 90, r: -10 }, { x: 110, y: 70, r: 0 }] } },
  STUDENT: { gloss: "STUDENT", english: "student", description: "Sign LEARN, then the PERSON marker (both flat hands sliding down the sides of the body).", movement: { handshape: "O", leftHandshape: "B", duration: 1400, right: [{ x: 150, y: 200, r: -20 }, { x: 150, y: 90, r: -10 }, { x: 150, y: 200, r: -20 }], left: [{ x: 150, y: 210, r: 90 }, { x: 150, y: 210, r: 90 }, { x: 150, y: 210, r: 90 }] } },

  // Feelings
  HAPPY: { gloss: "HAPPY", english: "happy", description: "Flat hand brushes upward on the chest in small circles.", movement: chestBrushUp("B") },
  SAD: { gloss: "SAD", english: "sad", description: "Both open 5-hands in front of the face drop down — features falling.", movement: faceDown() },
  LOVE: { gloss: "LOVE", english: "love", description: "Cross both fists over the heart — hugging yourself.", movement: bothCrossHeart("S") },
  ANGRY: { gloss: "ANGRY", english: "angry", description: "Claw C-hand in front of the face is pulled sharply away.", movement: pullAwayFace() },
  TIRED: { gloss: "TIRED", english: "tired", description: "Both bent hands touch the chest and rotate downward.", movement: { handshape: "B", leftHandshape: "B", duration: 1300, right: [{ x: 170, y: 170, r: -60 }, { x: 170, y: 200, r: -20 }, { x: 170, y: 170, r: -60 }], left: [{ x: 130, y: 170, r: 60 }, { x: 130, y: 200, r: 20 }, { x: 130, y: 170, r: 60 }] } },
  EXCITED: { gloss: "EXCITED", english: "excited", description: "Middle-finger 5 hands alternate brushing upward on the chest.", movement: { handshape: "5", leftHandshape: "5", duration: 900, right: [{ x: 170, y: 200, r: 0 }, { x: 170, y: 150, r: 0 }, { x: 170, y: 200, r: 0 }], left: [{ x: 130, y: 150, r: 0 }, { x: 130, y: 200, r: 0 }, { x: 130, y: 150, r: 0 }] } },

  // Daily
  EAT: { gloss: "EAT", english: "eat", description: "Flat-O fingertips tap the lips.", movement: tapMouth("O") },
  DRINK: { gloss: "DRINK", english: "drink", description: "C-hand tips up at the mouth like raising a cup.", movement: cupTilt() },
  WATER: { gloss: "WATER", english: "water", description: "W-hand taps the chin twice.", movement: tapChin("W") },
  HOME: { gloss: "HOME", english: "home", description: "Flat-O touches the mouth, then moves up to touch the cheek.", movement: { handshape: "O", duration: 1200, right: [REST_R, { x: 150, y: 96, r: -10 }, { x: 175, y: 82, r: -10 }, REST_R] } },
  WORK: { gloss: "WORK", english: "work", description: "Two S-fists — the dominant taps the back of the other twice.", movement: { handshape: "S", leftHandshape: "S", duration: 900, right: [{ x: 170, y: 195, r: -20 }, { x: 150, y: 195, r: -20 }, { x: 170, y: 195, r: -20 }, { x: 150, y: 195, r: -20 }], left: [{ x: 130, y: 205, r: 20 }, { x: 130, y: 205, r: 20 }, { x: 130, y: 205, r: 20 }, { x: 130, y: 205, r: 20 }] } },
  SCHOOL: { gloss: "SCHOOL", english: "school", description: "Flat palm claps down on the other flat palm twice.", movement: clapDown() },
  BOOK: { gloss: "BOOK", english: "book", description: "Two palms together, then open outward like a book.", movement: bookOpen() },
  LEARN: { gloss: "LEARN", english: "learn", description: "Open hand picks information off the flat palm and brings it up to the forehead.", movement: { handshape: "O", leftHandshape: "B", duration: 1400, right: [{ x: 150, y: 210, r: -20 }, { x: 150, y: 200, r: -20 }, { x: 150, y: 90, r: -10 }, { x: 150, y: 210, r: -20 }], left: [{ x: 150, y: 210, r: 90 }, { x: 150, y: 210, r: 90 }, { x: 150, y: 210, r: 90 }, { x: 150, y: 210, r: 90 }] } },

  // Actions
  GO: { gloss: "GO", english: "go", description: "Both index fingers flick forward together.", movement: bothForward("D") },
  COME: { gloss: "COME", english: "come", description: "Both index fingers pull inward toward the body.", movement: bothInward("D") },
  STOP: { gloss: "STOP", english: "stop", description: "Edge of the flat hand chops down onto the other flat palm.", movement: chopPalm() },
  HELP: { gloss: "HELP", english: "help", description: "Fist on the open palm, both lift up together.", movement: fistOnPalmLift() },
  PLAY: { gloss: "PLAY", english: "play", description: "Both Y-hands twist at the wrists.", movement: yTwist() },
  UNDERSTAND: { gloss: "UNDERSTAND", english: "understand", description: "S-fist at the temple flicks the index up — the lightbulb moment.", movement: templeFlick() },
  THINK: { gloss: "THINK", english: "think", description: "Index finger taps the temple.", movement: { handshape: "D", duration: 1000, right: [REST_R, { x: 185, y: 65, r: -20 }, { x: 185, y: 72, r: -20 }, { x: 185, y: 65, r: -20 }, REST_R] } },
  KNOW: { gloss: "KNOW", english: "know", description: "Fingertips tap the forehead.", movement: tapForehead("B") },
  REMEMBER: { gloss: "REMEMBER", english: "remember", description: "Thumb of the A-hand at the forehead, then lower onto the thumb of the other A-hand.", movement: { handshape: "A", leftHandshape: "A", duration: 1200, right: [{ x: 150, y: 65, r: -10 }, { x: 150, y: 175, r: -10 }, { x: 150, y: 65, r: -10 }], left: [{ x: 150, y: 195, r: 10 }, { x: 150, y: 195, r: 10 }, { x: 150, y: 195, r: 10 }] } },
  FORGET: { gloss: "FORGET", english: "forget", description: "Flat hand wipes across the forehead into a closed A-hand off to the side.", movement: { handshape: "B", duration: 1200, right: [{ x: 115, y: 60, r: 0 }, { x: 215, y: 60, r: 0 }, { x: 115, y: 60, r: 0 }] } },
  SEE: { gloss: "SEE", english: "see", description: "V-hand near the eyes moves forward.", movement: { handshape: "V", duration: 1000, right: [{ x: 175, y: 75, r: -20 }, { x: 220, y: 90, r: -20 }, { x: 175, y: 75, r: -20 }] } },
  SHOW: { gloss: "SHOW", english: "show", description: "Index finger of one hand touches the palm of the other; both move forward together.", movement: { handshape: "D", leftHandshape: "B", duration: 1200, right: [{ x: 130, y: 175, r: -25 }, { x: 170, y: 155, r: -25 }, { x: 130, y: 175, r: -25 }], left: [{ x: 130, y: 185, r: 0 }, { x: 170, y: 165, r: 0 }, { x: 130, y: 185, r: 0 }] } },
  TEACH: { gloss: "TEACH", english: "teach", description: "Both flat-O hands at the temples flick forward.", movement: { handshape: "O", leftHandshape: "O", duration: 1200, right: [{ x: 190, y: 70, r: 0 }, { x: 215, y: 90, r: 10 }, { x: 190, y: 70, r: 0 }], left: [{ x: 110, y: 70, r: 0 }, { x: 85, y: 90, r: -10 }, { x: 110, y: 70, r: 0 }] } },
  EXPLAIN: { gloss: "EXPLAIN", english: "explain", description: "Two F-hands alternate moving forward — laying out an idea.", movement: { handshape: "F", leftHandshape: "F", duration: 1000, right: [{ x: 175, y: 170, r: 0 }, { x: 210, y: 170, r: 0 }, { x: 175, y: 170, r: 0 }], left: [{ x: 125, y: 170, r: 0 }, { x: 90, y: 170, r: 0 }, { x: 125, y: 170, r: 0 }] } },
  MEAN: { gloss: "MEAN", english: "means", description: "V-fingertips of one hand drop into the flat palm of the other, twice.", movement: { handshape: "V", leftHandshape: "B", duration: 1000, right: [{ x: 150, y: 155, r: -30 }, { x: 150, y: 185, r: -30 }, { x: 150, y: 155, r: -30 }, { x: 150, y: 185, r: -30 }], left: [{ x: 150, y: 195, r: 90 }, { x: 150, y: 195, r: 90 }, { x: 150, y: 195, r: 90 }, { x: 150, y: 195, r: 90 }] } },
  LAW: { gloss: "LAW", english: "law", description: "L-hand slides down the flat palm, showing a fixed rule.", movement: { handshape: "L", leftHandshape: "B", duration: 1100, right: [{ x: 135, y: 145, r: -10 }, { x: 135, y: 205, r: -10 }, { x: 135, y: 145, r: -10 }], left: [{ x: 150, y: 190, r: 90 }, { x: 150, y: 190, r: 90 }, { x: 150, y: 190, r: 90 }] } },
  ELECTRIC: { gloss: "ELECTRIC", english: "electricity", description: "Bent hands touch and pull apart like a small electric spark.", movement: { handshape: "X", leftHandshape: "X", duration: 900, loops: 2, right: [{ x: 160, y: 165, r: -20 }, { x: 205, y: 145, r: 10 }, { x: 160, y: 165, r: -20 }], left: [{ x: 140, y: 165, r: 20 }, { x: 95, y: 145, r: -10 }, { x: 140, y: 165, r: 20 }] } },
  FLOW: { gloss: "FLOW", english: "flow", description: "Both open hands travel forward in a smooth wave, showing movement through a path.", movement: { handshape: "B", leftHandshape: "B", duration: 1200, right: [{ x: 125, y: 190, r: -8 }, { x: 165, y: 170, r: 6 }, { x: 210, y: 185, r: -8 }, { x: 125, y: 190, r: -8 }], left: [{ x: 95, y: 210, r: 8 }, { x: 135, y: 190, r: -6 }, { x: 180, y: 205, r: 8 }, { x: 95, y: 210, r: 8 }] } },
  CURRENT: { gloss: "CURRENT", english: "current", description: "Use FLOW to show charge moving through a wire.", movement: { handshape: "B", leftHandshape: "B", duration: 1200, right: [{ x: 125, y: 190, r: -8 }, { x: 165, y: 170, r: 6 }, { x: 210, y: 185, r: -8 }, { x: 125, y: 190, r: -8 }], left: [{ x: 95, y: 210, r: 8 }, { x: 135, y: 190, r: -6 }, { x: 180, y: 205, r: 8 }, { x: 95, y: 210, r: 8 }] } },
  VOLTAGE: { gloss: "VOLTAGE", english: "voltage", description: "V-hand pushes forward strongly, showing electrical pressure that drives current.", movement: { handshape: "V", duration: 1100, right: [{ x: 140, y: 185, r: -20 }, { x: 215, y: 155, r: 10 }, { x: 140, y: 185, r: -20 }] } },
  RESISTANCE: { gloss: "RESISTANCE", english: "resistance", description: "Two hands push against each other to show opposition to flow.", movement: { handshape: "B", leftHandshape: "B", duration: 1200, right: [{ x: 205, y: 180, r: -70 }, { x: 165, y: 180, r: -70 }, { x: 205, y: 180, r: -70 }], left: [{ x: 95, y: 180, r: 70 }, { x: 135, y: 180, r: 70 }, { x: 95, y: 180, r: 70 }] } },
  FORMULA: { gloss: "FORMULA", english: "formula", description: "F-hand writes on the open palm, showing a written rule or equation.", movement: { handshape: "F", leftHandshape: "B", duration: 1200, right: [{ x: 130, y: 165, r: -15 }, { x: 170, y: 185, r: 10 }, { x: 130, y: 205, r: -15 }, { x: 130, y: 165, r: -15 }], left: [{ x: 150, y: 195, r: 90 }, { x: 150, y: 195, r: 90 }, { x: 150, y: 195, r: 90 }, { x: 150, y: 195, r: 90 }] } },
  CONNECT: { gloss: "CONNECT", english: "connect / related", description: "Hooked index fingers link together to show a relationship.", movement: hookHands() },
  ENERGY: { gloss: "ENERGY", english: "energy", description: "E-hands rise upward with force, showing power building.", movement: { handshape: "E", leftHandshape: "E", duration: 1100, right: [{ x: 175, y: 205, r: -10 }, { x: 175, y: 145, r: -10 }, { x: 175, y: 205, r: -10 }], left: [{ x: 125, y: 205, r: 10 }, { x: 125, y: 145, r: 10 }, { x: 125, y: 205, r: 10 }] } },
  FORCE: { gloss: "FORCE", english: "force", description: "Both fists push forward firmly to show applied force.", movement: bothForward("S") },
  MOTION: { gloss: "MOTION", english: "motion", description: "Both index fingers move forward together to show movement.", movement: bothForward("D") },
  PLANT: { gloss: "PLANT", english: "plant", description: "One hand grows upward through the other hand like a sprout.", movement: { handshape: "B", leftHandshape: "B", duration: 1300, right: [{ x: 150, y: 210, r: 0 }, { x: 150, y: 160, r: 0 }, { x: 150, y: 210, r: 0 }], left: [{ x: 150, y: 205, r: 90 }, { x: 150, y: 205, r: 90 }, { x: 150, y: 205, r: 90 }] } },
  LIGHT: { gloss: "LIGHT", english: "light", description: "Hand opens outward from the face like light shining.", movement: { handshape: "L", duration: 1000, right: [{ x: 150, y: 75, r: -20 }, { x: 220, y: 105, r: 10 }, { x: 150, y: 75, r: -20 }] } },
  SUN: { gloss: "SUN", english: "sun", description: "Index draws a small circle overhead, then opens to show sunlight.", movement: { handshape: "D", duration: 1200, right: [{ x: 185, y: 45, r: 0 }, { x: 205, y: 55, r: 40 }, { x: 185, y: 65, r: 80 }, { x: 220, y: 95, r: 10 }] } },

  // Q-words (all with a slight side shake — the "wh?" facial marker is in the caption)
  WHAT: { gloss: "WHAT", english: "what", description: "Both palms up, shake slightly side to side (eyebrows down).", movement: { handshape: "5", leftHandshape: "5", duration: 900, loops: 3, right: [{ x: 195, y: 195, r: 0 }, { x: 210, y: 195, r: 0 }, { x: 195, y: 195, r: 0 }], left: [{ x: 105, y: 195, r: 0 }, { x: 90, y: 195, r: 0 }, { x: 105, y: 195, r: 0 }] } },
  WHERE: { gloss: "WHERE", english: "where", description: "Index finger shakes side to side (eyebrows down).", movement: shakeIndexSide("D") },
  WHO: { gloss: "WHO", english: "who", description: "L-hand at the chin, index bends in and out.", movement: { handshape: "L", duration: 900, right: [{ x: 165, y: 108, r: -10 }, { x: 165, y: 108, r: 5 }, { x: 165, y: 108, r: -10 }] } },
  WHY: { gloss: "WHY", english: "why", description: "Open hand at the temple pulls away, changing into a Y handshape.", movement: { handshape: "Y", duration: 1200, right: [{ x: 185, y: 65, r: -20 }, { x: 225, y: 105, r: 15 }, { x: 185, y: 65, r: -20 }] } },
  HOW: { gloss: "HOW", english: "how", description: "Both bent hands knuckle-to-knuckle rotate outward so palms turn up.", movement: { handshape: "B", leftHandshape: "B", duration: 1200, right: [{ x: 170, y: 175, r: -70 }, { x: 190, y: 175, r: 0 }, { x: 170, y: 175, r: -70 }], left: [{ x: 130, y: 175, r: 70 }, { x: 110, y: 175, r: 0 }, { x: 130, y: 175, r: 70 }] } },

  // Concept/logic — many math/science words reuse existing motions
  NUMBER: { gloss: "NUMBER", english: "number", description: "Two flat-O fingertips touch and rotate — the count.", movement: { handshape: "O", leftHandshape: "O", duration: 900, right: [{ x: 165, y: 175, r: -30 }, { x: 165, y: 175, r: 30 }, { x: 165, y: 175, r: -30 }], left: [{ x: 135, y: 175, r: 30 }, { x: 135, y: 175, r: -30 }, { x: 135, y: 175, r: 30 }] } },
  EQUAL: { gloss: "EQUAL", english: "equals", description: "Two bent B-hands tap each other twice.", movement: { handshape: "B", leftHandshape: "B", duration: 700, right: [{ x: 170, y: 180, r: -60 }, { x: 155, y: 180, r: -60 }, { x: 170, y: 180, r: -60 }, { x: 155, y: 180, r: -60 }], left: [{ x: 130, y: 180, r: 60 }, { x: 145, y: 180, r: 60 }, { x: 130, y: 180, r: 60 }, { x: 145, y: 180, r: 60 }] } },
  SAME: { gloss: "SAME", english: "same", description: "Both Y-hands (or 1-hands) come together, indexes touching.", movement: { handshape: "Y", leftHandshape: "Y", duration: 900, right: [{ x: 195, y: 180, r: 0 }, { x: 160, y: 180, r: 0 }, { x: 195, y: 180, r: 0 }], left: [{ x: 105, y: 180, r: 0 }, { x: 140, y: 180, r: 0 }, { x: 105, y: 180, r: 0 }] } },
  DIFFERENT: { gloss: "DIFFERENT", english: "different", description: "Crossed index fingers pull apart sharply.", movement: { handshape: "D", leftHandshape: "D", duration: 900, right: [{ x: 150, y: 170, r: 20 }, { x: 205, y: 170, r: 0 }, { x: 150, y: 170, r: 20 }], left: [{ x: 150, y: 170, r: -20 }, { x: 95, y: 170, r: 0 }, { x: 150, y: 170, r: -20 }] } },
  MORE: { gloss: "MORE", english: "more", description: "Two flat-O hands tap fingertips together.", movement: { handshape: "O", leftHandshape: "O", duration: 700, right: [{ x: 170, y: 170, r: -30 }, { x: 155, y: 170, r: -30 }, { x: 170, y: 170, r: -30 }, { x: 155, y: 170, r: -30 }], left: [{ x: 130, y: 170, r: 30 }, { x: 145, y: 170, r: 30 }, { x: 130, y: 170, r: 30 }, { x: 145, y: 170, r: 30 }] } },
  LESS: { gloss: "LESS", english: "less", description: "One flat hand lowers toward the other flat hand.", movement: { handshape: "B", leftHandshape: "B", duration: 1000, right: [{ x: 150, y: 140, r: 0 }, { x: 150, y: 175, r: 0 }, { x: 150, y: 140, r: 0 }], left: [{ x: 150, y: 195, r: 0 }, { x: 150, y: 195, r: 0 }, { x: 150, y: 195, r: 0 }] } },
  INCREASE: { gloss: "INCREASE", english: "increase", description: "H-hand flips up onto the other H-hand, going higher.", movement: { handshape: "H", leftHandshape: "H", duration: 1000, right: [{ x: 175, y: 180, r: -30 }, { x: 175, y: 150, r: 30 }, { x: 175, y: 180, r: -30 }], left: [{ x: 125, y: 195, r: 0 }, { x: 125, y: 195, r: 0 }, { x: 125, y: 195, r: 0 }] } },
  DECREASE: { gloss: "DECREASE", english: "decrease", description: "H-hand flips down off the other H-hand.", movement: { handshape: "H", leftHandshape: "H", duration: 1000, right: [{ x: 175, y: 150, r: 30 }, { x: 175, y: 180, r: -30 }, { x: 175, y: 150, r: 30 }], left: [{ x: 125, y: 195, r: 0 }, { x: 125, y: 195, r: 0 }, { x: 125, y: 195, r: 0 }] } },
  BECAUSE: { gloss: "BECAUSE", english: "because", description: "Fingertips brush the forehead, then pull down into a thumbs-up.", movement: { handshape: "L", duration: 1200, right: [{ x: 150, y: 60, r: -10 }, { x: 195, y: 100, r: 10 }, { x: 150, y: 60, r: -10 }] } },
  IF: { gloss: "IF", english: "if", description: "Both F-hands alternate up and down slightly — a conditional marker.", movement: { handshape: "F", leftHandshape: "F", duration: 900, right: [{ x: 175, y: 170, r: 0 }, { x: 175, y: 185, r: 0 }, { x: 175, y: 170, r: 0 }], left: [{ x: 125, y: 185, r: 0 }, { x: 125, y: 170, r: 0 }, { x: 125, y: 185, r: 0 }] } },
  IMPORTANT: { gloss: "IMPORTANT", english: "important", description: "Both F-hands loop up together and lock at the top.", movement: { handshape: "F", leftHandshape: "F", duration: 1200, right: [{ x: 175, y: 205, r: 0 }, { x: 160, y: 165, r: 0 }, { x: 175, y: 205, r: 0 }], left: [{ x: 125, y: 205, r: 0 }, { x: 140, y: 165, r: 0 }, { x: 125, y: 205, r: 0 }] } },
  EXAMPLE: { gloss: "EXAMPLE", english: "example", description: "Index finger touches the flat palm and moves forward.", movement: { handshape: "D", leftHandshape: "B", duration: 1200, right: [{ x: 135, y: 180, r: -25 }, { x: 175, y: 165, r: -25 }, { x: 135, y: 180, r: -25 }], left: [{ x: 135, y: 190, r: 0 }, { x: 175, y: 175, r: 0 }, { x: 135, y: 190, r: 0 }] } },
  TRUE: { gloss: "TRUE", english: "true", description: "Index finger at the lips moves forward decisively.", movement: { handshape: "D", duration: 1000, right: [{ x: 150, y: 96, r: -20 }, { x: 200, y: 130, r: 10 }, { x: 150, y: 96, r: -20 }] } },
  FALSE: { gloss: "FALSE", english: "false", description: "L-hand passes the nose sideways once.", movement: { handshape: "L", duration: 900, right: [{ x: 120, y: 85, r: 0 }, { x: 190, y: 85, r: 0 }, { x: 120, y: 85, r: 0 }] } },
  QUESTION: { gloss: "QUESTION", english: "question", description: "Index finger draws a question mark in the air.", movement: shakeIndexSide("X") },
};

/** All gloss keys — used by the AI gloss prompt as the allowed vocabulary. */
export const KNOWN_GLOSSES = Object.keys(SIGN_DICT);

/** Return a Sign for a gloss (case-insensitive), or null if unknown. */
export function lookupSign(gloss: string): Sign | null {
  if (!gloss) return null;
  const key = gloss.toUpperCase().trim();
  return SIGN_DICT[key] ?? null;
}
