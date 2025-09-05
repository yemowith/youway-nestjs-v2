import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { SupabaseService } from 'src/clients/supabase/supabase.service';
import {
  ApplicationInput,
  ApplicationResponse,
} from './application.controller';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async findAll(
    page = 1,
    pageSize = 10,
    search?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    rows: ApplicationResponse[];
    total: number;
    pageSize: number;
    page: number;
  }> {
    const skip = (page - 1) * pageSize;
    const where = search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
            { licenseName: { contains: search } },
            { areaExpertise: { contains: search } },
          ],
        }
      : undefined;

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy) {
      const allowedSortFields = [
        'firstName',
        'lastName',
        'email',
        'phone',
        'licenseName',
        'highLevelLicense',
        'areaExpertise',
        'createdAt',
        'updatedAt',
      ];
      if (allowedSortFields.includes(sortBy)) {
        orderBy = { [sortBy]: sortOrder };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        skip,
        take: pageSize,
        where,
        orderBy,
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      rows: data,
      total,
      pageSize,
      page,
    };
  }

  async findOne(id: string): Promise<ApplicationResponse> {
    const app = await this.prisma.application.findUnique({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async create(
    data: ApplicationInput,
    file?: Express.Multer.File,
  ): Promise<ApplicationResponse> {
    let cvUrl: string | undefined;
    if (file) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `applications/${fileName}`;
      const { error } = await this.supabaseService
        .getClient()
        .storage.from('user-documents')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });
      if (error) {
        throw new BadRequestException('Failed to upload CV: ' + error.message);
      }
      const {
        data: { publicUrl },
      } = this.supabaseService
        .getClient()
        .storage.from('user-documents')
        .getPublicUrl(filePath);
      cvUrl = publicUrl;
    }
    return this.prisma.application.create({
      data: {
        ...data,
        highLevelLicense: String(data.highLevelLicense) === 'true',
        cvUrl: cvUrl ?? '',
      },
    });
  }

  async update(
    id: string,
    data: ApplicationInput,
    file?: Express.Multer.File,
  ): Promise<ApplicationResponse> {
    const existing = await this.prisma.application.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Application not found');
    let cvUrl = existing.cvUrl;
    if (file) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `applications/${fileName}`;
      const { error } = await this.supabaseService
        .getClient()
        .storage.from('user-documents')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });
      if (error) {
        throw new BadRequestException('Failed to upload CV: ' + error.message);
      }
      const {
        data: { publicUrl },
      } = this.supabaseService
        .getClient()
        .storage.from('user-documents')
        .getPublicUrl(filePath);
      cvUrl = publicUrl;
    }
    return this.prisma.application.update({
      where: { id },
      data: {
        ...data,
        highLevelLicense: String(data.highLevelLicense) === 'true',
        cvUrl,
      },
    });
  }

  async delete(id: string): Promise<ApplicationResponse> {
    return this.prisma.application.delete({ where: { id } });
  }
}
