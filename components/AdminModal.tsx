
import React, { useState } from 'react';
import { ADMIN_PASSWORD, COLORS } from '../constants';

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            onLoginSuccess();
            onClose();
            setPassword('');
            setError('');
        } else {
            setError('비밀번호가 올바르지 않습니다.');
        }
    };
    
    const handleClose = () => {
        setPassword('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={handleClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b">
                    <h2 className="text-xl font-bold text-gray-800">관리자 로그인</h2>
                </div>
                <form onSubmit={handleLogin} className="p-5">
                    <div className="mb-4">
                        <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                        <input
                            type="password"
                            id="admin-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">취소</button>
                        <button type="submit" className="px-4 py-2 text-white rounded-md hover:opacity-90" style={{ backgroundColor: COLORS.primary }}>로그인</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminModal;
