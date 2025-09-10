import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

@Injectable()
export class DatetimeService {
  private timezone = 'Europe/Istanbul';

  setTimezone(timezone: string) {
    this.timezone = timezone;
  }

  /**
   * Get current date and time in ISO format (UTC)
   * @returns Current date in format: 2025-09-01T08:15:00.000Z
   */
  getNowISO(): string {
    return new Date().toISOString();
  }

  /**
   * Get current date and time in ISO format for a specific timezone
   * @param timezone - Timezone string (e.g., 'Europe/Istanbul')
   * @returns Current date in ISO format for the specified timezone
   */
  getNowISOInTimezone(timezone: string): string {
    const result = DateTime.now().setZone(timezone).toISO();
    if (!result) {
      throw new Error(`Failed to get current time in timezone: ${timezone}`);
    }
    return result;
  }

  /**
   * Get current date and time in ISO format for the default timezone
   * @returns Current date in ISO format for the default timezone
   */
  getNowISOInDefaultTimezone(): string {
    const result = DateTime.now().setZone(this.timezone).toISO();
    if (!result) {
      throw new Error(
        `Failed to get current time in default timezone: ${this.timezone}`,
      );
    }
    return result;
  }

  /**
   * Parse a time string in a specific timezone and convert to UTC
   * @param timeString - Time string in format 'YYYY-MM-DDTHH:mm:ss'
   * @param timezone - Timezone string (e.g., 'Europe/Istanbul')
   * @returns UTC ISO string
   */
  parseTimeInTimezoneToUTC(timeString: string, timezone: string): string {
    const localTime = DateTime.fromISO(timeString, { zone: timezone });

    if (!localTime.isValid) {
      throw new Error(
        `Invalid time format: ${timeString}. Expected format: YYYY-MM-DDTHH:mm:ss`,
      );
    }

    return localTime.toUTC().toISO();
  }

  parseTimeInTimezoneToDateTime(
    timeString: string,
    timezone: string,
  ): DateTime {
    const localTime = DateTime.fromISO(timeString, { zone: timezone });
    return localTime;
  }

  /**
   * Calculate end time in a specific timezone and convert to UTC
   * @param startTimeString - Start time string in format 'YYYY-MM-DDTHH:mm:ss'
   * @param timezone - Timezone string (e.g., 'Europe/Istanbul')
   * @param durationMinutes - Duration in minutes
   * @returns UTC ISO string
   */
  calculateEndTimeInTimezoneToUTC(
    startTimeString: string,
    timezone: string,
    durationMinutes: number,
  ): string {
    const startTimeLocal = DateTime.fromISO(startTimeString, {
      zone: timezone,
    });

    if (!startTimeLocal.isValid) {
      throw new Error(
        `Invalid start time format: ${startTimeString}. Expected format: YYYY-MM-DDTHH:mm:ss`,
      );
    }

    const endTimeLocal = startTimeLocal.plus({ minutes: durationMinutes });
    return endTimeLocal.toUTC().toISO();
  }

  /**
   * Get timezone from country code or name
   * @param countryCode - Country code (e.g., 'TR')
   * @returns Timezone string
   */
  getTimezoneFromCountry(countryCode: string): string {
    const timezoneMap: Record<string, string> = {
      TR: 'Europe/Istanbul',
      US: 'America/New_York',
      GB: 'Europe/London',
      DE: 'Europe/Berlin',
      FR: 'Europe/Paris',
      // Add more countries as needed
    };

    return timezoneMap[countryCode] || 'UTC';
  }

  /**
   * Convert a time slot (dayDate + hour) to UTC from a specific timezone
   * @param timeSlot - Object with dayDate (YYYY-MM-DD) and hour (HH:MM)
   * @param timezone - Timezone string (e.g., 'Europe/Istanbul')
   * @returns UTC ISO string
   */
  convertTimeSlotToUTC(
    timeSlot: { dayDate: string; hour: string },
    timezone: string,
  ): string {
    const { dayDate, hour } = timeSlot;

    // Validate input format
    if (!dayDate || !hour) {
      throw new Error('Time slot must have both dayDate and hour properties');
    }

    // Combine dayDate and hour into a proper ISO string
    const timeString = `${dayDate}T${hour}:00`;

    return this.parseTimeInTimezoneToUTC(timeString, timezone);
  }

  /**
   * Convert multiple time slots to UTC from a specific timezone
   * @param timeSlots - Array of time slot objects
   * @param timezone - Timezone string (e.g., 'Europe/Istanbul')
   * @returns Array of UTC ISO strings
   */
  convertTimeSlotsToUTC(
    timeSlots: { dayDate: string; hour: string }[],
    timezone: string,
  ): string[] {
    return timeSlots.map((slot) => this.convertTimeSlotToUTC(slot, timezone));
  }

  /**
   * Convert a time slot to UTC and get both start and end times
   * @param timeSlot - Object with dayDate (YYYY-MM-DD) and hour (HH:MM)
   * @param timezone - Timezone string (e.g., 'Europe/Istanbul')
   * @param durationMinutes - Duration in minutes
   * @returns Object with startTimeUTC and endTimeUTC
   */
  convertTimeSlotToUTCRange(
    timeSlot: { dayDate: string; hour: string },
    timezone: string,
    durationMinutes: number,
  ): { startTimeUTC: string; endTimeUTC: string } {
    const { dayDate, hour } = timeSlot;

    // Validate input format
    if (!dayDate || !hour) {
      throw new Error('Time slot must have both dayDate and hour properties');
    }

    // Combine dayDate and hour into a proper ISO string
    const timeString = `${dayDate}T${hour}:00`;

    const startTimeUTC = this.parseTimeInTimezoneToUTC(timeString, timezone);
    const endTimeUTC = this.calculateEndTimeInTimezoneToUTC(
      timeString,
      timezone,
      durationMinutes,
    );

    return { startTimeUTC, endTimeUTC };
  }

  getNowPlusMinutes(minutes: number): string {
    const now = new Date();
    const plus10Minutes = new Date(now.getTime() + minutes * 60 * 1000); // Add 10 minutes in milliseconds
    return plus10Minutes.toISOString();
  }
}
