import type { LangCodeISO6393 } from "@read-frog/definitions"

// Unicode script ranges for target language detection
const CJK_RANGES: number[][] = [
  [0x4E00, 0x9FFF], // CJK Unified Ideographs
  [0x3400, 0x4DBF], // CJK Extension A
  [0x20000, 0x2A6DF], // CJK Extension B
  [0x2A700, 0x2B73F], // CJK Extension C
  [0x2B740, 0x2B81F], // CJK Extension D
  [0xF900, 0xFAFF], // CJK Compatibility Ideographs
]

const HIRAGANA_RANGE: number[] = [0x3040, 0x309F]
const KATAKANA_RANGE: number[] = [0x30A0, 0x30FF]
const HANGUL_RANGES: number[][] = [
  [0xAC00, 0xD7AF], // Hangul Syllables
  [0x1100, 0x11FF], // Hangul Jamo
]

function isCharInRange(cp: number, ranges: number[][]): boolean {
  for (const [lo, hi] of ranges) {
    if (cp >= lo && cp <= hi)
      return true
  }
  return false
}

/**
 * Determine whether text is predominantly written in the target language's
 * Unicode script. Uses character-range detection, which is synchronous and
 * 100% reliable for non-Latin scripts (CJK, Hangul, kana, Arabic, etc.).
 *
 * Returns `false` for Latin-script target languages (eng, fra, spa, etc.)
 * because Unicode alone cannot distinguish them.
 *
 * @param text - The selected text to check
 * @param targetCode - The configured target language (ISO 639-3)
 * @returns `true` if ≥50% of non-space characters fall in the target script
 */
export function isTextInTargetLanguageScript(
  text: string,
  targetCode: LangCodeISO6393,
): boolean {
  const scriptRanges = getScriptRanges(targetCode)
  if (!scriptRanges)
    return false // Latin-script targets can't be detected by Unicode alone

  let targetChars = 0
  let totalNonSpaceChars = 0
  for (const char of text) {
    if (/\s/.test(char))
      continue
    totalNonSpaceChars++
    const cp = char.codePointAt(0)!
    if (isCharInRange(cp, scriptRanges))
      targetChars++
  }

  // Skip if majority of non-space chars are in target script
  return totalNonSpaceChars > 0 && targetChars / totalNonSpaceChars >= 0.5
}

function getScriptRanges(code: LangCodeISO6393): number[][] | null {
  // Chinese varieties
  if (code === "cmn" || code === "cmn-Hant" || code === "yue")
    return CJK_RANGES
  // Japanese (CJK + kana)
  if (code === "jpn")
    return [...CJK_RANGES, HIRAGANA_RANGE, KATAKANA_RANGE]
  // Korean (Hangul + CJK)
  if (code === "kor")
    return [...HANGUL_RANGES, ...CJK_RANGES]
  // Thai
  if (code === "tha")
    return [[0x0E00, 0x0E7F]]
  // Arabic
  if (code === "arb")
    return [[0x0600, 0x06FF], [0x0750, 0x077F]]
  // Hindi / Devanagari
  if (code === "hin")
    return [[0x0900, 0x097F]]
  // Russian / Cyrillic
  if (code === "rus")
    return [[0x0400, 0x04FF]]
  // Latin-script languages: can't reliably distinguish by Unicode alone
  return null
}
