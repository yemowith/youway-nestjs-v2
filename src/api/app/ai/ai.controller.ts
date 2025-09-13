import { Controller, Get, Query } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('questions')
  @ApiOperation({ summary: 'Get questions for AI chatbot' })
  async getQuestions(
    @Query('group') group?: string,
    @Query('limit') limit?: string,
  ) {
    return this.aiService.getQuestions(
      group,
      limit ? parseInt(limit) : undefined,
    );
  }
}
