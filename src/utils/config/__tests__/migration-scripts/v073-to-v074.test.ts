// @vitest-environment jsdom
import { describe, expect, it } from "vitest"
import { migrate } from "../../migration-scripts/v073-to-v074"

describe("v073-to-v074 migration", () => {
  it("adds skipTargetLanguage to selectionTranslation", () => {
    const oldConfig = {
      selectionTranslation: {
        enabled: true,
        triggerMode: "toolbar",
        providerId: "google-translate-default",
        autoPronunciation: false,
        disabledSites: [],
      },
    }

    const result = migrate(oldConfig)

    expect(result.selectionTranslation.skipTargetLanguage).toBe(true)
  })

  it("preserves existing selectionTranslation fields", () => {
    const oldConfig = {
      selectionTranslation: {
        enabled: true,
        triggerMode: "meta",
        providerId: "openai-default",
        autoPronunciation: true,
        disabledSites: ["example.com"],
      },
    }

    const result = migrate(oldConfig)

    expect(result.selectionTranslation.enabled).toBe(true)
    expect(result.selectionTranslation.triggerMode).toBe("meta")
    expect(result.selectionTranslation.providerId).toBe("openai-default")
    expect(result.selectionTranslation.autoPronunciation).toBe(true)
    expect(result.selectionTranslation.disabledSites).toEqual(["example.com"])
  })

  it("handles missing selectionTranslation gracefully", () => {
    const oldConfig = {}

    const result = migrate(oldConfig)

    expect(result.selectionTranslation.skipTargetLanguage).toBe(true)
  })

  it("preserves all other config fields", () => {
    const oldConfig = {
      language: { sourceCode: "auto", targetCode: "cmn" },
      selectionTranslation: {
        enabled: true,
        triggerMode: "toolbar",
      },
      translate: { mode: "bilingual" },
    }

    const result = migrate(oldConfig)

    expect(result.language.sourceCode).toBe("auto")
    expect(result.translate.mode).toBe("bilingual")
  })
})
