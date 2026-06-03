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
  keyTakeaways: z.array(z.string()).min(4).max(10),
  pomodoroPlan: z.array(z.object({
    block: z.number().int().min(1),
    focusMinutes: z.number().int(),
    breakMinutes: z.number().int(),
    task: z.string(),
  })).min(3).max(8),
  practiceQuestions: z.array(z.string()).min(4).max(8),
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
    const model = getModel();
    const technique = TECHNIQUES.find((t) => t.id === data.style)!;
    // Scale depth with topic size — a single concept gets ~700 words,
    // a full syllabus gets a thorough multi-section deep-dive.
    const big = data.topic.length > 180;
    const wordTarget = big ? "900-1500 words" : "500-900 words";
    try {
      const { object } = await generateObject({
        model,
        schema: planSchema,
        maxOutputTokens: 8192,
        temperature: 0.75,
        prompt: `Learner's preferred technique: ${technique.label} — ${technique.blurb}

Syllabus / topic from learner:
"""${data.topic}"""

1) "explanation": Explain the topic FULLY and DEEPLY in the ${technique.label} style. Use rich markdown — H2/H3 headings to break sections, bold, bullet lists, numbered steps, blockquotes for insights, and short worked examples or mini-scenarios. Target ${wordTarget}. ${big ? "Because the learner pasted a large topic, break it into clearly labeled sub-sections (one per sub-topic) and cover each thoroughly — do NOT summarize, teach it." : "Cover: intuition, formal definition, the core mechanism step by step, a concrete worked example, common pitfalls, and how it connects to related ideas."} Commit fully to the ${technique.label} style throughout — don't drift into a generic textbook tone.

2) "keyTakeaways": 4-8 punchy bullets a learner should remember.

3) "pomodoroPlan": 3-6 blocks. 25 min focus / 5 min break, with a 15-min break after the 4th. Each block has a SPECIFIC task tied to a sub-section of the topic above.

4) "practiceQuestions": 4-8 self-test questions ranging from recall to application.`,
      });
      return object;
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        throw new Error("Couldn't compose the lesson — try a shorter or more specific topic.");
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

