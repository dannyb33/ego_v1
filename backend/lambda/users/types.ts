import { z } from 'zod';
import { BaseDBSchema } from '../utils/global-types';

export const UserProfileSchema = BaseDBSchema.extend({
    username: z.string(),
    displayName: z.string(),
    bio: z.string(),
    followingCount: z.number(),
    followerCount: z.number(),
    postCount: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
    entityType: z.literal("PROFILE"),
});

export const PageSchema = BaseDBSchema.extend({
    sectionCount: z.number(),
    backgroundType: z.enum(['color', 'image']),
    backgroundColor: z.string(),
    backgroundImage: z.string().optional(),
    font: z.string(),
    entityType: z.literal("PAGE"),
});

export const SectionSchema = BaseDBSchema.extend({
    componentCount: z.number(),
    hasTitle: z.boolean(),
    title: z.string().default("Title"),
    orderIndex: z.number(),
    entityType: z.literal("SECTION")
})

export const BaseComponentSchema = BaseDBSchema.extend({
    GSI1PK: z.string(),
    GSI1SK: z.string(),
    componentType: z.string(),
    orderInSection: z.number(),
})

export const TextComponentSchema = BaseComponentSchema.extend({
    font: z.string(),
    backgroundColor: z.string(),
    text: z.string().default("Default Text")
})

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type Page = z.infer<typeof PageSchema>;