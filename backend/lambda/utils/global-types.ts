import { z } from 'zod';

export const DEFAULT_SECTIONS = 3;
export const DEFAULT_FONT = "Inter";
export const DEFAULT_COLOR = "#FFFFFF"

export const BaseDBSchema = z.object({
    PK: z.string(),
    SK: z.string(),
    entityType: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});