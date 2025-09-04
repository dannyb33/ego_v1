import { z } from 'zod';
import { BaseDBSchema } from "../utils/global-types";


export const BasePostSchema = BaseDBSchema.extend({
    username: z.string(),
    displayName: z.string(),
    postType: z.string(),
});

export const TextPostSchema = BasePostSchema.extend({
    text: z.string()
});

export const ImagePostSchema = BasePostSchema.extend({
    imageUrl: z.string(),
    text: z.string()
});


export type BasePost = z.infer<typeof BasePostSchema>;
export type TextPost = z.infer<typeof TextPostSchema>;
export type ImagePost = z.infer<typeof ImagePostSchema>;