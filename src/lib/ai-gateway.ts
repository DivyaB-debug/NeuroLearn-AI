import { google } from "@ai-sdk/google";

export const getGoogleModel = () => {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) {
    throw new Error(
      "Missing GOOGLE_GENERATIVE_AI_API_KEY — add your Google AI Studio key to the environment."
    );
  }
  return google("gemini-2.5-flash", { apiKey: key });
};

export const TECHNIQUES = [
  { id: "visual_storytelling", label: "Visual Storytelling", blurb: "A vivid scene you can picture in your head." },
  { id: "analogy", label: "Analogy & Metaphor", blurb: "Mapped to something familiar from everyday life." },
  { id: "feynman", label: "Feynman (ELI5)", blurb: "Plain language, no jargon — like explaining to a kid." },
  { id: "step_by_step", label: "Step-by-Step", blurb: "Numbered, logical breakdown from start to finish." },
  { id: "socratic", label: "Socratic Questioning", blurb: "Guiding questions that lead you to the answer." },
  { id: "mnemonic", label: "Mnemonic & Memory", blurb: "Memory hooks, acronyms, rhymes that stick." },
] as const;

export type TechniqueId = typeof TECHNIQUES[number]["id"];
