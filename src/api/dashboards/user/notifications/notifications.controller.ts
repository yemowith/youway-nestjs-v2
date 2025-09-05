import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import {
  NotificationsResponseDto,
  UnreadCountResponseDto,
  MarkAsReadResponseDto,
  NotificationDto,
} from './dto/notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get user notifications',
    description: 'Retrieve paginated notifications for the authenticated user',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: String,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: String,
    description: 'Number of notifications per page (default: 20)',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved notifications',
    type: NotificationsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserNotifications(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const userId = req.user.id;
    return this.notificationsService.getUserNotifications(
      userId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('unread')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get unread notifications',
    description: 'Retrieve all unread notifications for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved unread notifications',
    type: [NotificationDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUnreadNotifications(@Request() req) {
    const userId = req.user.id;
    return this.notificationsService.getUnreadNotifications(userId);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get unread notifications count',
    description:
      'Get the total count of unread notifications for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved unread count',
    type: UnreadCountResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUnreadCount(@Request() req) {
    const userId = req.user.id;
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Post(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Mark notification as read',
    description:
      'Mark a specific notification as read for the authenticated user',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID to mark as read',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully marked notification as read',
    type: MarkAsReadResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Request() req, @Param('id') notificationId: string) {
    const userId = req.user.id;
    const count = await this.notificationsService.markAsRead(
      notificationId,
      userId,
    );
    return { count };
  }

  @Post('mark-all-read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description:
      'Mark all unread notifications as read for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully marked all notifications as read',
    type: MarkAsReadResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAllAsRead(@Request() req) {
    const userId = req.user.id;
    const count = await this.notificationsService.markAllAsRead(userId);
    return { count };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete notification',
    description: 'Delete a specific notification for the authenticated user',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID to delete',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted notification',
    type: UnreadCountResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async removeNotification(
    @Request() req,
    @Param('id') notificationId: string,
  ) {
    const userId = req.user.id;
    const count = await this.notificationsService.removeNotification(
      notificationId,
      userId,
    );
    return { count };
  }

  @Delete('remove-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete all notifications',
    description: 'Delete all notifications for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted all notifications',
    type: UnreadCountResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeAllNotifications(@Request() req) {
    const userId: string = req.user.id;
    const count = await this.notificationsService.removeAllNotifications(
      userId,
    );
    return { count };
  }
}
