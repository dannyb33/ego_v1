import { useState, useCallback } from 'react';
import { executeGraphQLQuery } from '@/lib/graphql';
import { UserProfile, PageResponse, Post } from '@/types';
import { GET_USER, GET_PAGE, GET_USER_POSTS } from '@/graphql/queries';

export const useUserData = () => {
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [userPage, setUserPage] = useState<PageResponse | null>(null);
    const [userPosts, setUserPosts] = useState<Post[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUserData = useCallback(async (sub: string) => {
        setLoading(true);
        setError(null);
        try {
            const user = (await executeGraphQLQuery<{ getUser: UserProfile }>({
                query: GET_USER,
                variables: { sub }
            })).getUser;

            const pageData = await executeGraphQLQuery<{ getPage: PageResponse }>({
                query: GET_PAGE,
                variables: { sub: user.uuid }
            });
            setUserPage(pageData.getPage);

            const postsData = await executeGraphQLQuery<{ getUserPosts: Post[] }>({
                query: GET_USER_POSTS,
                variables: { sub: user.uuid }
            });
            setUserPosts(postsData.getUserPosts);

            setSelectedUser(user);
            
        } catch (err) {
            setError((err as Error)?.message || 'Failed to load user data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const clearSelectedUser = useCallback(() => {
        setSelectedUser(null);
        setUserPage(null);
        setUserPosts(null);
        setError(null);
    }, []);

    return {
        selectedUser,
        userPage,
        userPosts,
        loading,
        error,
        fetchUserData,
        clearSelectedUser,
        setSelectedUser
    };
};
