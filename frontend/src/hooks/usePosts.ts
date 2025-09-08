import { useState, useCallback } from 'react';
import { executeGraphQLQuery } from '@/lib/graphql';
import { ContentType, ImagePost, Post, TextPost, UploadUrl } from '@/types';
import { GET_CURRENT_POSTS, GET_UPLOAD_URL } from '@/graphql/queries';
import { CREATE_IMAGE_POST, CREATE_TEXT_POST } from '@/graphql/mutations';
import { create } from 'domain';

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

    const createImagePost = useCallback(async (file: File, text?: string) => {
        try {
            const fileType = mimeToEnum[file.type];

            if (!text) {
                text = ""
            }

            if (!fileType) {
                throw new Error("Invalid file type: only PNG or JPEG are allowed")
            }

            console.log(file);

            const { getUploadUrl } = await executeGraphQLQuery<{ getUploadUrl: UploadUrl }>({
                query: GET_UPLOAD_URL,
                variables: {
                    fileName: file.name,
                    contentType: fileType
                }
            });

            console.log(getUploadUrl);

            console.log(await fetch(getUploadUrl.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file
            }));

            const newPost = await executeGraphQLQuery<{ createImagePost: ImagePost}>({
                query: CREATE_IMAGE_POST,
                variables: {imageUrl: getUploadUrl.imageUrl, text: text },
            });

            console.log(newPost);

            setPosts(prev => prev ? [newPost.createImagePost, ...prev] : [newPost.createImagePost]);

        } catch (err) {
            setError((err as Error)?.message || 'Failed to create image post');
            console.error(err);
        }
    }, []);

    return {
        posts,
        loading,
        error,
        fetchPosts,
        createTextPost,
        createImagePost
    };
};

const mimeToEnum: Record<string, string> = {
    "image/jpeg": "JPEG",
    "image/png": "PNG",
};