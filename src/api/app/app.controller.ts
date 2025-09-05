import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Cacheable, expireIn } from 'src/clients/cache/cache.decorator';
import { CacheService } from 'src/clients/cache/cache.service';
import { AppResponseDto } from './dto';

@ApiTags('App')
@Controller('app')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  @ApiOkResponse({
    description: 'Get application data including settings and banners.',
    type: AppResponseDto,
  })
  @Cacheable({
    key: 'app',
    expire: expireIn('1h'),
  })
  async getApp(): Promise<AppResponseDto> {
    return this.appService.getApp();
  }
}
