import { z } from 'zod';

export const UserProfileSchema = z.object({
    PK: z.string(),
    SK: z.string(),
    username: z.string(),
    displayName: z.string(),
    bio: z.string(),
    followingCount: z.number(),
    followerCount: z.number(),
    postCount: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;