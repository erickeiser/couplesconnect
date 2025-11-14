
import React from 'react';

interface HeaderProps {
    onLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
    return (
        <header className="py-4 px-6 md:px-8 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div 
                    className="flex items-center space-x-3 cursor-pointer"
                    onClick={onLogoClick}
                >
                    <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tighter text-white">
                        Couples <span className="text-purple-400">Connect</span>
                    </h1>
                </div>
            </div>
        </header>
    );
};
