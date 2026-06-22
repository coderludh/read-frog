import type { ThinkingSnapshot } from "@/types/background-stream"
import { IconLoader2 } from "@tabler/icons-react"
import { Activity } from "react"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Thinking } from "@/components/thinking"
import { CopyButton } from "../../components/copy-button"
import { SelectionSourceContent } from "../../components/selection-source-content"
import { SpeakButton } from "../../components/speak-button"

export type TranslationMode = "translate" | "dictionary"

interface TranslationContentProps {
  selectionContent: string | null | undefined
  translatedText: string | undefined
  isTranslating: boolean
  thinking: ThinkingSnapshot | null
  /** "dictionary" renders the word-explain Markdown; "translate" renders plain text. */
  mode?: TranslationMode
}

export function TranslationContent({
  selectionContent,
  translatedText,
  isTranslating,
  thinking,
  mode = "translate",
}: TranslationContentProps) {
  const showLoadingIndicator = isTranslating && !thinking && !translatedText
  const showStreamingIndicator = isTranslating && !thinking && translatedText
  const isDictionaryMode = mode === "dictionary"
  return (
    <div className="p-4">
      <SelectionSourceContent text={selectionContent} separatorClassName="mb-3" />
      <div className="space-y-2">
        {thinking && (
          <Thinking status={thinking.status} content={thinking.text} />
        )}
        {isDictionaryMode && translatedText
          ? (
              <MarkdownRenderer content={translatedText} />
            )
          : (
              <p className="text-sm whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                {showLoadingIndicator && <IconLoader2 className="inline size-4 animate-spin" strokeWidth={1.6} />}
                {translatedText}
                {showStreamingIndicator && " ●"}
              </p>
            )}
        <Activity mode={translatedText ? "visible" : "hidden"}>
          <div className="flex items-center gap-1">
            <CopyButton text={translatedText} />
            <SpeakButton text={translatedText} />
          </div>
        </Activity>
      </div>
    </div>
  )
}
