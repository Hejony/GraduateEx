
export interface Booking {
  id: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:mm format
  name: string;
  message: string;
  password?: string;
}

export interface TimeSlotInfo {
    date: Date;
    time: string;
}

export type ModalState =
  | { type: 'closed' }
  | { type: 'booking'; data: { slotInfo: TimeSlotInfo; bookingToEdit?: Booking } }
  | { type: 'admin' }
  | { type: 'confirmDelete'; data: { bookingId: string; passwordAttempt: string } };
