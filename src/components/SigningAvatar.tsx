import { useEffect, useRef } from "react";
import type { SignMovement, Pose } from "@/lib/asl-signs";

/**
 * SigningAvatar — a stylized human figure that signs a single sign at a time.
 *
 * The avatar is an SVG (head, neck, torso, arms). Each hand is a `<g>` element
 * whose position and rotation are animated with the Web Animations API. A small
 * ASL handshape image from /public/asl/ is rendered inside each hand `<g>` so
 * the viewer sees the real handshape while the movement plays out.
 *
 * Coord system: viewBox is 300 × 340. Rest position: right hand (215, 210),
 * left hand (85, 210). See src/lib/asl-signs.ts for anchor points.
 */

type Props = {
  movement: SignMovement | null;
  label?: string;              // English label shown under the avatar
  caption?: string;            // "gloss • english" strip shown above
  playing: boolean;
  /** Fingerspell mode: if provided, overrides handshape and hides motion */
  spellLetter?: string | null;
  emphasis?: "questioning" | "positive" | "negative" | null;
};

const REST_R: Pose = { x: 215, y: 210, r: 0 };
const REST_L: Pose = { x: 85, y: 210, r: 0 };

function poseTransform(p: Pose) {
  return `translate(${p.x}px, ${p.y}px) rotate(${p.r ?? 0}deg)`;
}

function buildKeyframes(poses: Pose[]): Keyframe[] {
  return poses.map((p) => ({ transform: poseTransform(p) }));
}

function handAsset(shape: string) {
  return /^[A-Z]$/.test(shape.toUpperCase()) ? shape.toUpperCase() : "B";
}

export function SigningAvatar({ movement, label, caption, playing, spellLetter, emphasis }: Props) {
  const rightRef = useRef<SVGGElement | null>(null);
  const leftRef = useRef<SVGGElement | null>(null);
  const rightAnim = useRef<Animation | null>(null);
  const leftAnim = useRef<Animation | null>(null);

  // Which handshape SVG to display on each hand
  const rightShape = spellLetter ?? movement?.handshape ?? "B";
  const leftShape = movement?.leftHandshape ?? "B";
  const rightAsset = handAsset(rightShape);
  const leftAsset = handAsset(leftShape);
  const twoHanded = !!(movement && movement.left && movement.left.length);

  useEffect(() => {
    // Cancel any prior animations
    rightAnim.current?.cancel();
    leftAnim.current?.cancel();
    rightAnim.current = null;
    leftAnim.current = null;

    if (!rightRef.current || !leftRef.current) return;

    // Fingerspell mode: hand hovers at chest, subtle breathing only
    if (spellLetter) {
      const pose: Pose = { x: 195, y: 155, r: 0 };
      rightRef.current.style.transform = poseTransform(pose);
      leftRef.current.style.transform = poseTransform(REST_L);
      if (playing) {
        rightAnim.current = rightRef.current.animate(
          [
            { transform: poseTransform(pose) },
            { transform: `translate(${pose.x}px, ${pose.y - 3}px) rotate(2deg)` },
            { transform: poseTransform(pose) },
          ],
          { duration: 1400, iterations: Infinity, easing: "ease-in-out" }
        );
      }
      return;
    }

    if (!movement) {
      rightRef.current.style.transform = poseTransform(REST_R);
      leftRef.current.style.transform = poseTransform(REST_L);
      return;
    }

    const rightKfs = buildKeyframes(movement.right ?? [REST_R]);
    const leftKfs = buildKeyframes(movement.left ?? [REST_L]);

    // Set initial pose so it doesn't flash from origin
    rightRef.current.style.transform = rightKfs[0].transform as string;
    leftRef.current.style.transform = leftKfs[0].transform as string;

    if (playing) {
      const opts: KeyframeAnimationOptions = {
        duration: movement.duration,
        iterations: Infinity,
        easing: "ease-in-out",
      };
      rightAnim.current = rightRef.current.animate(rightKfs, opts);
      if (movement.left) {
        leftAnim.current = leftRef.current.animate(leftKfs, opts);
      }
    }

    return () => {
      rightAnim.current?.cancel();
      leftAnim.current?.cancel();
    };
  }, [movement, playing, spellLetter]);

  const faceMood =
    emphasis === "positive" ? "url(#face-smile)" :
    emphasis === "negative" ? "url(#face-frown)" :
    emphasis === "questioning" ? "url(#face-quest)" :
    "url(#face-neutral)";

  return (
    <div className="relative w-full">
      {caption && (
        <div className="absolute inset-x-0 top-2 z-10 flex justify-center">
          <div className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs text-foreground backdrop-blur">
            {caption}
          </div>
        </div>
      )}
      <svg viewBox="0 0 300 340" className="h-full w-full">
        <defs>
          {/* Body gradient */}
          <linearGradient id="body-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="skin-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(30 55% 82%)" />
            <stop offset="100%" stopColor="hsl(25 45% 72%)" />
          </linearGradient>
          <radialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
        </defs>

        {/* Halo backdrop */}
        <circle cx="150" cy="170" r="130" fill="url(#halo)" opacity="0.6" />

        {/* Shoulders / torso */}
        <path
          d="M 60 340 Q 60 220 100 195 Q 150 175 200 195 Q 240 220 240 340 Z"
          fill="url(#body-grad)"
          opacity="0.9"
        />
        {/* Neckline detail */}
        <path
          d="M 130 205 Q 150 220 170 205 Q 165 230 150 232 Q 135 230 130 205 Z"
            fill="var(--background)"
          opacity="0.35"
        />

        {/* Neck */}
        <rect x="140" y="105" width="20" height="30" rx="6" fill="url(#skin-grad)" />

        {/* Head */}
        <g className="signing-head">
          <circle cx="150" cy="78" r="34" fill="url(#skin-grad)" />
          {/* Hair */}
          <path
            d="M 118 68 Q 120 42 150 40 Q 180 42 182 68 Q 178 55 150 55 Q 122 55 118 68 Z"
            fill="var(--foreground)"
            opacity="0.75"
          />
          {/* Eyebrows depend on emphasis (questioning = furrowed) */}
          {emphasis === "questioning" ? (
            <>
              <path d="M 132 70 L 144 74" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" />
              <path d="M 168 74 L 156 70" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M 132 72 Q 138 68 144 72" stroke="var(--foreground)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              <path d="M 156 72 Q 162 68 168 72" stroke="var(--foreground)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </>
          )}
          {/* Eyes */}
          <circle cx="138" cy="80" r="2.2" fill="var(--foreground)" />
          <circle cx="162" cy="80" r="2.2" fill="var(--foreground)" />
          {/* Mouth — mood */}
          <use href={faceMood} />
          <symbol id="face-neutral"><path d="M 142 96 Q 150 99 158 96" stroke="var(--foreground)" strokeWidth="1.6" fill="none" strokeLinecap="round" /></symbol>
          <symbol id="face-smile"><path d="M 140 94 Q 150 102 160 94" stroke="var(--foreground)" strokeWidth="1.8" fill="none" strokeLinecap="round" /></symbol>
          <symbol id="face-frown"><path d="M 140 100 Q 150 92 160 100" stroke="var(--foreground)" strokeWidth="1.8" fill="none" strokeLinecap="round" /></symbol>
          <symbol id="face-quest"><ellipse cx="150" cy="96" rx="4" ry="2.5" fill="none" stroke="var(--foreground)" strokeWidth="1.6" /></symbol>
        </g>

        {/* Arms — subtle lines suggesting arms; hands sit at the end */}
        <path d="M 108 200 Q 150 180 192 200" stroke="var(--foreground)" strokeOpacity="0.15" strokeWidth="1" fill="none" />

        {/* Left hand group (viewer's left = signer's dominant right hand in this scene we've set right as dominant on right side of screen for viewer-mirror clarity) */}
        {/* Right (dominant) hand */}
        <g
          ref={rightRef}
          style={{
            transformBox: "fill-box",
            transformOrigin: "0 0",
            transform: poseTransform(REST_R),
            transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <circle cx="0" cy="0" r="22" fill="var(--accent)" opacity="0.18" filter="url(#soft)" />
          <image
            href={`/asl/${rightAsset}.svg`}
            x="-22" y="-22" width="44" height="44"
            preserveAspectRatio="xMidYMid meet"
          />
          {/* handshape badge */}
          <g transform="translate(16, 16)">
            <circle r="9" fill="var(--primary)" />
            <text x="0" y="3" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--primary-foreground)">
              {rightShape.toUpperCase()}
            </text>
          </g>
        </g>

        {/* Left (support) hand */}
        <g
          ref={leftRef}
          style={{
            transformBox: "fill-box",
            transformOrigin: "0 0",
            transform: poseTransform(REST_L),
            transition: "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
            opacity: twoHanded ? 1 : 0.45,
          }}
        >
          <circle cx="0" cy="0" r="20" fill="var(--accent)" opacity="0.14" filter="url(#soft)" />
          <image
            href={`/asl/${leftAsset}.svg`}
            x="-20" y="-20" width="40" height="40"
            preserveAspectRatio="xMidYMid meet"
            style={{ transform: "scaleX(-1)", transformOrigin: "center", transformBox: "fill-box" }}
          />
        </g>
      </svg>

      {label && (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
          <div className="font-display text-xl tracking-wide text-foreground drop-shadow">{label}</div>
        </div>
      )}
    </div>
  );
}
