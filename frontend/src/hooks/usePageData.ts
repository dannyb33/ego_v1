import { ADD_COMPONENT, DELETE_COMPONENT, EDIT_COMPONENT } from "@/graphql/mutations";
import { GET_CURRENT_PAGE } from "@/graphql/queries";
import { executeGraphQLQuery } from "@/lib/graphql";
import { AnyComponent, ComponentUpdate, PageResponse } from "@/types";
import { useCallback, useState } from "react";

export const usePageData = () => {

    const [pageData, setPageData] = useState<PageResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updateCache, setUpdateCache] = useState<Record<string, ComponentUpdate> | null>(null);

    const fetchCurrentPage = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await executeGraphQLQuery<{ getCurrentPage: PageResponse }>({ query: GET_CURRENT_PAGE });
            setPageData(data.getCurrentPage);
        } catch (err) {
            const errorMessage = (err as Error)?.message || 'Failed to fetch page';
            console.error(err)
        } finally {
            setLoading(false);
        }
    }, []);

    const addComponent = useCallback(async (type: string) => {
        setLoading(true);
        try {
            const componentData = await executeGraphQLQuery<{ addPageComponent: AnyComponent }>({
                query: ADD_COMPONENT,
                variables: { type }
            });

            setPageData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    components: [...prev.components, componentData.addPageComponent],
                    componentCount: prev.componentCount + 1,
                };
            });
        } catch (err) {
            setError((err as Error)?.message || 'Failed to add component');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteComponent = useCallback(async (id: string) => {
        setLoading(true);
        try {
            const componentData = await executeGraphQLQuery<{ removePageComponent: AnyComponent }>({
                query: DELETE_COMPONENT,
                variables: { componentId: id }
            });

            setPageData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    components: prev.components.filter(c => c.uuid !== componentData.removePageComponent.uuid),
                    componentCount: prev.componentCount - 1,
                };
            });
        } catch (err) {
            setError((err as Error)?.message || 'Failed to delete component');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const editComponent = useCallback(async (id: string, updates: ComponentUpdate) => {
        setLoading(true);
        try {
            const componentData = await executeGraphQLQuery<{ editPageComponent: AnyComponent }>({
                query: EDIT_COMPONENT,
                variables: { componentId: id, updates }
            });

            setPageData(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    components: prev.components.map(c =>
                        c.uuid === componentData.editPageComponent.uuid ? componentData.editPageComponent : c
                    ),
                };
            });
        } catch (err) {
            setError((err as Error)?.message || 'Failed to edit component');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const editUpdateCache = useCallback((componentId: string, update: ComponentUpdate) => {
        setUpdateCache(prev => {
            if (prev === null) {
                return { [componentId]: update };
            }
            return {
                ...prev,
                [componentId]: {
                    ...prev[componentId],
                    ...update
                }
            };
        });
    }, []);

    const applyUpdateCache = useCallback(async () => {
        if (updateCache && pageData) {
            for (const [id, updates] of Object.entries(updateCache)) {
                if (pageData.components.some(c => c.uuid === id)) {
                    await editComponent(id, updates);
                }
            }
            setUpdateCache(null);
        }
    }, [updateCache, pageData, editComponent]);


    return {
        pageData,
        loading,
        error,
        updateCache,
        fetchCurrentPage,
        addComponent,
        deleteComponent,
        editComponent,
        editUpdateCache,
        applyUpdateCache
    };

};