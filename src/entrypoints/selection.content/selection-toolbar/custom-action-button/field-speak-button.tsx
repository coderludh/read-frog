import type { LangCodeISO6393 } from "@read-frog/definitions"
import { i18n } from "#imports"
import { IconLoader2, IconPlayerStopFilled, IconVolume } from "@tabler/icons-react"
import { useAtomValue } from "jotai"
import { useCallback } from "react"
import { buttonVariants } from "@/components/ui/base-ui/button"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"
import { ANALYTICS_SURFACE } from "@/types/analytics"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { cn } from "@/utils/styles/utils"
import { SelectionPopoverTooltip, useSelectionTooltipState } from "../../components/selection-tooltip"

/** Resolve source language for TTS voice selection. Returns null for "auto". */
function resolveSourceLanguage(sourceCode: string): LangCodeISO6393 | null {
  return sourceCode === "auto" ? null : sourceCode as LangCodeISO6393
}

export function FieldSpeakButton({
  text,
  disabled,
}: {
  text: string
  disabled: boolean
}) {
  const { handlePress, onOpenChange: handleTooltipOpenChange, open: tooltipOpen } = useSelectionTooltipState()
  const ttsConfig = useAtomValue(configFieldsAtomMap.tts)
  const languageConfig = useAtomValue(configFieldsAtomMap.language)
  const sourceLanguage = resolveSourceLanguage(languageConfig.sourceCode)
  const { play, stop, isFetching, isPlaying } = useTextToSpeech(ANALYTICS_SURFACE.SELECTION_TOOLBAR)

  const handleClick = useCallback(() => {
    if (disabled) {
      return
    }

    if (isFetching || isPlaying) {
      handlePress()
      stop()
      return
    }

    handlePress()
    void play(text, ttsConfig, { sourceLanguage })
  }, [disabled, handlePress, isFetching, isPlaying, play, stop, text, ttsConfig, sourceLanguage])

  const tooltipText = isFetching
    ? i18n.t("speak.fetchingAudio")
    : isPlaying
      ? i18n.t("action.playing")
      : i18n.t("action.speak")

  const icon = isFetching
    ? <IconLoader2 className="animate-spin" />
    : isPlaying
      ? <IconPlayerStopFilled />
      : <IconVolume />

  return (
    <SelectionPopoverTooltip
      content={tooltipText}
      open={tooltipOpen}
      onOpenChange={handleTooltipOpenChange}
      render={(
        <button
          type="button"
          className={cn(buttonVariants({ variant: "ghost-secondary", size: "icon-xs" }), "text-muted-foreground")}
          onClick={handleClick}
          aria-label={tooltipText}
          disabled={disabled}
        />
      )}
    >
      {icon}
    </SelectionPopoverTooltip>
  )
}
