import React, { useState, useEffect, useCallback } from 'react';
import type { Booking, TimeSlotInfo, ModalState } from './types';
import { CALENDAR_DATES, TIME_SLOTS, MAX_BOOKINGS_PER_SLOT, COLORS } from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import AdminModal from './components/AdminModal';
import ConfirmationModal from './components/ConfirmationModal';

const App: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [modalState, setModalState] = useState<ModalState>({ type: 'closed' });

    useEffect(() => {
        try {
            const storedBookings = localStorage.getItem('bookings');
            if (storedBookings) {
                setBookings(JSON.parse(storedBookings));
            }
        } catch (error) {
            console.error("예약 정보를 불러오는 데 실패했습니다:", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('bookings', JSON.stringify(bookings));
        } catch (error) {
            console.error("예약 정보를 저장하는 데 실패했습니다:", error);
        }
    }, [bookings]);
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const handleSaveBooking = useCallback((bookingData: Omit<Booking, 'id'> & { id?: string }) => {
        if (bookingData.id) { // Update
            setBookings(prev => prev.map(b => b.id === bookingData.id ? { ...b, name: bookingData.name, message: bookingData.message, password: bookingData.password } : b));
        } else { // Create
            const newBooking: Booking = {
                ...bookingData,
                id: new Date().toISOString() + Math.random(),
            };
            setBookings(prev => [...prev, newBooking]);
        }
        setModalState({ type: 'closed' });
    }, []);

    const handleDeleteBookingRequest = useCallback((bookingId: string, passwordAttempt: string) => {
        const bookingToDelete = bookings.find(b => b.id === bookingId);
        if (bookingToDelete?.password === passwordAttempt) {
            setModalState({ type: 'confirmDelete', data: { bookingId, passwordAttempt } });
        } else {
            alert('비밀번호가 일치하지 않아 삭제할 수 없습니다.');
        }
    }, [bookings]);
    
    const confirmDeleteBooking = useCallback(() => {
        if (modalState.type !== 'confirmDelete') return;
        const { bookingId, passwordAttempt } = modalState.data;
        const bookingToDelete = bookings.find(b => b.id === bookingId);
        if (bookingToDelete && bookingToDelete.password === passwordAttempt) {
            setBookings(prev => prev.filter(b => b.id !== bookingId));
        }
        setModalState({ type: 'closed' });
    }, [bookings, modalState]);


    const renderTimeSlot = (date: Date, time: string) => {
        const dateString = formatDate(date);
        const bookingsForSlot = bookings.filter(b => b.date === dateString && b.time === time);
        const isFull = bookingsForSlot.length >= MAX_BOOKINGS_PER_SLOT;

        const handleSlotClick = () => {
            if (!isFull) {
                setModalState({ type: 'booking', data: { slotInfo: { date, time } } });
            }
        };

        const handleBookingClick = (booking: Booking) => {
            setModalState({ type: 'booking', data: { slotInfo: { date, time }, bookingToEdit: booking } });
        };

        return (
            <div key={time} className="flex border-t border-gray-200">
                <div className="w-20 md:w-24 flex-shrink-0 p-2 md:p-3 bg-gray-100 text-sm md:text-base text-gray-600 text-center flex items-center justify-center">
                    {time}
                </div>
                <div
                    className={`flex-grow p-2 md:p-3 min-h-[60px] ${!isFull ? 'cursor-pointer hover:bg-blue-50' : 'bg-gray-50'}`}
                    onClick={handleSlotClick}
                >
                    <div className="flex flex-wrap gap-2">
                        {bookingsForSlot.map(booking => (
                            <div
                                key={booking.id}
                                onClick={(e) => { e.stopPropagation(); handleBookingClick(booking); }}
                                className="px-3 py-1 rounded-full text-sm font-semibold cursor-pointer transition-transform transform hover:scale-105"
                                style={{ backgroundColor: isAdmin ? COLORS.secondary : COLORS.primary, color: COLORS.white }}
                            >
                                {isAdmin ? `${booking.name} (${booking.message.substring(0, 10)}...)` : booking.name}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-16 md:w-20 flex-shrink-0 p-2 md:p-3 text-sm text-center flex items-center justify-center" style={{color: isFull ? 'red' : COLORS.secondary}}>
                    {`${bookingsForSlot.length}/${MAX_BOOKINGS_PER_SLOT}`}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-50">
            <Header isAdmin={isAdmin} onAdminClick={() => setModalState({ type: 'admin' })} onAdminLogout={() => setIsAdmin(false)}/>
            <main className="w-full max-w-7xl mx-auto p-4 md:p-8 flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {CALENDAR_DATES.map(date => (
                        <div key={date.toString()} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                            <h3 className="text-center font-bold text-lg p-3" style={{ backgroundColor: COLORS.secondary, color: COLORS.white }}>
                                {new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }).format(date)}
                            </h3>
                            <div>
                                {TIME_SLOTS.map(time => renderTimeSlot(date, time))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            
            <div className="w-full p-4 md:hidden">
                {isAdmin ? (
                    <button 
                        onClick={() => setIsAdmin(false)} 
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        로그아웃
                    </button>
                ) : (
                    <button 
                        onClick={() => setModalState({ type: 'admin' })} 
                        className="w-full text-white font-bold py-3 px-4 rounded-lg transition-colors hover:opacity-90"
                        style={{ backgroundColor: COLORS.primary }}
                    >
                        관리자
                    </button>
                )}
            </div>

            <Footer />

            {modalState.type === 'booking' && (
                <BookingModal
                    isOpen={true}
                    onClose={() => setModalState({ type: 'closed' })}
                    slotInfo={modalState.data.slotInfo}
                    existingBooking={modalState.data.bookingToEdit}
                    bookingsForSlot={bookings.filter(b => b.date === formatDate(modalState.data.slotInfo.date) && b.time === modalState.data.slotInfo.time)}
                    onSave={handleSaveBooking}
                    onDelete={handleDeleteBookingRequest}
                    isAdmin={isAdmin}
                />
            )}
            
            {modalState.type === 'admin' && (
                <AdminModal
                    isOpen={true}
                    onClose={() => setModalState({ type: 'closed' })}
                    onLoginSuccess={() => setIsAdmin(true)}
                />
            )}

            {modalState.type === 'confirmDelete' && (
                <ConfirmationModal
                    isOpen={true}
                    onClose={() => setModalState({ type: 'closed' })}
                    onConfirm={confirmDeleteBooking}
                    title="예약 삭제 확인"
                    message="정말로 이 예약을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
                />
            )}
        </div>
    );
};

export default App;