'use client';
import React from 'react';

interface MobileHeaderProps {
    activeTab: 'page' | 'journal';
    setActiveTab: (tab: 'page' | 'journal') => void;
    username?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ activeTab, setActiveTab, username }) => {
    return (
        <header className="md:hidden flex bg-[var(--color-baby-powder)] shadow-md backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 justify-between items-center h-16 px-6">
            <div className="flex-1 flex justify-center space-x-10">
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

            <div className="flex-shrink-0">
                <span className="text-sm sm:text-base text-black-600">
                    {username}
                </span>
            </div>


        </header>
    );
};

export default MobileHeader;