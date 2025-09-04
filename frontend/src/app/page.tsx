'use client'
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DesktopHeader from "@/components/layout/DesktopHeader";
import MobileHeader from "@/components/layout/MobileHeader";
import Sidebar from "@/components/layout/Sidebar";
import JournalContent from "@/components/page/JournalContent";
import PageContent from "@/components/page/PageContent";
import { useAuth } from "@/contexts/AuthContext";
import { useAppState } from "@/hooks/useAppState";
import { useFollow } from "@/hooks/useFollow";
import { usePageData } from "@/hooks/usePageData";
import { usePosts } from "@/hooks/usePosts";
import { useUserData } from "@/hooks/useUserData";
import { useUserSearch } from "@/hooks/useUserSearch";
import { sign } from "crypto";
import { useCallback, useEffect } from "react";

function MainPageContent() {
    const { user, signOut } = useAuth();

    const pageHook = usePageData();
    const postsHook = usePosts();
    const searchHook = useUserSearch();
    const userHook = useUserData();
    const followHook = useFollow();
    const stateHook = useAppState();

    useEffect(() => {
        stateHook.closeAllMenus();

        if (stateHook.activeTab === 'page') {
            pageHook.fetchCurrentPage();
        } else if (stateHook.activeTab === 'journal') {
            postsHook.fetchPosts();
        }
    }, [stateHook.activeTab]);

    useEffect(() => {
        if (
            ['followedUsers', 'searchUsers'].includes(stateHook.activeMenu) &&
            followHook.followedList === null &&
            !followHook.loading
        ) {
            followHook.fetchFollowedList();
        }
    }, [stateHook.activeMenu, followHook.followedList, followHook.loading]);

    const handleCustomizerState = useCallback(async () => {
        if (!stateHook.customizerOpen) {
            stateHook.setCustomizerOpen(true);
            return;
        }

        if (pageHook.updateCache) {
            await pageHook.applyUpdateCache();
        }

        stateHook.setCustomizerOpen(false);
    }, [stateHook.customizerOpen, pageHook.updateCache, pageHook.applyUpdateCache]);


    return (
        <div className="relative h-screen flex">
            {/* Sidebar */}
            <aside
                className={`
                    fixed md:static top-0 left-0 h-full w-64 bg-[var(--color-bright-pink-crayola)] shadow-md text-white p-4 flex flex-col transition-transform duration-300 z-50
                    ${stateHook.sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                `}
            >
                <Sidebar
                    activeMenu={stateHook.activeMenu}
                    setActiveMenu={stateHook.setActiveMenu}
                    searchQuery={searchHook.searchQuery}
                    setSearchQuery={searchHook.setSearchQuery}
                    searchResults={searchHook.searchResults}
                    searchLoading={searchHook.loading}
                    searchError={searchHook.error}
                    followedList={followHook.followedList}
                    followedLoading={followHook.loading}
                    followedError={followHook.error}
                    selectedUser={userHook.selectedUser}
                    setSelectedUser={userHook.setSelectedUser}
                    fetchUserData={userHook.fetchUserData}
                    signOut={signOut}
                />
            </aside>

            {/* Main area (header + content) */}
            <div className="flex-1 flex flex-col">
                {/* Desktop header */}
                <div>
                    <DesktopHeader
                        activeTab={stateHook.activeTab}
                        setActiveTab={stateHook.setActiveTab}
                        username={user?.username}
                    />
                </div>

                {/* Mobile Header */}
                <div>
                    <MobileHeader
                        activeTab={stateHook.activeTab}
                        setActiveTab={stateHook.setActiveTab}
                        username={user?.username}
                    />
                </div>

                {/* Main content */}
                <main className="flex-1 overflow-auto p-4">
                    {/* Page or Journal content goes here */}
                    {stateHook.activeTab == 'page' && (
                        <PageContent
                            currentPage={
                                userHook.selectedUser
                                    ? userHook.userPage
                                    : pageHook.pageData
                            }
                            selectedUser={userHook.selectedUser}
                            followedList={followHook.followedList}
                            customizerOpen={stateHook.customizerOpen}
                            onDeleteComponent={pageHook.deleteComponent}
                            onEditComponent={pageHook.editUpdateCache}
                            toggleComponentMenu={() => stateHook.setComponentMenuOpen(!stateHook.componentMenuOpen)}
                            onAddComponent={pageHook.addComponent}
                            componentMenuOpen={stateHook.componentMenuOpen}
                            onToggleCustomizer={handleCustomizerState}
                            onFollowChange={followHook.handleFollowChange}
                        />
                    )}
                    {stateHook.activeTab == 'journal' && (
                        <JournalContent
                            currentPosts={
                                userHook.selectedUser
                                ? userHook.userPosts
                                : postsHook.posts
                            }
                            selectedUser={userHook.selectedUser}
                            postMenuOpen={stateHook.postMenuOpen}
                            textPostMenuOpen={stateHook.addTextPostMenuOpen}
                            onTogglePostMenu={() => stateHook.setPostMenuOpen(!stateHook.postMenuOpen)}
                            toggleTextPostModal={() => stateHook.setAddTextPostMenuOpen(!stateHook.addTextPostMenuOpen)}
                            onOpenImagePostModal={() => stateHook.setAddTextPostMenuOpen(!stateHook.addTextPostMenuOpen)}
                            onCreateTextPost={postsHook.createTextPost}
                        />
                    )}

                </main>
            </div>

            {/* Mobile hamburger */}
            {!stateHook.sidebarOpen && (
                <button
                    className="absolute top-3 left-4 z-50 w-10 h-10 bg-[var(--color-bright-pink-crayola)] text-white rounded-md md:hidden cursor-pointer shadow-md transition hover:-translate-y-0.5 active:translate-y-0.5 duration-200"
                    onClick={() => stateHook.setSidebarOpen(true)}
                >
                    ☰
                </button>
            )}

            {/* Mobile overlay */}
            {stateHook.sidebarOpen && (
                <div
                    className="fixed inset-0 md:hidden z-40 bg-black/40"
                    onClick={() => stateHook.setSidebarOpen(false)}
                />
            )}


        </div>
    );
}

export default function Home() {
    return (
        <ProtectedRoute>
            <MainPageContent />
        </ProtectedRoute>
    );
}