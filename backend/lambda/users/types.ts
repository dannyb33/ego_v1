import { z } from 'zod';
import { BaseDBSchema } from '../utils/global-types';

export const UserProfileSchema = BaseDBSchema.extend({
    GSI1PK: z.string(),
    GSI1SK: z.string(),
    username: z.string(),
    displayName: z.string(),
    bio: z.string(),
    followingCount: z.number(),
    followerCount: z.number(),
    postCount: z.number(),
    entityType: z.literal("PROFILE"),
});

export const PageSchema = BaseDBSchema.extend({
    sectionCount: z.number(),
    backgroundType: z.enum(['COLOR', 'IMAGE']),
    backgroundColor: z.string(),
    backgroundImage: z.string().optional(),
    font: z.string(),
    entityType: z.literal("PAGE"),
});

export const BaseComponentSchema = BaseDBSchema.extend({
    componentType: z.string(),
    order: z.number(),
});

export const TextComponentSchema = BaseComponentSchema.extend({
    font: z.string(),
    backgroundColor: z.string(),
    text: z.string().default("Default Text")
});

export const BioComponentSchema = BaseComponentSchema.extend({
    username: z.string(),
    displayName: z.string(),
    bio: z.string(),
    followingCount: z.number(),
    followerCount: z.number(),
    postCount: z.number()
});

export const ComponentUpdateSchema = z.object({
    font: z.string(),
    backgroundColor: z.string(),
    text: z.string()
});

export const FollowingSchema = BaseDBSchema.extend({
    followingUsername: z.string(),
    followingDisplayName: z.string(),
    followingSub: z.string()
});

export const FollowerSchema = BaseDBSchema.extend({
    followerUsername: z.string(),
    followerDisplayName: z.string(),
    followerSub: z.string()
})

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Page = z.infer<typeof PageSchema>;

export type BaseComponent = z.infer<typeof BaseComponentSchema>;
export type BioComponent = z.infer<typeof BioComponentSchema>;
export type TextComponent = z.infer<typeof TextComponentSchema>;

export type Component = BaseComponent | BioComponent | TextComponent;
export type ComponentType = ["BIO", "TEXT"]
export type ComponentUpdateInput = z.infer<typeof ComponentUpdateSchema>;

export const ComponentSchemas: Record<string, z.ZodTypeAny> = {
    BIO: BioComponentSchema,
    TEXT: TextComponentSchema
}

export type FollowingObject = z.infer<typeof FollowingSchema>;
export type FollowerObject = z.infer<typeof FollowerSchema>;