import { describe, expect, it } from "vitest"
import { migrate } from "../../migration-scripts/v072-to-v073"

describe("v072-to-v073 migration", () => {
  it("adds selectionTranslation config section", () => {
    const migrated = migrate({
      translate: {
        providerId: "openai-default",
      },
      providersConfig: [
        {
          id: "openai-default",
          enabled: true,
          provider: "openai",
        },
      ],
    })

    expect(migrated.selectionTranslation).toEqual({
      enabled: true,
      triggerMode: "toolbar",
      providerId: "openai-default",
      autoPronunciation: false,
      disabledSites: [],
    })
  })

  it("prefers google-translate-default when available", () => {
    const migrated = migrate({
      translate: {
        providerId: "openai-default",
      },
      providersConfig: [
        {
          id: "openai-default",
          enabled: true,
          provider: "openai",
        },
        {
          id: "google-translate-default",
          enabled: true,
          provider: "google-translate",
        },
      ],
    })

    expect(migrated.selectionTranslation.providerId).toBe("google-translate-default")
  })

  it("falls back to existing translate.providerId when no non-API translate provider exists", () => {
    const migrated = migrate({
      translate: {
        providerId: "google-default",
      },
      providersConfig: [
        {
          id: "google-default",
          enabled: true,
          provider: "google",
        },
      ],
    })

    expect(migrated.selectionTranslation.providerId).toBe("google-default")
  })

  it("preserves existing config keys", () => {
    const migrated = migrate({
      language: {
        sourceCode: "eng",
        targetCode: "cmn",
      },
    })

    expect(migrated.language).toEqual({
      sourceCode: "eng",
      targetCode: "cmn",
    })
  })

  it("converts a default 302.AI provider to an OpenAI-compatible custom provider", () => {
    const migrated = migrate({
      providersConfig: [
        {
          id: "ai302-default",
          name: "302.AI",
          enabled: true,
          provider: "ai302",
          apiKey: "302-key",
          baseURL: "https://api.302.ai/v1",
          temperature: 0.2,
          headers: { "x-test": "enabled" },
          providerOptions: { reasoning_effort: "low" },
          model: {
            model: "gpt-4.1-mini",
            isCustomModel: true,
            customModel: null,
          },
        },
      ],
    })

    expect(migrated.providersConfig[0]).toEqual({
      id: "ai302-default",
      name: "302.AI",
      enabled: true,
      provider: "openai-compatible",
      apiKey: "302-key",
      baseURL: "https://api.302.ai/v1",
      temperature: 0.2,
      headers: { "x-test": "enabled" },
      providerOptions: { reasoning_effort: "low" },
      model: {
        model: "use-custom-model",
        isCustomModel: true,
        customModel: "gpt-4.1-mini",
      },
    })
  })

  it("prefers an existing custom model when converting 302.AI", () => {
    const migrated = migrate({
      providersConfig: [
        {
          id: "ai302-custom",
          name: "302.AI Custom",
          enabled: true,
          provider: "ai302",
          model: {
            model: "gpt-4.1-mini",
            isCustomModel: true,
            customModel: "qwen3-235b-a22b",
          },
        },
      ],
    })

    expect(migrated.providersConfig[0]).toEqual({
      id: "ai302-custom",
      name: "302.AI Custom",
      enabled: true,
      provider: "openai-compatible",
      baseURL: "https://api.302.ai/v1",
      model: {
        model: "use-custom-model",
        isCustomModel: true,
        customModel: "qwen3-235b-a22b",
      },
    })
  })

  it("leaves non-302 providers unchanged", () => {
    const openAIProvider = {
      id: "openai-default",
      name: "OpenAI",
      enabled: true,
      provider: "openai",
      model: {
        model: "gpt-5-mini",
        isCustomModel: false,
        customModel: null,
      },
    }
    const migrated = migrate({
      providersConfig: [openAIProvider],
    })

    expect(migrated.providersConfig[0]).toBe(openAIProvider)
  })

  it("preserves malformed config shapes as much as possible", () => {
    expect(migrate({}).selectionTranslation).toEqual({
      enabled: true,
      triggerMode: "toolbar",
      providerId: "google-translate-default",
      autoPronunciation: false,
      disabledSites: [],
    })
    expect(migrate({ providersConfig: null })).toEqual({ providersConfig: null, selectionTranslation: { enabled: true, triggerMode: "toolbar", providerId: "google-translate-default", autoPronunciation: false, disabledSites: [] } })
    expect(migrate({ providersConfig: ["bad-provider"] })).toEqual({ providersConfig: ["bad-provider"], selectionTranslation: { enabled: true, triggerMode: "toolbar", providerId: "google-translate-default", autoPronunciation: false, disabledSites: [] } })
  })
})