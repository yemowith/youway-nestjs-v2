import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { RoomsService } from 'src/modules/rooms/rooms.service';

class GenerateVideoTokenDto {
  appointmentId: string;
  ttl?: number;
}

@ApiTags('Rooms')
@Controller('rooms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('generate-video-token')
  @ApiOperation({
    summary: 'Generate video token for appointment with room creation',
    description:
      "Creates a video room if it doesn't exist and generates a video token for the specified appointment and user identity",
  })
  @ApiBody({
    type: GenerateVideoTokenDto,
    description:
      'Video token generation request (identity is taken from authenticated user)',
    examples: {
      basic: {
        summary: 'Basic request',
        value: {
          appointmentId: 'appointment-123',
        },
      },
      withTtl: {
        summary: 'Request with custom TTL',
        value: {
          appointmentId: 'appointment-123',
          ttl: 1800,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Video token generated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            appointmentId: { type: 'string', example: 'appointment-123' },
            identity: { type: 'string', example: 'user-456' },
            roomName: { type: 'string', example: 'room-appointment-123' },
            roomUrl: {
              type: 'string',
              example: 'https://youway.daily.co/room-appointment-123',
            },
            expiresIn: { type: 'number', example: 3600 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid appointment or timing',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Appointment not started yet' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not found - Appointment not found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Appointment not found' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async generateVideoToken(
    @Body() body: GenerateVideoTokenDto,
    @Request() req: { user: { id: string } },
  ) {
    const { appointmentId, ttl = 3600 } = body;

    // Validate required fields
    if (!appointmentId) {
      throw new BadRequestException('appointmentId is required');
    }

    // Get identity from authenticated user
    const identity = req.user.id;

    try {
      // Generate video token
      const token = await this.roomsService.generateVideoToken(
        appointmentId,
        identity,
      );

      return {
        success: true,
        data: token, // The service now returns the full token object with roomUrl
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException(
        `Failed to generate video token: ${error.message}`,
      );
    }
  }
}
