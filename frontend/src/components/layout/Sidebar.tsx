'use client';

import React from 'react';
import { UserProfile, FollowedUser } from '@/types';

interface SidebarProps {
    activeMenu: 'default' | 'searchUsers' | 'followedUsers';
    setActiveMenu: (menu: 'default' | 'searchUsers' | 'followedUsers') => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchResults: UserProfile[] | null;
    searchLoading: boolean;
    searchError: string | null;
    followedList: FollowedUser[] | null;
    followedLoading: boolean;
    followedError: string | null;
    selectedUser: UserProfile | null;
    setSelectedUser: (user: UserProfile | null) => void;
    fetchUserData: (sub: string) => void;
    signOut: () => void;
}

export default function Sidebar({
    activeMenu,
    setActiveMenu,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchLoading,
    searchError,
    followedList,
    followedLoading,
    followedError,
    selectedUser,
    setSelectedUser,
    fetchUserData,
    signOut
}: SidebarProps) {
    if (activeMenu === 'searchUsers') {
        return (
            <>
                <button
                    className="text-xl text-black font-bold mb-4 self-start cursor-pointer rounded px-1 hover:bg-[var(--color-baby-powder)] hover:shadow-md transition hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200"
                    onClick={() => setActiveMenu('default')}
                >
                    ←
                </button>
                <input
                    type="text"
                    className="text-[var(--color-raisin-black)] w-full border rounded px-3 py-2 text-sm mb-4 bg-[var(--color-baby-powder)]"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <div className="flex-1 overflow-auto pt-2">
                    {searchLoading && <p className="text-[var(--color-raisin-black)] px-1 text-md mb-4">Searching...</p>}
                    {!searchLoading && searchResults?.length === 0 && searchQuery && <p className="text-[var(--color-raisin-black)] px-1 text-md">No users found.</p>}
                    {searchError && <p className="text-[var(--color-raisin-black)] text-sm">{searchError}</p>}
                    {searchResults?.map((u) => (
                        <div
                            key={u.uuid}
                            className="border-b bg-[var(--color-baby-powder)] mb-4 border-[var(--color-raisin-black)] py-2 px-2 hover:bg-gray-100 rounded cursor-pointer shadow-md transition hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200"
                            onClick={() => fetchUserData(u.uuid)}
                        >
                            <p className={`text-black ${selectedUser?.uuid === u.uuid ? "font-bold" : "font-medium"}`}>
                                {u.displayName}
                            </p>
                            <p className="text-sm text-gray-500">
                                @{u.username}
                            </p>
                        </div>
                    ))}
                </div>
            </>
        );
    }

    if (activeMenu === 'followedUsers') {
        return (
            <>
                <button
                    className="text-[var(--color-raisin-black)] text-xl font-bold mb-4 self-start cursor-pointer rounded px-1 hover:bg-[var(--color-baby-powder)] hover:shadow-md transition hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200"
                    onClick={() => setActiveMenu('default')}
                >
                    ←
                </button>

                <div className="flex-1 overflow-auto pt-2">
                    {followedLoading && <p className="text-[var(--color-raisin-black)] text-sm mb-4 drop-shadow-sm">Loading...</p>}
                    {!followedLoading && followedList?.length === 0 && <p className="px-1 text-black-500 text-md drop-shadow-sm">No followed users.</p>}
                    {followedError && <p className="text-[var(--color-raisin-black)] text-sm">{followedError}</p>}
                    {followedList?.map((u) => (
                        <div
                            key={u.followingSub}
                            className="border-b bg-[var(--color-baby-powder)] mb-4 border-[var(--color-raisin-black)] py-2 px-2 hover:bg-gray-100 rounded cursor-pointer shadow-md transition hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200"
                            onClick={() => fetchUserData(u.followingSub)}
                        >
                            <p className={`text-black ${selectedUser?.uuid === u.followingSub ? "font-bold" : "font-medium"}`}>
                                {u.followingDisplayName}
                            </p>
                            <p className="text-sm text-gray-500">
                                @{u.followingUsername}
                            </p>
                        </div>
                    ))}
                </div>
            </>
        );
    }

    return (
        <>
            <h2 className="text-2xl font-bold text-[var(--color-baby-powder)] drop-shadow-md mb-6">Menu</h2>
            <ul className="space-y-2 text-black text-md flex-1">
                <li
                    className={`hover:bg-[var(--color-baby-powder)] hover:shadow-md rounded p-2 cursor-pointer transition hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200 ${activeMenu === "default" && !selectedUser ? "bg-[var(--color-baby-powder)] font-bold shadow-md" : ""
                        }`}
                    onClick={() => {
                        setActiveMenu('default');
                        setSelectedUser(null);
                    }}
                >
                    Your Page
                </li>
                <li
                    className="hover:bg-[var(--color-baby-powder)] hover:shadow-md rounded p-2 cursor-pointer transition hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200"
                    onClick={() => setActiveMenu('followedUsers')}
                >
                    Following
                </li>
                <li
                    className="hover:bg-[var(--color-baby-powder)] hover:shadow-md rounded p-2 cursor-pointer transition hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200"
                    onClick={() => setActiveMenu('searchUsers')}
                >
                    Search Users
                </li>
            </ul>

            
            {/* Sign Out button at bottom */}
            <div className="mt-4">
                <button
                    onClick={signOut}
                    className="w-full bg-[var(--color-eggplant)] text-white px-3 py-2 rounded text-sm hover:bg-[var(--color-raisin-black)] transition hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                    Sign Out
                </button>
            </div>
        </>
    );
}