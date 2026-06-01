import z from "zod"

export interface PopoverFixedPosition {
  xRatio: number
  yRatio: number
  widthRatio: number
}

export const popoverFixedPositionSchema = z.object({
  xRatio: z.number().min(0).max(1),
  yRatio: z.number().min(0).max(1),
  widthRatio: z.number().min(0).max(1),
}).nullable()

export type PopoverFixedPositionStorage = z.infer<typeof popoverFixedPositionSchema>
