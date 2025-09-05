import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReferralService } from '../../../../modules/user/referral/referral.service';
import { UserReferralWithProfileDto } from './dto/referral.dto';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';

@ApiTags('Referral')
@Controller('dashboards/user/referral')
@ApiBearerAuth()
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('children')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user children referrals' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of children referrals',
    type: [UserReferralWithProfileDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getUserChildren(
    @Req() req,
  ): Promise<{
    referralProfile: UserReferralWithProfileDto;
    referralChildrens: UserReferralWithProfileDto[];
  }> {
    const referralProfile = await this.referralService.getUserReferral(
      req.user.id,
    );
    const referralChildrens = await this.referralService.getUserChildren(
      req.user.id,
    );
    return {
      referralProfile,
      referralChildrens,
    };
  }
}
