import React from 'react';
import { TITLE, SUBTITLE, COLORS } from '../constants';

interface HeaderProps {
    onAdminClick: () => void;
    isAdmin: boolean;
    onAdminLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAdminClick, isAdmin, onAdminLogout }) => {
    return (
        <header className="w-full text-center p-6 md:p-8" style={{ backgroundColor: COLORS.primary, color: COLORS.white }}>
            <div className="relative">
                <h1 className="text-2xl md:text-4xl font-bold mb-2">{TITLE}</h1>
                <p className="text-sm md:text-base">{SUBTITLE}</p>
                <div className="absolute top-0 right-0 hidden md:block">
                    {isAdmin ? (
                        <button onClick={onAdminLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            로그아웃
                        </button>
                    ) : (
                        <button onClick={onAdminClick} className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            관리자
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;