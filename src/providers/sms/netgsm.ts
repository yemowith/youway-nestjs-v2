import axios, { AxiosError } from 'axios';

// Types
export interface NetGSMMessage {
  msg: string;
  no: string;
}

export interface NetGSMRequest {
  msgheader: string;
  messages: NetGSMMessage[];
  encoding: string;
  iysfilter?: string;
  partnercode?: string;
}

export interface NetGSMResponse {
  code: string;
  jobid: string;
  description: string;
}

export interface NetGSMConfig {
  username: string;
  password: string;
  baseUrl?: string;
}

export class NetGSMSender {
  private readonly baseUrl: string;
  private readonly auth: string;

  constructor(config: NetGSMConfig) {
    this.baseUrl =
      config.baseUrl || 'https://api.netgsm.com.tr/sms/rest/v2/send';
    this.auth = Buffer.from(`${config.username}:${config.password}`).toString(
      'base64',
    );
  }

  /**
   * Send SMS messages using NetGSM API
   * @param request SMS request data
   * @returns Promise with NetGSM response
   */
  async sendSMS(request: NetGSMRequest): Promise<NetGSMResponse> {
    try {
      const response = await axios.post<NetGSMResponse>(this.baseUrl, request, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${this.auth}`,
        },
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(
          `NetGSM API Error: ${error.response?.data || error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * Create a single SMS message
   * @param message Message content
   * @param phoneNumber Recipient phone number
   * @returns Formatted message object
   */
  static createMessage(message: string, phoneNumber: string): NetGSMMessage {
    return {
      msg: message,
      no: phoneNumber,
    };
  }

  /**
   * Create a batch SMS request
   * @param header Message header
   * @param messages Array of messages
   * @param encoding Message encoding (default: 'TR')
   * @returns Formatted request object
   */
  static createRequest(
    header: string,
    messages: NetGSMMessage[],
    encoding: string = 'TR',
  ): NetGSMRequest {
    return {
      msgheader: header,
      messages,
      encoding,
      iysfilter: '',
      partnercode: '',
    };
  }
}
