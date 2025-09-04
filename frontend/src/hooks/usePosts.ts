import { useState, useCallback } from 'react';
import { executeGraphQLQuery } from '@/lib/graphql';
import { Post, TextPost } from '@/types';
import { GET_CURRENT_POSTS } from '@/graphql/queries';
import { CREATE_TEXT_POST } from '@/graphql/mutations';

export const usePosts = () => {
    const [posts, setPosts] = useState<Post[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await executeGraphQLQuery<{ getCurrentPosts: Post[] }>({
                query: GET_CURRENT_POSTS
            });
            setPosts(data.getCurrentPosts);
        } catch (err) {
            setError((err as Error)?.message || 'Failed to load posts');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createTextPost = useCallback(async (text: string) => {
        try {
            const newPost = await executeGraphQLQuery<{ createTextPost: TextPost }>({
                query: CREATE_TEXT_POST,
                variables: { text }
            });

            setPosts(prev => prev ? [newPost.createTextPost, ...prev] : [newPost.createTextPost]);
        } catch (err) {
            setError((err as Error)?.message || 'Failed to create text post');
            console.error(err);
        }
    }, []);

    return {
        posts,
        loading,
        error,
        fetchPosts,
        createTextPost
    };
};