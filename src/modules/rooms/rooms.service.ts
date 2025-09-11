import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { RedisdbService } from 'src/clients/redisdb/redisdb.service';
import { DatetimeService } from 'src/helpers/datetime/datetime.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);
  private readonly prefix = 'room:';
  private readonly dailyApiUrl = 'https://api.daily.co/v1';
  private readonly dailyApiKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly datetime: DatetimeService,
    private readonly redisdb: RedisdbService,
    private readonly config: ConfigService,
  ) {
    this.dailyApiKey = config.get('daily.apiKey') || '';
  }

  private async checkHealthAppointment(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        user: true,
        seller: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const now = this.datetime.getNowISO();

    if (appointment.startTime.toISOString() > now) {
      throw new BadRequestException('Appointment not started yet');
    }

    if (appointment.endTime.toISOString() < now) {
      throw new BadRequestException('Appointment already ended');
    }

    return appointment;
  }

  private async createDailyRoom(roomName: string) {
    try {
      // Check if API key is configured
      if (!this.dailyApiKey) {
        this.logger.error('Daily.co API key is not configured');
        throw new BadRequestException('Video service not configured');
      }

      this.logger.log(`Creating Daily.co room: ${roomName}`);

      const response = await axios.post(
        `${this.dailyApiUrl}/rooms`,
        {
          name: roomName,
          privacy: 'private',
          properties: {
            enable_prejoin_ui: false,
            max_participants: 2,
            enable_screenshare: false,
            enable_chat: true,
            enable_knocking: false,
            enable_recording: false,
            enable_transcription: true,
            enable_people_ui: false,
            enable_network_ui: false,
            enable_emoji_reactions: true,
            enable_live_captions_ui: true,
            enable_noise_cancellation_ui: true,
            enable_video_processing_ui: true,
            enable_advanced_chat: true,
            exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.dailyApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Daily.co room created successfully: ${roomName}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create Daily.co room:', {
        roomName,
        error: error.response?.data || error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      throw new BadRequestException('Failed to create video room');
    }
  }

  private async getDailyRoom(roomName: string) {
    try {
      const response = await axios.get(
        `${this.dailyApiUrl}/rooms/${roomName}`,
        {
          headers: {
            Authorization: `Bearer ${this.dailyApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to get Daily.co room:', error);
      throw new BadRequestException('Failed to get video room');
    }
  }

  private setRoomName(appointmentId: string) {
    const randomString = Math.random().toString(36).substring(2, 15);
    return `room-seans-${appointmentId}`;
  }

  private async deleteDailyRoom(roomName: string) {
    try {
      await axios.delete(`${this.dailyApiUrl}/rooms/${roomName}`, {
        headers: {
          Authorization: `Bearer ${this.dailyApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`Deleted Daily.co room: ${roomName}`);
    } catch (error) {
      this.logger.error('Failed to delete Daily.co room:', error);
      throw new BadRequestException('Failed to delete video room');
    }
  }

  async generateVideoToken(appointmentId: string, identity: string) {
    await this.checkHealthAppointment(appointmentId);

    const roomName = this.setRoomName(appointmentId);

    let room;
    try {
      // Try to get existing room first
      room = await this.getDailyRoom(roomName);
      this.logger.log(`Using existing room: ${roomName}`);
    } catch (error) {
      // If room doesn't exist, create it
      this.logger.log(`Room ${roomName} not found, creating new room`);
      room = await this.createDailyRoom(roomName);
    }

    // Generate Daily.co meeting token
    const meetingToken = await this.generateDailyMeetingToken(
      roomName,
      identity,
    );

    console.log('Room data:', room);

    return {
      token: meetingToken,
      appointmentId,
      identity,
      roomName: roomName,
      roomUrl: room.url,
      expiresIn: 3600, // 1 hour
    };
  }

  private async generateDailyMeetingToken(roomName: string, identity: string) {
    try {
      this.logger.log(
        `Generating Daily.co meeting token for room: ${roomName}, user: ${identity}`,
      );

      const response = await axios.post(
        `${this.dailyApiUrl}/meeting-tokens`,
        {
          properties: {
            room_name: roomName,
            user_id: identity,
            is_owner: false,
            exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.dailyApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Daily.co meeting token generated successfully`);
      return response.data.token;
    } catch (error) {
      this.logger.error('Failed to generate Daily.co meeting token:', {
        roomName,
        identity,
        error: error.response?.data || error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      throw new BadRequestException('Failed to generate video token');
    }
  }

  /**
   * Get Daily.co room information
   * @param roomName - Room name to get information for
   * @returns Promise<object> - Room information
   */
  async getRoomInfo(roomName: string) {
    return await this.getDailyRoom(roomName);
  }

  /**
   * Delete Daily.co room
   * @param roomName - Room name to delete
   */
  async deleteRoom(roomName: string) {
    return await this.deleteDailyRoom(roomName);
  }
}
