import { useState, useCallback, useEffect } from 'react';
import { executeGraphQLQuery } from '@/lib/graphql';
import { UserProfile } from '@/types';
import { SEARCH_USERS } from '@/graphql/queries';
import { useAuth } from '@/contexts/AuthContext';

export const useUserSearch = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserProfile[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSearchResults = useCallback(async (query: string) => {
        if (!query) {
            setSearchResults(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await executeGraphQLQuery<{ searchUsers: UserProfile[] }>({
                query: SEARCH_USERS,
                variables: { query }
            });

            setSearchResults(data.searchUsers.filter(currUser => currUser.uuid !== user?.userId));
        } catch (err) {
            setError((err as Error)?.message || 'Failed to fetch users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user?.userId]);

    // Debounce search input
    useEffect(() => {
        const delay = setTimeout(() => fetchSearchResults(searchQuery), 300);
        return () => clearTimeout(delay);
    }, [searchQuery, fetchSearchResults]);

    return {
        searchQuery,
        setSearchQuery,
        searchResults,
        loading,
        error
    };
};