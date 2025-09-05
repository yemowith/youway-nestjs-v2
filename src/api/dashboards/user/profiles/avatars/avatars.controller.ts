import {
  Controller,
  Get,
  Put,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
} from '@nestjs/common'
import { Response, Request } from 'express'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { AvatarsService } from '../../../../../modules/user/avatar/avatars.service'
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard'

// Extend Express Request type to include user
interface RequestWithUser extends Request {
  user: {
    id: string
  }
}

@ApiTags('Avatars')
@Controller('profiles/avatars')
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Get('generate')
  @ApiOperation({ summary: 'Generate an avatar image' })
  @ApiResponse({
    status: 200,
    description: 'Avatar image generated successfully',
  })
  generateAvatar(
    @Query('name') name: string,
    @Query('background') background: string = 'random',
    @Query('color') color: string = 'fff',
    @Query('size') size: string = '200',
    @Res() res: Response,
  ) {
    const svg = this.avatarsService.generateAvatar({
      name,
      background,
      color,
      size: parseInt(size, 10),
    })

    res.setHeader('Content-Type', 'image/svg+xml')
    res.setHeader('Cache-Control', 'public, max-age=31536000') // Cache for 1 year
    return res.send(svg)
  }

  @Put('update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Avatar updated successfully',
  })
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.id

    const publicUrl = await this.avatarsService.updateAvatar(userId, file)
    return { success: true, data: { profileImage: publicUrl } }
  }
}
