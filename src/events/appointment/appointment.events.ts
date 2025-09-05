export interface AppointmentScheduledEvent {
  appointmentId: string;
  userId: string;
  sellerId: string;
  packageId: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  timestamp: Date;
}

export const APPOINTMENT_EVENTS = {
  SCHEDULED: 'appointment.scheduled',
  CANCELLED: 'appointment.cancelled',
  COMPLETED: 'appointment.completed',
} as const;
