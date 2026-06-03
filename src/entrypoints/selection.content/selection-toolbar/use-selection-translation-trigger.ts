import { useAtomValue } from "jotai"
import { useCallback, useEffect, useRef } from "react"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { matchDomainPattern } from "@/utils/url"

const EDITABLE_ELEMENT_SELECTOR = "input, textarea, select, [contenteditable='true'], [contenteditable='plaintext-only']"

const MAX_SHORT_PRESS_MS = 500

function isMacPlatform(): boolean {
  if (typeof navigator === "undefined")
    return false
  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform
    ?? navigator.platform
    ?? ""
  return /mac/i.test(platform)
}

function isEditableElement(element: Element | null): boolean {
  if (!element)
    return false
  return element.closest(EDITABLE_ELEMENT_SELECTOR) !== null
}

function isComposing(): boolean {
  return document.activeElement instanceof Element
    && document.activeElement.closest("[contenteditable]") !== null
    && window.getSelection()?.type === "Caret"
}

function getSelectionAnchorPosition(): { x: number, y: number } | undefined {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0)
    return undefined

  const range = selection.getRangeAt(0)
  const rect = range.getBoundingClientRect()

  if (rect.width === 0 && rect.height === 0)
    return undefined

  return {
    x: rect.left + rect.width / 2 + window.scrollX,
    y: rect.bottom + window.scrollY + 20,
  }
}

export function useSelectionTranslationTrigger(
  openPopover: (anchor?: { x: number, y: number }) => void,
) {
  const selectionTranslation = useAtomValue(configFieldsAtomMap.selectionTranslation)
  const selectionToolbar = useAtomValue(configFieldsAtomMap.selectionToolbar)
  const triggerMode = selectionTranslation.triggerMode
  const modifierStateRef = useRef<{
    pressStartTime: number | null
    companionKeyPressed: boolean
    pointerActivity: boolean
  }>({ pressStartTime: null, companionKeyPressed: false, pointerActivity: false })
  const openPopoverRef = useRef(openPopover)
  openPopoverRef.current = openPopover

  const shouldShowToolbarOnMouseup = triggerMode === "ctrl" || triggerMode === "alt" || triggerMode === "shift" || triggerMode === "meta" || (triggerMode === "toolbar" && selectionToolbar.enabled)

  const canTriggerTranslation = useCallback(() => {
    if (!selectionTranslation.enabled)
      return false
    if (selectionTranslation.disabledSites?.some(pattern =>
      matchDomainPattern(window.location.href, pattern),
    )) {
      return false
    }
    return true
  }, [selectionTranslation.enabled, selectionTranslation.disabledSites])

  const triggerTranslation = useCallback((anchor?: { x: number, y: number }) => {
    const selection = window.getSelection()
    const text = selection?.toString().trim() ?? ""

    if (!text || !canTriggerTranslation())
      return

    const effectiveAnchor = anchor ?? getSelectionAnchorPosition()
    openPopoverRef.current(effectiveAnchor)
  }, [canTriggerTranslation])

  useEffect(() => {
    if (triggerMode === "toolbar" || triggerMode === "direct")
      return

    const modifierKey = triggerMode === "ctrl" ? "Control" : triggerMode === "alt" ? "Alt" : triggerMode === "shift" ? "Shift" : triggerMode === "meta" && isMacPlatform() ? "Meta" : null
    if (!modifierKey)
      return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat)
        return
      if (isEditableElement(document.activeElement))
        return
      if (isComposing())
        return

      if (e.key === modifierKey) {
        // Modifier key pressed — start tracking
        modifierStateRef.current = {
          pressStartTime: Date.now(),
          companionKeyPressed: false,
          pointerActivity: false,
        }
      }
      else if (modifierStateRef.current.pressStartTime !== null) {
        // Another key pressed while modifier is held — mark as companion
        modifierStateRef.current.companionKeyPressed = true
      }
    }

    // Trigger on modifier keyup if short press + no companion + no pointer activity
    const handleKeyUp = (e: KeyboardEvent) => {
      const state = modifierStateRef.current

      if (e.key === modifierKey && state.pressStartTime !== null) {
        const holdDuration = Date.now() - state.pressStartTime

        if (
          !state.companionKeyPressed
          && !state.pointerActivity
          && holdDuration < MAX_SHORT_PRESS_MS
        ) {
          triggerTranslation()
        }

        // Reset state regardless of outcome
        modifierStateRef.current = {
          pressStartTime: null,
          companionKeyPressed: false,
          pointerActivity: false,
        }
      }
      else if (state.pressStartTime !== null && e.key !== modifierKey) {
        // Companion key released while modifier still held — still mark as companion
        modifierStateRef.current.companionKeyPressed = true
      }
    }

    // Mark pointer activity while modifier is held
    const handlePointerActivity = () => {
      if (modifierStateRef.current.pressStartTime !== null) {
        modifierStateRef.current.pointerActivity = true
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("keyup", handleKeyUp)
    document.addEventListener("wheel", handlePointerActivity, { passive: true })
    document.addEventListener("mousedown", handlePointerActivity)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("keyup", handleKeyUp)
      document.removeEventListener("wheel", handlePointerActivity)
      document.removeEventListener("mousedown", handlePointerActivity)
      modifierStateRef.current = { pressStartTime: null, companionKeyPressed: false, pointerActivity: false }
    }
  }, [triggerMode, triggerTranslation])

  return {
    shouldShowToolbarOnMouseup,
    triggerTranslation,
    triggerMode,
  }
}
