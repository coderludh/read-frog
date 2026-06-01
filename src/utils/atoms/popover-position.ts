import type { PopoverFixedPositionStorage } from "@/types/popover-position"
import { atom } from "jotai"
import { popoverFixedPositionSchema } from "@/types/popover-position"
import { POPOVER_FIXED_POSITION_STORAGE_KEY } from "../constants/config"
import { logger } from "../logger"
import { storageAdapter } from "./storage-adapter"

const DEFAULT_POPOVER_FIXED_POSITION: PopoverFixedPositionStorage = null

export const basePopoverFixedPositionAtom = atom<PopoverFixedPositionStorage>(DEFAULT_POPOVER_FIXED_POSITION)

export const popoverFixedPositionAtom = atom(
  get => get(basePopoverFixedPositionAtom),
  async (get, set, newValue: PopoverFixedPositionStorage) => {
    const prev = get(basePopoverFixedPositionAtom)
    set(basePopoverFixedPositionAtom, newValue)
    try {
      await storageAdapter.set(POPOVER_FIXED_POSITION_STORAGE_KEY, newValue, popoverFixedPositionSchema)
    }
    catch (error) {
      console.error("Failed to set popoverFixedPosition to storage:", newValue, error)
      set(basePopoverFixedPositionAtom, prev)
    }
  },
)

basePopoverFixedPositionAtom.onMount = (setAtom: (newValue: PopoverFixedPositionStorage) => void) => {
  void storageAdapter.get<PopoverFixedPositionStorage>(
    POPOVER_FIXED_POSITION_STORAGE_KEY,
    DEFAULT_POPOVER_FIXED_POSITION,
    popoverFixedPositionSchema,
  ).then(setAtom).catch((error) => {
    logger.error("basePopoverFixedPositionAtom initial storage load failed", error)
  })
  const unwatch = storageAdapter.watch<PopoverFixedPositionStorage>(
    POPOVER_FIXED_POSITION_STORAGE_KEY,
    setAtom,
  )

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      void storageAdapter.get<PopoverFixedPositionStorage>(
        POPOVER_FIXED_POSITION_STORAGE_KEY,
        DEFAULT_POPOVER_FIXED_POSITION,
        popoverFixedPositionSchema,
      ).then(setAtom).catch((error) => {
        logger.error("basePopoverFixedPositionAtom visibility change storage reload failed", error)
      })
    }
  }
  document.addEventListener("visibilitychange", handleVisibilityChange)

  return () => {
    unwatch()
    document.removeEventListener("visibilitychange", handleVisibilityChange)
  }
}
