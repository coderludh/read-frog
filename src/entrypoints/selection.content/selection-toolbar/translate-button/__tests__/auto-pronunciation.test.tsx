// @vitest-environment jsdom
import { describe, expect, it } from "vitest"
import { DEFAULT_CONFIG } from "@/utils/constants/config"

describe("auto-pronunciation", () => {
  it("autoPronunciation defaults to false in config", () => {
    expect(DEFAULT_CONFIG.selectionTranslation.autoPronunciation).toBe(false)
  })

  it("autoPronunciation field exists in selectionTranslation config", () => {
    expect("autoPronunciation" in DEFAULT_CONFIG.selectionTranslation).toBe(true)
  })
})

describe("skipTargetLanguage", () => {
  it("skipTargetLanguage defaults to true in config", () => {
    expect(DEFAULT_CONFIG.selectionTranslation.skipTargetLanguage).toBe(true)
  })

  it("skipTargetLanguage field exists in selectionTranslation config", () => {
    expect("skipTargetLanguage" in DEFAULT_CONFIG.selectionTranslation).toBe(true)
  })
})
