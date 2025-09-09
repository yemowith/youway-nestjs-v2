import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { FinancialService } from './financial.service';
import { FinancialSummaryDto } from './dto/financial-summary.dto';
import { UserPaymentsResponseDto } from './dto/user-payments.dto';
import { UserTransactionsResponseDto } from './dto/user-transactions.dto';

@ApiTags('Financial')
@Controller('dashboards/user/financial')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get financial summary for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Financial summary retrieved successfully',
    type: FinancialSummaryDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getFinancialSummary(
    @Request() req: { user: { id: string } },
  ): Promise<FinancialSummaryDto> {
    return this.financialService.getFinancialSummary(req.user.id);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get paginated user payments' })
  @ApiResponse({
    status: 200,
    description: 'User payments retrieved successfully',
    type: UserPaymentsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getPayments(
    @Request() req: { user: { id: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<UserPaymentsResponseDto> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    // Validate pagination parameters
    const validPage = Math.max(1, pageNumber);
    const validLimit = Math.min(Math.max(1, limitNumber), 100); // Max 100 items per page

    return this.financialService.getPayments(
      req.user.id,
      validPage,
      validLimit,
    );
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get paginated user transactions' })
  @ApiResponse({
    status: 200,
    description: 'User transactions retrieved successfully',
    type: UserTransactionsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getTransactions(
    @Request() req: { user: { id: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<UserTransactionsResponseDto> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;

    // Validate pagination parameters
    const validPage = Math.max(1, pageNumber);
    const validLimit = Math.min(Math.max(1, limitNumber), 100); // Max 100 items per page

    return this.financialService.getTransactions(
      req.user.id,
      validPage,
      validLimit,
    );
  }
}
