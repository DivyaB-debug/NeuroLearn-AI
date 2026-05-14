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
          maxOutputTokens: 2048,
          temperature: 0.7,
          prompt: `Explain the topic "${data.topic}" using the "${t.label}" teaching technique (${t.blurb}).

Rules:
- "explanation": 90-140 words, FULLY committed to that style. ${
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
  keyTakeaways: z.array(z.string()).min(3).max(6),
  pomodoroPlan: z.array(z.object({
    block: z.number().int().min(1),
    focusMinutes: z.number().int(),
    breakMinutes: z.number().int(),
    task: z.string(),
  })).min(3).max(6),
  practiceQuestions: z.array(z.string()).min(3).max(5),
});

// --- Generate a study plan + explanation in user's chosen style ---
export const generateStudyPlan = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      topic: z.string().trim().min(2).max(500),
      style: z.enum(techniqueIds),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const model = getModel();
    const technique = TECHNIQUES.find((t) => t.id === data.style)!;
    try {
      const { object } = await generateObject({
        model,
        schema: planSchema,
        maxOutputTokens: 4096,
        temperature: 0.75,
        prompt: `Learner's preferred technique: ${technique.label} — ${technique.blurb}

Syllabus / topic from learner:
"""${data.topic}"""

1) "explanation": Explain the topic FULLY in the ${technique.label} style. Use rich markdown (headings, bold, lists, blockquotes). 250-450 words. Commit to the style.

2) "keyTakeaways": 3-5 short bullets.

3) "pomodoroPlan": 3-5 blocks. 25 min focus / 5 min break, with a 15-min break after the 4th. Each block has a specific task tied to the topic.

4) "practiceQuestions": 3-5 self-test questions.`,
      });
      return object;
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        throw new Error("Couldn't compose the lesson — try a shorter or more specific topic.");
      }
      throw err;
    }
  });
