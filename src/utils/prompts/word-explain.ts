import type { LangCodeISO6393, LangLevel } from "@read-frog/definitions"
import { LANG_CODE_TO_EN_NAME } from "@read-frog/definitions"

/**
 * Build prompts for dictionary-style word/phrase explanation in selection
 * translation. Returns Markdown that the popover renders via MarkdownRenderer.
 *
 * The output contains three sections:
 *   1. headword + pronunciation
 *   2. the contextually correct meaning (based on the surrounding sentence,
 *      web title, and summary)
 *   3. other common senses grouped by part of speech, each with a short example
 */
export interface WordExplainPromptOptions {
  /** Raw selected text (a single word or short phrase). */
  input: string
  /** Source language code; the language of the selected text. */
  sourceLang: LangCodeISO6393
  /** Target language code; the language the user reads in. */
  targetLang: LangCodeISO6393
  /** Learner level — controls how much explanation/example detail to include. */
  langLevel: LangLevel
  /** Optional page context that helps disambiguate the word. */
  webTitle?: string
  /** Optional web page summary for context. */
  webSummary?: string
  /** Optional surrounding sentence(s) where the word appears. */
  webContent?: string
}

export interface WordExplainPromptResult {
  systemPrompt: string
  prompt: string
}

const LEVEL_GUIDANCE: Record<LangLevel, string> = {
  beginner: "Use very simple wording. Keep each definition to one short clause. Examples should use the most common 1000 words.",
  intermediate: "Use natural everyday wording. Definitions can be one full sentence. Examples can use moderately advanced vocabulary.",
  advanced: "Use precise wording with nuance. Definitions can include register/collocation hints. Examples may reflect realistic native usage.",
}

export function getWordExplainPrompt(
  options: WordExplainPromptOptions,
): WordExplainPromptResult {
  const {
    input,
    sourceLang,
    targetLang,
    langLevel,
    webTitle,
    webSummary,
    webContent,
  } = options

  const sourceLangName = LANG_CODE_TO_EN_NAME[sourceLang] ?? sourceLang
  const targetLangName = LANG_CODE_TO_EN_NAME[targetLang] ?? targetLang
  const levelGuidance = LEVEL_GUIDANCE[langLevel] ?? LEVEL_GUIDANCE.intermediate

  const systemPrompt = `You are a professional ${sourceLangName} dictionary assistant for a learner whose native language is ${targetLangName}. The learner's level is ${langLevel}.

# Goal
The user has selected a single word or short phrase while reading a web page. Explain it for the learner.

# Style
${levelGuidance}
Write all explanations in ${targetLangName}, except for the headword, pronunciation, and example sentences (which stay in ${sourceLangName} where natural).

# Output format (strict Markdown)
Output ONLY the following sections, in this order, with NO extra commentary:

### {{headword}}  /{{IPA or pinyin}}/

**【此处含义】** {{the meaning that fits the surrounding context}} (give the part of speech)
> {{the sentence from the page where it appears, or the input itself if no context}}
> {{translation of that sentence in ${targetLangName}}}

**【其他常见义项】**
- **{{part-of-speech}}**: {{sense 1}} — _{{short example in ${sourceLangName}}}_
- **{{part-of-speech}}**: {{sense 2}} — _{{short example in ${sourceLangName}}}_
- ...up to 4 senses total, ordered by frequency

# Rules
- If the input is a phrase or idiom, treat it as one unit; do not gloss the words separately.
- Skip the 【其他常见义项】 section entirely if the word genuinely has only one common meaning.
- If you cannot determine the pronunciation, omit the \`/.../\` slashes (do not invent one).
- Never output anything outside the format above. No greetings, no notes, no "Here is...".`

  const contextLines: string[] = []
  if (webTitle && webTitle.trim())
    contextLines.push(`Web page title: ${webTitle.trim()}`)
  if (webSummary && webSummary.trim())
    contextLines.push(`Web page summary: ${webSummary.trim()}`)
  if (webContent && webContent.trim())
    contextLines.push(`Surrounding context: ${webContent.trim()}`)

  const contextBlock = contextLines.length > 0
    ? `\n\n## Context\n${contextLines.join("\n")}`
    : ""

  const prompt = `Selected word/phrase: ${input}${contextBlock}`

  return { systemPrompt, prompt }
}
