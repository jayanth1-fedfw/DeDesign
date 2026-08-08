import { z } from 'zod';

export const ZoneSchema = z.object({
  id: z.string(),
  label: z.enum(['headline', 'body', 'image', 'cta', 'footer', 'logo']),
  source: z.enum(['ocr', 'contour']),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  confidence: z.number().min(0).max(1),
  text: z.string().optional(),
});

export const StepSchema = z.object({
  order: z.number().int().positive(),
  instruction: z.string(),
});

export const AnalysisResponseSchema = z.object({
  canvas_size_guess: z.object({
    width: z.number(),
    height: z.number(),
    aspect_ratio: z.string(),
  }),
  layout_style: z.enum(['centered', 'grid', 'asymmetric', 'full-bleed']),
  estimated_font_style: z.object({
    headline: z.string(),
    body: z.string(),
  }),
  zones: z.array(ZoneSchema),
  steps: z.array(StepSchema),
});
