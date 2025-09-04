'use client';

import React from 'react';
import { PostRenderer } from '@/components/page/PostRenderer';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { Post, UserProfile } from '@/types';
import AddTextPostModal from '../modals/AddTextPostModal';
import { text } from 'stream/consumers';
import AddImagePostModal from '../modals/AddImagePostModal';

interface JournalContentProps {
    currentPosts: Post[] | null;
    selectedUser: UserProfile | null;
    postMenuOpen: boolean;
    textPostMenuOpen: boolean;
    imagePostMenuOpen: boolean;
    onTogglePostMenu: () => void;
    onToggleTextPostModal: () => void;
    onToggleImagePostModal: () => void;
    onCreateTextPost: (text: string) => void;
    onCreateImagePost: (file: File, text?: string) => void;
}

export default function JournalContent({
    currentPosts,
    selectedUser,
    postMenuOpen,
    textPostMenuOpen,
    imagePostMenuOpen,
    onTogglePostMenu,
    onToggleTextPostModal,
    onToggleImagePostModal,
    onCreateTextPost,
    onCreateImagePost
}: JournalContentProps) {
    const pageOwner = selectedUser ? selectedUser.displayName + "'s" : 'Your';

    return (
        <div>
            {(!currentPosts || currentPosts.length === 0) && (
                <div>
                    <div className="mb-4 text-gray-700 font-bold">{pageOwner} Journal</div>
                    <p>No posts.</p>
                </div>
            )}

            {currentPosts && (
                <div className="space-y-4">
                    {currentPosts.map((post) => (
                        <PostRenderer key={post.uuid} post={post} />
                    ))}
                </div>
            )}

            {!selectedUser && (
                <FloatingActionButton isOpen={postMenuOpen} onClick={onTogglePostMenu}>
                    <button
                        className="w-28 px-4 py-2 rounded-lg bg-[var(--color-bright-pink-crayola)] text-white font-bold shadow-md hover:bg-[var(--color-celeste)] hover:text-[var(--color-bright-pink-crayola)] transition hover:-translate-y-1 active:translate-y-0.5 transition-all duration-200 cursor-pointer"
                        onClick={onToggleTextPostModal}
                    >
                        Text Post
                    </button>
                    <button
                        className="w-28 px-4 py-2 rounded-lg bg-[var(--color-bright-pink-crayola)] text-white font-bold shadow-md hover:bg-[var(--color-celeste)] hover:text-[var(--color-bright-pink-crayola)] transition hover:-translate-y-1 active:translate-y-0.5 transition-all duration-200 cursor-pointer"
                        onClick={onToggleImagePostModal}
                    >
                        Image Post
                    </button>
                </FloatingActionButton>
            )}

            <AddTextPostModal
                isOpen={textPostMenuOpen}
                onClose={() => {
                    onToggleTextPostModal();
                    onTogglePostMenu();
                }}
                onCreatePost={onCreateTextPost}
            />

            <AddImagePostModal
                isOpen={imagePostMenuOpen}
                onClose={() => {
                    onToggleImagePostModal();
                    onTogglePostMenu();
                }}
                onCreatePost={onCreateImagePost}
            />

        </div>
    );
}