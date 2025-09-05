import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger'
import { ProfilesService } from './profiles.service'
import { ProfileResponseDto, UserOptionDto } from './dto/profile.dto'
import { UpdateUserOptionDto } from './dto/update-user-option.dto'
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard'

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Retrieves the current user profile including referral information',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req) {
    return await this.profilesService.getProfileById(req.user.id)
  }

  @Post('options/update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user option' })
  @ApiResponse({
    status: 200,
    description: 'User option updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
        message: {
          type: 'string',
          example: 'User option updated successfully',
        },
        data: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/UserOptionDto',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async updateUserOption(
    @Req() req,
    @Body() updateUserOptionDto: UpdateUserOptionDto,
  ) {
    return await this.profilesService.updateUserOption(
      req.user.id,
      updateUserOptionDto,
    )
  }
}
