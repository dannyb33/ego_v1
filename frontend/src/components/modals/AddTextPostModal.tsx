'use client';

import React, { useState } from 'react';

interface AddTextPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreatePost: (text: string) => void;
}

export default function AddTextPostModal({
    isOpen,
    onClose,
    onCreatePost
}: AddTextPostModalProps) {
    const [textInput, setTextInput] = useState("");

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (textInput.trim()) {
            onCreatePost(textInput);
            setTextInput(""); // Clear input
            onClose();
        }
    };

    const handleClose = () => {
        setTextInput(""); // Clear input when closing
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
            <div className="bg-[var(--color-baby-powder)] rounded-lg shadow-xl p-6 w-80 flex flex-col space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Post a Text Entry</h2>

                <textarea
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-bright-pink-crayola)]"
                    placeholder="Write your post here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                />

                <button
                    onClick={handleSubmit}
                    className="w-full rounded-lg p-3 bg-[var(--color-bright-pink-crayola)] text-white font-bold hover:bg-[var(--color-eggplant)] transition cursor-pointer shadow-md"
                >
                    Post
                </button>

                <button
                    onClick={handleClose}
                    className="mt-2 text-gray-700 text-sm underline hover:text-gray-900 cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}