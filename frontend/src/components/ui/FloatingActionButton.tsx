'use client';

import React from 'react';

interface FloatingActionButtonProps {
    isOpen: boolean;
    onClick: () => void;
    children?: React.ReactNode;
}

export default function FloatingActionButton({
    isOpen,
    onClick,
    children
}: FloatingActionButtonProps) {
    return (
        <div className="fixed bottom-6 right-6">
            <div className="relative flex flex-col items-center">
                {/* Menu options positioned above the button */}
                {isOpen && children && (
                    <div className="absolute bottom-full mb-2 flex flex-col items-center space-y-2">
                        {children}
                    </div>
                )}

                {/* Main circle button */}
                <button
                    className={`
            w-20 h-20 rounded-full 
            ${isOpen ? "bg-[var(--color-eggplant)]" : "bg-[var(--color-bright-pink-crayola)]"} 
            text-white text-4xl font-bold leading-none 
            flex items-center justify-center
            shadow-lg 
            hover:bg-[var(--color-celeste)] hover:text-[var(--color-bright-pink-crayola)] 
            hover:-translate-y-1 active:translate-y-0.5 
            transition-all duration-200
            cursor-pointer
          `}
                    onClick={onClick}
                >
                    <span className="drop-shadow-lg relative -top-0.5">{isOpen ? "×" : "+"}</span>
                </button>
            </div>
        </div>
    );
}