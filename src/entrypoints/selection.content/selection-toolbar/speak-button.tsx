import type { LangCodeISO6393 } from "@read-frog/definitions"
import { i18n } from "#imports"
import { IconLoader2, IconPlayerStopFilled, IconVolume } from "@tabler/icons-react"
import { useAtomValue } from "jotai"
import { useCallback } from "react"
import { toast } from "sonner"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { ANALYTICS_SURFACE } from "@/types/analytics"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { resolveLanguageCodeFromLocale } from "@/utils/content/page-language"
import { SelectionToolbarTooltip, useSelectionTooltipState } from "../components/selection-tooltip"
import { selectionContentAtom, selectionToolbarTranslateRequestAtom } from "./atoms"

/**
 * Resolve source language for TTS voice selection.
 * When sourceCode is "auto", falls back to the page's declared language
 * from <html lang="...">, which is far more reliable than franc detection
 * on individual short words.
 */
function resolveSourceLanguage(sourceCode: string): LangCodeISO6393 | null {
  if (sourceCode !== "auto") {
    return sourceCode as LangCodeISO6393
  }

  // Use page's declared language as a reliable proxy for selected text language
  return resolveLanguageCodeFromLocale(document.documentElement.lang)
}

export function SpeakButton() {
  const selectionContent = useAtomValue(selectionContentAtom)
  const ttsConfig = useAtomValue(configFieldsAtomMap.tts)
  const translateRequest = useAtomValue(selectionToolbarTranslateRequestAtom)
  const sourceLanguage = resolveSourceLanguage(translateRequest.language.sourceCode)
  const { play, stop, isFetching, isPlaying } = useTextToSpeech(ANALYTICS_SURFACE.SELECTION_TOOLBAR)
  const isBusy = isFetching || isPlaying
  const { handlePress, onOpenChange: handleTooltipOpenChange, open: tooltipOpen } = useSelectionTooltipState()

  const handleClick = useCallback(async () => {
    if (isBusy) {
      handlePress()
      stop()
      return
    }

    if (!selectionContent) {
      toast.error(i18n.t("speak.noTextSelected"))
      return
    }

    handlePress()
    void play(selectionContent, ttsConfig, { sourceLanguage })
  }, [handlePress, isBusy, play, selectionContent, stop, ttsConfig, sourceLanguage])

  const tooltipText = isFetching
    ? i18n.t("speak.fetchingAudio")
    : isPlaying
      ? i18n.t("action.playing")
      : i18n.t("action.speak")

  return (
    <SelectionToolbarTooltip
      content={tooltipText}
      open={tooltipOpen}
      onOpenChange={handleTooltipOpenChange}
      render={(
        <button
          type="button"
          className="px-2 h-7 flex items-center justify-center hover:bg-accent cursor-pointer"
          onClick={handleClick}
          aria-label={tooltipText}
        />
      )}
    >
      {isFetching
        ? (
            <IconLoader2 className="size-4.5 animate-spin" strokeWidth={1.6} />
          )
        : isPlaying
          ? (
              <IconPlayerStopFilled className="size-4.5" strokeWidth={1.6} />
            )
          : (
              <IconVolume className="size-4.5" strokeWidth={1.6} />
            )}
    </SelectionToolbarTooltip>
  )
}
