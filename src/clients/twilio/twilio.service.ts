import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class TwilioService implements OnModuleInit {
  private twilioClient: twilio.Twilio;
  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeTwilioClient();
  }

  async initializeTwilioClient() {
    const accountSid = this.configService.get<string>('twilio.accountSid');
    const authToken = this.configService.get<string>('twilio.authToken');

    if (!accountSid || !authToken) {
      throw new Error(
        'Twilio configuration is missing. Please check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.',
      );
    }

    this.twilioClient = twilio(accountSid, authToken);
  }

  /**
   * Get the Twilio client instance
   * @returns twilio.Twilio - The Twilio client
   */
  getClient(): twilio.Twilio {
    if (!this.twilioClient) {
      throw new Error(
        'Twilio client not initialized. Make sure to call initializeTwilioClient() first.',
      );
    }
    return this.twilioClient;
  }

  /**
   * Create a video room
   * @param roomName - Name of the room
   * @param options - Room creation options
   * @returns Promise<any>
   */
  async createVideoRoom(
    roomName: string,
    options?: Record<string, any>,
  ): Promise<any> {
    const client = this.getClient();
    return await client.video.rooms.create({
      uniqueName: roomName,
      ...(options || {}),
    });
  }

  /**
   * Get video room by name
   * @param roomName - Name of the room
   * @returns Promise<any | null>
   */
  async getVideoRoom(roomName: string): Promise<any> {
    try {
      const client = this.getClient();
      return await client.video.rooms(roomName).fetch();
    } catch (error) {
      if (error.code === 20404) {
        return null; // Room not found
      }
      throw error;
    }
  }

  /**
   * Generate access token for video
   * @param identity - User identity
   * @param roomName - Room name
   * @param options - Token options
   * @returns string - JWT access token
   */
  generateVideoToken(
    identity: string,
    roomName: string,
    options?: any,
  ): string {
    const client = this.getClient();
    const token = new twilio.jwt.AccessToken(
      this.configService.get<string>('twilio.accountSid')!,
      this.configService.get<string>('twilio.apiKey')!,
      this.configService.get<string>('twilio.apiSecret')!,
      { identity },
    );

    const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
      room: roomName,
    });

    token.addGrant(videoGrant);
    return token.toJwt();
  }

  /**
   * Generate a new API Key SID
   * @param friendlyName - Friendly name for the API key
   * @returns Promise<any> - The generated API key
   */
  async generateKeySid(friendlyName?: string): Promise<any> {
    const client = this.getClient();
    return await client.newKeys.create({
      friendlyName: friendlyName || `API Key ${new Date().toISOString()}`,
    });
  }

  /**
   * Get API Key by SID using IAM API
   * @param keySid - The API Key SID
   * @returns Promise<any> - The API key details
   */
  async getKeySid(keySid: string): Promise<any> {
    const client = this.getClient();
    return await client.iam.v1.apiKey(keySid).fetch();
  }

  /**
   * List all API Keys using IAM API
   * @returns Promise<any[]> - List of API keys
   */
  async listKeySids(): Promise<any[]> {
    const client = this.getClient();
    const accountSid = this.configService.get<string>('twilio.accountSid');
    if (!accountSid) {
      throw new Error('Account SID not found in configuration');
    }
    const keys = await client.iam.v1.getApiKeys.list({
      accountSid,
    });
    return keys;
  }

  /**
   * Update API Key using IAM API
   * @param keySid - The API Key SID
   * @param friendlyName - New friendly name
   * @returns Promise<any> - Updated API key
   */
  async updateKeySid(keySid: string, friendlyName: string): Promise<any> {
    const client = this.getClient();
    return await client.iam.v1.apiKey(keySid).update({
      friendlyName,
    });
  }

  /**
   * Delete API Key using IAM API
   * @param keySid - The API Key SID
   * @returns Promise<boolean> - Success status
   */
  async deleteKeySid(keySid: string): Promise<boolean> {
    try {
      const client = this.getClient();
      await client.iam.v1.apiKey(keySid).remove();
      return true;
    } catch (error) {
      console.error('Error deleting API key:', error);
      return false;
    }
  }
}
