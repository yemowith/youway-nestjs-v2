import { ApiProperty } from '@nestjs/swagger';

export class NotificationDto {
  @ApiProperty({ description: 'Notification ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Notification type' })
  type: string;

  @ApiProperty({ description: 'Notification message' })
  message: string;

  @ApiProperty({
    description: 'Additional notification details',
    required: false,
  })
  details?: any;

  @ApiProperty({ description: 'Whether the notification has been read' })
  isRead: boolean;

  @ApiProperty({ description: 'Creation timestamp', format: 'date-time' })
  createdAt: Date;
}

export class PaginationDto {
  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;
}

export class NotificationsResponseDto {
  @ApiProperty({
    type: [NotificationDto],
    description: 'Array of notifications',
  })
  notifications: NotificationDto[];

  @ApiProperty({ type: PaginationDto, description: 'Pagination information' })
  pagination: PaginationDto;
}

export class UnreadCountResponseDto {
  @ApiProperty({ description: 'Number of unread notifications' })
  count: number;
}

export class MarkAsReadResponseDto {
  @ApiProperty({ description: 'Number of notifications marked as read' })
  count: number;
}
