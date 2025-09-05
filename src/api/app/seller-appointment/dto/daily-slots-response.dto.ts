import { ApiProperty } from '@nestjs/swagger';

export class SlotDto {
  @ApiProperty({
    description: 'Date in YYYY-MM-DD format',
    example: '2025-09-01',
  })
  dayDate: string;

  @ApiProperty({
    description: 'Time in HH:MM:SS format',
    example: '09:00:00',
  })
  hour: string;

  @ApiProperty({
    description: 'Start time in ISO format (UTC)',
    example: '2025-09-01T06:00:00.000Z',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time in ISO format (UTC)',
    example: '2025-09-01T06:15:00.000Z',
  })
  endTime: string;

  @ApiProperty({
    description: 'Whether the slot is available for booking',
    example: true,
  })
  isAvailable: boolean;

  @ApiProperty({
    description: 'Whether the slot is already booked',
    example: false,
  })
  isBooked: boolean;

  @ApiProperty({
    description: 'Whether the slot is outside available hours',
    example: false,
  })
  isOutsideHours: boolean;

  @ApiProperty({
    description: 'Timezone of the seller',
    example: 'Europe/Istanbul',
    required: false,
  })
  tz?: string;
}

export class DailySlotsResponseDto {
  @ApiProperty({
    description: 'Total number of slots generated',
    example: 32,
  })
  totalSlots: number;

  @ApiProperty({
    description: 'Number of available slots',
    example: 24,
  })
  availableSlots: number;

  @ApiProperty({
    description: 'Number of booked slots',
    example: 8,
  })
  bookedSlots: number;

  @ApiProperty({
    description: 'Number of slots outside available hours',
    example: 0,
  })
  outsideHoursSlots: number;

  @ApiProperty({
    description: 'Number of existing appointments',
    example: 8,
  })
  existingAppointments: number;

  @ApiProperty({
    description: 'Number of unavailabilities',
    example: 0,
  })
  unavailabilities: number;

  @ApiProperty({
    description: 'Array of time slots',
    type: [SlotDto],
  })
  slots: SlotDto[];
}
