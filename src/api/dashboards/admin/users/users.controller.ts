import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserType, UserStatus, AuthProvider, Sex } from '@prisma/client';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// Custom type for identity responses
type IdentityResponse = {
  id: string;
  provider: AuthProvider;
  providerId: string;
  createdAt: Date;
};

// Custom type for user responses (excluding sensitive data)
type UserResponse = {
  id: string;
  firstName: string;
  lastName: string;
  type: UserType;
  status: UserStatus;
  profileImage: string | null;
  about: string | null;
  birthYear?: number | null;
  sex?: Sex | null;
  createdAt: Date;
  updatedAt: Date;
  identities: IdentityResponse[];
};

// Custom type for user input
type UserInput = {
  firstName?: string;
  lastName?: string;
  type?: UserType;
  status?: UserStatus;
  profileImage?: string | null;
  about?: string | null;
  birthDate?: Date | null;
};

// Custom type for password change input
type PasswordChangeInput = {
  newPassword: string;
};

@ApiTags('Admin Users')
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all users with pagination, search and sorting',
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<{
    rows: UserResponse[];
    total: number;
    pageSize: number;
    page: number;
  }> {
    return this.usersService.findAll(
      Number(page),
      Number(pageSize),
      search,
      sortBy,
      sortOrder,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponse> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: UserInput,
  ): Promise<UserResponse> {
    return this.usersService.update(id, data);
  }

  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspend a user by changing status to SUSPENDED' })
  async suspendUser(@Param('id') id: string): Promise<UserResponse> {
    return this.usersService.updateStatus(id, 'SUSPENDED');
  }

  @Patch(':id/change-password')
  @ApiOperation({ summary: 'Change user password' })
  async changePassword(
    @Param('id') id: string,
    @Body() data: PasswordChangeInput,
  ): Promise<{ message: string }> {
    return this.usersService.changePassword(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<UserResponse> {
    return this.usersService.delete(id);
  }
}
