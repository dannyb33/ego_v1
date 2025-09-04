'use client';

import React from 'react';

interface AddComponentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddComponent: (type: string) => void;
}

export default function AddComponentModal({
    isOpen,
    onClose,
    onAddComponent
}: AddComponentModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
            <div className="bg-[var(--color-baby-powder)] rounded-lg shadow-xl p-6 w-80 flex flex-col space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Add a Component</h2>

                <button
                    onClick={() => {
                        onAddComponent('BIO')
                        onClose();
                    }}
                    className="w-full rounded-lg p-4 bg-[var(--color-bright-pink-crayola)] text-white font-bold hover:bg-[var(--color-eggplant)] transition cursor-pointer shadow-md"
                >
                    Add Bio Component
                </button>

                <button
                    onClick={() => {
                        onAddComponent('TEXT')
                        onClose();
                    }}
                    className="w-full rounded-lg p-4 bg-[var(--color-bright-pink-crayola)] text-white font-bold hover:bg-[var(--color-eggplant)] transition cursor-pointer shadow-md"
                >
                    Add Text Component
                </button>

                <button
                    onClick={onClose}
                    className="mt-2 text-gray-700 text-sm underline hover:text-gray-900 cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}