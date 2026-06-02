/**
 * Migration script from v072 to v073
 * - Adds selectionTranslation config section.
 * - Converts legacy 302.AI providers to OpenAI-compatible custom providers.
 *
 * IMPORTANT: All values are hardcoded inline. Migration scripts are frozen
 * snapshots — never import constants or helpers that may change.
 */

const NON_API_TRANSLATE_PROVIDERS = ["google-translate", "microsoft-translate", "deeplx", "deepl"]
const NON_API_TRANSLATE_PROVIDER_IDS: Record<string, string> = {
  "google-translate": "google-translate-default",
  "microsoft-translate": "microsoft-translate-default",
  "deeplx": "deeplx-default",
  "deepl": "deepl-default",
}

function resolveSelectionTranslationProviderId(oldConfig: any): string {
  const providersConfig = oldConfig?.providersConfig
  if (!Array.isArray(providersConfig)) {
    return "google-translate-default"
  }

  const providerIds = new Set(providersConfig.map((p: any) => p.id))

  // Prefer google-translate-default if available
  if (providerIds.has("google-translate-default")) {
    return "google-translate-default"
  }

  // Try other non-API translate providers
  for (const [_providerType, defaultId] of Object.entries(NON_API_TRANSLATE_PROVIDER_IDS)) {
    if (providerIds.has(defaultId)) {
      return defaultId
    }
  }

  // Fall back to the existing translate.providerId if it's a valid translate provider
  const translateProviderId = oldConfig?.translate?.providerId
  if (typeof translateProviderId === "string" && providerIds.has(translateProviderId)) {
    const provider = providersConfig.find((p: any) => p.id === translateProviderId)
    if (provider && NON_API_TRANSLATE_PROVIDERS.includes(provider.provider)) {
      return translateProviderId
    }
  }

  // Fall back to any enabled translate provider in providersConfig
  for (const provider of providersConfig) {
    if (provider.enabled && NON_API_TRANSLATE_PROVIDERS.includes(provider.provider)) {
      return provider.id
    }
  }

  // Last resort: use the existing translate.providerId (LLM providers are valid too)
  if (typeof translateProviderId === "string" && providerIds.has(translateProviderId)) {
    return translateProviderId
  }

  // Use first enabled provider that can translate
  for (const provider of providersConfig) {
    if (provider.enabled) {
      return provider.id
    }
  }

  return "google-translate-default"
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined
}

function resolveCustomModel(provider: any): string | null {
  return getNonEmptyString(provider?.model?.customModel)
    ?? getNonEmptyString(provider?.model?.model)
    ?? null
}

function migrateProvider(provider: any): any {
  if (!isRecord(provider) || provider.provider !== "ai302") {
    return provider
  }

  return {
    ...provider,
    provider: "openai-compatible",
    baseURL: getNonEmptyString(provider.baseURL) ?? "https://api.302.ai/v1",
    model: {
      model: "use-custom-model",
      isCustomModel: true,
      customModel: resolveCustomModel(provider),
    },
  }
}

export function migrate(oldConfig: any): any {
  // Migrate 302.AI providers to OpenAI-compatible custom providers
  const providersConfig = Array.isArray(oldConfig?.providersConfig)
    ? oldConfig.providersConfig.map(migrateProvider)
    : oldConfig?.providersConfig

  // Add selectionTranslation config section
  const providerId = resolveSelectionTranslationProviderId(oldConfig)

  return {
    ...oldConfig,
    providersConfig,
    selectionTranslation: {
      enabled: true,
      triggerMode: "toolbar",
      providerId,
      autoPronunciation: false,
      disabledSites: [],
    },
  }
}