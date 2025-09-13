import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { QuestionInput, QuestionResponse } from './questions.controller';

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page = 1,
    pageSize = 10,
    search?: string,
    group?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    rows: QuestionResponse[];
    total: number;
    pageSize: number;
    page: number;
  }> {
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (search) {
      where.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { questionKey: { contains: search, mode: 'insensitive' } },
        { group: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (group) {
      where.group = group;
    }

    let orderBy: any = [{ sortOrder: 'asc' }, { createdAt: 'desc' }];
    if (sortBy) {
      const allowedSortFields = [
        'question',
        'questionKey',
        'group',
        'sortOrder',
        'createdAt',
        'updatedAt',
      ];
      if (allowedSortFields.includes(sortBy)) {
        orderBy = [{ [sortBy]: sortOrder }];
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.question.findMany({
        skip,
        take: pageSize,
        where,
        orderBy,
      }),
      this.prisma.question.count({ where }),
    ]);

    return {
      rows: data,
      total,
      pageSize,
      page,
    };
  }

  async findOne(id: string): Promise<QuestionResponse> {
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async findByGroup(group: string): Promise<QuestionResponse[]> {
    return this.prisma.question.findMany({
      where: { group },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getGroups(): Promise<string[]> {
    const groups = await this.prisma.question.findMany({
      select: { group: true },
      distinct: ['group'],
      orderBy: [{ group: 'asc' }],
    });
    return groups.map((g) => g.group);
  }

  async create(data: QuestionInput): Promise<QuestionResponse> {
    const {
      question,
      questionKey,
      answers,
      group = 'general',
      sortOrder = 0,
    } = data;

    return this.prisma.question.create({
      data: {
        question,
        questionKey,
        answers,
        group,
        sortOrder,
      },
    });
  }

  async update(id: string, data: QuestionInput): Promise<QuestionResponse> {
    const existing = await this.prisma.question.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Question not found');

    const updateData: any = {};
    if (data.question !== undefined) updateData.question = data.question;
    if (data.questionKey !== undefined)
      updateData.questionKey = data.questionKey;
    if (data.answers !== undefined) updateData.answers = data.answers;
    if (data.group !== undefined) updateData.group = data.group;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    return this.prisma.question.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<QuestionResponse> {
    const existing = await this.prisma.question.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Question not found');

    return this.prisma.question.delete({ where: { id } });
  }

  async searchByText(q: string): Promise<QuestionResponse[]> {
    return this.prisma.question.findMany({
      where: {
        OR: [
          { question: { contains: q, mode: 'insensitive' } },
          { questionKey: { contains: q, mode: 'insensitive' } },
          { group: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: [{ sortOrder: 'asc' }, { question: 'asc' }],
    });
  }

  async findAllForAI(): Promise<QuestionResponse[]> {
    return this.prisma.question.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }
}
