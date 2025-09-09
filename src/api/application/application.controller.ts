import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import {
  ApiOperation,
  ApiTags,
  ApiConsumes,
  ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

export type ApplicationResponse = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseName: string;
  highLevelLicense: boolean;
  highLevelLicenseName?: string;
  cvUrl: string;
  createdAt: Date;
  updatedAt: Date;
  therapies: {
    id: string;
    applicationId: string;
    therapyId: string;
    therapy: {
      id: string;
      name: string;
    };
  }[];
  therapySchools: {
    id: string;
    applicationId: string;
    therapySchoolId: string;
    therapySchool: {
      id: string;
      name: string;
    };
  }[];
};

export type ApplicationInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseName: string;
  highLevelLicense?: string; // Changed to string for multipart form data
  highLevelLicenseName?: string;
  therapies?: string;
  therapySchools?: string;
  userAgreement: string;
};

@ApiTags('Application')
@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Create new application' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Application created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        licenseName: { type: 'string' },
        highLevelLicense: { type: 'boolean' },
        highLevelLicenseName: { type: 'string' },
        cvUrl: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        therapies: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              applicationId: { type: 'string' },
              therapyId: { type: 'string' },
              therapy: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
        therapySchools: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              applicationId: { type: 'string' },
              therapySchoolId: { type: 'string' },
              therapySchool: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - application with email/phone already exists',
  })
  @UseInterceptors(FileInterceptor('cv'))
  async create(
    @Body() data: ApplicationInput,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApplicationResponse> {
    return this.applicationService.create(data, file);
  }
}
