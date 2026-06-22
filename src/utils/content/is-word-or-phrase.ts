/**
 * Heuristic detection of whether a selection is a single word or short phrase
 * (vs. a full sentence). Used to decide whether selection translation should
 * switch to dictionary mode (multiple senses + contextual meaning) instead of
 * plain translation.
 *
 * The rules are intentionally simple and synchronous:
 *   1. No sentence-terminal punctuation — a sentence almost always ends with
 *      one of the ASCII/CJK terminal marks and a word/phrase does not.
 *   2. Token count is small — CJK/kana/hangul characters count as one token
 *      each, while Latin/other scripts are split on whitespace. Up to
 *      `MAX_TOKENS` tokens count as a word or phrase.
 */

// ASCII + CJK sentence-terminal punctuation. Listed by code point (avoids
// regex range lint warnings) and tested via test() on single characters.
const SENTENCE_TERMINAL_CHARS = new Set([
  ".",
  "!",
  "?",
  ";",
  "。", // 。 ideographic full stop
  "！", // ！ fullwidth exclamation
  "？", // ？ fullwidth question
  "；", // ； fullwidth semicolon
])

/**
 * Unicode code-point ranges treated as single-token "CJK-like" characters.
 * Same ranges as script-detect.ts; written as numbers so the source stays
 * ASCII and the ranges are explicit.
 */
const CJK_OR_KANA_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0x4E00, 0x9FFF], // CJK Unified Ideographs
  [0x3400, 0x4DBF], // CJK Extension A
  [0xF900, 0xFAFF], // CJK Compatibility Ideographs
  [0x3040, 0x309F], // Hiragana
  [0x30A0, 0x30FF], // Katakana
  [0xAC00, 0xD7AF], // Hangul Syllables
  [0x1100, 0x11FF], // Hangul Jamo
]

function isCjkOrKana(char: string): boolean {
  const cp = char.codePointAt(0)
  if (cp === undefined)
    return false
  for (const [lo, hi] of CJK_OR_KANA_RANGES) {
    if (cp >= lo && cp <= hi)
      return true
  }
  return false
}

/** Maximum "tokens" (words or CJK characters) allowed for a word/phrase. */
const MAX_TOKENS = 3

/**
 * Count lexical tokens in a string: each CJK/kana/hangul character is one
 * token, and each whitespace-delimited run of non-CJK characters is one token.
 */
export function countTokens(text: string): number {
  let count = 0
  let inLatinToken = false

  for (const char of text) {
    if (isCjkOrKana(char)) {
      inLatinToken = false
      count++
      continue
    }

    if (/\s/.test(char)) {
      inLatinToken = false
      continue
    }

    // Any other non-space character: accumulate into the current Latin token.
    if (!inLatinToken) {
      inLatinToken = true
      count++
    }
  }

  return count
}

/**
 * Returns `true` when `text` looks like a single word or short phrase and
 * therefore qualifies for dictionary-style explanation in selection
 * translation. Returns `false` for sentences, code snippets with newlines, or
 * very long selections.
 */
export function isWordOrPhrase(text: string | null | undefined): boolean {
  if (!text)
    return false

  const trimmed = text.trim()
  if (trimmed.length === 0)
    return false

  // Multi-line selections (code blocks, paragraphs) are not single words.
  if (/\n/.test(trimmed))
    return false

  // Sentence-terminal punctuation strongly implies a full sentence.
  for (const char of trimmed) {
    if (SENTENCE_TERMINAL_CHARS.has(char))
      return false
  }

  return countTokens(trimmed) <= MAX_TOKENS
}
