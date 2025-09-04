'use client';
import React from 'react';

interface DesktopHeaderProps {
    activeTab: 'page' | 'journal';
    setActiveTab: (tab: 'page' | 'journal') => void;
    username?: string;
}

const DesktopHeader: React.FC<DesktopHeaderProps> = ({ activeTab, setActiveTab, username }) => {
    return (
        <header className="hidden md:flex bg-[var(--color-baby-powder)] shadow-md backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 justify-between items-center h-16 px-6">
            <div className="flex items-center space-x-10">
                <button
                    className={`text-lg sm:text-xl font-bold cursor-pointer transition hover:-translate-y-0.5 active:translate-y-0.5 duration-200 ${activeTab === "page"
                        ? "text-gray-900"
                        : "text-gray-400 hover:text-gray-900"
                        }`}
                    onClick={() => setActiveTab("page")}
                >
                    Page
                </button>
                <button
                    className={`text-lg sm:text-xl font-bold cursor-pointer transition hover:-translate-y-0.5 active:translate-y-0.5 duration-200 ${activeTab === "journal"
                        ? "text-gray-900"
                        : "text-gray-400 hover:text-gray-900"
                        }`}
                    onClick={() => setActiveTab("journal")}
                >
                    Journal
                </button>
            </div>

            <div className="flex items-center space-x-4">
                <span className="text-sm sm:text-base text-black-600">
                    {username}
                </span>
            </div>
        </header>
    );
};

export default DesktopHeader;