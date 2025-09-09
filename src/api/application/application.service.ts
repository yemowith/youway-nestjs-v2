import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
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

  async create(
    data: ApplicationInput,
    file?: Express.Multer.File,
  ): Promise<ApplicationResponse> {
    // Input validation
    this.validateApplicationInput(data);

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

    // Validate therapy and therapy school IDs if provided
    if (therapyIds.length > 0) {
      await this.validateTherapyIds(therapyIds);
    }
    if (therapySchoolIds.length > 0) {
      await this.validateTherapySchoolIds(therapySchoolIds);
    }

    // Validate user agreement
    if (data.userAgreement !== 'true') {
      throw new BadRequestException('User agreement must be accepted');
    }

    // Check for duplicate email
    await this.checkDuplicateEmail(data.email);

    // Check for duplicate phone
    await this.checkDuplicatePhone(data.phone);

    // Validate and upload CV file if provided
    let cvUrl = '';
    if (file) {
      cvUrl = await this.uploadCvFile(file);
    }

    // Create application in database with therapies and therapy schools
    try {
      const application = await this.prisma.application.create({
        data: {
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email.toLowerCase().trim(),
          phone: data.phone.trim(),
          licenseName: data.licenseName.trim(),
          highLevelLicense: String(data.highLevelLicense) === 'true',
          highLevelLicenseName: data.highLevelLicenseName?.trim() || null,
          cvUrl,
          // Create therapy relationships
          therapies:
            therapyIds.length > 0
              ? {
                  create: therapyIds.map((therapyId) => ({
                    therapyId: therapyId.trim(),
                  })),
                }
              : undefined,
          // Create therapy school relationships
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

      return {
        ...application,
        highLevelLicenseName: application.highLevelLicenseName || undefined,
      };
    } catch (error) {
      // Handle Prisma-specific errors
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Application with this email or phone already exists',
        );
      }
      throw new BadRequestException(
        'Failed to create application: ' + error.message,
      );
    }
  }

  private validateApplicationInput(data: ApplicationInput): void {
    const errors: string[] = [];

    // Required field validation
    if (!data.firstName || data.firstName.trim().length === 0) {
      errors.push('First name is required');
    } else if (data.firstName.trim().length > 100) {
      errors.push('First name must be 100 characters or less');
    }

    if (!data.lastName || data.lastName.trim().length === 0) {
      errors.push('Last name is required');
    } else if (data.lastName.trim().length > 100) {
      errors.push('Last name must be 100 characters or less');
    }

    if (!data.email || data.email.trim().length === 0) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Invalid email format');
      } else if (data.email.length > 255) {
        errors.push('Email must be 255 characters or less');
      }
    }

    if (!data.phone || data.phone.trim().length === 0) {
      errors.push('Phone number is required');
    } else if (data.phone.trim().length > 20) {
      errors.push('Phone number must be 20 characters or less');
    }

    if (!data.licenseName || data.licenseName.trim().length === 0) {
      errors.push('License name is required');
    } else if (data.licenseName.trim().length > 20) {
      errors.push('License name must be 20 characters or less');
    }

    if (
      data.highLevelLicenseName &&
      data.highLevelLicenseName.trim().length > 20
    ) {
      errors.push('High level license name must be 20 characters or less');
    }

    if (!data.userAgreement || data.userAgreement !== 'true') {
      errors.push('User agreement must be accepted');
    }

    if (errors.length > 0) {
      throw new BadRequestException(`Validation failed: ${errors.join(', ')}`);
    }
  }

  private async checkDuplicateEmail(email: string): Promise<void> {
    const existingApplication = await this.prisma.application.findFirst({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingApplication) {
      throw new ConflictException(
        'An application with this email already exists',
      );
    }
  }

  private async checkDuplicatePhone(phone: string): Promise<void> {
    const existingApplication = await this.prisma.application.findFirst({
      where: { phone: phone.trim() },
    });

    if (existingApplication) {
      throw new ConflictException(
        'An application with this phone number already exists',
      );
    }
  }

  private async uploadCvFile(file: Express.Multer.File): Promise<string> {
    // Validate file
    this.validateCvFile(file);

    try {
      const fileExt = file.originalname.split('.').pop()?.toLowerCase();
      const fileName = `application_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const filePath = `applications/${fileName}`;

      // Upload to Supabase storage
      const { error } = await this.supabaseService
        .getClient()
        .storage.from('user-documents')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        throw new BadRequestException(`Failed to upload CV: ${error.message}`);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = this.supabaseService
        .getClient()
        .storage.from('user-documents')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to upload CV file');
    }
  }

  private validateCvFile(file: Express.Multer.File): void {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const allowedExtensions = ['pdf', 'doc', 'docx'];

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new BadRequestException('CV file size must be less than 5MB');
    }

    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('CV file must be a PDF or Word document');
    }

    // Check file extension
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        'CV file must have .pdf, .doc, or .docx extension',
      );
    }
  }

  private async validateTherapyIds(therapyIds: string[]): Promise<void> {
    if (!therapyIds || therapyIds.length === 0) return;

    // Check if all therapy IDs exist
    const existingTherapies = await this.prisma.therapy.findMany({
      where: {
        id: {
          in: therapyIds,
        },
      },
      select: {
        id: true,
      },
    });

    const existingIds = existingTherapies.map((t) => t.id);
    const invalidIds = therapyIds.filter((id) => !existingIds.includes(id));

    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid therapy IDs: ${invalidIds.join(', ')}`,
      );
    }
  }

  private async validateTherapySchoolIds(
    therapySchoolIds: string[],
  ): Promise<void> {
    if (!therapySchoolIds || therapySchoolIds.length === 0) return;

    // Check if all therapy school IDs exist
    const existingTherapySchools = await this.prisma.therapySchool.findMany({
      where: {
        id: {
          in: therapySchoolIds,
        },
      },
      select: {
        id: true,
      },
    });

    const existingIds = existingTherapySchools.map((ts) => ts.id);
    const invalidIds = therapySchoolIds.filter(
      (id) => !existingIds.includes(id),
    );

    if (invalidIds.length > 0) {
      throw new BadRequestException(
        `Invalid therapy school IDs: ${invalidIds.join(', ')}`,
      );
    }
  }
}
