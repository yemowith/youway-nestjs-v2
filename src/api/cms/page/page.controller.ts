import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PageService } from './page.service';
import { PageResponseDto, FindPageBySlugDto } from './dto';

@ApiTags('CMS - Pages')
@Controller('cms/page')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get(':slug')
  @ApiOperation({
    summary: 'Find page by slug',
    description:
      'Retrieve a page and related pages in the same category by its slug',
  })
  @ApiParam({
    name: 'slug',
    description: 'Page slug (URL-friendly identifier)',
    example: 'about-us',
  })
  @ApiResponse({
    status: 200,
    description: 'Page found successfully',
    type: PageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Page not found',
  })
  async findBySlug(@Param('slug') slug: string): Promise<PageResponseDto> {
    return this.pageService.findBySlug(slug);
  }
}
