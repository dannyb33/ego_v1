import { useState, useCallback } from 'react';

export const useAppState = () => {
    const [activeTab, setActiveTab] = useState<'page' | 'journal'>('page');
    const [customizerOpen, setCustomizerOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState<'default' | 'searchUsers' | 'followedUsers'>('default');

    // Modal states
    const [componentMenuOpen, setComponentMenuOpen] = useState(false);
    const [postMenuOpen, setPostMenuOpen] = useState(false);
    const [addTextPostMenuOpen, setAddTextPostMenuOpen] = useState(false);
    const [addImagePostMenuOpen, setAddImagePostMenuOpen] = useState(false);
    // const [textInput, setTextInput] = useState('');

    const toggleCustomizer = useCallback(() => {
        setCustomizerOpen(prev => !prev);
    }, []);

    const closeAllMenus = useCallback(() => {
        setComponentMenuOpen(false);
        setPostMenuOpen(false);
        setAddTextPostMenuOpen(false);
        setAddImagePostMenuOpen(false);
        setCustomizerOpen(false);
    }, []);

    const switchTab = useCallback((tab: 'page' | 'journal') => {
        setActiveTab(tab);
        closeAllMenus();
    }, [closeAllMenus]);

    return {
        // Tab and navigation state
        activeTab,
        setActiveTab: switchTab,
        customizerOpen,
        setCustomizerOpen,
        toggleCustomizer,
        sidebarOpen,
        setSidebarOpen,
        activeMenu,
        setActiveMenu,

        // Modal states
        componentMenuOpen,
        setComponentMenuOpen,
        postMenuOpen,
        setPostMenuOpen,

        addTextPostMenuOpen,
        setAddTextPostMenuOpen,

        addImagePostMenuOpen,
        setAddImagePostMenuOpen,

        // textInput,
        // setTextInput,

        // Utility functions
        closeAllMenus
    };
};