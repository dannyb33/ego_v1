'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    activeTab: 'page' | 'journal';
    setActiveTab: (tab: 'page' | 'journal') => void;
    sidebarContent: React.ReactNode;
    children: React.ReactNode;
}

export default function MainLayout({
    sidebarOpen,
    setSidebarOpen,
    activeTab,
    setActiveTab,
    sidebarContent,
    children
}: MainLayoutProps) {
    const { user, signOut } = useAuth();

    return (
        <div className="flex flex-col min-h-screen">
            {/* Mobile Top Navbar */}
            <header className="w-full flex items-center justify-between bg-[var(--color-bright-pink-crayola)] p-4 shadow-md md:hidden">
                <button
                    className="text-white text-2xl"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    ☰
                </button>
                <h1 className="text-lg sm:text-xl font-bold text-white">My App</h1>
            </header>

            <div className="flex flex-1">
                {/* Sidebar */}
                <aside
                    className={`  
            fixed top-0 left-0 h-full w-64 bg-[var(--color-bright-pink-crayola)]
            shadow-md z-30 p-4 transform transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:relative md:flex-shrink-0
          `}
                >
                    {sidebarContent}
                </aside>

                {/* Mobile overlay when sidebar is open */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col md:ml-64">
                    {/* Desktop Header */}
                    <header className="hidden md:flex bg-[var(--color-baby-powder)] shadow-md backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 justify-between items-center h-16 px-6">
                        <div className="flex items-center space-x-10">
                            <button
                                className={`text-lg sm:text-xl font-bold ${activeTab === "page"
                                        ? "text-gray-900"
                                        : "text-gray-400 hover:text-gray-900"
                                    }`}
                                onClick={() => setActiveTab("page")}
                            >
                                Page
                            </button>
                            <button
                                className={`text-lg sm:text-xl font-bold ${activeTab === "journal"
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
                                {user?.username}
                            </span>
                            <button
                                onClick={signOut}
                                className="bg-[var(--color-eggplant)] text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                                Sign Out
                            </button>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex-1 overflow-auto p-4 sm:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}