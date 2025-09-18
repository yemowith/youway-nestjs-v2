import { Controller, Post, Body } from '@nestjs/common';
import { HelpService, HelpRequestDto } from './help.service';

@Controller('help')
export class HelpController {
  constructor(private readonly helpService: HelpService) {}

  @Post('send-request')
  async sendHelpRequest(@Body() helpRequest: HelpRequestDto) {
    return this.helpService.sendHelpRequest(helpRequest);
  }
}
