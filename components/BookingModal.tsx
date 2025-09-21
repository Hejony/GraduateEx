import React, { useState, useEffect } from 'react';
import type { Booking, TimeSlotInfo } from '../types';
import { MAX_BOOKINGS_PER_SLOT, COLORS } from '../constants';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    slotInfo: TimeSlotInfo | null;
    existingBooking?: Booking;
    bookingsForSlot: Booking[];
    onSave: (booking: Omit<Booking, 'id'> & { id?: string }) => void;
    onDelete: (bookingId: string, passwordAttempt: string) => void;
    isAdmin: boolean;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, slotInfo, existingBooking, bookingsForSlot, onSave, onDelete, isAdmin }) => {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);

    const isEditing = !!existingBooking;

    useEffect(() => {
        if (existingBooking) {
            setName(existingBooking.name);
            // Admin sees message immediately. Non-admin must verify.
            setMessage(isAdmin ? existingBooking.message : '');
        } else {
            // New booking
            setName('');
            setMessage('');
        }
        setPassword('');
        setError('');
        // Admin is auto-verified for editing.
        setIsPasswordVerified(isAdmin && isEditing);
    }, [isOpen, existingBooking, isAdmin]);

    if (!isOpen || !slotInfo) return null;

    const isSlotFull = !isEditing && bookingsForSlot.length >= MAX_BOOKINGS_PER_SLOT;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('이름을 입력해주세요.');
            return;
        }
        if (!password) {
            setError('수정/삭제를 위한 비밀번호를 입력해주세요.');
            return;
        }

        const bookingData = {
            id: existingBooking?.id,
            date: slotInfo.date.toISOString().split('T')[0],
            time: slotInfo.time,
            name: name.trim(),
            message: message.trim(),
            password,
        };
        
        if (isEditing && existingBooking?.password !== password) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        onSave(bookingData);
        onClose();
    };

    const handleDelete = () => {
        if (!existingBooking) return;
        if (!password) {
            setError('삭제를 위해 비밀번호를 입력해주세요.');
            return;
        }
        onDelete(existingBooking.id, password);
    };

    const handlePasswordCheck = () => {
        if (existingBooking?.password === password) {
            setIsPasswordVerified(true);
            setMessage(existingBooking.message); // Show the message after verification
            setError('');
        } else {
            setError('비밀번호가 일치하지 않습니다.');
        }
    };
    
    const formattedDate = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(slotInfo.date);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b" style={{ backgroundColor: COLORS.primary, color: COLORS.white }}>
                    <h2 className="text-2xl font-bold">{isEditing ? '예약 수정' : '방문 예약'}</h2>
                    <p className="text-white/80">{formattedDate} {slotInfo.time}</p>
                </div>

                <div className="p-6">
                    {isSlotFull && !isEditing && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                            <p className="font-bold">예약 마감</p>
                            <p>이 시간대는 예약이 모두 찼습니다.</p>
                        </div>
                    )}

                    {isEditing && isAdmin && (
                         <div className="mb-4 bg-gray-100 p-4 rounded-md">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">방명록 메시지 (관리자 전용):</label>
                            <p className="text-gray-900 whitespace-pre-wrap">{existingBooking.message || '메시지가 없습니다.'}</p>
                        </div>
                    )}
                    
                    {(!isSlotFull || isEditing) && (
                        <form onSubmit={handleSubmit}>
                             <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                    readOnly={isAdmin || (isEditing && !isAdmin && !isPasswordVerified)}
                                />
                            </div>
                            
                            {(!isEditing || isAdmin || (isEditing && !isAdmin && isPasswordVerified)) && !isAdmin && (
                                <div className="mb-4">
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">메시지 (선택)</label>
                                    <textarea
                                        id="message"
                                        rows={3}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="관리자에게만 보이는 메시지입니다."
                                    />
                                </div>
                            )}

                            {!isAdmin && (
                                <div className="mb-6">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="예약 수정/삭제 시 필요합니다"
                                        required
                                    />
                                </div>
                            )}
                            
                            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                            
                            <div className="flex justify-end items-center gap-3">
                                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">취소</button>
                               
                                {!isAdmin && (
                                    <>
                                        {isEditing ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={handleDelete}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                                >
                                                    삭제
                                                </button>
                                                {!isPasswordVerified ? (
                                                    <button
                                                        type="button"
                                                        onClick={handlePasswordCheck}
                                                        className="px-4 py-2 text-white rounded-md hover:opacity-90" style={{ backgroundColor: COLORS.primary }}
                                                    >
                                                        수정하기
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="submit"
                                                        className="px-4 py-2 text-white rounded-md hover:opacity-90" style={{ backgroundColor: COLORS.primary }}
                                                    >
                                                        수정 완료
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <button type="submit" className="px-4 py-2 text-white rounded-md hover:opacity-90" style={{ backgroundColor: COLORS.primary }}>
                                                예약하기
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingModal;