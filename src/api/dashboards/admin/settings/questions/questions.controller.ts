import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// DTOs for Question
export type QuestionResponse = {
  id: string;
  question: string;
  questionKey: string;
  answers: any; // JSON field
  group: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type QuestionInput = {
  question: string;
  questionKey: string;
  answers: any; // JSON field
  group?: string;
  sortOrder?: number;
};

@ApiTags('Admin - Questions')
@Controller('admin/settings/questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all questions' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('group') group?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    rows: QuestionResponse[];
    total: number;
    pageSize: number;
    page: number;
  }> {
    return this.questionsService.findAll(
      Number(page),
      Number(pageSize),
      search,
      group,
      sortBy,
      sortOrder,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search questions by text' })
  async searchQuestions(@Query('q') q: string): Promise<QuestionResponse[]> {
    if (!q || !q.trim()) return [];
    return this.questionsService.searchByText(q.trim());
  }

  @Get('groups')
  @ApiOperation({ summary: 'Get all question groups' })
  async getGroups(): Promise<string[]> {
    return this.questionsService.getGroups();
  }

  @Get('ai/questions')
  @ApiOperation({ summary: 'Get questions for AI chatbot in correct order' })
  async getQuestionsForAI(): Promise<QuestionResponse[]> {
    return this.questionsService.findAllForAI();
  }

  @Get('group/:group')
  @ApiOperation({ summary: 'Get questions by group' })
  async findByGroup(
    @Param('group') group: string,
  ): Promise<QuestionResponse[]> {
    return this.questionsService.findByGroup(group);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get question by ID' })
  async findOne(@Param('id') id: string): Promise<QuestionResponse> {
    return this.questionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new question' })
  async create(@Body() data: QuestionInput): Promise<QuestionResponse> {
    return this.questionsService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update question' })
  async update(
    @Param('id') id: string,
    @Body() data: QuestionInput,
  ): Promise<QuestionResponse> {
    return this.questionsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete question' })
  async delete(@Param('id') id: string): Promise<QuestionResponse> {
    return this.questionsService.delete(id);
  }
}
