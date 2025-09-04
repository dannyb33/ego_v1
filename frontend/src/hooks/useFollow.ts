import { useState, useCallback } from 'react';
import { executeGraphQLQuery } from '@/lib/graphql';
import { FollowedUser, UserProfile } from '@/types';
import { GET_USERS_FOLLOWED } from '@/graphql/queries';
import { FOLLOW_USER, UNFOLLOW_USER } from '@/graphql/mutations';

export const useFollow = () => {
    const [followedList, setFollowedList] = useState<FollowedUser[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFollowedList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const followedData = await executeGraphQLQuery<{ getUsersFollowed: FollowedUser[] }>({
                query: GET_USERS_FOLLOWED
            });
            setFollowedList(followedData.getUsersFollowed);
        } catch (err) {
            setError((err as Error)?.message || 'Failed to fetch following');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleFollowChange = useCallback(async (sub: string, following: boolean) => {
        try {
            if (!following) {
                const followUser = await executeGraphQLQuery<{ followUser: UserProfile }>({
                    query: FOLLOW_USER,
                    variables: { userId: sub }
                });

                const newFollow: FollowedUser = {
                    createdAt: followUser.followUser.createdAt,
                    updatedAt: followUser.followUser.updatedAt,
                    followingUsername: followUser.followUser.username,
                    followingDisplayName: followUser.followUser.displayName,
                    followingSub: followUser.followUser.uuid
                };

                setFollowedList(prev => prev ? [...prev, newFollow] : [newFollow]);
            } else {
                await executeGraphQLQuery<{ unfollowUser: UserProfile }>({
                    query: UNFOLLOW_USER,
                    variables: { userId: sub }
                });

                setFollowedList(prev => prev ? prev.filter(u => u.followingSub !== sub) : []);
            }
        } catch (err) {
            setError((err as Error)?.message || 'Failed to change following status');
            console.error(err);
        }
    }, []);

    const isFollowing = useCallback((userId: string) => {
        return !!(followedList && followedList.some(user => user.followingSub === userId));
    }, [followedList]);

    return {
        followedList,
        loading,
        error,
        fetchFollowedList,
        handleFollowChange,
        isFollowing
    };
};