'use client';

import React from 'react';
import ComponentRenderer from '@/components/page/ComponentRenderer';
import { PageResponse, UserProfile, FollowedUser, ComponentUpdate } from '@/types';
import AddComponentModal from '../modals/AddComponentModal';

interface PageContentProps {
    currentPage: PageResponse | null;
    selectedUser: UserProfile | null;
    followedList: FollowedUser[] | null;
    customizerOpen: boolean;
    componentMenuOpen: boolean;
    onDeleteComponent: (id: string) => void;
    onEditComponent: (componentId: string, updates: ComponentUpdate) => void;
    toggleComponentMenu: () => void;
    onAddComponent: (id: string) => void;
    onToggleCustomizer: () => void;
    onFollowChange: (sub: string, following: boolean) => void;
}

export default function PageContent({
    currentPage,
    selectedUser,
    followedList,
    customizerOpen,
    componentMenuOpen,
    onDeleteComponent,
    onEditComponent,
    toggleComponentMenu,
    onAddComponent,
    onToggleCustomizer,
    onFollowChange
}: PageContentProps) {
    if (!currentPage) return <p>No page data.</p>;

    const sortedComponents = [...currentPage.components].sort((a, b) => a.order - b.order);
    const pageOwner = selectedUser ? selectedUser.displayName + "'s" : 'Your';
    const isFollowing = !!(selectedUser && followedList && followedList.some(user => user.followingSub === selectedUser.uuid));

    return (
        <div>
            <div className="flex items-center space-x-4 mb-2">
                <div className="text-gray-700 py-2 font-bold">{pageOwner} Page</div>

                {selectedUser && (
                    <button
                        className={`group rounded-lg shadow-md w-24 font-bold transition cursor-pointer px-4 py-1
                      flex justify-center items-center transition hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200
                        ${isFollowing
                                ? "bg-[var(--color-celeste)] text-gray-900 hover:bg-[var(--color-bright-pink-crayola)]"
                                : "bg-[var(--color-bright-pink-crayola)] text-gray-900 hover:bg-[var(--color-celeste)]"
                            }`}
                        onClick={() => onFollowChange(selectedUser.uuid, isFollowing)}
                    >
                        {!isFollowing ? (
                            "Follow"
                        ) : (
                            <>
                                <span className="group-hover:hidden">Following</span>
                                <span className="hidden group-hover:inline">Unfollow</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {sortedComponents.length > 0 ? (
                <div className="space-y-4">
                    {sortedComponents.map((c) => (
                        <ComponentRenderer
                            key={c.uuid}
                            component={c}
                            customizerOpen={customizerOpen}
                            onDelete={() => onDeleteComponent(c.uuid)}
                            onEdit={(componentId: string, updates: ComponentUpdate) => onEditComponent(componentId, updates)}
                        />
                    ))}
                </div>
            ) : (
                <p className="mb-4">No components yet.</p>
            )}

            {customizerOpen && (
                <button
                    onClick={toggleComponentMenu}
                    className="w-full rounded-lg shadow-md p-6 mb-4 bg-[var(--color-baby-powder)] border-2 text-gray-900 text-center font-bold hover:bg-gray-200 transition cursor-pointer">
                    Add a component!
                </button>
            )}

            {!selectedUser && (
                <button
                    className={`
                        fixed bottom-6 right-6 
                        w-20 h-20 
                        rounded-full
                        ${customizerOpen ? "bg-[var(--color-eggplant)]" : "bg-[var(--color-bright-pink-crayola)]"}
                        text-white text-4xl font-bold leading-none 
                        flex items-center justify-center
                        shadow-lg 
                        hover:bg-[var(--color-celeste)] hover:text-[var(--color-bright-pink-crayola)] 
                        hover:-translate-y-1 active:translate-y-0.5 
                        transition-all duration-200
                        cursor-pointer
                    `}
                    onClick={onToggleCustomizer}
                >
                    <span className="drop-shadow-lg relative -top-0.5">{customizerOpen ? "×" : "+"}</span>
                </button>
            )}

            <AddComponentModal
                isOpen={componentMenuOpen}
                onClose={toggleComponentMenu}
                onAddComponent={onAddComponent}
            />
            
        </div>
    );
}