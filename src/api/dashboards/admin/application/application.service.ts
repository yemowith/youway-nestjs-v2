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

  private transformApplication(application: any): ApplicationResponse {
    return {
      ...application,
      highLevelLicenseName: application.highLevelLicenseName || undefined,
    };
  }

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
        include: {
          therapies: {
            include: {
              therapy: true,
            },
          },
          therapySchools: {
            include: {
              therapySchool: true,
            },
          },
        },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      rows: data.map((app) => this.transformApplication(app)),
      total,
      pageSize,
      page,
    };
  }

  async findOne(id: string): Promise<ApplicationResponse> {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: {
        therapies: {
          include: {
            therapy: true,
          },
        },
        therapySchools: {
          include: {
            therapySchool: true,
          },
        },
      },
    });
    if (!app) throw new NotFoundException('Application not found');
    return this.transformApplication(app);
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
    // Parse JSON strings for therapies and therapy schools
    let therapyIds: string[] = [];
    let therapySchoolIds: string[] = [];

    if (data.therapies) {
      try {
        therapyIds = JSON.parse(data.therapies);
      } catch (error) {
        throw new BadRequestException('Invalid therapies format');
      }
    }

    if (data.therapySchools) {
      try {
        therapySchoolIds = JSON.parse(data.therapySchools);
      } catch (error) {
        throw new BadRequestException('Invalid therapy schools format');
      }
    }

    const application = await this.prisma.application.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        licenseName: data.licenseName.trim(),
        highLevelLicense: String(data.highLevelLicense) === 'true',
        highLevelLicenseName: data.highLevelLicenseName?.trim() || null,
        cvUrl: cvUrl ?? '',
        therapies:
          therapyIds.length > 0
            ? {
                create: therapyIds.map((therapyId) => ({
                  therapyId: therapyId.trim(),
                })),
              }
            : undefined,
        therapySchools:
          therapySchoolIds.length > 0
            ? {
                create: therapySchoolIds.map((therapySchoolId) => ({
                  therapySchoolId: therapySchoolId.trim(),
                })),
              }
            : undefined,
      },
      include: {
        therapies: {
          include: {
            therapy: true,
          },
        },
        therapySchools: {
          include: {
            therapySchool: true,
          },
        },
      },
    });
    return this.transformApplication(application);
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
    // Parse JSON strings for therapies and therapy schools
    let therapyIds: string[] = [];
    let therapySchoolIds: string[] = [];

    if (data.therapies) {
      try {
        therapyIds = JSON.parse(data.therapies);
      } catch (error) {
        throw new BadRequestException('Invalid therapies format');
      }
    }

    if (data.therapySchools) {
      try {
        therapySchoolIds = JSON.parse(data.therapySchools);
      } catch (error) {
        throw new BadRequestException('Invalid therapy schools format');
      }
    }

    // Delete existing relationships and create new ones
    await this.prisma.applicationTherapy.deleteMany({
      where: { applicationId: id },
    });
    await this.prisma.applicationTherapySchool.deleteMany({
      where: { applicationId: id },
    });

    const application = await this.prisma.application.update({
      where: { id },
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        licenseName: data.licenseName.trim(),
        highLevelLicense: String(data.highLevelLicense) === 'true',
        highLevelLicenseName: data.highLevelLicenseName?.trim() || null,
        cvUrl,
        therapies:
          therapyIds.length > 0
            ? {
                create: therapyIds.map((therapyId) => ({
                  therapyId: therapyId.trim(),
                })),
              }
            : undefined,
        therapySchools:
          therapySchoolIds.length > 0
            ? {
                create: therapySchoolIds.map((therapySchoolId) => ({
                  therapySchoolId: therapySchoolId.trim(),
                })),
              }
            : undefined,
      },
      include: {
        therapies: {
          include: {
            therapy: true,
          },
        },
        therapySchools: {
          include: {
            therapySchool: true,
          },
        },
      },
    });
    return this.transformApplication(application);
  }

  async delete(id: string): Promise<ApplicationResponse> {
    const application = await this.prisma.application.delete({
      where: { id },
      include: {
        therapies: {
          include: {
            therapy: true,
          },
        },
        therapySchools: {
          include: {
            therapySchool: true,
          },
        },
      },
    });
    return this.transformApplication(application);
  }
}
