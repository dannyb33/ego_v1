'use client'

import React, { useState } from 'react';

interface AddImagePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreatePost: (file: File, text?: string) => void;
}

export default function AddImagePostModal({
    isOpen,
    onClose,
    onCreatePost
}: AddImagePostModalProps) {
    const [textInput, setTextInput] = useState("");
    const [fileInput, setFileInput] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFileInput(e.target.files[0]);
            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = () => {
        if (fileInput) {
            if (textInput.trim()) {
                onCreatePost(fileInput, textInput);
                setTextInput("");
            }
            else {
                onCreatePost(fileInput);
            }
            setFileInput(null);
            setPreviewUrl(null);
            onClose();
        }
    };

    const handleClose = () => {
        setTextInput("");
        setFileInput(null);
        setPreviewUrl(null);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
            <div className="bg-[var(--color-baby-powder)] rounded-lg shadow-xl p-6 w-80 flex flex-col space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
                    Post an Image
                </h2>

                <textarea
                    className="w-full h-15 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-bright-pink-crayola)]"
                    placeholder="Write your post here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                />

                <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="
                        w-full text-sm text-gray-700
                        file:mr-3 file:py-2 file:px-3 
                        file:rounded-lg file:border-0
                        file:bg-[var(--color-bright-pink-crayola)]
                        file:text-white file:cursor-pointer
                        file:hover:file:bg-[var(--color-eggplant)]
                        transition hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200 cursor-pointer
                    "
                />

                {previewUrl && (
                    <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg shadow-md"
                    />
                )}

                <button
                    onClick={handleSubmit}
                    disabled={!fileInput}
                    className="disabled:opacity-50 w-full rounded-lg p-3 bg-[var(--color-bright-pink-crayola)] 
                     text-white font-bold hover:bg-[var(--color-eggplant)] 
                     transition hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-200 cursor-pointer shadow-md disabled:opacity-50"
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