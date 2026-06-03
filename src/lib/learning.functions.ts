import { createServerFn } from "@tanstack/react-start";
import { generateObject, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, TECHNIQUES } from "./ai-gateway";

const getModel = () => {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY — enable Lovable AI to use the diagnostic.");
  return createLovableAiGatewayProvider(key)("google/gemini-2.5-flash");
};

const techniqueIds = [
  "visual_storytelling",
  "analogy",
  "feynman",
  "step_by_step",
  "socratic",
  "mnemonic",
] as const;

const diagItemSchema = z.object({
  explanation: z.string(),
  question: z.string(),
  choices: z.array(z.string()).length(4),
  correctIndex: z.number().int().min(0).max(3),
});

// --- Diagnostic: explain a topic in 6 techniques + comprehension MCQ each ---
// Runs each technique as its own model call in parallel — much more reliable
// than asking for all 6 in one structured response.
export const generateDiagnostic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ topic: z.string().trim().min(2).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const model = getModel();

    const buildOne = async (techniqueId: typeof techniqueIds[number]) => {
      const t = TECHNIQUES.find((x) => x.id === techniqueId)!;
      try {
        const { object } = await generateObject({
          model,
          schema: diagItemSchema,
          maxOutputTokens: 4096,
          temperature: 0.7,
          prompt: `Explain the topic "${data.topic}" using the "${t.label}" teaching technique (${t.blurb}).

Rules:
- "explanation": 220-320 words, FULLY committed to that style. Cover the concept thoroughly — definition, why it matters, the core mechanism, and at least one concrete example. Don't be shallow. ${
            techniqueId === "socratic" ? "Use probing questions and answer them." :
            techniqueId === "mnemonic" ? "Include a real memory device, acronym, or rhyme." :
            techniqueId === "feynman" ? "No jargon — explain like to a smart 12-year-old." :
            techniqueId === "analogy" ? "Sustain ONE core analogy throughout." :
            techniqueId === "visual_storytelling" ? "Paint a vivid scene the reader can picture." :
            "Use a numbered logical chain from start to finish."
          }
- "question": ONE multiple-choice comprehension question testing whether the reader understood THIS explanation.
- "choices": exactly 4 plausible options.
- "correctIndex": 0-based index of the correct choice.`,
        });
        return { technique: techniqueId, ...object };
      } catch (err) {
        if (NoObjectGeneratedError.isInstance(err)) {
          throw new Error(`Failed to generate ${t.label} explanation. Try a more specific topic.`);
        }
        throw err;
      }
    };

    const items = await Promise.all(techniqueIds.map(buildOne));
    return { items };
  });

const planSchema = z.object({
  explanation: z.string(),
  keyTakeaways: z.array(z.string()).min(3).max(10),
  pomodoroPlan: z.array(z.object({
    block: z.number().int().min(1),
    focusMinutes: z.number().int(),
    breakMinutes: z.number().int(),
    task: z.string(),
  })).min(2).max(8),
  practiceQuestions: z.array(z.string()).min(3).max(10),
});

// --- Generate a study plan + explanation in user's chosen style ---
export const generateStudyPlan = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      topic: z.string().trim().min(2).max(2000),
      style: z.enum(techniqueIds),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY — enable Lovable AI.");
    const technique = TECHNIQUES.find((t) => t.id === data.style)!;
    const big = data.topic.length > 180;
    // Trim very long topics so we don't burn the output budget on input echo.
    const topic = data.topic.length > 1200 ? data.topic.slice(0, 1200) + "…" : data.topic;
    const wordTarget = big ? "700-1100 words" : "400-700 words";

    const buildPrompt = (deep: boolean) => `Learner's preferred technique: ${technique.label} — ${technique.blurb}

Syllabus / topic from learner:
"""${topic}"""

1) "explanation": Explain the topic in the ${technique.label} style using rich markdown (H2/H3, bold, bullets, short examples). Target ${deep ? wordTarget : "350-550 words"}. ${big ? "Break large topics into labeled sub-sections." : "Cover intuition, mechanism, a worked example, and common pitfalls."} Stay in the ${technique.label} voice.

2) "keyTakeaways": 3-7 punchy bullets.

3) "pomodoroPlan": 2-5 blocks. 25 min focus / 5 min break, longer break after the 4th. Each block has a specific task.

4) "practiceQuestions": 3-6 self-test questions from recall to application.`;

    const tryGenerate = async (deep: boolean) => {
      const provider = createLovableAiGatewayProvider(key);
      const model = provider(deep ? "google/gemini-2.5-flash" : "google/gemini-2.5-flash-lite");
      return generateObject({
        model,
        schema: planSchema,
        maxOutputTokens: deep ? 8192 : 4096,
        temperature: 0.7,
        prompt: buildPrompt(deep),
      });
    };

    try {
      const { object } = await tryGenerate(true);
      return object;
    } catch (err) {
      // Most NoObjectGenerated errors here are token-cap / schema-validation
      // misses on long outputs. Retry once with a tighter, faster config.
      if (NoObjectGeneratedError.isInstance(err)) {
        try {
          const { object } = await tryGenerate(false);
          return object;
        } catch (err2) {
          console.error("generateStudyPlan retry failed:", err2);
          throw new Error("Couldn't compose the lesson — try a shorter or more specific topic.");
        }
      }
      throw err;
    }
  });


// --- Visual story planner: turn a topic into 4 scene prompts + captions ---
const storySchema = z.object({
  title: z.string(),
  scenes: z.array(z.object({
    caption: z.string(),
    imagePrompt: z.string(),
  })).min(3).max(5),
});

export const generateVisualStory = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ topic: z.string().trim().min(2).max(2000) }).parse(d)
  )
  .handler(async ({ data }) => {
    const model = getModel();
    try {
      const { object } = await generateObject({
        model,
        schema: storySchema,
        maxOutputTokens: 2048,
        temperature: 0.8,
        prompt: `Design a 4-scene visual story that teaches: "${data.topic}".

Each scene must:
- "caption": 1-2 sentences (max 220 chars) — narrative voice, teaches a single beat of the concept. Scenes connect into a story arc (setup → mechanism → example → payoff).
- "imagePrompt": a detailed visual description (40-80 words) for an AI illustrator. Concrete subjects, setting, lighting, mood. NO text/labels in the image. Consistent art style across scenes (specify it, e.g. "soft gouache illustration", "isometric 3D render", "minimal flat vector"). Pick ONE style and reuse it in every imagePrompt.

Title should be short and evocative.`,
      });
      return object;
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        throw new Error("Couldn't plan the visual story — try a more specific topic.");
      }
      throw err;
    }
  });

