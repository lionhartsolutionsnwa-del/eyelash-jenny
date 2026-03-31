// Jenny Professional Eyelash - Slot Computation Engine
// =====================================================

import type { AvailableSlot } from '@/types';

/**
 * Convert "HH:MM" or "HH:MM:SS" to total minutes since midnight.
 */
export function timeToMinutes(time: string): number {
  const parts = time.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

/**
 * Convert total minutes since midnight to "HH:MM" string.
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Format "HH:MM" or "HH:MM:SS" into a human-friendly "9:30 AM" display string.
 */
export function formatTimeDisplay(time: string): string {
  const parts = time.split(':');
  let hour = parseInt(parts[0], 10);
  const minute = parts[1];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minute} ${ampm}`;
}

/**
 * Check if two time ranges overlap.
 * Ranges are [start1, end1) and [start2, end2) in minutes.
 */
export function doRangesOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 < end2 && start2 < end1;
}

export interface ComputeSlotsParams {
  /** The date being queried (YYYY-MM-DD), for context only */
  date: string;
  /** Duration of the selected service in minutes */
  serviceDurationMinutes: number;
  /** Business hours for the day */
  availability: { start_time: string; end_time: string };
  /** Break periods during the day */
  breakTimes: { start_time: string; end_time: string }[];
  /** Already-booked time ranges for the day */
  existingBookings: { start_time: string; end_time: string }[];
  /** Interval between slot start times (default 30) */
  slotInterval?: number;
  /** Buffer time in minutes between bookings (default 15) */
  bufferMinutes?: number;
}

/**
 * Compute all candidate time slots for a given date and service,
 * marking each as available or unavailable.
 */
export function computeAvailableSlots(
  params: ComputeSlotsParams
): AvailableSlot[] {
  const {
    serviceDurationMinutes,
    availability,
    breakTimes,
    existingBookings,
    slotInterval = 30,
    bufferMinutes = 15,
  } = params;

  const dayStart = timeToMinutes(availability.start_time);
  const dayEnd = timeToMinutes(availability.end_time);

  // Pre-convert break times to minutes
  const breaks = breakTimes.map((b) => ({
    start: timeToMinutes(b.start_time),
    end: timeToMinutes(b.end_time),
  }));

  // Pre-convert existing bookings to minutes
  const bookings = existingBookings.map((b) => ({
    start: timeToMinutes(b.start_time),
    end: timeToMinutes(b.end_time),
  }));

  const slots: AvailableSlot[] = [];

  // Generate candidate slots from dayStart up to (dayEnd - serviceDuration)
  for (
    let slotStart = dayStart;
    slotStart + serviceDurationMinutes <= dayEnd;
    slotStart += slotInterval
  ) {
    const slotEnd = slotStart + serviceDurationMinutes;

    // Check overlap with break times (exact service window)
    const overlapsBreak = breaks.some((b) =>
      doRangesOverlap(slotStart, slotEnd, b.start, b.end)
    );

    // Check overlap with existing bookings (include buffer on both sides)
    const bufferedStart = slotStart - bufferMinutes;
    const bufferedEnd = slotEnd + bufferMinutes;
    const overlapsBooking = bookings.some((b) =>
      doRangesOverlap(bufferedStart, bufferedEnd, b.start, b.end)
    );

    slots.push({
      time: minutesToTime(slotStart),
      available: !overlapsBreak && !overlapsBooking,
    });
  }

  return slots;
}
