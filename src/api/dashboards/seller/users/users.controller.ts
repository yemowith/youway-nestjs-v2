import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService, UserFilters, PaginationParams } from './users.service';
import {
  UserResponseDto,
  PaginatedUsersResponse,
} from 'src/modules/seller/users/dto/user-response.dto';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { JwtSellerGuard } from 'src/api/auth/guards/jwt-seller.guard';

@ApiTags('Seller Users')
@Controller('dashboard/seller/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get users who have appointments with the seller',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved users',
    type: PaginatedUsersResponse,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['firstName', 'lastName', 'createdAt', 'email'],
    description: 'Sort field (default: createdAt)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order (default: desc)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in first name, last name, email, or phone',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Filter users from this date (ISO string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Filter users until this date (ISO string)',
  })
  async getUsers(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: 'firstName' | 'lastName' | 'createdAt' | 'email',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<PaginatedUsersResponse> {
    const filters: UserFilters = {
      search,
      startDate,
      endDate,
    };

    const pagination: PaginationParams = {
      page,
      limit,
      sortBy,
      sortOrder,
    };

    return this.usersService.getSellerUsers(
      req.user.id as string,
      filters,
      pagination,
    );
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user statistics for seller' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user statistics',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total users with appointments' },
        active: { type: 'number', description: 'Active users (last 30 days)' },
        newThisMonth: { type: 'number', description: 'New users this month' },
      },
    },
  })
  async getUserStats(@Request() req: any) {
    return this.usersService.getUsersStats(req.user.id as string);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get specific user by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved user',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or no appointments with this seller',
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  async getUserById(
    @Request() req: any,
    @Param('id') userId: string,
  ): Promise<UserResponseDto> {
    return this.usersService.getUserById(userId, req.user.id as string);
  }
}
