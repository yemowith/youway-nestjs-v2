import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';

export interface QuestionResponse {
  id: string;
  question: string;
  answers: any;
  group: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  async getQuestions(
    group?: string,
    limit?: number,
  ): Promise<QuestionResponse[]> {
    const where = group ? { group } : undefined;
    const take = limit || 50; // Default limit of 50 questions

    const questions = await this.prisma.question.findMany({
      where,
      take,
      orderBy: { sortOrder: 'asc' },
    });

    return questions;
  }
}
