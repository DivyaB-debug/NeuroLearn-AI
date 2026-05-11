import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, TECHNIQUES } from "./ai-gateway";

const getModel = () => {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)("google/gemini-3-flash-preview");
};

// --- Diagnostic: explain a topic in 6 techniques + comprehension MCQ each ---
export const generateDiagnostic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ topic: z.string().trim().min(2).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const model = getModel();
    const techniqueList = TECHNIQUES.map((t) => `- ${t.id}: ${t.label} — ${t.blurb}`).join("\n");
    const { output } = await generateText({
      model,
      output: Output.object({
        schema: z.object({
          items: z.array(
            z.object({
              technique: z.enum([
                "visual_storytelling",
                "analogy",
                "feynman",
                "step_by_step",
                "socratic",
                "mnemonic",
              ]),
              explanation: z.string().min(40),
              question: z.string(),
              choices: z.array(z.string()).length(4),
              correctIndex: z.number().int().min(0).max(3),
            })
          ).length(6),
        }),
      }),
      prompt: `Topic: "${data.topic}"

Explain this topic in SIX different teaching techniques. For each, write a 90-140 word explanation in that exact style, then write ONE multiple-choice comprehension question (4 choices) testing whether the reader understood THAT explanation.

Techniques (use each exactly once, ids must match):
${techniqueList}

Be vivid and committed to each style. The Socratic one should literally ask probing questions and reveal answers. The mnemonic one should include a real memory device.`,
    });
    return output;
  });

// --- Generate a study plan + explanation in user's chosen style ---
export const generateStudyPlan = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      topic: z.string().trim().min(2).max(500),
      style: z.enum([
        "visual_storytelling", "analogy", "feynman", "step_by_step", "socratic", "mnemonic",
      ]),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const model = getModel();
    const technique = TECHNIQUES.find((t) => t.id === data.style)!;
    const { output } = await generateText({
      model,
      output: Output.object({
        schema: z.object({
          explanation: z.string(),
          keyTakeaways: z.array(z.string()).min(3).max(6),
          pomodoroPlan: z.array(z.object({
            block: z.number().int().min(1),
            focusMinutes: z.number().int(),
            breakMinutes: z.number().int(),
            task: z.string(),
          })).min(3).max(6),
          practiceQuestions: z.array(z.string()).min(3).max(5),
        }),
      }),
      prompt: `Learner's preferred technique: ${technique.label} — ${technique.blurb}

Syllabus / topic from learner:
"""${data.topic}"""

1) Write an "explanation" of the topic FULLY in the ${technique.label} style. Use rich markdown (headings, bold, lists, blockquotes). 250-450 words. Commit to the style — if Visual Storytelling, paint scenes; if Mnemonic, build acronyms; if Socratic, ask & answer questions; if Feynman, no jargon; if Analogy, sustain one core analogy; if Step-by-Step, numbered logical chain.

2) "keyTakeaways": 3-5 short bullets.

3) "pomodoroPlan": 3-5 study blocks. Standard Pomodoro = 25 min focus / 5 min break, with a longer 15-min break after the 4th. Each block has a specific task tied to the topic.

4) "practiceQuestions": 3-5 questions to self-test understanding.`,
    });
    return output;
  });
